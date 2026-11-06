---
title: Flash the image to USB
sidebar_label: Flash to USB
sidebar_position: 1
description: Write the downloaded PS5 Linux image to a USB drive with balenaEtcher or dd, from Windows, macOS or Linux.
hardware: [original, slim, pro]
applies_to: all
---

# Flash the image to USB

You have an image file from [Choose your image](/getting-started/which-image): a PS5 Bazzite Deck `.img`, or an official `.img.xz`.

The drive must be **64 GB or larger**; an external SSD makes everything faster. Flashing erases the drive.

## Check the download {#check-the-download}

PS5 Bazzite Deck's image comes as several `.img.7z.001`, `.002`, … parts. Extract them with [7-Zip](https://www.7-zip.org) by opening the `.001` file; Windows' built-in extraction and some other tools produce a broken `.img`. The release's `.sha256` file lists the `.img`'s checksum on its first line. Compare it with yours:

- **Windows:** `certutil -hashfile ps5-bazzite-deck-bootc-vX.Y.img SHA256`
- **Linux or macOS:** `sha256sum ps5-bazzite-deck-bootc-vX.Y.img` (macOS: `shasum -a 256 …`)

Releases before v2.6.1 list only the checksums of the `.7z` parts.

## Flash it

**Linux or macOS:**

```bash
# Find your drive first with lsblk (Linux) or diskutil list (macOS)
sudo dd if=ps5-ubuntu2604.img of=/dev/sdX bs=4M status=progress conv=fsync
```

On Linux you can also flash a compressed `.img.xz` directly, without decompressing it first:

```bash
xzcat ps5-ubuntu2604.img.xz | sudo dd of=/dev/sdX bs=4M status=progress conv=fsync
sync
```

:::danger
Double-check the target device. `dd` overwrites whatever you point it at without asking.
:::

**Windows:** use [balenaEtcher](https://etcher.balena.io/):

1. **Flash from file** → pick the `.img` (an `.img.xz` works too, without unpacking it first).
2. **Select target** → pick the USB drive. Check its size: everything on it is erased.
3. **Flash!**, then wait until it has also checked the written drive.

When Windows then offers to format the drive, choose **Cancel**: the Linux partitions are fine, Windows just can't read them. Formatting erases the install.

:::warning[Not Rufus]
The image has to be written to the drive byte for byte, which Rufus calls **DD mode**. Rufus used to ask whether to write in ISO or DD mode; current versions no longer ask, and drives flashed with them stopped in an emergency shell (`/dev/disk/by-label/bazzite-deck does not exist`) for several users. balenaEtcher always writes byte for byte, and it fixed the problem for all of them.
:::

## Plug the drive into the PS5

Use a fast port, see [USB ports](/getting-started/drives#usb-ports); the slow USB 2.0 port is for a controller or keyboard. To change boot options in `cmdline.txt` from your PC first, see [Edit cmdline.txt from a PC](/post-install/boot-options#edit-from-a-pc).

## Next steps

**[Start Linux with the loader](/installation/booting)**.
