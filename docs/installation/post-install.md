---
title: Post-install checklist
sidebar_position: 5
description: The PS5-specific things to do after Linux boots for the first time, on any distro, in the order that saves the most trouble.
---

# Post-install checklist

Linux is running. These are the steps every PS5 Linux user ends up doing, in the order that avoids the most trouble. None of them are generic Linux setup; for your distro's own first steps, use its documentation.

:::tip[PS5 Bazzite Deck]
All of this is already done on [PS5 Bazzite Deck](/installation/bazzite-deck) apart from changing the password and the optional items. Skip to [Set the GPU memory](#5-set-the-gpu-memory) if you want more than the default.
:::

## 1. Change the password and check SSH

Most images ship with SSH on and a known password. Change it:

```bash
passwd
```

The default users per image are on [SSH and getting help](/troubleshooting/getting-help#ssh-availability-by-distro). Keep SSH working: it is how you get in when the display goes black.

## 2. Stop the distro from replacing the kernel

The PS5 kernel comes from `ps5-linux-patches`, not from your distro. A distro upgrade that installs a stock kernel into the boot partition leaves you with a system that doesn't boot. On Ubuntu and Debian, hold the stock kernel packages:

```bash
sudo apt-mark hold linux-generic linux-generic-hwe-24.04 linux-generic-hwe-26.04 \
  linux-image-generic linux-image-generic-hwe-24.04 linux-image-generic-hwe-26.04 \
  linux-headers-generic linux-headers-generic-hwe-24.04 linux-headers-generic-hwe-26.04
```

On Arch and Fedora, the `linux-ps5` package from the [package repository](/advanced/package-repository) is the kernel; don't install the distro's `linux` or `kernel` package alongside it.

## 3. Disable the screen saver

It is broken on the PS5 and can't be dismissed once it starts. Turn it off in your desktop's power settings before any long install or download. Over SSH, `sudo reboot` is the way out if it already started.

## 4. Check the fan and the clocks

What you do here depends on the kernel, see [Kernel setup](/advanced/kernel):

- **rmuxnet's kernel:** the fan follows a temperature curve and the GPU clock scales by itself. Turn the CPU boost on if you want it: `echo 1 | sudo tee /sys/devices/system/cpu/cpufreq/boost` (put it in a systemd unit to keep it). Don't install `ps5-linux-tools` for the boost on this kernel.
- **Upstream kernels:** the CPU stays at 3.2 GHz until `ps5_control --boost on`. Current packages run the fan curve and the GPU governor by themselves; older ones also need `ps5_control --fan on`. Install [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools) and enable both at every boot:

  ```bash
  git clone https://github.com/ps5-linux/ps5-linux-tools
  cd ps5-linux-tools
  make
  sudo ./install.sh
  ```

  On a distro with the [package repository](/advanced/package-repository), `ps5-linux-tools` is a package that does the same. Check with `sudo systemctl status ps5fan ps5boost`.

See [Fan control](/hardware/fan) and [Clocks and boost](/hardware/gpu#clocks-and-boost).

## 5. Set the GPU memory

The default `vram.txt` reserves 512 MB for the GPU and lets it borrow up to half of the rest, which caps games at about 7 GB. For gaming, reserve **6 GB** instead: the GPU then has 6 GB guaranteed and can borrow up to about 10 GB in total. Edit `vram.txt` on the boot partition (it is read as a hexadecimal byte count):

```text title="vram.txt"
180000000
```

That memory is no longer available to the rest of the system, so stay at the default on a server or a desktop that doesn't game. For games that need more than 8 GB, raise the ceiling further with `ttm.pages_limit`, see [VRAM](/hardware/gpu#vram).

## 6. Install the Wi-Fi driver

If you use the internal Wi-Fi, install the driver for your chip, see [Wi-Fi](/using-linux/networking/wifi). On the Marvell IW620 the driver is out of tree and must be reinstalled after every kernel update, unless your kernel comes from the package repository or is rmuxnet's release, which both bundle it. The MediaTek chips work with the in-kernel drivers in every current kernel. Ethernet works out of the box.

## 7. Tune cmdline.txt

Two parameters on the boot partition are worth a look, see [Kernel parameters](/advanced/kernel#kernel-parameters-cmdlinetxt):

- `video=DP-1:1920x1080@60`: the safe boot mode. Keep it, and set your real resolution from the desktop.
- `amdgpu.force_1080p=1`: caps output at 1080p60. Remove it unless you need it to get a picture at all.

## 8. Optional

- **40 CU unlock:** more GPU power on units whose disabled compute units are good; artefacts on units where they aren't. Original PS5 and Slim only, see [40 CU unlock](/hardware/gpu#40-cu-unlock).
- **Swap or zram:** a desktop with Steam open can fill the 14 GB that is left, see [Memory, VRAM and swap](/using-linux/memory-and-swap).
- **Graphical glitches in a game:** add `RADV_DEBUG=nohiz %command%` to that game's Steam launch options. Don't set it globally: it costs performance in every game, and most don't need it, see [GPU performance tips](/hardware/gpu#performance-tips).
- **Steam:** not the Snap package, see [Gaming performance](/using-linux/gaming-performance#steam-and-proton).
- **Newer Mesa (Ubuntu only):** the PS5's GPU (GFX1013) picks up fixes in newer Mesa releases, and Ubuntu's own packages lag behind. The kisak PPA is the usual source there: `sudo add-apt-repository ppa:kisak/kisak-mesa` then `sudo apt upgrade`. Arch and Fedora ship recent Mesa already, and on Bazzite it comes with the image.

## Where to go next

- [Move Linux to an M.2 SSD](/installation/m2-install)
- [Display output](/using-linux/display)
- [Gaming performance](/using-linux/gaming-performance)
