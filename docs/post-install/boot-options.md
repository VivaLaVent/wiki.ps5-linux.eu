---
title: "Boot options: cmdline.txt and vram.txt"
sidebar_label: Boot options (cmdline.txt)
sidebar_position: 2
description: Every kernel parameter for the PS5 in one place, with the default lines, how to edit them, and which kernels have which option.
hardware: [original, slim, pro]
applies_to: all
---

# Boot options: cmdline.txt and vram.txt

Two small files on the USB drive's FAT32 boot partition control how Linux starts: `cmdline.txt` holds the kernel parameters, `vram.txt` the GPU's dedicated memory. This page is the reference for both; other pages link here for the details.

## Edit cmdline.txt

`cmdline.txt` must stay **one single line**. Add an option at the end with a space in front of it; delete it the same way.

- **On the PS5, in Linux:** the boot partition is mounted at `/boot/efi` on most images (`/efi` on Legacy PS5 Bazzite Deck installs). These commands find it by themselves:

  ```bash
  E=$(for d in /efi /boot/efi; do sudo test -f $d/cmdline.txt && echo $d && break; done)
  sudo cat $E/cmdline.txt                                                  # show
  sudo sed -i 's/[[:space:]]*$/ amdgpu.force_1080p=1/' $E/cmdline.txt      # add an option
  sudo sed -i 's/ *amdgpu\.force_1080p=1//' $E/cmdline.txt                 # remove it again
  ```

