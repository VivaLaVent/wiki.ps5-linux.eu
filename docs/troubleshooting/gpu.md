---
title: GPU
sidebar_position: 3
description: Clocks, compute units, VRAM and the video engine of the PS5 GPU, and the limits and errors games run into.
hardware: [original, slim, pro]
applies_to: all
---

# GPU

Clocks, compute units, VRAM and hardware video on the original PS5 and the Slim. The Pro's GPU is on [PS5 Pro](/troubleshooting/ps5-pro).

## Quick answers {#limits}

| Problem | Do this |
| --- | --- |
| Micro-stutter | Remove `idle=halt` from `cmdline.txt` |
| Game crashes after a long session, RAM nearly full | Less VRAM: 4 GB, see [VRAM](#vram) |
| No picture on a distro of your own | `options amdgpu dpm=0 gpu_recovery=0` in `/etc/modprobe.d/ps5-amdgpu.conf`; every working image ships it |

| Limit | What happens | Status |
| --- | --- | --- |
| GPU memory ceiling | A game that needs more than the GTT ceiling crashes with `Not enough memory for command submission`. Raise `ttm.pages_limit` rather than a fixed `vram.txt` carve-out, see [VRAM](/troubleshooting/gpu#vram). | Documented fix |
| 40 CU unlock | More GPU power on units whose disabled pairs are good; artefacts, a purple tint or crashes on units where one isn't, see [40 CU unlock](/troubleshooting/gpu#40-cu-unlock). Don't use it on a Pro. | Silicon lottery |
| HEVC encoding | The video engine corrupts colours with P-frames (red screen when streaming or recording). Use H.264, or HEVC with I-frames only, see [VCN](/troubleshooting/gpu#using-it-with-ffmpeg). | Known not to work |
| GPU fault at session switches | Switching between a Gamescope session and a desktop can trigger a GPU page fault and `ring gfx_0.0.0 timeout`, most often at 4K120 on some TVs. It is on the compositor side; keep the desktop at 4K60 and switch sessions at the boot instead, see [Boot to the desktop](/post-install/boot-to-desktop). On a PS5 Pro the fault isn't recovered (`GPU Recovery Failed`) and the screen stays black until a restart. If you hit it, save the coredump before restarting: `sudo cp /sys/class/drm/card0/device/devcoredump/data ~/gpu-coredump.txt`. | Open |
| `Failed to pin framebuffer: -ENOMEM` | Reported under memory pressure with a desktop and Steam running. No confirmed fix; more zram helped in one report, see [Memory and swap](/post-install/all-distros#memory-and-swap). | Open |
| Graphical glitches in one game | Glitches in a single game. Add `RADV_DEBUG=nohiz %command%` to that game's launch options, see [Performance tips](#performance-tips). | Workaround |
| No AV1 decode, no GPU load sensor on the base PS5 | AV1 video falls back to the CPU; KDE's system monitor shows no GPU usage, see [Browser video](/post-install/browser-video). | Hardware limits |

## Clocks and boost {#clocks-and-boost}

| Kernel | Clocks | What to do |
| --- | --- | --- |
| PS5 Bazzite Deck | GPU governor; CPU boost through `ps5-perf` | Nothing, on by default |
| [rmuxnet's kernel](/post-install/kernel#install-rmuxnets-release) | `ps5-cpufreq` and `ps5-gpufreq` follow the load | CPU boost: `echo 1 \| sudo tee /sys/devices/system/cpu/cpufreq/boost`. Don't use `ps5_control --boost` here |
| Upstream packages | GPU governor; CPU at 3.2 GHz | `sudo ./ps5_control --boost on` from [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools) |
| Older upstream kernels | Fixed at the firmware's clocks | `sudo ./ps5_control --fan on && sudo ./ps5_control --boost on`; `sudo ./install.sh` applies both at every start |

The GPU governor runs 500 to 2,230 MHz (2,350 on the Pro) and slows down at 85 °C: `ps5_gpufreq.temp_limit=<50-95>` in `cmdline.txt`. The current clock is `cur_freq` under `/sys/class/devfreq/`.

## 40 CU unlock {#40-cu-unlock}

Consoles ship with 36 or 38 of the GPU's 40 compute units on. Switching the rest on makes the GPU faster on many consoles and causes green dots, a purple tint, flicker or crashes on others. Try it, and turn it off at the first sign of trouble. **Not on a PS5 Pro.**

Turn it on (`amdgpu.ps5_cu_unlock=3` in `cmdline.txt`):

```bash
E=$(for d in /boot/efi /efi; do sudo test -f $d/cmdline.txt && echo $d && break; done); sudo sed -i -e 's/amdgpu\.ps5_cu_unlock=[0-9]*/amdgpu.ps5_cu_unlock=3/' -e '/ps5_cu_unlock/!s/[[:space:]]*$/ amdgpu.ps5_cu_unlock=3/' $E/cmdline.txt && sudo cat $E/cmdline.txt
```

Power off, start with the loader, and check for `40`:

```bash
sudo dmesg | grep active_cu_number
```

Turn it off:

```bash
E=$(for d in /boot/efi /efi; do sudo test -f $d/cmdline.txt && echo $d && break; done); sudo sed -i 's/ *amdgpu\.ps5_cu_unlock=[0-9]*//' $E/cmdline.txt && sudo cat $E/cmdline.txt
```

- Glitches in a game after the unlock: first `RADV_DEBUG=nohiz %command%` in its Steam launch options.
- Heavy artefacts with all 40: one of your disabled pairs is defective. 38 units perform like 36, so turn it off.
- Values: `0` off, `1` probe, `2` SE0/SH0 only, `3` all, `4` probe all.
- To test without changing `cmdline.txt`: [UMR](https://gitlab.freedesktop.org/tomstdenis/umr) can switch the units on at runtime. Compare a benchmark before and after; its topology view can keep showing them as off.

## Async compute {#async-compute}

Games use the GPU's compute queue for lighting, post-processing and upscaling alongside rendering. Upstream Mesa hides it on this GPU; PS5 Bazzite Deck's RADV turns it on.

| Console | Compute queue |
| --- | --- |
| PS5 Pro | On from PS5 Bazzite Deck v2.6.1. Hide it: `AMD_VIOLA_COMPUTE_QUEUE=0 %command%` |
| Original PS5 and Slim | On from PS5 Bazzite Deck v2.7.3 (bootc). Hide it: `AMD_PS5_COMPUTE_QUEUE=0 %command%`. Hidden on other images |

A corrupted picture, missing geometry or a hang in one game: hide the queue for that game and report it.

## VRAM {#vram}

`vram.txt` on the boot partition sets the **minimum** the GPU reserves, in **hexadecimal bytes**. The loader applies it, so a change takes effect at the next start with the loader, not at a warm reboot. A decimal value ends in a black screen.

| Size | `vram.txt` value |
| --- | --- |
| 512 MB (default) | `20000000` |
| 1 GB | `40000000` |
| 2 GB | `80000000` |
| 4 GB | `100000000` |
| 6 GB (recommended for gaming) | `180000000` |
| 8 GB | `200000000` |

- **PS5 Bazzite Deck sets 6 GB** from v2.6.1. Check: `cat /boot/efi/vram.txt` (`0x180000000`) and the VRAM line of `ps5-report`.
- **Gaming: 6 GB.** A game that crashes after a long session with RAM nearly full: 4 GB.
- **Not gaming: leave the default.** Reserved VRAM is taken from everything else.

The GPU can use more than the minimum: up to `vram.txt + (remaining RAM) / 2`, about 10 GB with 6 GB set. A game that needs more crashes with `Not enough memory for command submission`. Raise the ceiling with `ttm.pages_limit` in `cmdline.txt`: the size in GB × 262144, so `ttm.pages_limit=2621440` for 10 GB. It doesn't make games faster.

## Performance tips {#performance-tips}

- **Micro-stutter:** remove `idle=halt` from `cmdline.txt`.
- **Glitches in one game:** `RADV_DEBUG=nohiz %command%` in that game's launch options only; it costs performance.
- The [AMD BC-250 documentation](https://elektricm.github.io/amd-bc250-docs/) covers the same GPU. Its VRAM section doesn't apply to the PS5.

## Video engine (VCN) {#video-engine}

Hardware video decode and encode work in every current kernel.

| What | Status |
| --- | --- |
| Decode H.264, HEVC Main/Main 10, VP9 Profile 0/2, VC-1 | ✅ Working, bit-exact with software decoding |
| Decode MPEG-2 | ✅ Working, very close but not bit-exact |
| Encode H.264 | ✅ Working |
| Encode HEVC, I-frames only | ✅ Working |
| Encode HEVC, normal GOP with P-frames | ❌ Broken: corrupt colours at every tested bitrate |
| Decode H.264 High 10, AV1, VP8, Theora, MPEG-4 Part 2 | ❌ Not supported by the hardware |

Check it with `vainfo` (package `libva-utils` or `vainfo`).

### FFmpeg {#using-it-with-ffmpeg}

Decode:

```bash
ffmpeg -hwaccel vaapi -i input.mkv -f null -
```

Transcode to H.264:

```bash
ffmpeg -hwaccel vaapi -hwaccel_output_format vaapi -i input.mkv -c:v h264_vaapi -b:v 12M output.mkv
```

HEVC only with I-frames (`-g 1 -bf 0`), at a much higher bitrate; H.264 is the better encoder when file size matters:

```bash
ffmpeg -hwaccel vaapi -hwaccel_output_format vaapi -i input.mkv -c:v hevc_vaapi -g 1 -bf 0 -b:v 25M output.mkv
```

### Browsers and streaming

Firefox decodes in hardware by itself (`about:support` → **Media**). Chrome needs flags, see [Browser video](/post-install/browser-video). Moonlight streaming works through Sunshine with H.264, see [Game streaming](/post-install/all-distros#game-streaming).

### Measurements

Hardware decoding costs about 1% of one CPU core (software: up to most of a core for 4K HEVC Main 10); H.264 transcoding runs at full frame rate at 1 to 2.5% of a core.

<details>
<summary>Decoding: CPU use</summary>

| Codec | Size | Software | VCN | VCN frame check |
| --- | --- | --- | --- | --- |
| H.264 Baseline | 720p | 4.35% | 0.54% | 32 exact frames |
| H.264 Main | 1080p | 17.19% | 0.60% | 32 exact frames |
| H.264 High | 1080p | 17.66% | 0.67% | 32 exact frames |
| HEVC Main | 1080p | 29.77% | 0.54% | 32 exact frames |
| HEVC Main 10 | 1080p | 35.12% | 0.47% | 32 exact frames |
| VP9 Profile 0 | 1080p | 19.40% | 0.60% | 32 exact frames |
| VP9 Profile 2 | 1080p | 23.68% | 0.54% | 32 exact frames |
| MPEG-2 Main | 1080p | 7.76% | 0.74% | 57.09 dB, not exact |
| VC-1 Advanced | 720p | 19.67% | 0.87% | 32 exact frames |
| H.264 High | 4K | 66.89% | 1.74% | 32 exact frames |
| HEVC Main 10 | 4K | 83.48% | 1.07% | 12 exact frames |
| VP9 Profile 0 | 4K | 75.12% | 1.14% | 12 exact frames |
| H.264 High 10 | 1080p | 21.47% | n/a | Unsupported |
| AV1 Main | 1080p | 16.99% | n/a | Unsupported |
| Theora | 1080p | 8.96% | n/a | Unsupported |
| VP8 | 1080p | 14.18% | n/a | Unsupported |
| MPEG-4 Part 2 Simple | 1080p | 8.03% | n/a | Unsupported |

</details>

<details>
<summary>Decoding: frames per second</summary>

| Codec | Size | Software | VCN |
| --- | --- | --- | --- |
| H.264 Baseline | 720p | 29.7 | 29.4 |
| H.264 Main | 1080p | 29.7 | 29.4 |
| H.264 High | 1080p | 29.7 | 29.4 |
| HEVC Main | 1080p | 29.7 | 29.4 |
| HEVC Main 10 | 1080p | 29.7 | 29.4 |
| VP9 Profile 0 | 1080p | 29.6 | 29.4 |
| VP9 Profile 2 | 1080p | 29.4 | 29.4 |
| MPEG-2 Main | 1080p | 28.8 | 28.5 |
| VC-1 Advanced | 720p | 59.4 | 58.8 |
| H.264 High | 4K | 29.4 | 29.4 |
| HEVC Main 10 | 4K | 30.0 | 30.0 |
| VP9 Profile 0 | 4K | 29.7 | 29.7 |
| H.264 High 10 | 1080p | 29.4 | n/a |
| AV1 Main | 1080p | 30.9 | n/a |
| Theora | 1080p | 21.9 | n/a |
| VP8 | 1080p | 29.7 | n/a |
| MPEG-4 Part 2 Simple | 1080p | 29.7 | n/a |

</details>

<details>
<summary>Transcoding: CPU use</summary>

| Codec | Size | Target (Mbps) | Software | VCN | VCN output |
| --- | --- | --- | --- | --- | --- |
| H.264 Baseline | 1080p | 12 | 90.12% | 1.00% | Checked |
| H.264 Main | 1080p | 12 | 102.15% | 1.00% | Checked |
| H.264 High | 1080p | 12 | 103.02% | 1.00% | Checked |
| HEVC Main | 1080p | 12 | 292.23% | 0.94% | Corrupt colours |
| HEVC Main 10 | 1080p | 12 | 298.39% | 1.00% | Corrupt colours |
| H.264 | 1080p | 4 | 87.78% | 0.94% | Checked |
| HEVC | 1080p | 4 | 322.99% | 0.80% | Corrupt colours |
| H.264 | 1080p | 8 | 95.00% | 0.94% | Checked |
| HEVC | 1080p | 8 | 309.06% | 0.94% | Corrupt colours |
| H.264 | 1080p | 25 | 118.16% | 1.20% | Checked |
| HEVC | 1080p | 25 | 284.08% | 1.20% | Corrupt colours |
| H.264 | 4K | 25 | 315.14% | 2.27% | Checked |
| HEVC | 4K | 25 | 419.63% | 1.87% | Corrupt colours |
| H.264 | 4K | 50 | 356.79% | 2.41% | Checked |
| HEVC | 4K | 50 | 367.30% | 2.14% | Corrupt colours |

</details>

<details>
<summary>Transcoding: frames per second</summary>

| Codec | Size | Target (Mbps) | Software | VCN |
| --- | --- | --- | --- | --- |
| H.264 Baseline | 1080p | 12 | 29.4 | 29.4 |
| H.264 Main | 1080p | 12 | 29.4 | 29.4 |
| H.264 High | 1080p | 12 | 29.4 | 29.4 |
| HEVC Main | 1080p | 12 | 18.4 | 29.4 |
| HEVC Main 10 | 1080p | 12 | 15.4 | 29.4 |
| H.264 | 1080p | 4 | 29.4 | 29.4 |
| HEVC | 1080p | 4 | 26.8 | 29.4 |
| H.264 | 1080p | 8 | 29.4 | 29.4 |
| HEVC | 1080p | 8 | 21.4 | 29.4 |
| H.264 | 1080p | 25 | 29.4 | 29.4 |
| HEVC | 1080p | 25 | 14.4 | 29.4 |
| H.264 | 4K | 25 | 29.4 | 29.4 |
| HEVC | 4K | 25 | 8.0 | 29.4 |
| H.264 | 4K | 50 | 29.4 | 29.4 |
| HEVC | 4K | 50 | 6.4 | 29.4 |

</details>

<details>
<summary>Encoding quality: PSNR (dB)</summary>

Higher is better. HEVC VCN results use a normal GOP with P-frames, which is why they are so low (corrupt colours).

| Codec | Size | Target (Mbps) | Software | VCN |
| --- | --- | --- | --- | --- |
| H.264 Baseline | 1080p | 12 | 51.16 | 48.19 |
| H.264 Main | 1080p | 12 | 52.54 | 49.90 |
| H.264 High | 1080p | 12 | 52.20 | 49.90 |
| HEVC Main | 1080p | 12 | 51.76 | 15.46 |
| HEVC Main 10 | 1080p | 12 | 52.14 | 15.31 |
| H.264 | 1080p | 4 | 41.66 | 39.68 |
| HEVC | 1080p | 4 | 43.25 | 15.85 |
| H.264 | 1080p | 8 | 47.54 | 45.12 |
| HEVC | 1080p | 8 | 47.98 | 15.61 |
| H.264 | 1080p | 25 | 60.88 | 59.90 |
| HEVC | 1080p | 25 | 60.20 | 15.42 |
| H.264 | 4K | 25 | 45.72 | 42.68 |
| HEVC | 4K | 25 | 47.32 | 15.03 |
| H.264 | 4K | 50 | 53.24 | 51.30 |
| HEVC | 4K | 50 | 53.84 | 15.01 |

</details>

<details>
<summary>Output file bitrate (Mbps)</summary>

| Codec | Size | Target | Software | VCN |
| --- | --- | --- | --- | --- |
| H.264 | 1080p | 4 | 4.08 | 4.01 |
| HEVC | 1080p | 4 | 4.10 | 4.10 |
| H.264 | 1080p | 8 | 8.17 | 8.00 |
| HEVC | 1080p | 8 | 8.20 | 7.96 |
| H.264 | 1080p | 25 | 24.81 | 24.86 |
| HEVC | 1080p | 25 | 25.62 | 24.90 |
| H.264 | 4K | 25 | 25.39 | 24.90 |
| HEVC | 4K | 25 | 25.59 | 25.05 |
| H.264 | 4K | 50 | 50.67 | 49.78 |
| HEVC | 4K | 50 | 51.24 | 49.81 |

</details>
