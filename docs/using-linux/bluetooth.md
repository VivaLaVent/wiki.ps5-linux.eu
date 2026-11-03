---
title: Bluetooth
sidebar_position: 4
description: The PS5's three Bluetooth chips, the btusb quirks each one needs, and how Linux gets its own Bluetooth address so one DualSense serves both systems.
---

# Bluetooth

The PS5's Bluetooth is part of the Wi-Fi/Bluetooth combo chip, attached over USB to the console's Salina xHCI controller. Which chip you have decides which kernel fixes you need. Pairing a controller is on [DualSense controller](./dualsense.md); this page is the driver side.

:::info[Where the fixes live]
The patches described here are in PS5 Bazzite Deck's [`patches/`](https://github.com/VivaLaVent/ps5-bazzite-deck/tree/main/patches) folder, applied in the order of its `build.sh`. rmuxnet's kernel carries its own version of the MediaTek fixes, which its author reports as broken at the time of writing. Upstream `ps5-linux-patches` only has the IW620 quirks entry. See [Kernel setup](/advanced/kernel#what-is-where).
:::

## The three chips

| Chip | USB ID | Consoles | Status |
| --- | --- | --- | --- |
| Marvell IW620 | `1286:2059` | Original PS5, some Slims | ✅ Working with the quirks below |
| MediaTek MT7961 | `0e8d:3603` | Most Slims | ✅ Working with the endpoint fix below |
| MediaTek MT7925 | `0e8d:3605` | PS5 Pro | ✅ Working from a cold boot with the Pro patch below |

Find yours:

```bash
lsusb | grep -i -e 1286:2059 -e 0e8d:3603 -e 0e8d:3605
```

All three drop off USB when they enter USB power saving (U3) and stay gone until a power-off. Keep them powered with a udev rule that sets `power/control` to `on` for the chip and for the Salina xHCI (`104d:9108`), see [Bluetooth troubleshooting](./dualsense.md#bluetooth-troubleshooting).

## IW620 (Marvell)

Two changes to `btusb` make the IW620 usable:

- **Quirks table entry.** The chip needs its own entry with the right quirks; without it `btusb` treats it as a generic adapter.
- **L2CAP connect while encryption is pending.** Controllers that connect before encryption has finished were dropped. The fix defers the connection until security is settled.

Both are in rmuxnet's kernel and PS5 Bazzite Deck; upstream has the quirks entry.

:::warning[Don't mix the LE command families on this chip]
A third change, a "legacy LE" workaround that marks the chip's extended LE scan and create-connection commands as broken so keyboards and mice reconnect, exists in rmuxnet's repository and was in some PS5 Bazzite Deck releases. On the IW620 it stops the settings from finding any new device: the scan uses the legacy commands while advertising still uses the extended ones (`0x2039`), and the chip refuses to mix them (`Busy`, `0x200b … Command Disallowed`). A DualSense that was already paired keeps working, which hides the problem. The current PS5 Bazzite Deck release drops the workaround; anyone porting it to another kernel should know what it does to the IW620.
:::

The IW620's Bluetooth side can also hang after a warm restart. Reloading `btusb` brings it back; if not, power off and start with the loader.

## MediaTek on the Slim

The MT7961 only drains ACL data from its second bulk OUT endpoint (`0x02`). The Slim Bluetooth patch sends ACL there; the module parameter `btusb.ps5_tx_ep` overrides the endpoint (`0` = the driver's default). Confirmed on Slims.

## MediaTek on the Pro

The MT7925 (`0e8d:3605`) needs more than a table entry. The Pro Bluetooth patch:

- binds only interface 3 (the HCI controller) and doesn't claim the ISO interface,
- after the usual `btmtk` setup, sends the WMT activation `6f fc 06 01 06 02 00 00 01` as a class/interface request with `wIndex` 3, and routes HCI commands to `wIndex` 3 from then on,
- sends ACL data on bulk OUT `0x0d`: endpoint `0x0b` accepts one transfer and then NAKs forever,
- retries the first HCI Reset a few times, because from a cold boot it raced the controller becoming ready and left a dead `hci0` that only a reload of `btusb` revived.

Confirmed on Pros. Only `0e8d:3605` is touched; other consoles are unaffected. rmuxnet's kernel has an optional endpoint resync after the firmware setup instead (`btusb.ps5_ep_resync=1`, off by default); whether it needs the reload hasn't been confirmed.

## One DualSense for the PS5 and Linux

The PS5 OS and Linux share the chip, so they share its Bluetooth address, and a DualSense keeps one pairing per host address. Giving Linux a different address lets the controller keep one pairing for the PS5 OS and one for Linux, on separate profiles. The user steps are on [DualSense controller](./dualsense.md#one-dualsense-for-the-ps5-and-linux); this is how it works. Confirmed on all three chips. On the Pro's MT7925 the address is set with `btmgmt` once Bluetooth is fully up, because the chip can't take it earlier.

The Linux address is the chip's own with the "locally administered" bit set in the first byte: `80:60:B7:C5:74:44` becomes `82:60:B7:C5:74:44`. How it is set depends on the chip:

| Chip | Method |
| --- | --- |
| IW620 | Marvell vendor command `0xFC22` ("set BD address", parameters `FE 06` plus the address) sent to the chip over a raw HCI socket. The chip keeps it in RAM; the PS5 OS gets the original back on its next start. |
| MediaTek | `btmgmt public-addr` with the adapter powered off, which the kernel can apply on this chip. On some MT7961 units the command completes but the old address stays; the fallback is MediaTek's own vendor command `0xFC1A` (the address little-endian), then a power cycle so the kernel reads it back. |

Why not `btmgmt public-addr` on the IW620: the kernel only sends a new public address to the chip during the adapter's first setup. Once the adapter is up, the kernel keeps the address in memory and never sends it to the chip.

Pitfalls found in testing:

- **Save the address and reuse it.** The chip's power-on default isn't fixed in hardware on every IW620 and can read differently after a cold boot. Deriving the Linux address fresh each boot then changes it, and the controller's stored pairing stops matching. The script saves the address on first use and reuses it.
- **The kernel and `bluetoothd` must see the new address too.** Otherwise pairings are stored under the old address on some boots and the new one on others. After the vendor command, the adapter is powered off and on with `bluetoothd` stopped, so it registers the adapter under the new address. If the chip loses the address during that re-initialisation, it is set once more without another re-initialisation.
- **It doesn't survive a warm restart on the IW620** (see below).
- `bluetoothctl` may still show the original address on the IW620; the chip and the controller use the new one.

Source: [`files/ps5-bt-addr`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/main/files/ps5-bt-addr) and [`files/ps5-bt-pro-addr`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/main/files/ps5-bt-pro-addr).

### Controller refused in a loop

Symptom: the log repeats `Refusing connection … unknown device` and a controller never connects. It happens with the Linux-only address **off**: Linux then has the same address as the PS5 OS, so a controller that was paired with the PS5 OS connects to Linux as soon as it is switched on, and Linux, which has no pairing for it, refuses it, over and over.

Fix: turn the Linux-only address on, cold start, and pair the controller once in Linux on a profile of its own:

```bash
ps5-bt-address on
sudo systemctl poweroff
```

After the cold start, on the console in a terminal:

```bash
bluetoothctl
agent on
default-agent
scan on
# put the controller into pairing mode on a free profile, wait for its address to appear
pair <controller-address>
trust <controller-address>
connect <controller-address>
scan off
exit
```

From then on the controller connects to Linux on that profile and to the PS5 OS on its original one.

### IW620: the Linux-only address and warm restarts

Status: no fix yet. With the address on, a [warm restart](/advanced/warm-reboot) can leave the IW620 hung: its Bluetooth side stops answering on USB (`device descriptor read/64, error -110`, `device not accepting address`), and sometimes Wi-Fi is gone too (`wlan_pcie ... probe ... failed`). Only a power-off and a start with the loader brings it back. With the address off, Bluetooth survives a warm restart. A cold start always works, with or without the address.

The cause is the chip's state, not the restart itself: a warm restart starts the new kernel without resetting any hardware, so the chip enters the next boot with the changed address and then gets the vendor command again. Ideas, none tested yet:

1. Undo the address before the warm restart: send `0xFC22` with the original address on the way down, so the chip starts the next boot as after a cold one. This needs the original address kept somewhere, for example in `/run`.
2. Don't send it twice: on a warm boot, read the chip's current address first and skip the command if it already has the Linux one (the MediaTek path does this).
3. Reset the Bluetooth side before the warm restart: unbind `btusb` and reset the chip's USB device, or send an HCI reset.

Test plan for an IW620 console with both on: cold start and check `ps5-bt-address status` shows the Linux address and the controller connects; warm restart and check the adapter comes back (`bluetoothctl show`) and the controller reconnects; ten warm restarts in a row, then a cold start, checking Wi-Fi each time; on failure, `sudo dmesg | grep -i -e btusb -e btmrvl -e "usb 5-"`.

:::note[PS5 Bazzite Deck]
While the address is on, the image replaces warm restarts with normal ones on IW620 consoles. `ps5-bt-address off` turns the address off instead.
:::
