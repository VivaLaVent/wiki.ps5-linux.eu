---
title: GPU
sidebar_position: 3
description: Clocks, compute units, VRAM and the video engine of the PS5 GPU, and the limits and errors games run into.
hardware: [original, slim, pro]
applies_to: all
---

# GPU

The PS5's GPU is an RDNA2 part inside the Oberon APU, PCI ID `1002:13fb` on the original PS5 and the Slim. The PS5 Pro has a different GPU, see [PS5 Pro](/troubleshooting/ps5-pro). This page covers what the kernel does with it and the settings you can change.

## Status

- `amdgpu` drives the GPU and the HDMI output on every kernel.
- Hardware video decode and encode (VCN) work; HEVC encoding only with I-frames. See [Hardware video (VCN)](#video-engine).

:::danger[Required modprobe options for a working display]
Every working image ships `/etc/modprobe.d/ps5-amdgpu.conf` with:

```text title="/etc/modprobe.d/ps5-amdgpu.conf"
options amdgpu dpm=0 gpu_recovery=0
```

Without this file the GPU comes up without a picture. When you bring up a distro of your own, put it in place before you look at any other display problem.
:::

## Clocks and boost

The console's firmware starts the CPU at 3.2 GHz and the GPU below the 2.23 GHz the PS5 OS runs it at. How the full clocks are reached depends on the kernel, see [Kernel setup](/post-install/kernel):

| Kernel | CPU and GPU clocks | What to do |
| --- | --- | --- |
| [rmuxnet's kernel](/post-install/kernel#install-rmuxnets-release) | `ps5-cpufreq` and `ps5-gpufreq` scale them with the load. | Nothing for the GPU. CPU boost (3.3 to 3.5 GHz) is off until you turn it on, below. |
| PS5 Bazzite Deck | The upstream GPU governor; CPU boost through `ps5-perf`. | On by default. |
| Upstream (current packages) | The upstream GPU governor (`ps5_gpufreq.temp_limit`, see [PS5 Pro](/troubleshooting/ps5-pro#gpu-driver)); the CPU stays at 3.2 GHz until `ps5_control --boost on`. | Install [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools), below. |
| Older upstream kernels | Fixed at the firmware's clocks until `ps5_control --boost on`. | Install [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools), below. |

The upstream GPU governor is a devfreq driver: 500 to 2,230 MHz on the original PS5 and the Slim, 500 to 2,350 MHz on the Pro, with a thermal limit of 85 °C by default (`ps5_gpufreq.temp_limit=<50-95>` in `cmdline.txt`). Read the current clock from `cur_freq` under its directory in `/sys/class/devfreq/`.

### rmuxnet's kernel: cpufreq and devfreq

`ps5-cpufreq` drives the CPU P-states (800 MHz to 3.2 GHz, `schedutil` governor) through the SMU. The three boost states are off at boot. Turn them on:

```bash
echo 1 | sudo tee /sys/devices/system/cpu/cpufreq/boost
```

`ps5-gpufreq` is a devfreq driver at `/sys/class/devfreq/ps5-gpufreq/` with the `simple_ondemand` governor: 400 to 2,230 MHz on the original PS5 and the Slim, 500 to 2,350 MHz on the PS5 Pro, in 400 MHz steps up to 2,000 MHz and then the maximum. `cur_freq` shows the clock; `min_freq` and `max_freq` pin it, and `governor` set to `performance` holds the maximum.

:::warning[Don't use ps5_control --boost on this kernel]
The drivers already own the clocks. `ps5_control --boost on` pins them at maximum until a full restart and doesn't improve frame rates. Use the cpufreq `boost` switch above instead.
:::

### Older kernels: ps5-linux-tools

On kernels without a clock driver, `ps5_control` from [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools) raises the clocks through the power controller:

```bash
cd ps5-linux-tools
sudo ./ps5_control --fan on
sudo ./ps5_control --boost on
```

Turn the fan on whenever you turn the boost on, as the PS5 OS does. `--fan max` runs the fan harder than `on` if you want to hold the boost clocks under a heavy load:

```bash
sudo ./ps5_control --fan max
```

To apply both at every boot:

```bash
sudo ./install.sh
```

This installs `ps5fan.service` and `ps5boost.service`. On a kernel with the fan curve (see [Fan control](/troubleshooting/fan)) `--fan` isn't needed.

## 40 CU unlock

The die has 40 compute units (CUs), but every console leaves the factory with 36 or 38 of them enabled; the others are switched off in the silicon, usually because they failed a test, sometimes only to even out production. Which case you have is per console, which is also why identical consoles benchmark differently. The PS5 kernel patch can switch the disabled CUs back on.

**Kernel parameter:** `amdgpu.ps5_cu_unlock=N`

| Value | Behaviour |
| --- | --- |
| 0 | Off (default) |
| 1 | Probe |
| 2 | Unlock SE0/SH0 only |
| 3 | Unlock all harvested CUs |
| 4 | Probe all |

Without the parameter, `dmesg` shows the hardware default: 2 shader engines × 2 shader arrays × 10 CUs, of which 36 are active here:

```text
amdgpu: SE 2, SH per SE 2, CU per SH 10, active_cu_number 36
```

:::warning[Original PS5 and Slim only]
Don't use this on a PS5 Pro: all of its 60 compute units are already active.
:::

It is a lottery. On many consoles all 40 CUs work and the GPU gets faster; on others the extra units produce green dots, a purple tint, flickering or crashes. Try it, and turn it off again at the first sign of trouble.

To unlock all CUs, add this to `cmdline.txt` on the FAT32 USB partition:

```text title="cmdline.txt"
amdgpu.ps5_cu_unlock=3
```

Or let this one-liner do it from Linux (it finds `cmdline.txt` in `/boot/efi` or `/efi`):

```bash
E=$(for d in /boot/efi /efi; do sudo test -f $d/cmdline.txt && echo $d && break; done); sudo sed -i -e 's/amdgpu\.ps5_cu_unlock=[0-9]*/amdgpu.ps5_cu_unlock=3/' -e '/ps5_cu_unlock/!s/[[:space:]]*$/ amdgpu.ps5_cu_unlock=3/' $E/cmdline.txt && sudo cat $E/cmdline.txt
```

Reboot and run the loader, then check the result. It should show `40` (or `36` without the unlock):

```bash
sudo dmesg | grep active_cu_number
```

To turn it off again:

```bash
E=$(for d in /boot/efi /efi; do sudo test -f $d/cmdline.txt && echo $d && break; done); sudo sed -i 's/ *amdgpu\.ps5_cu_unlock=[0-9]*//' $E/cmdline.txt && sudo cat $E/cmdline.txt
```

The patch enables the CUs in two places, the CC register and the SPI; changing only one of them makes the units show up without any work being sent to them. Source: [ps5-linux-patches commit 5b0dc56](https://github.com/ps5-linux/ps5-linux-patches/commit/5b0dc56c1b37a01dd813cb0f58cd4ae2fc6ed45a).

:::info[Both shader engines need the same CU count]
The GPU only uses extra CUs when its two shader engines (SEs) end up with the same number active. 38 CUs, with one SE at 20 and the other at 18, performs like 36. If a game glitches after the unlock, try `RADV_DEBUG=nohiz %command%` in its Steam launch options first, then 38 CUs instead of 40.
:::

:::warning[Disabled CUs come in pairs, and a pair can be bad]
CUs are disabled two at a time, so a console has 36, 38 or 40 usable CUs and never an odd number. Heavy artefacts with all 40 on usually mean one of your disabled pairs is defective rather than merely switched off. Finding which one means testing 38 CUs with different pairs masked, and nothing about the console predicts the answer.
:::

### Runtime unlock with UMR (no kernel rebuild)

[UMR](https://gitlab.freedesktop.org/tomstdenis/umr), AMD's GPU register debugger, can switch the extra CUs on while the system runs, which is a quick way to test your console before you change `cmdline.txt`. It is packaged in the AUR for Arch and as an RPM for Fedora and Bazzite; on Debian-based distros, build it from source.

UMR's topology view can keep showing the CUs as disabled while the runtime unlock is in effect. Run a benchmark before and after and compare the scores rather than relying on the topology output.

## Performance compared to the BC-250

The AMD BC-250, a mining board built on the same APU, is the usual reference. At the same CU count and clock the BC-250 scores a few percent higher in Superposition than the PS5, with or without the 40 CU unlock, and the PS5's scores fall short of what scaling the BC-250's results by CU count would predict. The cause isn't known; CU detection isn't the problem, and the leading theory is that the PS5's clock doesn't hold steady under the benchmark. Without the boost the two platforms score closer together.

:::danger[A dead end: lds_size]
Setting `adev->gfx.cu_info.lds_size = 128;` in `amdgpu_device.c` has been suggested as a fix. A rebuild with it produced a black screen and no `amdgpu` output. It is listed here so nobody tries it again, not as a fix.
:::

## VRAM

Tools show a default allocation of 512 MB, but VRAM is **dynamic**: the driver takes more as needed. With the default split and about 14 GB usable, the ceiling works out at roughly 7 GB; the formula and how to raise it are below.

To set a fixed minimum, edit `vram.txt` on the FAT32 USB partition. The loader reads the value as **hexadecimal bytes**, not decimal megabytes (`strtoull(buf, NULL, 16)` in `ps5-linux-loader/source/loader.c`). A decimal megabyte value gives the GPU almost nothing, and the boot ends in a black screen.

The default (512 MB) is:

```text title="vram.txt"
20000000
```

| Size | `vram.txt` value |
| --- | --- |
| 512 MB (default) | `20000000` |
| 1 GB | `40000000` |
| 2 GB | `80000000` |
| 4 GB | `100000000` |
| 6 GB (recommended for gaming) | `180000000` |
| 8 GB | `200000000` |

:::warning[What vram.txt actually controls]
Every VRAM split is dynamic; 512 MB is **not** a special "fully dynamic" mode. The `vram.txt` value only sets the *minimum* amount of reserved VRAM, not the maximum. The real ceiling for dynamic allocation is:

```text
(vram.txt split) + (remaining RAM not in that split) / 2
```

That is why a game that wants a little more than 8 GB of GPU memory crashes with `amdgpu_vm_validate() failed / Not enough memory for command submission` while `free` still shows plenty of RAM.

**The real fix:** raise the GTT ceiling with the `ttm.pages_limit` kernel parameter instead of (or as well as) raising `vram.txt`:

```text
ttm.pages_limit = (desired GTT size in GB) × 1024 × 1024 / 4
```

For a console used for gaming, **6 GB in `vram.txt`** (`180000000`) is the usual choice: the GPU then has 6 GB it never has to compete for, and the ceiling becomes 6 + (14 - 6) / 2 = about 10 GB. On a server or a desktop that doesn't game, leave the default: the 6 GB are then locked away from everything else. Raising `ttm.pages_limit` gives the same ceiling without locking anything, and is the tool for games that need more than that.

Example for a 10 GB GTT ceiling:

```text title="cmdline.txt"
ttm.pages_limit=2621440
```
:::

## Performance tips

- **Micro-stuttering?** Remove `idle=halt` from `cmdline.txt`.
- **Glitches in one game?** Add `RADV_DEBUG=nohiz %command%` to that game's Steam launch options. Keep it per game: it disables a depth optimisation and costs performance everywhere, and only a few games need it.
- The [AMD BC-250 documentation](https://elektricm.github.io/amd-bc250-docs/) covers the same GPU and much of it carries over. Its section on VRAM and GTT doesn't match how the split works on the PS5; use the [VRAM](#vram) section above for that.

## Video engine (VCN) {#video-engine}

The GPU's video engine (VCN 2.0, IP 2.0.3, driver `vcn_v2_0`) decodes and encodes video in hardware in every current PS5 kernel. This page lists what it handles, how it was made to work, and measured results.

| What | Status |
| --- | --- |
| Decode H.264, HEVC Main/Main 10, VP9 Profile 0/2, VC-1 | ✅ Working, bit-exact with software decoding |
| Decode MPEG-2 | ✅ Working, very close but not bit-exact |
| Encode H.264 | ✅ Working |
| Encode HEVC, I-frames only | ✅ Working |
| Encode HEVC, normal GOP with P-frames | ❌ Broken: corrupt colours at every tested bitrate |
| Decode H.264 High 10, AV1, VP8, Theora, MPEG-4 Part 2 | ❌ Not supported by the hardware |

Frame sizes that decode: H.264 up to 4096×2304, HEVC and VP9 up to 8192×4352. The engine advertises H.264 at 4096×4096 but fails on it.

### How it works

The video engine runs AMD's Navi 10 VCN firmware with one change: as shipped, that firmware waits at boot for a handshake from the SMU, which never comes on the PS5, so the patched copy doesn't wait. It lives in the patch set repository as `firmware/amdgpu/ps5_vcn.bin` and is compiled into the kernel.

On `1002:13fb`, the driver also:

- turns off VCN doorbells (the rings use direct register writes instead),
- resets the VCPU before starting and after a failed stop,
- clears stale ring state before starting.

### Getting it

:::note[Which kernels have it]
Every current kernel: the upstream packages, rmuxnet's release and PS5 Bazzite Deck. On an old kernel, update or build from the current patch set, see [Kernel setup](/post-install/kernel).
:::

The repository's `.config` sets:

```text
CONFIG_EXTRA_FIRMWARE="amdgpu/ps5_vcn.bin"
CONFIG_EXTRA_FIRMWARE_DIR="../ps5-linux-patches/firmware"
```

That path is relative to the kernel source tree, so `linux` and `ps5-linux-patches` must be cloned side by side, exactly as in the build steps.

### Check that it works

Install `libva-utils` (Arch) or `vainfo` (Debian/Ubuntu), then run:

```bash
vainfo
```

It lists H.264, HEVC, VP9, MPEG-2 and VC-1 decoding, plus H.264 and HEVC encoding, when the engine is up.

### Using it with FFmpeg

Decode:

```bash
ffmpeg -hwaccel vaapi -i input.mkv -f null -
```

Transcode to H.264:

```bash
ffmpeg -hwaccel vaapi -hwaccel_output_format vaapi -i input.mkv -c:v h264_vaapi -b:v 12M output.mkv
```

HEVC comes out clean only when every frame is an I-frame; with P-frames the colours are wrong. Force I-frames with `-g 1 -bf 0`:

```bash
ffmpeg -hwaccel vaapi -hwaccel_output_format vaapi -i input.mkv -c:v hevc_vaapi -g 1 -bf 0 -b:v 25M output.mkv
```

An all-I-frame stream needs a much higher bitrate for the same quality, so when file size matters, `h264_vaapi` is the better encoder.

### Browsers and streaming

Firefox decodes through VAAPI by itself: H.264 at 720p, 1080p and 4K, HEVC and HEVC Main 10 at 1080p, and VP9 at 1080p all play without dropped frames. `about:support`, under **Media**, shows which codecs are decoded in hardware. Chrome needs flags, see [Browser video](/post-install/browser-video).

Moonlight streaming from the PS5 works through Sunshine with H.264 VCN encoding, see [Game streaming](/post-install/all-distros#game-streaming).

### Results

The short version: decoding in hardware costs around 1% of one CPU core, where software decoding of the heaviest streams (HEVC Main 10 at 4K) costs most of a core, and H.264 hardware transcoding runs at full frame rate at about 1 to 2.5% of a core.

CPU figures are FFmpeg's CPU use between seconds 2 and 9.5 of each run, where 100% is one logical CPU.

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

#### How to read the results

| Term | Meaning |
| --- | --- |
| CPU scale | 100% = one logical CPU. FFmpeg CPU use between seconds 2 and 9.5. |
| FPS | Paced runs, including startup. Not maximum throughput. |
| HEVC VCN encoding | Normal GOP with P-frames. Corrupt colours at every tested bitrate; I-frame-only output is clean. |
| PSNR | Measured over the first 60 encoded frames. Higher means less pixel error. |
| File bitrate | Includes container overhead. |
| Repeats | Decoding and 12 Mbps tests: two runs. Other bitrates: one run. |
| Exact frames | Decoded pixels match software decoding exactly. |

## Limits and open problems {#limits}

What every PS5 Linux user runs into sooner or later, whatever the distro.

| Limit | What happens | Status |
| --- | --- | --- |
| GPU memory ceiling | A game that needs more than the GTT ceiling crashes with `Not enough memory for command submission`. Raise `ttm.pages_limit` rather than a fixed `vram.txt` carve-out, see [VRAM](/troubleshooting/gpu#vram). | Documented fix |
| 40 CU unlock | More GPU power on units whose disabled pairs are good; artefacts, a purple tint or crashes on units where one isn't, see [40 CU unlock](/troubleshooting/gpu#40-cu-unlock). Don't use it on a Pro. | Silicon lottery |
| HEVC encoding | The video engine corrupts colours with P-frames (red screen when streaming or recording). Use H.264, or HEVC with I-frames only, see [VCN](/troubleshooting/gpu#using-it-with-ffmpeg). | Known not to work |
| GPU fault at session switches | Switching between a Gamescope session and a desktop can trigger a GPU page fault and `ring gfx_0.0.0 timeout`, most often at 4K120 on some TVs. It is on the compositor side; keep the desktop at 4K60 and switch sessions at the boot instead, see [Boot to the desktop](/post-install/boot-to-desktop). On a PS5 Pro the fault isn't recovered (`GPU Recovery Failed`) and the screen stays black until a restart. If you hit it, save the coredump before restarting: `sudo cp /sys/class/drm/card0/device/devcoredump/data ~/gpu-coredump.txt`. | Open |
| `Failed to pin framebuffer: -ENOMEM` | Reported under memory pressure with a desktop and Steam running. No confirmed fix; more zram helped in one report, see [Memory and swap](/post-install/all-distros#memory-and-swap). | Open |
| Graphical glitches in one game | Glitches in a single game. Add `RADV_DEBUG=nohiz %command%` to that game's launch options, see [Performance tips](#performance-tips). | Workaround |
| No AV1 decode, no GPU load sensor on the base PS5 | AV1 video falls back to the CPU; KDE's system monitor shows no GPU usage, see [Browser video](/post-install/browser-video). | Hardware limits |
