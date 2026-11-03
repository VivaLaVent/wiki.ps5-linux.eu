---
title: GPU (AMD Oberon / RDNA2)
sidebar_label: GPU
sidebar_position: 3
description: GPU status, clocks and boost, the 40 CU unlock, VRAM settings and performance tips.
---

# GPU (AMD Oberon / RDNA2)

The PS5's GPU is an RDNA2 part inside the Oberon APU, PCI ID `1002:13fb` on the original PS5 and the Slim. The PS5 Pro has a different GPU, see [PS5 Pro](./ps5-pro.md). This page covers what the kernel does with it and the settings you can change.

## Status

- `amdgpu` drives the GPU and the HDMI output on every kernel.
- Hardware video decode and encode (VCN) work; HEVC encoding only with I-frames. See [Hardware video (VCN)](./vcn.mdx).

:::danger[Required modprobe options for a working display]
Every working image ships `/etc/modprobe.d/ps5-amdgpu.conf` with:

```text title="/etc/modprobe.d/ps5-amdgpu.conf"
options amdgpu dpm=0 gpu_recovery=0
```

Without this file the GPU comes up without a picture. When you bring up a distro of your own, put it in place before you look at any other display problem.
:::

## Clocks and boost

The console's firmware starts the CPU at 3.2 GHz and the GPU below the 2.23 GHz the PS5 OS runs it at. How the full clocks are reached depends on the kernel, see [Kernel setup](/advanced/kernel):

| Kernel | CPU and GPU clocks | What to do |
| --- | --- | --- |
| [rmuxnet's kernel](/advanced/kernel#install-rmuxnets-release) | `ps5-cpufreq` and `ps5-gpufreq` scale them with the load. | Nothing for the GPU. CPU boost (3.3 to 3.5 GHz) is off until you turn it on, below. |
| PS5 Bazzite Deck | The upstream GPU governor; CPU boost through `ps5-perf`. | On by default. |
| Upstream (current packages) | The upstream GPU governor (`ps5_gpufreq.temp_limit`, see [PS5 Pro](./ps5-pro.md#gpu-driver)); the CPU stays at 3.2 GHz until `ps5_control --boost on`. | Install [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools), below. |
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

This installs `ps5fan.service` and `ps5boost.service`. On a kernel with the fan curve (see [Fan control](./fan.md)) `--fan` isn't needed.

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
