---
title: Recovery via chroot
sidebar_position: 3
description: Fix an install that no longer boots by chrooting into it from another Linux system.
---

# Recovery via chroot

If your install no longer boots but you have access to another Linux system (booted from another USB drive, or another machine), you can chroot into your install to fix it.

## Find your partition

```bash
lsblk -f
```

Look for the ext4 partition: `nvme0n1p3` for an M.2 install, or `sdXN` for a USB drive.

## Chroot into an M.2 install

```bash
sudo mkdir -p /mnt/ps5root
sudo mount /dev/nvme0n1p3 /mnt/ps5root

sudo mount --bind /dev  /mnt/ps5root/dev
sudo mount --bind /proc /mnt/ps5root/proc
sudo mount --bind /sys  /mnt/ps5root/sys
sudo mount --bind /run  /mnt/ps5root/run

sudo chroot /mnt/ps5root

# Make your fixes here, then:
exit

sudo umount /mnt/ps5root/{run,dev,proc,sys}
sudo umount /mnt/ps5root
```

## Common fixes inside the chroot

- **Reinstall the kernel:** `dpkg -i /tmp/linux-ps5_*.deb`
- **Create a user** (for example when Ubuntu went black before setup finished):

  ```bash
  adduser <username>
  usermod -aG sudo <username>
  ```

- **Fix home folder permissions:** `chown -R <user>:<user> /home/<user>`

## Reinstall the kernel on a USB drive

If your external USB drive no longer boots, reinstall the kernel `.deb` through a chroot. Replace `sdXN` with the root filesystem partition and use the kernel package you want to install.

```bash
sudo mkdir -p /mnt/usb
sudo mount /dev/sdXN /mnt/usb

sudo mount --bind /dev      /mnt/usb/dev
sudo mount --bind /dev/pts  /mnt/usb/dev/pts
sudo mount --bind /proc     /mnt/usb/proc
sudo mount --bind /sys      /mnt/usb/sys
sudo mount --bind /run      /mnt/usb/run

sudo cp ./linux-ps5_7.0.10_amd64.deb /mnt/usb/tmp/

sudo chroot /mnt/usb /bin/bash

cd /tmp
dpkg -i linux-ps5_7.0.10_amd64.deb
```

When you're done, `exit` the chroot and unmount everything in reverse order, as in the M.2 example above.
