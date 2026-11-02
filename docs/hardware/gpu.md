---
title: GPU (AMD Oberon / RDNA2)
sidebar_label: GPU
sidebar_position: 3
description: GPU status, boost mode, the 40 CU unlock, VRAM settings, benchmarks and performance tips.
---

# GPU (AMD Oberon / RDNA2)

**PCI ID:** `1002:13fb`

## Status

- `amdgpu` loads and drives HDMI output: **working**.
- Hardware video decode and encode (VCN): **working**; HEVC encoding only works with I-frames. See [Hardware video (VCN)](./vcn.mdx).

:::danger[Required modprobe options for a working display]
The known-working distro images ship `/etc/modprobe.d/ps5-amdgpu.conf` with:

```text title="/etc/modprobe.d/ps5-amdgpu.conf"
options amdgpu dpm=0 gpu_recovery=0
```

Ports without this file (seen on a work-in-progress Fedora build) end up with no video or a black screen. If you are porting a new distro or building one from scratch, add this file before chasing any other display problem.
:::

## Clocks and boost

The firmware starts the CPU at 3.2 GHz and the GPU below the PS5 OS's 2.23 GHz. How you get the full clocks depends on the kernel, see [Kernel setup](/advanced/kernel):

| Kernel | CPU and GPU clocks | What to do |
| --- | --- | --- |
| [rmuxnet 7.3.1](/advanced/kernel#install-the-731-pinksoup-release) | `ps5-cpufreq` and `ps5-gpufreq` scale them with the load. | Nothing for the GPU. CPU boost (3.3 to 3.5 GHz) is off until you turn it on, below. |
| PS5 Bazzite Deck | Upstream #66's GPU governor, CPU boost through `ps5-perf`. | On by default. |
| Upstream 7.2.3 (packages from 1 November 2026) | Upstream #66's GPU governor (`ps5_gpufreq.temp_limit`, see [PS5 Pro](./ps5-pro.md#gpu-driver)); the CPU stays at 3.2 GHz until `ps5_control --boost on`. | Install [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools), below. |
| Older upstream kernels | Fixed at the firmware's clocks until `ps5_control --boost on`. | Install [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools), below. |

### rmuxnet 7.3.1: cpufreq and devfreq

`ps5-cpufreq` drives the CPU P-states (800 MHz to 3.2 GHz, `schedutil` governor) through the SMU. The three boost states are off at boot. Turn them on:

```bash
echo 1 | sudo tee /sys/devices/system/cpu/cpufreq/boost
```

`ps5-gpufreq` is a devfreq driver at `/sys/class/devfreq/ps5-gpufreq/` with the `simple_ondemand` governor: 400 to 2,230 MHz on the original PS5 and the Slim, 500 to 2,350 MHz on the PS5 Pro, in 400 MHz steps up to 2,000 MHz and then the maximum. `cur_freq` shows the clock; `min_freq` and `max_freq` pin it, and `governor` set to `performance` holds the maximum.

:::warning[Don't use ps5_control --boost on this kernel]
The drivers already own the clocks. `ps5_control --boost on` pins them at maximum until a full restart and doesn't improve frame rates. Use the cpufreq `boost` switch above instead.
:::

### Older kernels: ps5-linux-tools

Use `ps5_control` from [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools) to unlock full speed:

```bash
cd ps5-linux-tools
sudo ./ps5_control --fan on
sudo ./ps5_control --boost on
```

Always turn the fan on together with boost; this matches how the PS5 OS behaves. For heavier loads, or if you want to sustain higher boost clocks, `--fan max` runs the fan harder than `on`:

```bash
sudo ./ps5_control --fan max
```

To apply both at every boot:

```bash
sudo ./install.sh
```

This installs `ps5fan.service` and `ps5boost.service` as systemd units. On a kernel with the fan curve (see [Fan control](./fan.md)) `--fan` isn't needed.

## 40 CU unlock

PS5 units ship with either 36 or 38 of their 40 compute units (CUs) active; the rest are disabled ("harvested") in the silicon. How many your console has is **hardware-specific**: some top out at 38, others can run all 40. This is also why benchmark scores vary between units. The ps5-linux kernel patch unlocks whichever disabled CUs are present.

**Kernel parameter:** `amdgpu.ps5_cu_unlock=N`

| Value | Behaviour |
| --- | --- |
| 0 | Off (default) |
| 1 | Probe |
| 2 | Unlock SE0/SH0 only |
| 3 | Unlock all harvested CUs |
| 4 | Probe all |

Without the parameter, `dmesg` reports the hardware default (2 × 2 × 10 = 40 physical CUs, 36 active on this unit):

```text
amdgpu: SE 2, SH per SE 2, CU per SH 10, active_cu_number 36
```

:::warning[Original PS5 and Slim only]
Don't use this on a PS5 Pro: all of its 60 compute units are already active.
:::

It is a silicon lottery: on many consoles all 40 CUs work and you get more GPU power; on others the extra units cause green dots and other artefacts, a purple tint, or crashes. Try it, and turn it off again if you see any of that.

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

The patch writes to both the CC register and the SPI. Both are needed for the unlock to affect dispatch (verified on the BC-250). Source: [ps5-linux-patches commit 5b0dc56](https://github.com/ps5-linux/ps5-linux-patches/commit/5b0dc56c1b37a01dd813cb0f58cd4ae2fc6ed45a).

:::info[Each shader engine needs the same CU count]
Extra CUs are only used when both shader engines (SEs) have the same number active. 38 CUs (an uneven split across the SEs) benchmarks exactly like 36. If you see graphical glitches after unlocking, first try `RADV_DEBUG=nohiz` in the game's Steam launch options. If that doesn't help, try 38 CUs instead of 40.
:::

:::warning[Harvested CUs come in pairs, and some can be faulty]
CUs are disabled in pairs, so a real unit always has 36, 38 or 40 usable CUs, never an odd number. If enabling all 40 causes severe visual artefacts, one of your disabled pairs may be faulty rather than disabled for yield. Finding which pair takes trial and error: test 38 CUs with different pairs masked off. There is no known way to predict which pair fails.
:::

### Runtime unlock with UMR (no kernel rebuild)

[UMR](https://gitlab.freedesktop.org/tomstdenis/umr), the AMD GPU register debugger, can enable the extra CUs at runtime without a kernel patch or rebuild. It is handy for testing before you commit to the kernel-level unlock. It is available from the AUR on Arch and as an RPM on Fedora and Bazzite; on Debian-based distros, build it from source.

You can check the topology with `umr`, but it may still show the CUs as disabled even when the runtime unlock is active. Check your benchmark scores to confirm it worked instead of relying on the topology output.

## Slower than the BC-250 (open investigation)

Superposition scores are noticeably lower than BC-250 results would predict. The PS5 has 36–40 CUs against the BC-250's 24, so linear scaling suggests about 5,700–6,450 points. Actual scores are closer to 5,100–5,600, even with 40 CUs and boost. The best so far is 5,602 on Gentoo with kernel 7.3.0-rc6-PinkSoup, 40 CUs and no boost. The root cause isn't confirmed. `dmesg` reports all 36 CUs correctly, so it isn't a detection problem.

At the same CU count and clock, the BC-250 consistently beats the PS5:

| Configuration | PS5 (boost mode) | BC-250 |
| --- | --- | --- |
| 36 CUs at ~2,200 MHz | 5,040 points | 5,330 points |
| 40 CUs at ~2,200 MHz | 5,290 points | 5,530 points |

The leading theory is that boost mode doesn't hold a constant clock; without boost, the two platforms score much closer.

:::danger[Unconfirmed: caused a black screen when tested]
One suggestion was setting `adev->gfx.cu_info.lds_size = 128;` in `amdgpu_device.c`. A tester who tried it got a black screen with no `amdgpu` output after rebuilding; the cause is unclear. This is **not** a working fix. It is listed here so nobody repeats the same dead end.
:::

## VRAM

Tools show a default allocation of 512 MB, but VRAM is **dynamic**: the driver takes more as needed. With the default split and about 14 GB usable, the ceiling works out at roughly 7 GB; the formula and how to raise it are below.

To set a fixed minimum, edit `vram.txt` on the FAT32 USB partition. The loader reads the value as **hexadecimal bytes**, not decimal megabytes (`strtoull(buf, NULL, 16)` in `ps5-linux-loader/source/loader.c`). A decimal megabyte value silently sets VRAM to almost nothing, which is a common cause of a black screen at boot.

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

That is why some games that use just over 8 GB of VRAM (Final Fantasy VII Remake is a known example) crash with `amdgpu_vm_validate() failed / Not enough memory for command submission`, even though plenty of RAM seems to be free.

**The real fix:** raise the GTT ceiling with the `ttm.pages_limit` kernel parameter instead of (or as well as) raising `vram.txt`:

```text
ttm.pages_limit = (desired GTT size in GB) × 1024 × 1024 / 4
```

For a console used for gaming, the community recommendation is **6 GB in `vram.txt`** (`180000000`): the GPU then has 6 GB it never has to compete for, and the ceiling becomes 6 + (14 - 6) / 2 = about 10 GB. On a server or a desktop that doesn't game, leave the default: the 6 GB are then locked away from everything else. Raising `ttm.pages_limit` gives the same ceiling without locking anything, and is the tool for games that need more than that.

Example for a 10 GB GTT ceiling:

```text title="cmdline.txt"
ttm.pages_limit=2621440
```
:::

## Benchmarks (Superposition 1080p Extreme)

| Configuration | Score | Notes |
| --- | --- | --- |
| No boost | 4,903 | CPU at 3,193 MHz |
| Fan + boost, no CU unlock | ~5,150 | |
| 40 CUs + fan + boost | 5,041 | CPU at 3,493 MHz, kernel 7.0.10 |
| 40 CUs + fan + boost (CFI-1216A) | 5,259 | 6 nm APU |
| No CU unlock, no boost | 5,367 | Kernel 7.3.0-rc6, 40.15 fps average, highest seen |

BC-250 reference: 36 CUs at 2,200 MHz ≈ 5,336; 40 CUs at 2,200 MHz ≈ 5,530. Depending on temperatures, boost mode on the PS5 may not always hold its full clock speed.

## Performance tips

- **Micro-stuttering?** Remove `idle=halt` from `cmdline.txt`. theflow asked the community to test this.
- **Graphical glitches in games?** Set `RADV_DEBUG=nohiz`, the same advice as for the AMD BC-250. Set it globally in your shell profile or environment rather than per game: several games have problems without it, and it is easy to forget on a new Steam library entry.
- Many tips from the [AMD BC-250 documentation](https://elektricm.github.io/amd-bc250-docs/) also apply to the PS5. Double-check anything about VRAM or GTT allocation against the [VRAM](#vram) section above, though: that site has been reported to contain inaccurate, LLM-generated information about how the VRAM split works.
