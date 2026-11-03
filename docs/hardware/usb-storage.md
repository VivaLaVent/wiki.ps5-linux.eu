---
title: USB and storage
sidebar_position: 6
description: USB ports, hubs, network adapters, USB drives, M.2 drives and the Gen3 NVMe unlock.
---

# USB and storage

Which USB port to boot from, what to expect from hubs, adapters and external SSDs, and what the M.2 slot accepts.

## USB ports

Every PS5 has fast ports (SuperSpeed, 10 Gbit/s) and one slow port (USB 2.0, 480 Mbit/s). The slow port boots Linux too, but everything that reads from the drive takes much longer.

**Original PS5:**

| Port | Type | Speed | Boot from it? |
| --- | --- | --- | --- |
| Front | USB-C | USB 3.x | ✅ Recommended |
| Front | USB-A | USB 2.0 | ⚠️ Possible, but slow |
| Rear (2×) | USB-A | USB 3.x | ✅ Yes |

**PS5 Slim:** boot from the two **rear USB-A** ports. One of the two front USB-C ports is the slow one.

Once Linux is running, every port is usable. Put the controller or keyboard on the slow port and keep the fast ports for the drive. While the loader puts the console into rest mode, keep hubs, keyboards and mice off the fast ports: they can stop rest mode and send the console back to the PS5 OS, see [Known issues](/troubleshooting/known-issues#rest-mode-error-back-to-the-ps5-login-screen).

## USB hubs and docks

Hubs and USB-C docks work as on any Linux PC, including their Ethernet ports (a 2.5 GbE port in a dock runs at full speed) and their USB-A ports. A dock can also sit behind a USB-A-to-USB-C adapter. Two things to keep in mind: connect the dock after Linux is up when it keeps the console from entering rest mode, and don't expect the dock's video output to do anything, since the console's display path goes through the HDMI chip (the front USB-C port's DisplayPort output is a separate, opt-in feature, see [Hardware overview](./overview.md#usb)).

## USB network adapters

Any Wi-Fi or Ethernet adapter with a Linux driver works; the ready-made images carry the usual drivers. A USB Wi-Fi adapter is the simple way to get online on a kernel that lacks the driver for your internal chip. For wired adapters, the **RTL8156B** chipset is a safe choice, see [Ethernet](/using-linux/networking/ethernet#usb-ethernet-adapters-keep-disconnecting).

:::warning[An eGPU is not possible]
An external GPU on an M.2-to-PCIe riser does not work on the PS5. The question comes up often; the answer is no.
:::

## USB drive (required)

Use a drive of **64 GB or more** for the official and community images (32 GB for [PS5 Bazzite Deck](/installation/bazzite-deck)). If you only have a small drive, see [No 64 GB USB drive?](/installation/m2-install#no-64-gb-usb-drive).

An external SSD is much faster than a flash drive. If an SSD in an enclosure isn't detected, change the cable (USB 3.x) and the port before you suspect the drive.

:::tip[USB SSD disconnects, freezes or shows I/O errors]
Many USB-C SSDs and enclosures have buggy UAS support. Turn UAS off for that drive only: find its ID (`xxxx:yyyy`) with `lsusb`, then add this to `cmdline.txt`:

```text title="cmdline.txt"
usb-storage.quirks=xxxx:yyyy:u
```
:::

:::warning[Some enclosures don't boot with the loader]
If Linux won't boot from an SSD in a USB enclosure, try a different enclosure.
:::

:::warning[Rear ports and M.2 enclosures]
An M.2 enclosure that boots from the rear USB-A ports on one kernel is sometimes only detected on the front USB-C port with another. Whether that is the kernel or the enclosure isn't settled. If a rear port shows nothing, move the drive to the front USB-C port before you look further.
:::

:::warning[Enclosure goes to sleep]
Some SSD enclosures have their own idle timer and don't wake up again once Linux has started. The symptoms look like a dead display or a bad image. Turn off the desktop's automatic screen blanking so the system stays active, and if the enclosure still sleeps, use another one.
:::

:::tip[The drive shows much less free space than its capacity]
The root partition starts small and is meant to grow to the drive on the first boot. If `df` shows only a few GB free on a much larger drive, grow the filesystem:

```bash
sudo resize2fs /dev/sda1
```

Change the device and partition to match your drive.
:::

### Root filesystem not found or boot hangs

If the kernel starts but reports that it can't find the root filesystem, or boot stalls with a USB SSD, the drive is probably slow to appear. Add these to `cmdline.txt`, together with the UAS setting above if you have I/O errors:

```text
rootwait rootdelay=60 usbcore.autosuspend=-1
```

`rootwait rootdelay=60` waits up to 60 seconds for the drive, and `usbcore.autosuspend=-1` stops USB devices from going to sleep. For two drives, list both in the quirks: `usb-storage.quirks=xxxx:yyyy:u,aaaa:bbbb:u`.

## M.2 drives

- **NVMe only.** SATA M.2 drives don't work in the slot, with or without an adapter.
- **Gen3 NVMe** drives are refused by the PS5 OS, but can be unlocked, see [Gen3 NVMe unlock](#gen3-nvme-unlock) below. Drives under 250 GB also work once unlocked.
- Community test results: [M.2 compatibility list](./m2-compatibility.md).

To install Linux on an M.2 drive, see [Install to M.2](/installation/m2-install).

## Gen3 NVMe unlock

The PS5 OS refuses Gen3 NVMe drives as too slow (it asks for 5,500 MB/s). For Linux the speed is irrelevant, and for PS5 games the difference is a second or two on loading screens.

The check reads a small header at the start of the drive. Copying the first 2 MB from a Gen4 drive that a PS5 has formatted onto the Gen3 drive makes the PS5 accept it.

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

:::tip[No Gen4 drive?]
Bringus Studios documented the method and links a ready-made 2 MB dump in the description of this video: [youtube.com/watch?v=Uds315QBUnE](https://www.youtube.com/watch?v=Uds315QBUnE).

Shared dumps don't work for everyone, see the [M.2 compatibility list](./m2-compatibility.md). If it fails, borrow a Gen4 drive and make your own.
:::

:::warning[Don't reformat the Gen3 drive on the PS5]
Formatting it again under **Settings → Storage** wipes the unlocked header. If that happens, write the 2 MB header again from a PC.
:::

**Firmware compatibility:** every report on the early firmware versions that first got M.2 support succeeded; on newer firmware the results are mixed, with successes and failures on the same version and the same shared dump. The [M.2 compatibility list](./m2-compatibility.md) has them all. Where it fails, the dump is the usual suspect: make your own from a PS5-formatted Gen4 drive instead of using a shared one.
