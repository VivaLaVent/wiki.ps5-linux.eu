---
title: Storage and USB
sidebar_position: 9
description: Fixes for PS5 Linux USB drives that disconnect, aren't found at boot, don't boot from an enclosure, or show too little space.
hardware: [original, slim, pro]
applies_to: all
---

# Storage and USB

Problems with the drive Linux runs from. Which drives and ports to use in the first place is on [Drives and USB ports](/getting-started/drives).

## Slow starts, long Steam updates, black screens on a hard drive {#slow-drive}

Hard drives, and SATA SSDs in cheap USB adapters, are much slower than a USB NVMe SSD. Starts take minutes, Steam's updates can keep the screen black for a long time, and some adapters drop the drive under a long write (I/O errors, a frozen picture). If the drive's light shows activity, wait. If it happens often, move the system to a USB NVMe SSD or the [M.2 slot](/installation/m2-install). A drive that disconnects needs the UAS setting below.

After holding the power button during a write, the next start can take longer while the filesystem is checked, or stop in an emergency shell. Let it finish; if it doesn't start, check the root partition from a Linux PC with `sudo e2fsck -f /dev/sdX4` (`sdX` is the drive; the root is partition 4 on a bootc install).

## USB SSD disconnects, freezes or shows I/O errors {#uas}

Many USB-C SSDs and enclosures have buggy UAS support. Turn UAS off for that drive only: find its ID (`xxxx:yyyy`) with `lsusb`, then add this to `cmdline.txt`:

```text title="cmdline.txt"
usb-storage.quirks=xxxx:yyyy:u
```

## Some enclosures don't boot with the loader

If Linux won't boot from an SSD in a USB enclosure, try a different enclosure.

## Rear ports and M.2 enclosures

An M.2 enclosure that boots from the rear USB-A ports on one kernel is sometimes only detected on the front USB-C port with another. Whether that is the kernel or the enclosure isn't settled. If a rear port shows nothing, move the drive to the front USB-C port before you look further.

## Enclosure goes to sleep

Some SSD enclosures have their own idle timer and don't wake up again once Linux has started. The symptoms look like a dead display or a bad image. Turn off the desktop's automatic screen blanking so the system stays active, and if the enclosure still sleeps, use another one.

## The drive shows much less free space than its capacity

The root partition starts small and is meant to grow to the drive on the first boot. If `df` shows only a few GB free on a much larger drive, grow the filesystem:

```bash
sudo resize2fs /dev/sda1
```

Change the device and partition to match your drive.

## Root filesystem not found or boot hangs

If the kernel starts but reports that it can't find the root filesystem, or boot stalls with a USB SSD, the drive is probably slow to appear. Add these to `cmdline.txt`, together with the UAS setting above if you have I/O errors:

```text
rootwait rootdelay=60 usbcore.autosuspend=-1
```

`rootwait rootdelay=60` waits up to 60 seconds for the drive, and `usbcore.autosuspend=-1` stops USB devices from going to sleep (set by default on PS5 Bazzite Deck from v2.10). For two drives, list both in the quirks: `usb-storage.quirks=xxxx:yyyy:u,aaaa:bbbb:u`.
