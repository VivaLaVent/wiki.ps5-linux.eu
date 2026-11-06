---
title: PS5 Pro
sidebar_position: 4
description: "What the PS5 Pro needs beyond the base PS5 under Linux: its Viola GPU firmware, the GPU and Vulkan drivers, what not to enable, and its problems."
hardware: [pro]
applies_to: all
---

# PS5 Pro

The Pro has a different GPU (`1002:13da` or `1002:13dc`, "Viola", 60 active compute units) and a MediaTek MT7925 Wi-Fi/Bluetooth chip. Everything else works as on the base PS5. This page covers the GPU side and the Pro-specific quirks; Bluetooth is on [Bluetooth](/troubleshooting/bluetooth#mediatek-on-the-pro).

:::info[Where the Pro support lives]
The Pro GPU driver and its clock governor are upstream, in [ps5-linux/ps5-linux-patches](https://github.com/ps5-linux/ps5-linux-patches). rmuxnet's kernel and PS5 Bazzite Deck carry the same driver on their newer kernel base; the clocks are handled differently in each, see below.
:::

## GPU firmware

The Pro's GPU needs its own firmware, eight files named `viola_*.bin` (`ce`, `me`, `mec`, `mec2`, `pfp`, `rlc`, `sdma`, `sdma1`). The [Linux loader](/getting-started/loader#which-loader) dumps them from the PS5 OS to the boot partition, under `lib/firmware/amdgpu/`, every time it starts Linux.

Only a loader that knows the offsets for the Pro's firmware version does this:

| Pro firmware | Official loader (`main`), bazzite-bootc-loader up to v2.5.1 | soniciso1's loader, bazzite-bootc-loader from v2.6.1 |
| --- | --- | --- |
| 11.00, 11.20, 11.40 | No | Yes |
| 11.60 | Yes | Yes |
| 12.00, 12.02, 12.40, 12.70 | No | Yes |
| 12.20, 12.60 | No | No |
| 13.20, 13.60 | Yes | Yes |
| 13.40, 13.42 | No | Yes |

soniciso1's offsets for the versions the official loader lacks were read from retail firmware images; report on [Discord](https://discord.gg/ps5linux) whether yours dumps.

With a loader that doesn't dump the files, `ls /boot/efi/lib/firmware/amdgpu/` (or `/efi/...` on Bazzite) stays empty, `amdgpu` loads the base PS5's firmware and the Pro runs as a base PS5 with 36 CUs. On PS5 Bazzite Deck, `journalctl -u ps5-stage-viola-fw` says that the staging was skipped.

`amdgpu` loads firmware from the initramfs, so the files have to be inside `initrd.img`. There are two ways:

- **Rebuild the initrd** on the console after copying the files to `/usr/lib/firmware/amdgpu/`. The `linux-ps5` package's `ps5-stage-gpu-firmware.service` does this, see [Package repository](/post-install/package-repository).
- **Append them without rebuilding.** The kernel unpacks concatenated cpio archives, so a small uncompressed `newc` cpio with the eight files can be appended to the existing `initrd.img`. Each archive has to start on a 4-byte boundary: pad the original initrd with zero bytes to a multiple of four before appending, or the kernel stops at `invalid magic` and the Pro silently runs with 36 CUs. PS5 Bazzite Deck's `ps5-stage-viola-fw` service does this at boot.

Either way, the firmware is used from the **next** start with the loader. That means two starts after every kernel or image update: the update replaces `initrd.img`, the first start adds the firmware back (and runs with 36 CUs), and the second start runs on it with 60 CUs. This is normal, even though it looks like a bug. Check:

```bash
sudo dmesg | grep -i -e viola -e active_cu_number
```

`using Viola firmware` and `active_cu_number 60` mean the Pro firmware is in use. A Pro without it reports 36.

### Command-processor microcode {#cp-microcode}

Five of the eight files (`ce`, `me`, `pfp`, `mec`, `mec2`) are the GPU's command-processor microcode. PS5 Bazzite Deck v2.1.6 to v2.5.1 replaced Sony's with linux-firmware's `cyan_skillfish2` microcode, because a DXVK (D3D9) game hung at its first frame on Sony's. That substitute hangs D3D12 games under vkd3d instead, such as Dragon's Dogma 2: the log shows `ring gfx_0.0.0 timeout` with the game's process, then `GPU Recovery Failed: -110`, and the screen stays black while SSH still works. With Sony's microcode, Dragon's Dogma 2 runs at 55 to 60 FPS on a Pro.

From v2.6.1, PS5 Bazzite Deck uses Sony's microcode again. For a D3D9 game that hangs at its first frame, add `ps5.viola_cp=cs2` to `cmdline.txt` and start twice: the first start rebuilds the initrd with the substitute, the second runs on it. Remove the option to go back.

## Vulkan driver (RADV) {#radv}

The Pro's GPU has int8 matrix instructions that the base PS5 lacks, and a compute queue that works (on the base PS5's GPU it is broken, so Mesa hides it). Borchev's [Mesa patch](https://github.com/Borchev/mesa_viola_support) teaches RADV, Mesa's Vulkan driver, to use both. Int8 dot products in compute shaders, such as FSR4's INT8 model, run about 3.6 times faster; Borchev measured Dragon's Dogma 2 staying at its 60 FPS cap with FSR4 and frame generation, where the stock driver dropped to 55 to 58 FPS in its heaviest section.

PS5 Bazzite Deck ships this RADV from v2.6.1 (bootc installs). It changes nothing on the base PS5 and the Slim. Launch options to turn the parts off for one game:

| Option | Effect |
| --- | --- |
| `RADV_VIOLA_ML=0 %command%` | The stock int8 code instead of the matrix instructions |
| `AMD_VIOLA_COMPUTE_QUEUE=0 %command%` | Hides the compute queue again |

FSR4's INT8 model under Proton needs OptiScaler; the launch options are in the patch's README.

## GPU driver

The upstream driver only switches on with the Viola firmware present:

- Viola golden settings, with the Cyan Skillfish register table split into common, Oberon and Viola parts.
- 64 CUs in the topology (`max_cu_per_sh` = 16) and the Pro's WGP mask; 60 are active.
- Firmware selection (`amdgpu.ps5_viola_fw=0` forces the base firmware) and an SMU backend for GPU clock and temperature reporting (`amdgpu.ps5_smu=0` turns it off).
- MP1: BAPM and active WGPs for the Pro.
- A GPU clock governor in `drivers/ps5/gpufreq.c` (devfreq, 500 to 2,350 MHz on the Pro, 500 to 2,230 MHz on the base PS5) with a thermal limit of 85 °C by default: `ps5_gpufreq.temp_limit=<50-95>`. On every kernel that has it, this governor replaces rmuxnet's earlier `ps5-gpufreq` driver.
- The WGP enable check runs in gfx `hw_init`, so it also runs on resume and after a GPU reset.
- `0x13dc` is treated as Viola like `0x13da`.
- The GFX clock comes from the SMU's `QueryGfxclk`, the GPU temperature from `Tctl`.
- With the Viola firmware, `gpu_busy_percent` comes from amdgpu itself, so overlays show the GPU load.

Confirmed on several Pros: the Viola firmware loads, 30 WGPs / 60 CUs are active, the SMU initialises, 4K120 works, the fan driver probes and the governor starts (`500-2350 MHz … limit 85 C` in the log).

:::note[Still open]
How the GPU behaves under sustained load, and the GPU clock reading `0 MHz` in hwmon and `ps5-report` while the console is idle, have not been pinned down yet. A line `ps5-gpufreq … Error finding interconnect paths: -95` in the log is harmless: that kernel feature isn't supported on the PS5.
:::

### rmuxnet's kernel

The same driver, plus `mp1.ps5_bapm_set=<0-3>` for the BAPM parameter set with the Viola firmware. The clocks are handled by his own `ps5-cpufreq` and `ps5-gpufreq` drivers, which know the Pro's range (500 to 2,350 MHz) and register on the Pro as well; his boost raises the GPU ceiling to 2,350 MHz there. See [Clocks and boost](/troubleshooting/gpu#clocks-and-boost). The fan driver handles the Pro's MainSoC zone.

:::note[Not tested]
The clock drivers on a Pro have not been confirmed on hardware by the wiki editors.
:::

## What not to enable on a Pro

- **`amdgpu.ps5_cu_unlock`:** with the Viola firmware, 60 CUs are active. The driver's unlock code also covers the Pro's last two WGPs (64 CUs), but that is untested and they may be disabled for a reason. The [40 CU unlock](/troubleshooting/gpu#40-cu-unlock) is for the base PS5 and the Slim.
- **The earlier versions of rmuxnet's CPU frequency driver.** On a Pro their requests to the power controller never got through, most likely because the Pro's SMU backend uses the same controller, and the log flooded with `mp1fw_sendmsg: Error : busy` and `cpufreq: Failed to change cpu frequency: -16`. PS5 Bazzite Deck keeps `ps5-cpufreq` off on a Pro (its `ps5-gpufreq` is no longer built at all, the upstream governor replaces it); the firmware then sets the CPU clocks. rmuxnet's kernel ships reworked versions that know the Pro, see above.

## Starting Linux fails on the Pro

The loader depends on the PS5 OS's rest mode. If the console goes from white to steady orange without blinking and then starts the PS5 OS instead of Linux, rest mode was refused or interrupted. The same thing happens on every model; it is on [Error messages](/troubleshooting/error-messages#rest-mode-error-back-to-the-ps5-login-screen) with the usual causes (USB hubs, keyboards and mice on the fast ports, leftover state from a failed attempt) and the fix.

A GPU fault on a Pro is not recovered: the log shows `GPU Recovery Failed` and the screen stays black until a restart. Save the coredump before you restart if you want it looked at, see [Limits and open problems](/troubleshooting/gpu#limits).

A deliberate reset (`cat /sys/kernel/debug/dri/0/amdgpu_gpu_recover`) fails the same way with the Pro's firmware and with the base firmware (`amdgpu.ps5_viola_fw=0`): after the full reset, the GPU's DMA engines don't pass their test (`ring sdma0/sdma1 test failed`). So it isn't the Pro firmware; the full GPU reset doesn't recover on this hardware. On the original PS5 and the Slim, the lighter per-ring reset usually handles a fault before it gets that far. After a failed recovery, `sudo reboot` may hang; holding the power button then risks filesystem damage. Over SSH, restart safely with:

```bash
sudo sync; echo s | sudo tee /proc/sysrq-trigger; echo u | sudo tee /proc/sysrq-trigger; echo b | sudo tee /proc/sysrq-trigger
```

## Other problems on the Pro

- **Black screen in D3D12 games** (Dragon's Dogma 2 and others under vkd3d), SSH still works, `ring gfx_0.0.0 timeout` and `GPU Recovery Failed: -110` in the log: PS5 Bazzite Deck v2.1.6 to v2.5.1 replaced part of the Pro's GPU firmware; fixed in v2.6.1, see [Command-processor microcode](#cp-microcode). On a later version, it is the unrecovered GPU fault above: restart over SSH as shown there.
- **36 compute units instead of 60:** the Pro's GPU firmware isn't in use yet. After every update, start Linux twice: the first start adds the firmware to the initrd, the second runs on it. If it stays at 36, the loader doesn't dump the firmware on your firmware version, see [GPU firmware](#gpu-firmware).