- **From a PC:** plug the USB drive in and open the small FAT32 partition, see [Edit cmdline.txt from Windows](/installation/flash#optional-edit-cmdlinetxt-from-windows).
- **PS5 Bazzite Deck:** `cmdline.txt` is written from the system's own kernel arguments at every start and shutdown. Add an option the bootc way, so it survives updates and rollbacks:

  ```bash
  sudo rpm-ostree kargs --append=amdgpu.force_1080p=1      # add
  sudo rpm-ostree kargs --delete=amdgpu.force_1080p=1      # remove
  ```

  An option added to `cmdline.txt` from a PC, for example when the screen stays black, is kept too.

Changes take effect at the next start with the loader.

## The default line

Most images:

```text title="cmdline.txt"
root=LABEL=<image> rw rootwait console=ttyTitania0 console=tty0 mitigations=off idle=halt preempt=full video=DP-1:1920x1080@60
```

PS5 Bazzite Deck:

```text title="cmdline.txt"
root=LABEL=bazzite-deck rw rootwait console=ttyTitania0 console=tty0 mitigations=off idle=halt preempt=full
```

- `root=LABEL=…`: the partition Linux starts from; an [M.2 install](/installation/m2-install) changes it.
- `console=ttyTitania0`: the console's serial port, under Sony's name for it. Only matters when you debug over a serial cable.
- `mitigations=off`: the CPU vulnerability mitigations are off for speed. `mitigations=auto` turns them back on.
- `idle=halt`: try removing it if you notice micro-stuttering, see [GPU](/hardware/gpu#performance-tips).
- `video=DP-1:1920x1080@60`: starts at 1080p60. Remove it if you get a black screen; PS5 Bazzite Deck doesn't use it.

## Parameter reference

**Kernels:** *all* = every current kernel (upstream, rmuxnet's, PS5 Bazzite Deck) · *BD* = PS5 Bazzite Deck only · *upstream* = upstream `main` and rmuxnet's kernel, not PS5 Bazzite Deck.

### Display and HDMI {#display-and-hdmi}

| Parameter | What it does | Kernels | Details |
| --- | --- | --- | --- |
| `amdgpu.force_1080p=1` | Only allows 1080p60: a safe mode to get a picture back. Remove it afterwards | all | [Display recovery](/hardware/hdmi#display-recovery) |
| `video=HDMI-A-1:3840x2160@60` | Forces a 4K mode | all | [HDMI](/hardware/hdmi#4k-display-black-screen-after-login) |
| `drm.edid_firmware=…` | Loads a custom EDID file | all | [Custom EDID](/hardware/hdmi#custom-edid-injection) |
| `hdmi.frl_4k120=0` | Never offers 4K at 120 Hz (upstream: turns native FRL off altogether) | all | [HDMI](/hardware/hdmi) |
| `ps5_cec.one_touch_play=0` | Doesn't turn the TV on and switch it to the console at boot | all | [HDMI](/hardware/hdmi) |
| `usbc_dp.enable=1` | DisplayPort output on the front USB-C port (USB-C displays, PS VR2). Not with the boot drive in that port | all | [HDMI](/hardware/hdmi) |
| `hdmi.vrr=0` | Never offers VRR. Steam's VRR setting also turns it off | BD | [VRR](/hardware/hdmi#vrr-on-flava3) |
| `hdmi.modes_100hz=1` | Offers 1080p, 1440p and 4K at 100 Hz (FLAVA3, displays that go to 100 Hz) | BD from v2.6 | [HDMI](/hardware/hdmi) |
| `hdmi.rgb_range=<0,1,2>` | RGB range flag sent to the TV: 1 full (default), 2 limited, 0 none | BD | [RGB range](/hardware/hdmi#rgb-range) |
| `hdmi.icc_trace=1` | Logs every message to the HDMI chip and its reply. Debugging only, very noisy | BD | |
| `hdmi.vrr_measure=1` | Logs the measured frame intervals every 2 seconds while VRR is on. Debugging only | BD | |
| `hdmi.frl_yuv420=<0,1,2>` | 4:2:0 over native FRL: 0 off, 1 as a fallback (default), 2 preferred | upstream | |
| `hdmi.frl_recovery=0` | Turns off the retries after a failed FRL link | upstream | |
| `hdmi.allm=<0,1,2>` | Auto low latency mode: 0 off, 1 while the content type is Game (default), 2 always | upstream | |
| `hdmi.hdcp_mode=<n>` | HDCP: 0 on, 1 off, 2 on with HDCP 2.2, 3 off with the HDCP 2.2 bit set (default), -1 keep | upstream | |
| `hdmi.extended_modes=<0,1,2>` | Modes the chip can drive but the EDID doesn't list: 0 off, 1 offered (default), 2 preferred | upstream | |

On upstream kernels, `/sys/module/hdmi/parameters/` also shows read-only state: `frl_rate`, `frl_rate_max`, `frl_failed` (write `N` to try FRL again), `allm_sink`, `allm_active` and `recovery_status`.

### GPU and memory {#gpu-and-memory}

| Parameter | What it does | Kernels | Details |
| --- | --- | --- | --- |
| `amdgpu.ps5_cu_unlock=3` | Unlocks the disabled compute units (40 instead of 36). Original PS5 and Slim only; artefacts on some consoles | all | [40 CU unlock](/hardware/gpu#40-cu-unlock) |
| `ttm.pages_limit=…` | Raises how much system memory the GPU may borrow (GTT) | all | [VRAM](/hardware/gpu#vram) |
| `ps5_gpufreq.temp_limit=<50-95>` | Thermal limit of the GPU clock governor, 85 °C by default | upstream, BD | [GPU](/hardware/gpu) |
| `amdgpu.ps5_viola_fw=0` | PS5 Pro: use the base PS5's GPU firmware (36 CUs). For comparisons and troubleshooting | upstream, BD | [PS5 Pro](/hardware/ps5-pro#gpu-driver) |
| `ps5.viola_cp=cs2` | PS5 Pro: linux-firmware's command-processor microcode instead of Sony's, for D3D9 games that hang at their first frame. Takes two starts | BD from v2.6 | [PS5 Pro](/hardware/ps5-pro#cp-microcode) |
| `ps5_fan.curve=1` | Starts with the kernel fan curve instead of the console's firmware control | BD from v2.6 | [Fan control](/hardware/fan) |
| `lsm=landlock,lockdown,yama,integrity,apparmor,bpf` | Turns on the BPF LSM, which Bazzite's Game Mode needs (`cardwired`), on a kernel built without `bpf` in `CONFIG_LSM`. PS5 Bazzite Deck's kernel has it built in | all | [Image build](/advanced/image-build) |

### USB and storage {#usb-and-storage}

| Parameter | What it does | Kernels | Details |
| --- | --- | --- | --- |
| `usb-storage.quirks=xxxx:yyyy:u` | Turns off UAS for one USB drive (`xxxx:yyyy` from `lsusb`): for SSDs or enclosures that disconnect or freeze | all | [Storage](/hardware/storage#usb-drive-required) |
| `rootwait rootdelay=60` | Waits up to 60 seconds for a slow USB drive | all | [Storage](/hardware/storage#usb-drive-required) |
| `usbcore.autosuspend=-1` | Stops USB devices from sleeping (already the default in PS5 Bazzite Deck's kernel) | all | [Storage](/hardware/storage#usb-drive-required) |

### Bluetooth {#bluetooth}

| Parameter | What it does | Kernels | Details |
| --- | --- | --- | --- |
| `btusb.ps5_tx_ep=<n>` | Bluetooth send endpoint on the Slim's MediaTek chip | rmuxnet, BD | [Bluetooth](/hardware/wifi-bluetooth#mediatek-on-the-slim) |
| `btusb.ps5_ep_resync=1` | PS5 Pro: resyncs the Bluetooth endpoints after the firmware setup | rmuxnet | [Bluetooth](/hardware/wifi-bluetooth#mediatek-on-the-pro) |

## vram.txt {#vram}

`vram.txt` sets the GPU's dedicated memory. The loader's default is 512 MB, and the GPU borrows more from system memory as needed; PS5 Bazzite Deck sets 6 GB from v2.6. The value is a **hexadecimal byte count**, not megabytes: see [VRAM](/hardware/gpu#vram) for the format and a table of sizes. A large fixed value takes that memory away from the system; memory-hungry games (on the Pro, for example Hogwarts Legacy and Dragon's Dogma 2) run better with a smaller one plus `ttm.pages_limit`.

## Next steps

- **PS5 Bazzite Deck:** [After installing: PS5 Bazzite Deck](/post-install/bazzite)
- **Official or self-built images:** [Other images](/post-install/not-bazzite-deck)
