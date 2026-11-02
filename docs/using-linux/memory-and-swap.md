---
title: Memory, VRAM and swap
sidebar_label: Memory and swap
sidebar_position: 6
description: How the PS5's shared memory is split between the CPU and GPU, what "VRAM swapping" really means, and how to add a swap file or zram.
---

# Memory, VRAM and swap

"VRAM", "GTT" and "swap" get mixed up a lot. This page separates them. The PS5 has one pool of memory, and each term below describes a different part of how that pool is used.

## One pool, not two

A gaming PC has system RAM for the CPU and separate VRAM on the graphics card. The PS5 does not: it has **16 GB of unified GDDR6** that the CPU and GPU share. About 14 GB is usable by the OS, and the rest is reserved for firmware, see [Hardware overview](/hardware/overview#soc-original-ps5-and-slim).

On Linux this means:

- There is no copy between "system RAM" and "video RAM". Both are the same chips.
- Memory given to the GPU is memory taken away from everything else, and the other way around.

## The three terms

| Term | What it is | Where you set it |
| --- | --- | --- |
| **VRAM split** | Memory reserved up front for the GPU. This is only the **minimum**. | `vram.txt` on the FAT32 partition |
| **GTT** | Extra GPU memory the driver takes from the rest of the RAM when it needs it. This is what makes VRAM "dynamic". | `ttm.pages_limit` in `cmdline.txt` |
| **Swap** | Space on a drive (or compressed space in RAM) that Linux uses when normal RAM runs out. | A swap file, a swap partition or zram |

The first two decide **how much memory the GPU can use**. Swap is a general Linux feature for **the whole system running out of RAM**. They are separate settings.

### What "dynamic VRAM" means

The default `vram.txt` value is 512 MB, but the GPU is not limited to that. The driver takes more memory as a game needs it. The ceiling is:

```text
(vram.txt split) + (remaining RAM not in that split) / 2
```

Raising `vram.txt` also raises that ceiling, but it permanently locks that memory away from the rest of the system. Raising `ttm.pages_limit` gives the same ceiling without locking anything. The full explanation, the size table and a worked example are in [VRAM](/hardware/gpu#vram).

:::info[Not enough memory for command submission]
If a game crashes with `amdgpu_vm_validate() failed / Not enough memory for command submission` while plenty of RAM looks free, you have hit the GTT ceiling, not a lack of RAM. The fix is `ttm.pages_limit`, see [VRAM](/hardware/gpu#vram).
:::

## Does swap help games?

Swap helps the **system** when normal RAM is full: browsers, launchers, shader compilation and similar background work. With only 14 GB usable and the GPU taking its share from the same pool, a Linux desktop with Steam running can fill up.

What this wiki does **not** claim is that swap raises the GPU memory ceiling. The ceiling formula above only involves `vram.txt` and the remaining RAM. If a game crashes with the error above, change `ttm.pages_limit`; adding swap is not the documented fix.

:::note[Not tested]
How the GPU driver behaves when the whole system is deep into swap has not been documented on the PS5 yet. If you test it, share your results on [Discord](https://discord.gg/ps5linux).
:::

## Choosing where swap lives

The place you put swap matters a lot, because swap is only useful if it is faster than the alternative (an out-of-memory crash).

| Option | Good for | Watch out for |
| --- | --- | --- |
| **zram** (compressed swap in RAM) | Small, fast headroom with no drive wear | Uses RAM to store the compressed pages, so it gives less headroom than a swap file |
| **Swap file on the M.2 SSD** | The best drive option: an NVMe drive is fast and large | Only available if you [installed to M.2](/installation/m2-install) |
| **Swap file on a USB SSD** | A reasonable fallback | Slower than M.2, and it shares the USB bus with everything else on the drive |
| **Swap file on a USB flash drive or SD adapter** | Avoid | Slow and wears out quickly; swapping to it can make the system freeze |

:::warning[Don't swap to the drive that holds the loader]
Your Linux drive must stay plugged in after boot: the loader reads its FAT32 partition. A swap file on that same drive is fine, but if you unplug or lose the drive while swap is in use, the system crashes.
:::

Your image may already have zram or a swap file enabled. Check before adding one:

```bash
swapon --show
free -h
```

If `swapon --show` lists a device, swap is already active and you may not need to change anything.

## Add a swap file

This creates an 8 GB swap file. Change the size to whatever you want. It works on ext4, the filesystem used by the standard images.

```bash
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

Make it permanent by adding it to `/etc/fstab`:

```bash
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Check that it is active:

```bash
swapon --show
```

:::tip[Btrfs (for example PS5 Bazzite Deck)]
Don't use `fallocate` on Btrfs. Create the file with Btrfs's own command instead, which sets up the file correctly for swap:

```bash
sudo btrfs filesystem mkswapfile --size 8G /swapfile
sudo swapon /swapfile
```
:::

### Remove it again

```bash
sudo swapoff /swapfile
sudo rm /swapfile
```

Then delete the `/swapfile` line from `/etc/fstab`.

## Use zram instead

zram creates a compressed swap device in RAM. Nothing is written to the drive, so there is no wear, and it is fast. On systemd-based distros the usual tool is `zram-generator`. Install it with your package manager, then create the config:

```ini title="/etc/systemd/zram-generator.conf"
[zram0]
zram-size = ram / 2
compression-algorithm = zstd
```

Apply it with a reboot, then check with `swapon --show`. Some distros enable zram by default, so check first.

## Tuning how eagerly Linux swaps

The `vm.swappiness` setting controls how willingly Linux moves memory to swap. A lower value keeps more in RAM. Check the current value:

```bash
cat /proc/sys/vm/swappiness
```

Set it for the current session:

```bash
sudo sysctl vm.swappiness=10
```

To make it permanent, put `vm.swappiness=10` in a file under `/etc/sysctl.d/`. With zram, a higher value is normal, so leave the default if you use it.
