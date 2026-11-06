---
title: "Boot options: cmdline.txt and vram.txt"
sidebar_label: Boot options
sidebar_position: 2
description: Every kernel parameter for the PS5 in one place, one table for PS5 Bazzite Deck and one for the other images, with the default lines and how to edit them.
hardware: [original, slim, pro]
applies_to: all
---

# Boot options: cmdline.txt and vram.txt

Two small files on the USB drive's FAT32 boot partition control how Linux starts: `cmdline.txt` holds the kernel parameters, `vram.txt` the GPU's dedicated memory. This page is the reference for both; other pages link here for the details.

## Edit cmdline.txt {#edit-cmdlinetxt}

`cmdline.txt` must stay **one single line**. Add an option at the end with a space in front of it; delete it the same way.

- **On the PS5, in Linux:** the boot partition is mounted at `/boot/efi` on most images (`/efi` on Legacy PS5 Bazzite Deck installs) and belongs to root, so a file manager can show it but not save to it. Open a terminal (on PS5 Bazzite Deck: Desktop Mode → **Konsole**); these commands find the partition by themselves:

  ```bash
  E=$(for d in /efi /boot/efi; do sudo test -f $d/cmdline.txt && echo $d && break; done)
  sudo cat $E/cmdline.txt                                                  # show
  sudo sed -i 's/[[:space:]]*$/ amdgpu.force_1080p=1/' $E/cmdline.txt      # add an option
  sudo sed -i 's/ *amdgpu\.force_1080p=1//' $E/cmdline.txt                 # remove it again
  ```

- **PS5 Bazzite Deck:** `cmdline.txt` is written from the system's own kernel arguments at every start and shutdown. Add an option the bootc way, so it survives updates and rollbacks:

  ```bash
  sudo rpm-ostree kargs --append=amdgpu.force_1080p=1      # add
  sudo rpm-ostree kargs --delete=amdgpu.force_1080p=1      # remove
  ```

  An option added to `cmdline.txt` from a PC, for example when the screen stays black, is kept too.

Changes take effect at the next start with the loader.

### From a PC {#edit-from-a-pc}

Plug the USB drive into a PC and edit `cmdline.txt` on its small FAT32 boot partition. On Linux, mount that partition and edit the file. On Windows, the partition gets no drive letter, and File Explorer refuses to open it even when it has one (on the bootc form it is an EFI system partition). Give it a letter with `diskpart`, then edit it with Explorer++.

:::warning[Windows offers to format the drive]
When you plug in a Linux drive, Windows may ask to format a disk it can't read. Always choose **Cancel**: formatting erases the Linux install.
:::

#### With diskpart and Explorer++

1. **Open diskpart.** Start → type `cmd` → **Run as administrator**, then:

   ```text
   diskpart
   list disk
   ```

2. **Select the USB drive.** Find it in the list by its size, and use its number in place of `<n>`:

   ```text
   select disk <n>
   list partition
   ```

   Check the size twice: selecting the wrong disk gives the letter to a partition of your PC's own drive.

3. **Give the boot partition a letter.** It is the small partition of a few hundred MB, often listed as **System**. Use its number in place of `<n>`:

   ```text
   select partition <n>
   assign letter=P
   exit
   ```

