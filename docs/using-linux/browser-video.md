---
title: Browser video and monitoring
sidebar_label: Browser video
sidebar_position: 8
description: Turn on hardware video decode in Chrome and Firefox, avoid AV1, and read GPU load without a sensor.
---

# Browser video and monitoring

Hardware video decode needs a kernel with VCN support, see [Hardware video (VCN)](/hardware/vcn). With it, browsers can decode H.264 video on the GPU instead of the CPU.

## Chrome

Put these flags in `~/.config/chrome-flags.conf`:

```text title="~/.config/chrome-flags.conf"
--ozone-platform=wayland
--enable-features=AcceleratedVideoDecodeLinuxGL,AcceleratedVideoDecodeLinuxZeroCopyGL,AcceleratedVideoEncoder,VaapiIgnoreDriverChecks
```

Restart Chrome. Open `chrome://gpu` and check that **Video Decode** reads as hardware accelerated. The file is read by Arch-based packages of Chrome. Other packages may need the flags on the command line.

## Firefox

Firefox uses hardware decode by default when VAAPI works. No flags are needed.

## YouTube and AV1

The GPU has no AV1 decoder, so AV1 video falls back to the CPU and can stutter. Use an extension such as enhanced-h264ify to make YouTube serve H.264.

## Read GPU load

On the original PS5 and the Slim the GPU has no load sensor in the kernel, so KDE's system monitor shows no GPU usage; `nvtop` in a terminal shows what the driver does know. On the PS5 Pro the SMU backend provides `gpu_busy_percent`, and overlays such as MangoHud show the load.

:::note[Not tested]
The Chrome flags were reported on the official CachyOS image. The encoder flag turns on hardware encode, which only works well with H.264, see [Using it with FFmpeg](/hardware/vcn#using-it-with-ffmpeg).
:::
