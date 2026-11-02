---
title: PS5 Pro
sidebar_position: 2
description: What the PS5 Pro needs beyond the base PS5 under Linux - its Viola GPU firmware, how it reaches the initrd, the GPU driver and what not to enable.
---

# PS5 Pro

The Pro has a different GPU (`1002:13da` or `1002:13dc`, "Viola", 60 active compute units) and a MediaTek MT7925 Wi-Fi/Bluetooth chip. Everything else works as on the base PS5. This page covers the GPU side; Bluetooth is on [Bluetooth](/using-linux/bluetooth#mediatek-on-the-pro).

**Credits:** Borchev (upstream #58 and #66), mfoster978 (initrd alignment fix, image PR #32, loader PR #91).

:::info[Patch base]
The patches linked on this page apply to Linux v7.3 plus [rmuxnet/ps5-linux-patches-1](https://github.com/rmuxnet/ps5-linux-patches-1) `meower` at commit `baee34d`, in the order of the PS5 Bazzite Deck [`build.sh`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/v2.0.0/build.sh). The originals are in `ps5-linux/ps5-linux-patches` for kernel 7.2.
:::

## GPU firmware

The Pro's GPU needs its own firmware, eight files named `viola_*.bin` (`ce`, `me`, `mec`, `mec2`, `pfp`, `rlc`, `sdma`, `sdma1`). The [Linux loader](/installation/booting#which-loader) dumps them from the PS5 OS to the boot partition on firmware 13.20 and 13.60 (and 11.60 since loader PR #91), under `lib/firmware/amdgpu/`. Without all eight, `amdgpu` loads the base PS5's firmware and the Pro runs as a base PS5 with 36 CUs.

`amdgpu` loads firmware from the initramfs, so the files have to be inside `initrd.img`. There are two ways:

- **Rebuild the initrd** on the console after copying the files to `/usr/lib/firmware/amdgpu/`. The `linux-ps5` package's `ps5-stage-gpu-firmware.service` does this, see [Package repository](/advanced/package-repository).
- **Append them without rebuilding.** The kernel unpacks concatenated cpio archives, so a small uncompressed `newc` cpio with the eight files can be appended to the existing `initrd.img`. Each archive has to start on a 4-byte boundary: pad the original initrd with zero bytes to a multiple of four before appending, or the kernel stops at `invalid magic` and the Pro silently runs with 36 CUs. This was the bug mfoster978 found. Source: [`files/ps5-stage-viola-fw`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/v2.0.0/files/ps5-stage-viola-fw). Confirmed on Pros running PS5 Bazzite Deck.

Either way, the firmware is used from the next start with the loader. Check:

```bash
sudo dmesg | grep -i -e viola -e active_cu_number
```

`active_cu_number 60` means the Pro firmware is in use.

## GPU driver

Upstream #58 ([`ps5-pro-gpu.patch`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/v2.0.0/patches/ps5-pro-gpu.patch), the 7.3 port) only switches on with the Viola firmware present:

- Viola golden settings, with the Cyan Skillfish register table split into common, Oberon and Viola parts.
- 64 CUs in the topology (`max_cu_per_sh` = 16) and the Pro's WGP mask; 60 are active.
- Firmware selection (`amdgpu.ps5_viola_fw=0` forces the base firmware) and an SMU backend for GPU clock and temperature reporting (`amdgpu.ps5_smu=0` turns it off).
- MP1: BAPM and active WGPs for the Pro.

Upstream #66 ([`ps5-pro-upstream66.patch`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/v2.0.0/patches/ps5-pro-upstream66.patch)) on top:

- A GPU clock governor in `drivers/ps5/gpufreq.c` (devfreq, 500 to 2,350 MHz on the Pro, 500 to 2,230 MHz on the base PS5) with a thermal limit of 85 °C by default: `ps5_gpufreq.temp_limit=<50-95>`. It replaces rmuxnet's `ps5-gpufreq` driver, which is no longer built (`CONFIG_PS5_GPUFREQ=n`).
- The WGP enable check moved into gfx `hw_init`, so it also runs on resume and after a GPU reset.
- `0x13dc` treated as Viola like `0x13da`.
- GFX clock from the SMU's `QueryGfxclk`, and the GPU temperature from `Tctl`.

:::note[Not tested]
The 7.3 ports of #58 and #66 have not been confirmed on a Pro by the wiki editors. Upstream's originals are in `ps5-linux-patches` at `f21f65b` and `53809a3` (kernel 7.2.3 and later).
:::

## What not to enable on a Pro

- **`amdgpu.ps5_cu_unlock`:** all 60 CUs are already active; the [40 CU unlock](./gpu.md#40-cu-unlock) is for the base PS5 and the Slim.
- **rmuxnet's CPU and GPU frequency drivers** (`ps5-cpufreq`, `ps5-gpufreq` from the 7.3 port): on a Pro their requests to the power controller never get through, most likely because the Pro's SMU backend uses the same controller, and the log floods with `mp1fw_sendmsg: Error : busy`, `cpufreq: Failed to change cpu frequency: -16` and `devfreq ps5-gpufreq: dvfs failed with (-5)`. [`ps5-pro-no-freqdrivers.patch`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/v2.0.0/patches/ps5-pro-no-freqdrivers.patch) keeps them off on a Pro; the firmware then sets the clocks. Confirmed by a Pro tester.
