---
title: "Boot options: PS5 Bazzite Deck"
sidebar_label: Boot options
sidebar_position: 2
description: PS5 Bazzite Deck's default cmdline.txt line, how to add kernel options the bootc way, and every option it has.
hardware: [original, slim, pro]
applies_to: bazzite-deck
---

# Boot options: PS5 Bazzite Deck

How `cmdline.txt` and `vram.txt` work, and how to edit them from a PC, is on [Boot options](/post-install/boot-options).

## The default line

On bootc, the line is written from the system's own kernel arguments: `root=` names the partition by UUID, `ostree=` the version to start, and from v2.7.1 `firmware_class.path=/etc/firmware` lets the IW620 Wi-Fi driver find its firmware at its first load. Legacy installs start with this line:

```text title="cmdline.txt"
root=LABEL=bazzite-deck rw rootwait console=ttyTitania0 console=tty0 mitigations=off idle=halt preempt=full
```

## Add or remove an option {#edit}

On bootc, `cmdline.txt` is written from the system's own kernel arguments at every start and shutdown. Add an option the bootc way, so it survives updates and rollbacks:

```bash
sudo rpm-ostree kargs --append=amdgpu.force_1080p=1      # add
sudo rpm-ostree kargs --delete=amdgpu.force_1080p=1      # remove
```

An option added to `cmdline.txt` from a PC, for example when the screen stays black, is kept too.

On Legacy installs, edit `cmdline.txt` directly, see [Edit cmdline.txt](/post-install/boot-options#edit-cmdlinetxt). Changes take effect at the next start with the loader.

## Options {#options}

Add these with `rpm-ostree kargs` on bootc installs, see [above](#edit). The BPF LSM that Game Mode needs is built into its kernel, so it needs no `lsm=` option. VRR and HDMI-CEC have settings of their own: Steam's **Settings → Display** turns VRR off, and the TV's own settings stop it from turning on with the console.

| Area | Parameter | What it does | Details |
| --- | --- | --- | --- |
| Display and HDMI | `amdgpu.force_1080p=1` | Only allows 1080p60: a safe mode to get a picture back. Remove it afterwards | [Display recovery](/troubleshooting/display#display-recovery) |
| Display and HDMI | `video=HDMI-A-1:3840x2160@60` | Forces a 4K mode | [HDMI](/troubleshooting/display#4k-display-black-screen-after-login) |
| Display and HDMI | `drm.edid_firmware=…` | Loads a custom EDID file | [Custom EDID](/troubleshooting/display#custom-edid-injection) |
| Display and HDMI | `hdmi.frl_4k120=0` | Never offers 4K at 120 Hz | [HDMI](/troubleshooting/display) |
| Display and HDMI | `ps5_cec.one_touch_play=0` | Doesn't turn the TV on and switch it to the console at boot | [HDMI](/troubleshooting/display) |
| Display and HDMI | `usbc_dp.enable=1` | DisplayPort output on the front USB-C port (USB-C displays, PS VR2). Not with the boot drive in that port | [HDMI](/troubleshooting/display) |
| Display and HDMI | `hdmi.vrr=0` | Never offers VRR. Steam's VRR setting also turns it off | [VRR](/troubleshooting/display#vrr-on-flava3) |
| Display and HDMI | `hdmi.modes_100hz=1` | v2.6.1 to v2.6.3 only: offers 1080p, 1440p and 4K at 100 Hz on FLAVA3. From v2.7 these modes are always offered, and the option is gone | [HDMI](/troubleshooting/display) |
| Display and HDMI | `hdmi.rgb_range=<0,1,2>` | RGB range flag sent to the TV: 1 full (default), 2 limited, 0 none | [RGB range](/troubleshooting/display#rgb-range) |
| GPU and memory | `amdgpu.ps5_cu_unlock=3` | Unlocks the disabled compute units (40 instead of 36). Original PS5 and Slim only; artefacts on some consoles | [40 CU unlock](/troubleshooting/gpu#40-cu-unlock) |
| GPU and memory | `ttm.pages_limit=…` | Raises how much system memory the GPU may borrow (GTT). Only for games that run out of GPU memory | [VRAM](/troubleshooting/gpu#vram) |
| GPU and memory | `ps5_gpufreq.temp_limit=<50-95>` | Thermal limit of the GPU clock governor, 85 °C by default | [GPU](/troubleshooting/gpu) |
| GPU and memory | `amdgpu.ps5_viola_fw=0` | PS5 Pro: use the base PS5's GPU firmware (36 CUs). For comparisons and troubleshooting | [PS5 Pro](/troubleshooting/ps5-pro#gpu-driver) |
| GPU and memory | `ps5.viola_cp=cs2` | PS5 Pro: linux-firmware's command-processor microcode instead of Sony's, for D3D9 games that hang at their first frame. Takes two starts (from v2.6.1) | [PS5 Pro](/troubleshooting/ps5-pro#cp-microcode) |
| GPU and memory | `ps5_fan.curve=1` | Starts with the kernel fan curve instead of the console's firmware control (from v2.6.1) | [Fan control](/troubleshooting/fan) |
| USB and storage | `usb-storage.quirks=xxxx:yyyy:u` | Turns off UAS for one USB drive (`xxxx:yyyy` from `lsusb`): for SSDs or enclosures that disconnect or freeze | [Storage and USB](/troubleshooting/storage) |
| USB and storage | `rootwait rootdelay=60` | Waits up to 60 seconds for a slow USB drive | [Storage and USB](/troubleshooting/storage) |
| USB and storage | `usbcore.autosuspend=-1` | Stops USB devices from sleeping; already the default in its kernel | [Storage and USB](/troubleshooting/storage) |
| Bluetooth | `btusb.ps5_tx_ep=<n>` | Bluetooth send endpoint on the Slim's MediaTek chip | [Bluetooth](/troubleshooting/bluetooth#mediatek-on-the-slim) |

## vram.txt

`vram.txt` isn't managed by the image: updates and rollbacks leave your value alone (from v2.6.1 an install gets 6 GB once, later changes are kept). [PS5 Hardware Control](/post-install/decky#ps5-hardware-control) and ps5-hwcon-gui change the same file from Game Mode or the desktop.
