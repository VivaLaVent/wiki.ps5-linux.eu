---
title: "After installing: all images"
sidebar_label: All images
sidebar_position: 1
description: "Settings that apply to every PS5 Linux image, PS5 Bazzite Deck included: password, GPU memory, gaming performance, memory and swap."
hardware: [original, slim, pro]
applies_to: all
---

# After installing: all images

Linux is running. These steps apply to every image, PS5 Bazzite Deck included; none of them are generic Linux setup. What only one kind of image needs is on [PS5 Bazzite Deck](/post-install/bazzite) and [Other images](/post-install/not-bazzite-deck), each with its own boot options; editing `cmdline.txt` and `vram.txt` is on [Boot options](/post-install/boot-options).

## Change the password and check SSH

Most images ship with SSH on and a known password. Change it:

```bash
passwd
```

The default users per image are on [Connect over SSH](/post-install/ssh#ssh-availability-by-distro). Keep SSH working: it is how you get in when the display goes black.

## Disable the screen saver

It is broken on the PS5 and can't be dismissed once it starts. Turn it off in your desktop's power settings before any long install or download. Over SSH, `sudo reboot` is the way out if it already started.

## Set the GPU memory

For gaming, set `vram.txt` on the boot partition to 6 GB, `180000000` (a hexadecimal byte count), see [Edit vram.txt](/post-install/boot-options#edit-vramtxt). PS5 Bazzite Deck does this from v2.6.1. Why 6 GB, and when to choose less or raise `ttm.pages_limit`, is on [VRAM](/troubleshooting/gpu#vram).

## Gaming performance {#gaming-performance}

Steam and Proton run on the PS5 as on any Linux PC with a mid-range RDNA2 GPU. These are the settings that matter on the console; the limits you will run into are on [GPU](/troubleshooting/gpu#limits).

### Steam and Proton {#steam-and-proton}

Pick **Proton Experimental** in Steam's compatibility settings for the newest fixes, and for games with Easy Anti-Cheat or BattlEye try the dedicated **Proton EAC** or **Proton BE** builds. A game that fails or runs slowly on one Proton version often does better on another: Halo: The Master Chief Collection, for example, was reported to run much faster on Proton 10 than on Experimental. Switch it in the game's **Properties → Compatibility**; a tool such as ProtonPlus adds more builds.

### Performance tips

The basics (6 GB in `vram.txt`, and on other distros the fan, clocks and Wi-Fi driver) come first. On top of those:

- **Render below 4K.** 1800p gives most games a large frame rate gain over 4K for little visible loss; 1440p more so.
- **Remove `idle=halt`** from `cmdline.txt` if you notice micro-stuttering.
- **Graphical glitches in one game:** see [GPU](/troubleshooting/gpu#performance-tips) for `RADV_DEBUG=nohiz`.
- **Unlock the extra compute units** if your console has good ones, see [40 CU unlock](/troubleshooting/gpu#40-cu-unlock).
- **Raise the GPU memory ceiling** with `ttm.pages_limit` for games that need more than the 6 GB setting gives, see [VRAM](/troubleshooting/gpu#vram).
- **Add swap or zram** when a desktop with Steam and a browser open runs out of memory, see [Memory, VRAM and swap](#memory-and-swap).
- **Skip the desktop.** Gamescope started from a TTY, or an image that boots into Gaming Mode, leaves the most memory and GPU time to the game, and Gamescope's frame limiter and upscaler come with it.

### Game streaming

With a VCN-enabled kernel (see [Hardware video (VCN)](/troubleshooting/gpu#video-engine)), streaming can use H.264 hardware encoding through VAAPI. HEVC encoding only works with I-frames, so keep streaming on H.264. Vulkan video encoding is not available on this GPU (GFX1013).

- **Sunshine and Moonlight:** set `encoder = vaapi` in Sunshine and turn HEVC and AV1 off so it stays on H.264. 1080p at 60 and at 120 Hz stream well, and a DualSense connected to the client is passed through. Without VCN the stream fails with `[h264_vulkan] Encoding of h264 is not supported by this device`.
- **Steam Link:** works with x264 software encoding at the cost of noticeable CPU time.
- **Standalone VR headsets:** WiVRn has given better results than Steam Link or ALVR for PC VR. Raise the bitrate if the picture pixelates or the audio stutters.

## Memory, VRAM and swap {#memory-and-swap}

"VRAM", "GTT" and "swap" get mixed up a lot. The PS5 has one pool of memory, and each term below describes a different part of how that pool is used.

### One pool, not two

A gaming PC has system RAM for the CPU and separate VRAM on the graphics card. The PS5 does not: it has **16 GB of unified GDDR6** that the CPU and GPU share. About 14 GB is usable by the OS, and the rest is reserved for firmware, see [Hardware status](/getting-started/hardware#soc-original-ps5-and-slim).

On Linux this means:

- There is no copy between "system RAM" and "video RAM". Both are the same chips.
- Memory given to the GPU is memory taken away from everything else, and the other way around.

### The three terms

| Term | What it is | Where you set it |
| --- | --- | --- |
| **VRAM split** | Memory reserved up front for the GPU. This is only the **minimum**. | `vram.txt` on the FAT32 partition |
| **GTT** | Extra GPU memory the driver takes from the rest of the RAM when it needs it. This is what makes VRAM "dynamic". | `ttm.pages_limit` in `cmdline.txt` |
| **Swap** | Space on a drive (or compressed space in RAM) that Linux uses when normal RAM runs out. | A swap file, a swap partition or zram |

The first two decide **how much memory the GPU can use**. Swap is a general Linux feature for **the whole system running out of RAM**. They are separate settings.

The ceiling for the GPU is the `vram.txt` split plus half of the remaining RAM; the formula, the sizes and the error you see at the ceiling are on [VRAM](/troubleshooting/gpu#vram).

### Does swap help games?

Swap helps the **system** when normal RAM is full: browsers, launchers, shader compilation and similar background work. With only 14 GB usable and the GPU taking its share from the same pool, a Linux desktop with Steam running can fill up.

What this wiki does **not** claim is that swap raises the GPU memory ceiling. The ceiling only involves `vram.txt` and the remaining RAM. If a game crashes with `Not enough memory for command submission`, change `ttm.pages_limit`; adding swap is not the documented fix. A different error under memory pressure, `Failed to pin framebuffer: -ENOMEM`, has gone away for one user after adding more zram; that is a lead, not a confirmed fix.

:::note[Not tested]
How the GPU driver behaves when the whole system is deep into swap has not been documented on the PS5 yet. If you test it, share your results on [Discord](https://discord.gg/ps5linux).
:::

### Choosing where swap lives

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

### Add a swap file

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

#### Remove it again

```bash
sudo swapoff /swapfile
sudo rm /swapfile
```

Then delete the `/swapfile` line from `/etc/fstab`.

### Use zram instead

zram creates a compressed swap device in RAM. Nothing is written to the drive, so there is no wear, and it is fast. On systemd-based distros the usual tool is `zram-generator`. Install it with your package manager, then create the config:

```ini title="/etc/systemd/zram-generator.conf"
[zram0]
zram-size = ram / 2
compression-algorithm = zstd
```

It applies from the next start; check with `swapon --show`. Some distros enable zram by default, so check first.

### Tuning how eagerly Linux swaps

The `vm.swappiness` setting controls how willingly Linux moves memory to swap. A lower value keeps more in RAM. Check the current value:

```bash
cat /proc/sys/vm/swappiness
```

Set it for the current session:

```bash
sudo sysctl vm.swappiness=10
```

To make it permanent, put `vm.swappiness=10` in a file under `/etc/sysctl.d/`. With zram, a higher value is normal, so leave the default if you use it.

## Next steps

- **PS5 Bazzite Deck:** [After installing: PS5 Bazzite Deck](/post-install/bazzite)
- **Official or self-built images:** [After installing: other images](/post-install/not-bazzite-deck)
