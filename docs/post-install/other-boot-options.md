---
title: "Boot options: other images"
sidebar_label: Boot options
sidebar_position: 4
description: The default cmdline.txt line of the official and self-built PS5 Linux images, and every kernel option, with which kernel has it.
hardware: [original, slim, pro]
applies_to: not-bazzite-deck
---

# Boot options: other images

How `cmdline.txt` and `vram.txt` work, and how to edit them on the PS5 or from a PC, is on [Boot options](/post-install/boot-options).

## The default line

The official images:

```text title="cmdline.txt"
root=LABEL=<image> rw rootwait console=ttyTitania0 console=tty0 mitigations=off idle=halt preempt=full video=DP-1:1920x1080@60
```

`video=DP-1:1920x1080@60` starts at 1080p60. Remove it if you get a black screen.

## Options {#options}

**Kernel:** *all* = every current kernel · *upstream* = upstream `main` and its packages, and rmuxnet's kernel · *rmuxnet's* = rmuxnet's kernel only. Which kernel you run is on [Kernel setup](/post-install/kernel#what-is-where).

| Area | Parameter | What it does | Kernel | Details |
| --- | --- | --- | --- | --- |
| Display and HDMI | `amdgpu.force_1080p=1` | Only allows 1080p60: a safe mode to get a picture back. Remove it afterwards | all | [Display recovery](/troubleshooting/display#display-recovery) |
| Display and HDMI | `video=HDMI-A-1:3840x2160@60` | Forces a 4K mode | all | [HDMI](/troubleshooting/display#4k-display-black-screen-after-login) |
| Display and HDMI | `drm.edid_firmware=…` | Loads a custom EDID file | all | [Custom EDID](/troubleshooting/display#custom-edid-injection) |
| Display and HDMI | `hdmi.frl_4k120=0` | Never offers 4K at 120 Hz (upstream: turns native FRL off altogether) | all | [HDMI](/troubleshooting/display) |
| Display and HDMI | `ps5_cec.one_touch_play=0` | Doesn't turn the TV on and switch it to the console at boot | all | [HDMI](/troubleshooting/display) |
| Display and HDMI | `usbc_dp.enable=1` | DisplayPort output on the front USB-C port (USB-C displays, PS VR2). Not with the boot drive in that port | all | [HDMI](/troubleshooting/display) |
| Display and HDMI | `hdmi.frl_yuv420=<0,1,2>` | 4:2:0 over native FRL: 0 off, 1 as a fallback (default), 2 preferred | upstream |  |
| Display and HDMI | `hdmi.frl_recovery=0` | Turns off the retries after a failed FRL link | upstream |  |
| Display and HDMI | `hdmi.allm=<0,1,2>` | Auto low latency mode: 0 off, 1 while the content type is Game (default), 2 always | upstream |  |
| Display and HDMI | `hdmi.hdcp_mode=<n>` | HDCP: 0 on, 1 off, 2 on with HDCP 2.2, 3 off with the HDCP 2.2 bit set (default), -1 keep | upstream |  |
| Display and HDMI | `hdmi.extended_modes=<0,1,2>` | Modes the chip can drive but the EDID doesn't list: 0 off, 1 offered (default), 2 preferred | upstream |  |
| GPU and memory | `amdgpu.ps5_cu_unlock=3` | Unlocks the disabled compute units (40 instead of 36). Original PS5 and Slim only; artefacts on some consoles | all | [40 CU unlock](/troubleshooting/gpu#40-cu-unlock) |
| GPU and memory | `ttm.pages_limit=…` | Raises how much system memory the GPU may borrow (GTT) | all | [VRAM](/troubleshooting/gpu#vram) |
| GPU and memory | `ps5_gpufreq.temp_limit=<50-95>` | Thermal limit of the GPU clock governor, 85 °C by default | upstream | [GPU](/troubleshooting/gpu) |
| GPU and memory | `amdgpu.ps5_viola_fw=0` | PS5 Pro: use the base PS5's GPU firmware (36 CUs). For comparisons and troubleshooting | upstream | [PS5 Pro](/troubleshooting/ps5-pro#gpu-driver) |
| Game Mode | `lsm=landlock,lockdown,yama,integrity,apparmor,bpf` | Turns on the BPF LSM, which Bazzite's and SteamOS's Game Mode need (`cardwired`), on a kernel built without `bpf` in `CONFIG_LSM`. Without it Gamescope is killed a second after it starts | all | [Kernel setup](/post-install/kernel#build-a-kernel-for-bazzite-game-mode) |
| USB and storage | `usb-storage.quirks=xxxx:yyyy:u` | Turns off UAS for one USB drive (`xxxx:yyyy` from `lsusb`): for SSDs or enclosures that disconnect or freeze | all | [Storage and USB](/troubleshooting/storage) |
| USB and storage | `rootwait rootdelay=60` | Waits up to 60 seconds for a slow USB drive | all | [Storage and USB](/troubleshooting/storage) |
| USB and storage | `usbcore.autosuspend=-1` | Stops USB devices from sleeping | all | [Storage and USB](/troubleshooting/storage) |
| Bluetooth | `btusb.ps5_tx_ep=<n>` | Bluetooth send endpoint on the Slim's MediaTek chip | rmuxnet's | [Bluetooth](/troubleshooting/bluetooth#mediatek-on-the-slim) |
| Bluetooth | `btusb.ps5_ep_resync=1` | PS5 Pro: resyncs the Bluetooth endpoints after the firmware setup | rmuxnet's | [Bluetooth](/troubleshooting/bluetooth#mediatek-on-the-pro) |

On upstream kernels, `/sys/module/hdmi/parameters/` also shows read-only state: `frl_rate`, `frl_rate_max`, `frl_failed` (write `N` to try FRL again), `allm_sink`, `allm_active` and `recovery_status`.
