---
title: Wi-Fi, Ethernet and Bluetooth
sidebar_label: Wi-Fi and Bluetooth
description: "The PS5's network and Bluetooth chips under Linux: drivers, setup and troubleshooting."
hardware: [original, slim, pro]
applies_to: all
---

# Wi-Fi, Ethernet and Bluetooth

The console has wired Ethernet and one combo chip for Wi-Fi and Bluetooth: a Marvell IW620 on most original PS5s, a MediaTek chip on most Slims and the PS5 Pro. Which one yours has is on [Hardware status](/hardware/matrix#console-models-and-chips).

## Wi-Fi {#wifi}

Most original PS5s have a Marvell IW620 Wi-Fi/Bluetooth chip (`40:00.7`, PCI ID `1b4b:2b56`). Its Linux driver is an NXP `mwifiex` fork patched for the PS5, which is not part of the stock kernel; this page covers getting it in and keeping it working.

:::warning[MediaTek chips (most PS5 Slims and the PS5 Pro)]
Some consoles use a MediaTek chip instead of the Marvell IW620 covered on this page: the MT7961 (`14c3:7961`) on most Slims and the MT7925 (`14c3:7925`) on the PS5 Pro. See [Console models and chips](/hardware/matrix#console-models-and-chips) for how to check which one you have.

Both work with the drivers already in the kernel (`mt7921e` for the Slim, `mt7925e` for the Pro), and every current kernel builds them, the official one included; nothing on this page applies to them. Their Bluetooth is a different story, see [Bluetooth](#bluetooth). On an old kernel without the drivers, use a [USB Wi-Fi adapter](/hardware/storage#usb-network-adapters).
:::

:::tip[Kernels that bring the driver along]
The `linux-ps5` kernel package from the [package repository](/advanced/package-repository) includes this driver, and so does [rmuxnet's kernel](/advanced/kernel#install-rmuxnets-release): the driver is built with the kernel, and `install.sh` (and `build.sh`) write `/etc/modprobe.d/ps5-iw620.conf` and copy the firmware from the boot partition. On both, Wi-Fi works without the install steps below.
:::

### Install

```bash
git clone https://github.com/ps5-linux/ps5-linux-mwifiex
cd ps5-linux-mwifiex
sudo ./install.sh
```

To uninstall:

```bash
sudo ./install.sh uninstall
```

### Load the driver manually

```bash
sudo modprobe cfg80211
sudo insmod ./mlan.ko
sudo insmod ./moal.ko \
  fw_name=nxp/pcieuartiw620_combo_v1.bin \
  pcie_int_mode=1 drv_mode=1 cfg80211_wext=4 sta_name=mlan \
  ext_scan=1 auto_fw_reload=0 wifi_reset_config=0 \
  sched_scan=0 ps_mode=2 auto_ds=2 amsdu_disable=1
```

### Build from source

```bash
git clone https://github.com/nxp-imx/mwifiex.git && cd mwifiex
git checkout lf-6.18.2_1.0.0
git apply ../ps5-iw620.patch
make CONFIG_OBJTOOL=
```

### Set up Wi-Fi before the first boot

Without Ethernet, you can still have Wi-Fi on the first boot by writing the connection into the image from another Linux PC before the drive goes into the PS5. Replace `/dev/sdX1` with the root filesystem partition of the flashed drive.

```bash
# Mount the root filesystem partition of the flashed USB drive
MNT=$(mktemp -d)
sudo mount /dev/sdX1 "$MNT"

# Create the NetworkManager connection file
sudo install -d -m 700 "$MNT/etc/NetworkManager/system-connections"
sudo tee "$MNT/etc/NetworkManager/system-connections/wifi.nmconnection" >/dev/null <<'EOF'
[connection]
id=wifi
type=wifi
autoconnect=true

[wifi]
mode=infrastructure
ssid=YOUR_SSID_HERE

[wifi-security]
key-mgmt=wpa-psk
psk=YOUR_PASSWORD_HERE

[ipv4]
method=auto

[ipv6]
addr-gen-mode=stable-privacy
method=auto
EOF

sudo chmod 600 "$MNT/etc/NetworkManager/system-connections/wifi.nmconnection"
sudo chown root:root "$MNT/etc/NetworkManager/system-connections/wifi.nmconnection"
sudo umount "$MNT"
```

### After a kernel update

`install.sh` builds the driver for the kernel that is running at the time. After a kernel update, run `sudo ./install.sh` again, or there is no Wi-Fi. The `linux-ps5` package from the [package repository](/advanced/package-repository) and rmuxnet's kernel carry the driver, so they don't need this.

### Check that it works

A working driver prints these lines in `dmesg`:

```text
WLAN FW is active
Driver loaded successfully
```

Then check the connection. The interface is usually called `wlp64s0f7`:

```bash
nmcli device status
```

### Troubleshooting

#### Arch: install fails (missing headers or wrong headers path)

When `./install.sh` fails on an Arch-based image, install the kernel headers first:

```bash
sudo pacman -U linux-bin/linux-ps5-headers_*.pkg.tar.zst
```

The headers package sits next to the kernel package in `linux-bin/`, and is also on the [ps5-linux-patches releases](https://github.com/ps5-linux/ps5-linux-patches/releases).

If the build still fails, a packaging bug in some header packages put the files under `/usr/usr/include` instead of `/usr/include`. Copy them where the build looks:

```bash
sudo cp -r /usr/usr/include/* /usr/include/
```

#### Adapter shows as UNCLAIMED: the driver loads but never binds

Symptoms: `lspci` lists the Marvell chip, `moal` is loaded, but no interface appears, and `dmesg` shows the driver finding the card and then stopping without a firmware error:

```text
Attach moal handle ops, card interface type: 0x207
Enable moal_recv_amsdu_packet
Attach mlan adapter operations.card_type is 0x207.
```

The firmware is in the wrong place. An older `install.sh` copied it to `/lib/` instead of `/lib/firmware/nxp/`, and the kernel only looks under `/lib/firmware/`. Find it:

```bash
find /lib -iname "pcieuartiw620_combo_v1.bin"
```

Move it if needed:

```bash
sudo mkdir -p /lib/firmware/nxp
sudo mv /lib/pcieuartiw620_combo_v1.bin /lib/firmware/nxp/
```

Reload the driver; the interface appears at once.

#### Package manager installs (Fedora/Debian): common failures

With the `ps5-linux-mwifiex` package instead of the manual `install.sh`, two things go wrong regularly.

**Kernel version pin:**

```text
ps5-linux-mwifiex : Depends: linux-ps5 (= X.Y.Z) but X.Y.W is to be installed
```

The driver package is built against one exact kernel version. Install that `linux-ps5` version rather than upgrading the kernel first. Before you fight the package manager, check whether the kernel already has the driver built in:

```bash
dmesg | grep -iE 'moal|mlan|mwifiex'
```

**Compiler mismatch while building:**

```text
warning: kernel built on gcc 13, using gcc 15
```

The module has to be built with the same toolchain as the kernel. A distro upgrade that brings a newer GCC breaks the build against an older prebuilt `linux-ps5`; update the kernel package as well.

**rpm-ostree/Bazzite images from the official builder:**

```bash
sudo dnf upgrade -y linux-ps5 --setopt=gpgcheck=0
sudo rpm-ostree install ps5-linux-mwifiex ps5-linux-tools
sudo systemctl reboot
```

If apt or dnf complains about cached package files with the same names, fall back to the manual `install.sh` method.

#### Bazzite: no Wi-Fi networks

Bazzite uses `iwd` as NetworkManager's Wi-Fi backend by default, which doesn't work with the IW620 driver. Switch back to `wpa_supplicant` with `ujust toggle-iwd` (choose "disable iwd"), then run `sudo systemctl restart NetworkManager`. Current images already do this.

#### The interface shows as unavailable

The radio is blocked. Turn it on:

```bash
nmcli radio wifi on
rfkill unblock wifi
```

#### Two `moal` option files

If the `linux-ps5` package installed a `moal.conf` in `/etc/modprobe.d/` and you also have your own, modprobe merges the `options moal` lines from both. Keep them in sync or remove one.

#### Wi-Fi doesn't connect or drops under load

Right after the first boot the connection sometimes only comes up after Wi-Fi is switched off and on once. If it drops under load, reload the driver:

```bash
sudo modprobe -r moal mlan
sudo modprobe cfg80211
sudo insmod ./mlan.ko
sudo insmod ./moal.ko fw_name=nxp/pcieuartiw620_combo_v1.bin pcie_int_mode=1 drv_mode=1 cfg80211_wext=4 sta_name=mlan ext_scan=1 auto_fw_reload=0 wifi_reset_config=0 sched_scan=0 ps_mode=2 auto_ds=2 amsdu_disable=1
```

#### Driver stuck under sustained load

When `dmesg` shows this pattern during heavy traffic, the driver is caught in a reset loop:

```text
num_cmd_timeout = 1
woal_reset_adma: ADMA reset failed (value:97)
woal_reset_intf: get bss info failed
Block woal_cfg80211_deauthenticate in abnormal driver state
PCIe In-band Reset Fail
```

The chip's power saving seems to set it off. Load the driver with **`ps_mode=0`** (power saving off) instead of `ps_mode=2`: with that, the connection holds under sustained load. PS5 Bazzite Deck ships this setting.

## Ethernet {#ethernet}

The wired port (PCI ID `104d:9104`) is handled by the `mts` driver, which every PS5 kernel builds and loads by itself. Plug in a cable and the connection is there; nothing on this page is required for a normal setup.

### Background

The controller is a MediaTek Star Ethernet MAC (`mtk_star_emac`) inside the console's Salina chip. The `mts` driver was written for the PS5 on top of an earlier community base and is part of the PS5 patch set, built as a module:

```text
CONFIG_MTS=m
```

### Troubleshooting

If the interface doesn't come up after the first boot, disable and re-enable the wired connection in your network manager.

#### USB Ethernet adapters keep disconnecting

A USB Ethernet adapter that connects and disconnects in a loop is a driver problem of that adapter, not of the console, and there is no fix beyond another adapter or cable. The internal port works on every supported firmware, so use it where you can. For a new adapter, choose one with the **RTL8156B** chipset.

#### Slow speed, high CPU use and no IPv6 on old kernels

Early versions of `mts` had three faults: the port topped out around 300 Mbps while a USB adapter on the same cable did full gigabit, one CPU core sat at 100%, and incoming IPv6 didn't work. All three came from the interrupt and filter setup. The interrupt mask was written with the wrong polarity and interrupts were only partly acknowledged, so the status bits stayed set, the MSI stopped firing and the driver fell back to polling every 10 ms; and the multicast filter was never programmed, so neighbour discovery and router advertisements were dropped.

The current driver matches what Sony's own does: correct mask polarity, full interrupt acknowledgement, the same interrupt moderation timer, a hash-based multicast filter with promiscuous mode, and NAPI stopped before DMA on shutdown. It does full gigabit in both directions at around 13% of one core, gets a global IPv6 address through router advertisements, and shows RX drop and CRC counters in `ip -s -s link`.

:::note[Which kernels have it]
Every current kernel: the upstream packages, rmuxnet's kernel and PS5 Bazzite Deck, see [Kernel setup](/advanced/kernel). On an old kernel, update, or use a USB adapter for full gigabit speed.
:::

## Bluetooth {#bluetooth}

The PS5's Bluetooth is part of the Wi-Fi/Bluetooth combo chip, attached over USB to the console's Salina xHCI controller. Which chip you have decides which kernel fixes you need. Pairing a controller is on [DualSense controller](/using-linux/dualsense); this page is the driver side.

:::info[Where the fixes live]
The patches described here are in PS5 Bazzite Deck's [`patches/`](https://github.com/VivaLaVent/ps5-bazzite-deck/tree/main/patches) folder, applied in the order of its `build.sh`. rmuxnet's kernel carries its own version of the MediaTek fixes, which its author reports as broken at the time of writing. Upstream `ps5-linux-patches` only has the IW620 quirks entry. See [Kernel setup](/advanced/kernel#what-is-where).
:::

### The three chips

| Chip | USB ID | Consoles | Status |
| --- | --- | --- | --- |
| Marvell IW620 | `1286:2059` | Original PS5, some Slims | ✅ Working with the quirks below |
| MediaTek MT7961 | `0e8d:3603` | Most Slims | ✅ Working with the endpoint fix below |
| MediaTek MT7925 | `0e8d:3605` | PS5 Pro | ✅ Working from a cold boot with the Pro patch below |

Find yours:

```bash
lsusb | grep -i -e 1286:2059 -e 0e8d:3603 -e 0e8d:3605
```

All three drop off USB when they enter USB power saving (U3) and stay gone until a power-off. Keep them powered with a udev rule that sets `power/control` to `on` for the chip and for the Salina xHCI (`104d:9108`), see [Bluetooth troubleshooting](/using-linux/dualsense#bluetooth-troubleshooting).

### IW620 (Marvell)

Two changes to `btusb` make the IW620 usable:

- **Quirks table entry.** The chip needs its own entry with the right quirks; without it `btusb` treats it as a generic adapter.
- **L2CAP connect while encryption is pending.** Controllers that connect before encryption has finished were dropped. The fix defers the connection until security is settled.

Both are in rmuxnet's kernel and PS5 Bazzite Deck; upstream has the quirks entry.

:::warning[Don't mix the LE command families on this chip]
A third change, a "legacy LE" workaround that marks the chip's extended LE scan and create-connection commands as broken so keyboards and mice reconnect, exists in rmuxnet's repository and was in some PS5 Bazzite Deck releases. On the IW620 it stops the settings from finding any new device: the scan uses the legacy commands while advertising still uses the extended ones (`0x2039`), and the chip refuses to mix them (`Busy`, `0x200b … Command Disallowed`). A DualSense that was already paired keeps working, which hides the problem. The current PS5 Bazzite Deck release drops the workaround; anyone porting it to another kernel should know what it does to the IW620.
:::

The IW620's Bluetooth side can also hang after a warm restart. Reloading `btusb` brings it back; if not, power off and start with the loader.

### MediaTek on the Slim

The MT7961 only drains ACL data from its second bulk OUT endpoint (`0x02`). The Slim Bluetooth patch sends ACL there; the module parameter `btusb.ps5_tx_ep` overrides the endpoint (`0` = the driver's default). Confirmed on Slims.

### MediaTek on the Pro

The MT7925 (`0e8d:3605`) needs more than a table entry. The Pro Bluetooth patch:

- binds only interface 3 (the HCI controller) and doesn't claim the ISO interface,
- after the usual `btmtk` setup, sends the WMT activation `6f fc 06 01 06 02 00 00 01` as a class/interface request with `wIndex` 3, and routes HCI commands to `wIndex` 3 from then on,
- sends ACL data on bulk OUT `0x0d`: endpoint `0x0b` accepts one transfer and then NAKs forever,
- retries the first HCI Reset a few times, because from a cold boot it raced the controller becoming ready and left a dead `hci0` that only a reload of `btusb` revived.

Confirmed on Pros. Only `0e8d:3605` is touched; other consoles are unaffected. rmuxnet's kernel has an optional endpoint resync after the firmware setup instead (`btusb.ps5_ep_resync=1`, off by default); whether it needs the reload hasn't been confirmed.

### One DualSense for the PS5 and Linux

The PS5 OS and Linux share the chip, so they share its Bluetooth address, and a DualSense keeps one pairing per host address. Giving Linux a different address lets the controller keep one pairing for the PS5 OS and one for Linux, on separate profiles. The user steps are on [DualSense controller](/using-linux/dualsense#one-dualsense-for-the-ps5-and-linux); this is how it works. Confirmed on all three chips. On the Pro's MT7925 the address is set with `btmgmt` once Bluetooth is fully up, because the chip can't take it earlier.

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

#### Controller refused in a loop

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

#### Is the Linux-only address actually applied?

"On" in `ps5-bt-address status` means the setting; whether the chip took the address shows in the address itself. The Linux address has the `0x02` bit set in its first byte, so its second character changes (`9C:…` becomes `9E:…`, `EC:…` would become `EE:…`). If the first byte didn't change, the address wasn't applied this boot, Linux runs with the PS5 OS's address, and the controller's two pairings collide:

```bash
cat /sys/class/bluetooth/hci0/address
journalctl -u ps5-bt-addr -b --no-pager | tail -5   # why it wasn't applied
sudo systemctl restart ps5-bt-addr; sleep 3; cat /sys/class/bluetooth/hci0/address
```

`ps5-report` prints this as `linux-only BT address: on, applied` or `on, NOT applied`.

#### IW620: the Linux-only address and warm restarts

Status: no fix yet. With the address on, a [warm restart](/advanced/warm-reboot) can leave the IW620 hung: its Bluetooth side stops answering on USB (`device descriptor read/64, error -110`, `device not accepting address`), and sometimes Wi-Fi is gone too (`wlan_pcie ... probe ... failed`). Only a power-off and a start with the loader brings it back. With the address off, Bluetooth survives a warm restart. A cold start always works, with or without the address.

The cause is the chip's state, not the restart itself: a warm restart starts the new kernel without resetting any hardware, so the chip enters the next boot with the changed address and then gets the vendor command again. Ideas, none tested yet:

1. Undo the address before the warm restart: send `0xFC22` with the original address on the way down, so the chip starts the next boot as after a cold one. This needs the original address kept somewhere, for example in `/run`.
2. Don't send it twice: on a warm boot, read the chip's current address first and skip the command if it already has the Linux one (the MediaTek path does this).
3. Reset the Bluetooth side before the warm restart: unbind `btusb` and reset the chip's USB device, or send an HCI reset.

Test plan for an IW620 console with both on: cold start and check `ps5-bt-address status` shows the Linux address and the controller connects; warm restart and check the adapter comes back (`bluetoothctl show`) and the controller reconnects; ten warm restarts in a row, then a cold start, checking Wi-Fi each time; on failure, `sudo dmesg | grep -i -e btusb -e btmrvl -e "usb 5-"`.

:::note[PS5 Bazzite Deck]
While the address is on, the image replaces warm restarts with normal ones on IW620 consoles. `ps5-bt-address off` turns the address off instead.
:::

## Next steps

- [Hardware status](/hardware/matrix): what works on each model
- [After installing](/post-install/all-distros)
- [Troubleshooting & help](/troubleshooting/getting-help)
