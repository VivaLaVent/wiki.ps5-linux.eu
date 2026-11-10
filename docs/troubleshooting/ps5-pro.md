---
title: PS5 Pro
sidebar_position: 4
description: "What the PS5 Pro needs beyond the base PS5 under Linux: its Viola GPU firmware, the GPU and Vulkan drivers, what not to enable, and its problems."
hardware: [pro]
applies_to: all
---

# PS5 Pro

The Pro has its own GPU ("Viola", 60 compute units) and a MediaTek MT7925 Wi-Fi/Bluetooth chip; the rest works as on the base PS5. Bluetooth is on [Bluetooth](/troubleshooting/bluetooth#mediatek-on-the-pro).

## Quick answers {#other-problems-on-the-pro}

| Problem | Do this |
| --- | --- |
| 36 compute units instead of 60 | After every update, start Linux **twice**. Still 36: your loader doesn't dump the firmware for your system software, see [GPU firmware](#gpu-firmware) |
| Black screen in a game, SSH still works (`ring gfx_0.0.0 timeout`, `GPU Recovery Failed`) | A GPU fault isn't recovered on a Pro: [restart over SSH](#starting-linux-fails-on-the-pro). On PS5 Bazzite Deck v2.1.6 to v2.5.1, update |
| A D3D9 game hangs at its first frame | `ps5.viola_cp=cs2`, see [microcode](#cp-microcode) |
| Orange light, then the PS5 OS starts instead of Linux | Rest mode was refused, see [Error messages](/troubleshooting/error-messages#rest-mode-error-back-to-the-ps5-login-screen) |
| Game crashes after a long session | Less VRAM: 4 GB, see [VRAM](/troubleshooting/gpu#vram) |
| Log floods with `mp1fw_sendmsg: Error : busy` | An old kernel's CPU clock driver: update |

## GPU firmware {#gpu-firmware}

The Pro's GPU needs eight `viola_*.bin` files, which the loader dumps from the PS5 OS at every start. Only a loader that knows your system software does:

| Pro firmware | Official loader (`main`), bazzite-bootc-loader up to v2.5.1 | soniciso1's loader, bazzite-bootc-loader from v2.6.1 |
| --- | --- | --- |
| 11.00, 11.20, 11.40 | No | Yes |
| 11.60 | Yes | Yes |
| 12.00, 12.02, 12.40, 12.70 | No | Yes |
| 12.20, 12.60 | No | No |
| 13.20, 13.60 | Yes | Yes |
| 13.40, 13.42 | No | Yes |

Check:

```bash
sudo dmesg | grep -i -e viola -e active_cu_number
```

`using Viola firmware` and `active_cu_number 60` mean it is in use; 36 means the Pro runs as a base PS5.

- **Two starts after every update:** the update replaces the initrd, the first start puts the firmware back in, the second runs on it.
- PS5 Bazzite Deck adds the files to the initrd itself (`journalctl -u ps5-stage-viola-fw`); the `linux-ps5` package does it with `ps5-stage-gpu-firmware.service`.

### Microcode for D3D9 games {#cp-microcode}

PS5 Bazzite Deck uses Sony's GPU microcode (from v2.6.1). For a D3D9 game that hangs at its first frame, add `ps5.viola_cp=cs2` to `cmdline.txt` and start twice. Remove it again afterwards: D3D12 games hang with it.

## Restart after a GPU fault {#starting-linux-fails-on-the-pro}

After `GPU Recovery Failed`, the screen stays black and `sudo reboot` can hang. Holding the power button risks the filesystem; over SSH:

```bash
sudo sync; echo s | sudo tee /proc/sysrq-trigger; echo u | sudo tee /proc/sysrq-trigger; echo b | sudo tee /proc/sysrq-trigger
```

To have the fault looked at, save the coredump first, see [GPU](/troubleshooting/gpu#limits).

## Vulkan driver {#radv}

PS5 Bazzite Deck's RADV (from v2.6.1, bootc) uses the Pro's int8 matrix instructions and its compute queue ([Borchev's patch](https://github.com/Borchev/mesa_viola_support)). Per game, in the launch options:

| Option | Effect |
| --- | --- |
| `RADV_VIOLA_ML=0 %command%` | The stock int8 code instead of the matrix instructions |
| `AMD_VIOLA_COMPUTE_QUEUE=0 %command%` | Hides the compute queue again |

FSR4's INT8 model under Proton needs OptiScaler; its launch options are in the patch's README.

## Driver parameters {#gpu-driver}

| Parameter | Effect |
| --- | --- |
| `ps5_gpufreq.temp_limit=<50-95>` | Where the GPU clock (500 to 2,350 MHz) starts to drop; 85 °C by default |
| `amdgpu.ps5_viola_fw=0` | Forces the base PS5's firmware |
| `amdgpu.ps5_smu=0` | No GPU clock and temperature reporting |
| `mp1.ps5_bapm_set=<0-3>` | rmuxnet's kernel only |

Confirmed on several Pros: 60 CUs, 4K120, the fan driver and the clock governor. Still open: the GPU clock reads `0 MHz` at idle. `Error finding interconnect paths: -95` in the log is harmless.

## Not on a Pro

- **`amdgpu.ps5_cu_unlock`:** all 60 units are already on.
