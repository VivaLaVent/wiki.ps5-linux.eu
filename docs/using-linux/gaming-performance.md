---
title: Gaming performance
sidebar_position: 4
description: Get the best gaming performance out of PS5 Linux, and stream games with hardware encoding.
---

# Gaming performance

PS5 Linux runs Steam games through Proton, and performance is solid.

## Steam and Proton

:::warning[Don't use the Snap version of Steam]
The Snap package of Steam has known issues on the PS5 images. On Ubuntu, install it with apt instead (or use the `.deb` from [store.steampowered.com/about](https://store.steampowered.com/about/)):

```bash
sudo dpkg --add-architecture i386
sudo apt update
sudo apt install steam
```
:::

Use **Proton Experimental** (bleeding-edge branch) for the best compatibility. For games with Easy Anti-Cheat or BattlEye, try **Proton EAC** or **Proton BE**.

## Performance tips

- **Turn on the fan and CPU/GPU boost** with `ps5_control` before gaming, see [GPU boost](/hardware/gpu#boost).
- **1800p is a sweet spot:** many games that struggle at 4K reach 90+ fps at 1800p.
- **Set `RADV_DEBUG=nohiz`** globally if you see graphical glitches, see [GPU performance tips](/hardware/gpu#performance-tips).
- **Remove `idle=halt`** from `cmdline.txt` if you notice micro-stuttering.
- **Unlock the extra compute units** if your unit has them, see [40 CU unlock](/hardware/gpu#40-cu-unlock).
- **Raise the GPU memory ceiling** for games that need more than 8 GB of VRAM, see [VRAM](/hardware/gpu#vram).
- Running **Gamescope straight from a TTY** (no desktop environment) is the lowest-overhead way to play. Gamescope also handles frame rate limiting and upscaling.

## Game streaming

With a VCN-enabled kernel (see [Hardware video (VCN)](/hardware/vcn)), streaming can use H.264 hardware encoding through VAAPI. HEVC encoding only works with I-frames, so stick to H.264 for streaming. Vulkan video encoding is not supported on this GPU (GFX1013).

- **Sunshine + Moonlight:** works great with VCN. Tested with Sunshine 2026.914 streaming to Moonlight with `encoder = vaapi` and H.264 only (turn HEVC and AV1 off in Sunshine). Both 1080p60 and 1080p120 stream fine, and DualSense forwarding works. On the release kernel without VCN, it fails with `[h264_vulkan] Encoding of h264 is not supported by this device`.
- **Steam Link:** works with x264 software encoding. Reported CPU use is about 33% per core while streaming.
- **VR (Quest and other standalone headsets):** WiVRn has given better results than Steam Link or ALVR for PC VR streaming. It is reported to work with the Quest 3. Audio can be choppy at low bitrates; raise the bitrate if you see pixelation or stutter.
