---
title: Gaming performance
sidebar_position: 5
description: Get the best gaming performance out of PS5 Linux, stream games with hardware encoding, and know the limits that are still open.
---

# Gaming performance

Steam and Proton run on the PS5 as on any Linux PC with a mid-range RDNA2 GPU. This page has the settings that matter on the console and the limits you will run into.

## Steam and Proton

:::warning[Don't use the Snap version of Steam]
Ubuntu's Snap package of Steam runs in a sandbox that gets in the way on the PS5 images. Install Steam from apt instead (or the `.deb` from [store.steampowered.com/about](https://store.steampowered.com/about/)):

```bash
sudo dpkg --add-architecture i386
sudo apt update
sudo apt install steam
```
:::

Pick **Proton Experimental** in Steam's compatibility settings for the newest fixes, and for games with Easy Anti-Cheat or BattlEye try the dedicated **Proton EAC** or **Proton BE** builds. A game that fails on one Proton version often runs on another; a tool such as ProtonPlus makes switching easy.

## Performance tips

The basics (fan and clocks checked, 6 GB in `vram.txt`, the Wi-Fi driver) are in the [Post-install checklist](/installation/post-install). On top of those:

- **Render below 4K.** 1800p gives most games a large frame rate gain over 4K for little visible loss; 1440p more so.
- **Remove `idle=halt`** from `cmdline.txt` if you notice micro-stuttering.
- **Unlock the extra compute units** if your console has good ones, see [40 CU unlock](/hardware/gpu#40-cu-unlock).
- **Raise the GPU memory ceiling** with `ttm.pages_limit` for games that need more than the 6 GB setting gives, see [VRAM](/hardware/gpu#vram).
- **Add swap or zram** when a desktop with Steam and a browser open runs out of memory, see [Memory, VRAM and swap](/using-linux/memory-and-swap).
- **Skip the desktop.** Gamescope started from a TTY, or an image that boots into Gaming Mode, leaves the most memory and GPU time to the game, and Gamescope's frame limiter and upscaler come with it.

## Game streaming

With a VCN-enabled kernel (see [Hardware video (VCN)](/hardware/vcn)), streaming can use H.264 hardware encoding through VAAPI. HEVC encoding only works with I-frames, so keep streaming on H.264. Vulkan video encoding is not available on this GPU (GFX1013).

- **Sunshine and Moonlight:** set `encoder = vaapi` in Sunshine and turn HEVC and AV1 off so it stays on H.264. 1080p at 60 and at 120 Hz stream well, and a DualSense connected to the client is passed through. Without VCN the stream fails with `[h264_vulkan] Encoding of h264 is not supported by this device`.
- **Steam Link:** works with x264 software encoding at the cost of noticeable CPU time.
- **Standalone VR headsets:** WiVRn has given better results than Steam Link or ALVR for PC VR. Raise the bitrate if the picture pixelates or the audio stutters.

## Known limits

Things every PS5 Linux user runs into sooner or later, whatever the distro.

| Limit | What happens | Status |
| --- | --- | --- |
| GPU memory ceiling | A game that needs more than the GTT ceiling crashes with `Not enough memory for command submission`. Raise `ttm.pages_limit` rather than a fixed `vram.txt` carve-out, see [VRAM](/hardware/gpu#vram). | Documented fix |
| 40 CU unlock | More GPU power on units whose disabled pairs are good; artefacts, a purple tint or crashes on units where one isn't, see [40 CU unlock](/hardware/gpu#40-cu-unlock). Don't use it on a Pro. | Silicon lottery |
| HEVC encoding | The video engine corrupts colours with P-frames (red screen when streaming or recording). Use H.264, or HEVC with I-frames only, see [VCN](/hardware/vcn#using-it-with-ffmpeg). | Known not to work |
| GPU fault at session switches | Switching between a Gamescope session and a desktop can trigger a GPU page fault and `ring gfx_0.0.0 timeout`, most often at 4K120 on some TVs. It is on the compositor side; keep the desktop at 4K60 and switch sessions at the boot instead, see [Boot to the desktop](/using-linux/boot-to-desktop). On a PS5 Pro the fault isn't recovered (`GPU Recovery Failed`) and the screen stays black until a restart. If you hit it, save the coredump before restarting: `sudo cp /sys/class/drm/card0/device/devcoredump/data ~/gpu-coredump.txt`. | Open |
| `Failed to pin framebuffer: -ENOMEM` | Reported under memory pressure with a desktop and Steam running. No confirmed fix; more zram helped in one report, see [Memory and swap](/using-linux/memory-and-swap). | Open |
