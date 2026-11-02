---
title: USB and storage
sidebar_position: 4
description: USB ports, hubs, network adapters, USB drives, M.2 drives and the Gen3 NVMe unlock.
---

# USB and storage

## USB ports

| Port | Type | Speed | Boot from it? |
| --- | --- | --- | --- |
| Front bottom | USB-C | USB 3.x | ✅ Recommended |
| Front top | USB-A | USB 2.0 | ⚠️ Possible, but slow |
| Rear | USB-A | USB 3.x | ✅ Yes |

All ports work for peripherals once Linux has booted.

## USB hubs and docks

Confirmed to work with every port functional:

- **StarTech 10G2A1C25EPD-USB-HUB:** USB-C, 2× USB-A. Linux uses the full 2.5 GbE port.
- **Dell WD19TBS dock** (latest firmware): USB-C and all USB-A ports. Linux uses the full 1 GbE port. Also works through a USB 3.1 USB-A-to-USB-C OTG adapter, not only over a direct USB-C connection.
- **Orico PW11-6PR** (6-in-1 dock): Gigabit Ethernet and 3× USB-A confirmed. HDMI untested.

## USB network adapters

Any adapter with a Linux driver should work, since this is a normal Linux system. These are confirmed by users:

- **FENVI 1800 Mbps Wi-Fi 6 USB adapter** (MT7921 chip): works out of the box, no configuration needed.
- **TP-Link Archer TX10UB Nano** (AX900, Wi-Fi 6 + Bluetooth 5.3): Wi-Fi works smoothly.

For wired adapters, look for the **RTL8156B** chipset, see [Ethernet](/using-linux/networking/ethernet#usb-ethernet-adapters-keep-disconnecting).

:::warning[An eGPU is not possible]
Using an M.2-to-PCIe riser for an external GPU has been asked about and is confirmed **not supported**.
:::

## USB drive (required)

Use a drive of **64 GB or more**. If you only have a small drive, see [No 64 GB USB drive?](/installation/m2-install#no-64-gb-usb-drive).

If an M.2 enclosure isn't detected, try a different USB 3.x cable and a different port before assuming the drive is faulty.

:::warning[Reported: rear ports stop detecting M.2 enclosures on newer kernels]
Several users report that an M.2 enclosure that worked on the rear USB-A ports with an older kernel is only detected on the front USB-C port after updating. It is not yet clear whether this is a kernel regression or down to hardware or cable differences. If a rear port shows nothing, try the front USB-C port before troubleshooting further.
:::

:::warning[Enclosure won't wake up after going to sleep]
Some external SSD enclosures enter their own sleep mode after the payload launches and then don't power back on. This can look like a bad image, a bad HDMI connection or a dead TV, when the real cause is the enclosure. Turn off automatic screen blanking so the enclosure stays active. On Ubuntu: **Settings → Power → Automatic Screen Blank → Off**.
:::

:::tip[The drive shows much less free space than its capacity]
The root partition is sparse: it starts small and is meant to grow to fill the drive. If `df` shows only a few GB free on a much larger drive, grow the filesystem:

```bash
sudo resizefs2 /dev/sda1
```

Change the device and partition to match your drive.
:::

## M.2 drives

- **NVMe only.** SATA M.2 drives do **not** work, whatever adapter or enclosure you use.
- **Gen3 NVMe** drives are officially unsupported by Sony, but they can be unlocked, see [Gen3 NVMe unlock](#gen3-nvme-unlock) below. Drives under 250 GB also work once unlocked.
- Community test results: [M.2 compatibility list](./m2-compatibility.md) and the original [spreadsheet](https://docs.google.com/spreadsheets/d/1z35NT5GuQMwAh5G4U8cvb-FTG9SbWVAy07kW6v8dCk0/edit?usp=sharing).

To install Linux on an M.2 drive, see [Install to M.2](/installation/m2-install).

## Gen3 NVMe unlock

Sony blocks Gen3 NVMe drives, saying they are too slow (it requires at least 5,500 MB/s). In practice the difference is about 1–2 seconds on loading screens, which is not a real problem, especially for Linux.

The PS5 checks a small header at the start of the drive. Copying the first 2 MB from any PS5-formatted Gen4 drive onto your Gen3 drive bypasses the check completely.

**You need:**

- A Gen4 NVMe drive that has been formatted by a PS5 (or a ready-made dump)
- Your Gen3 NVMe drive
- A USB NVMe enclosure, or a PC with an M.2 slot

**Steps:**

```bash
# 1. Put the Gen4 drive in the enclosure and connect it to your PC.
#    Dump the first 2 MB:
sudo dd if=/dev/sdX of=ps5_gen4_header.bin bs=1M count=2

# 2. Swap in your Gen3 drive and write the header to it:
sudo dd if=ps5_gen4_header.bin of=/dev/sdX bs=1M count=2
```

Install the Gen3 drive in the PS5. It is detected and formatted as normal.

:::tip[No Gen4 drive? Use Bringus' dump]
Bringus Studios documented this method and shares a ready-made 2 MB dump in the description of this video: [youtube.com/watch?v=Uds315QBUnE](https://www.youtube.com/watch?v=Uds315QBUnE).

Ready-made dumps may not work on higher firmware. If it fails, borrow a Gen4 drive and make your own dump.
:::

:::warning[Don't reformat the Gen3 drive on the PS5]
Formatting it again under **Settings → Storage** wipes the unlocked header. If that happens, simply write the 2 MB header again from a PC.
:::

**Firmware compatibility:** confirmed on 4.00, 4.03 and 4.51. Failures reported on 5.xx and higher are probably user error, most likely the wrong dump. If it doesn't work, make your own dump from a PS5-formatted Gen4 drive instead of using a shared one. See the [M.2 compatibility list](./m2-compatibility.md) for all results.