4. **Edit cmdline.txt with Explorer++.** Download [Explorer++](https://explorerplusplus.com/) (it runs without installing), right-click `Explorer++.exe` → **Run as administrator**, and open `P:\`. Right-click `cmdline.txt` → **Open With** → **Notepad**. Keep it on **one single line**, add or remove the option, and save.

5. **Remove the letter again** before you unplug the drive. In an administrator Command Prompt:

   ```text
   diskpart
   select volume P
   remove letter=P
   exit
   ```

#### With WSL

Attach the drive to WSL, then edit the file from Linux.

```powershell
# In PowerShell as administrator: find the drive number
Get-CimInstance -Query "SELECT * from Win32_DiskDrive"

# Attach partition 1 of that drive to WSL
wsl --mount \\.\PHYSICALDRIVE1 --partition 1 --type vfat
```

```bash
# Then, inside WSL
ls /mnt/wsl/PHYSICALDRIVE1p1/
nano /mnt/wsl/PHYSICALDRIVE1p1/cmdline.txt
```

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
- `idle=halt`: try removing it if you notice micro-stuttering, see [GPU](/troubleshooting/gpu#performance-tips).
- `video=DP-1:1920x1080@60`: starts at 1080p60. Remove it if you get a black screen; PS5 Bazzite Deck doesn't use it.

## PS5 Bazzite Deck options {#bazzite-deck}

Add these with `rpm-ostree kargs` on bootc installs, see [Edit cmdline.txt](#edit-cmdlinetxt). The BPF LSM that Game Mode needs is built into its kernel, so it needs no `lsm=` option. VRR and HDMI-CEC have settings of their own: Steam's **Settings → Display** turns VRR off, and the TV's own settings stop it from turning on with the console.

| Area | Parameter | What it does | Details |
| --- | --- | --- | --- |
| Display and HDMI | `amdgpu.force_1080p=1` | Only allows 1080p60: a safe mode to get a picture back. Remove it afterwards | [Display recovery](/troubleshooting/display#display-recovery) |
| Display and HDMI | `video=HDMI-A-1:3840x2160@60` | Forces a 4K mode | [HDMI](/troubleshooting/display#4k-display-black-screen-after-login) |
| Display and HDMI | `drm.edid_firmware=…` | Loads a custom EDID file | [Custom EDID](/troubleshooting/display#custom-edid-injection) |
| Display and HDMI | `hdmi.frl_4k120=0` | Never offers 4K at 120 Hz | [HDMI](/troubleshooting/display) |
| Display and HDMI | `ps5_cec.one_touch_play=0` | Doesn't turn the TV on and switch it to the console at boot | [HDMI](/troubleshooting/display) |
| Display and HDMI | `usbc_dp.enable=1` | DisplayPort output on the front USB-C port (USB-C displays, PS VR2). Not with the boot drive in that port | [HDMI](/troubleshooting/display) |
| Display and HDMI | `hdmi.vrr=0` | Never offers VRR. Steam's VRR setting also turns it off | [VRR](/troubleshooting/display#vrr-on-flava3) |
| Display and HDMI | `hdmi.modes_100hz=1` | Offers 1080p, 1440p and 4K at 100 Hz (FLAVA3, displays that go to 100 Hz) (from v2.6.1) | [HDMI](/troubleshooting/display) |
| Display and HDMI | `hdmi.rgb_range=<0,1,2>` | RGB range flag sent to the TV: 1 full (default), 2 limited, 0 none | [RGB range](/troubleshooting/display#rgb-range) |
| Display and HDMI | `hdmi.icc_trace=1` | Logs every message to the HDMI chip and its reply. Debugging only, very noisy |  |
| Display and HDMI | `hdmi.vrr_measure=1` | Logs the measured frame intervals every 2 seconds while VRR is on. Debugging only |  |
| GPU and memory | `amdgpu.ps5_cu_unlock=3` | Unlocks the disabled compute units (40 instead of 36). Original PS5 and Slim only; artefacts on some consoles | [40 CU unlock](/troubleshooting/gpu#40-cu-unlock) |
| GPU and memory | `ttm.pages_limit=…` | Raises how much system memory the GPU may borrow (GTT) | [VRAM](/troubleshooting/gpu#vram) |
| GPU and memory | `ps5_gpufreq.temp_limit=<50-95>` | Thermal limit of the GPU clock governor, 85 °C by default | [GPU](/troubleshooting/gpu) |
| GPU and memory | `amdgpu.ps5_viola_fw=0` | PS5 Pro: use the base PS5's GPU firmware (36 CUs). For comparisons and troubleshooting | [PS5 Pro](/troubleshooting/ps5-pro#gpu-driver) |
| GPU and memory | `ps5.viola_cp=cs2` | PS5 Pro: linux-firmware's command-processor microcode instead of Sony's, for D3D9 games that hang at their first frame. Takes two starts (from v2.6.1) | [PS5 Pro](/troubleshooting/ps5-pro#cp-microcode) |
| GPU and memory | `ps5_fan.curve=1` | Starts with the kernel fan curve instead of the console's firmware control (from v2.6.1) | [Fan control](/troubleshooting/fan) |
| USB and storage | `usb-storage.quirks=xxxx:yyyy:u` | Turns off UAS for one USB drive (`xxxx:yyyy` from `lsusb`): for SSDs or enclosures that disconnect or freeze | [Storage and USB](/troubleshooting/storage) |
| USB and storage | `rootwait rootdelay=60` | Waits up to 60 seconds for a slow USB drive | [Storage and USB](/troubleshooting/storage) |
| USB and storage | `usbcore.autosuspend=-1` | Stops USB devices from sleeping; already the default in its kernel | [Storage and USB](/troubleshooting/storage) |
| Bluetooth | `btusb.ps5_tx_ep=<n>` | Bluetooth send endpoint on the Slim's MediaTek chip | [Bluetooth](/troubleshooting/bluetooth#mediatek-on-the-slim) |

## Other images options {#other-images}

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

## vram.txt {#vram}

`vram.txt` sets the GPU's dedicated memory. The loader's default is 512 MB, and the GPU borrows more from system memory as needed; PS5 Bazzite Deck sets 6 GB from v2.6.1. The value is a **hexadecimal byte count**, not megabytes: see [VRAM](/troubleshooting/gpu#vram) for the format and a table of sizes. A large fixed value takes that memory away from the system; memory-hungry games (on the Pro, for example Hogwarts Legacy and Dragon's Dogma 2) run better with a smaller one plus `ttm.pages_limit`.

### Edit vram.txt {#edit-vramtxt}

`vram.txt` sits next to `cmdline.txt` on the boot partition and holds one hexadecimal value. On the PS5, in a terminal (on PS5 Bazzite Deck: Desktop Mode → **Konsole**):

```bash
E=$(for d in /efi /boot/efi; do sudo test -f $d/cmdline.txt && echo $d && break; done)
sudo cat $E/vram.txt                         # show
echo 180000000 | sudo tee $E/vram.txt        # 6 GB
```

The new value is used from the next start with the loader: power off, then start Linux with the loader as usual. From a PC, edit it like `cmdline.txt`, see [From a PC](#edit-from-a-pc).

On PS5 Bazzite Deck, `vram.txt` isn't managed by the image: updates and rollbacks leave your value alone (from v2.6.1 an install gets 6 GB once, later changes are kept). [PS5 Hardware Control](/post-install/decky#ps5-hardware-control) and ps5-hwcon-gui change the same file from Game Mode or the desktop.
