---
title: Storage and USB
sidebar_position: 9
description: Fixes for PS5 Linux USB drives that disconnect, aren't found at boot, don't boot from an enclosure, or show too little space.
hardware: [original, slim, pro]
applies_to: all
---

# Storage and USB

Problems with the drive Linux runs from. Which drives and ports to use is on [Drives and USB ports](/getting-started/drives).

## Quick answers

| Problem | Do this |
| --- | --- |
| The USB SSD disconnects, freezes or shows I/O errors | Turn UAS off for that drive, see [UAS](#uas) |
| "Root filesystem not found", or the start hangs | `rootwait rootdelay=60 usbcore.autosuspend=-1` in `cmdline.txt`, see [Slow to appear](#root) |
| Slow starts, long black screens during Steam updates | A hard drive or a SATA SSD in a cheap adapter: wait while its light shows activity, or move to a USB NVMe SSD or the [M.2 slot](/installation/m2-install) <a id="slow-drive"></a> |
| Emergency shell after holding the power button | Let the filesystem check finish. If it doesn't start: `sudo e2fsck -f /dev/sdX4` from a Linux PC (partition 4 is the root on a bootc install) |
| Linux won't start from an SSD in an enclosure | Another enclosure |
| Nothing on a rear USB port | Move the drive to the front USB-C port |
| The picture dies after a while and the drive is asleep | The enclosure's own idle timer: turn off screen blanking, or use another enclosure |
| Much less free space than the drive's size | `sudo resize2fs /dev/sda1` (your root partition) |

## Turn UAS off for one drive {#uas}

Many USB-C SSDs and enclosures have buggy UAS support. Find the drive's ID (`xxxx:yyyy`) with `lsusb` and add this to `cmdline.txt`:

```text title="cmdline.txt"
usb-storage.quirks=xxxx:yyyy:u
```

Two drives: `usb-storage.quirks=xxxx:yyyy:u,aaaa:bbbb:u`.

## A drive that is slow to appear {#root}

```text title="cmdline.txt"
rootwait rootdelay=60 usbcore.autosuspend=-1
```

It waits up to 60 seconds for the drive and keeps USB devices from going to sleep. PS5 Bazzite Deck sets `usbcore.autosuspend=-1` itself from v2.10.
