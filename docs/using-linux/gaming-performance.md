---
title: Gaming performance
sidebar_position: 5
description: Get the best gaming performance out of PS5 Linux, stream games with hardware encoding, and know the limits that are still open.
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

The basics (fan and boost on, 6 GB in `vram.txt`, the Wi-Fi driver) are in the [Post-install checklist](/installation/post-install). On top of those:

- **1800p is a sweet spot:** many games that struggle at 4K reach 90+ fps at 1800p.
- **Remove `idle=halt`** from `cmdline.txt` if you notice micro-stuttering.
- **Unlock the extra compute units** if your unit has them, see [40 CU unlock](/hardware/gpu#40-cu-unlock).
- **Raise the GPU memory ceiling** with `ttm.pages_limit` for games that need more than the 6 GB setting gives, see [VRAM](/hardware/gpu#vram).
- Running **Gamescope straight from a TTY** (no desktop environment) is the lowest-overhead way to play. Gamescope also handles frame rate limiting and upscaling.

## Game streaming

With a VCN-enabled kernel (see [Hardware video (VCN)](/hardware/vcn)), streaming can use H.264 hardware encoding through VAAPI. HEVC encoding only works with I-frames, so stick to H.264 for streaming. Vulkan video encoding is not supported on this GPU (GFX1013).

- **Sunshine + Moonlight:** works great with VCN. Tested with Sunshine 2026.914 streaming to Moonlight with `encoder = vaapi` and H.264 only (turn HEVC and AV1 off in Sunshine). Both 1080p60 and 1080p120 stream fine, and DualSense forwarding works. On the release kernel without VCN, it fails with `[h264_vulkan] Encoding of h264 is not supported by this device`.
- **Steam Link:** works with x264 software encoding. Reported CPU use is about 33% per core while streaming.
- **VR (Quest and other standalone headsets):** WiVRn has given better results than Steam Link or ALVR for PC VR streaming. It is reported to work with the Quest 3. Audio can be choppy at low bitrates; raise the bitrate if you see pixelation or stutter.

## Known limits

Things every PS5 Linux user runs into sooner or later, whatever the distro.

| Limit | What happens | Status |
| --- | --- | --- |
| GPU memory ceiling | A game that needs more than the GTT ceiling crashes with `Not enough memory for command submission`. Raise `ttm.pages_limit` rather than a fixed `vram.txt` carve-out, see [VRAM](/hardware/gpu#vram). | Documented fix |
| 40 CU unlock | More GPU power on units whose disabled pairs are good; artefacts, a purple tint or crashes on units where one isn't, see [40 CU unlock](/hardware/gpu#40-cu-unlock). Don't use it on a Pro. | Silicon lottery |
| HEVC encoding | The video engine corrupts colours with P-frames (red screen when streaming or recording). Use H.264, or HEVC with I-frames only, see [VCN](/hardware/vcn#using-it-with-ffmpeg). | Known not to work |
| GPU page fault at session switches | Switching between a Gamescope session and a desktop can trigger a GPU page fault and `ring gfx_0.0.0 timeout`. It is on the compositor side; the GFX1013 fixes from upstream #57 didn't cure it. If you hit it, save the coredump right away: `sudo cp /sys/class/drm/card0/device/devcoredump/data ~/gpu-coredump.txt`. | Open |
| `Failed to pin framebuffer: -ENOMEM` | Reported under memory pressure with a desktop and Steam running. No fix or workaround confirmed yet; [swap](/using-linux/memory-and-swap) may help, untested. | Open, not tested |

