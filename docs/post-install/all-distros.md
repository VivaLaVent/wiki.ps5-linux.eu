---
title: "After installing: all distros"
sidebar_label: All distros
description: "Settings and tweaks that apply to every PS5 Linux image: cmdline.txt, memory and VRAM, gaming performance."
hardware: [original, slim, pro]
applies_to: all
---

# After installing: all distros

Linux is running. These are the steps every PS5 Linux user ends up doing, in the order that avoids the most trouble. None of them are generic Linux setup; for your distro's own first steps, use its documentation.

:::tip[PS5 Bazzite Deck]
All of this is already done on [PS5 Bazzite Deck](/choose/bazzite-deck) apart from changing the password and the optional items. Skip to [Set the GPU memory](#5-set-the-gpu-memory) if you want more than the default.
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

If you use the internal Wi-Fi, install the driver for your chip, see [Wi-Fi](/hardware/wifi-bluetooth#wifi). On the Marvell IW620 the driver is out of tree and must be reinstalled after every kernel update, unless your kernel comes from the package repository or is rmuxnet's release, which both bundle it. The MediaTek chips work with the in-kernel drivers in every current kernel. Ethernet works out of the box.

## 7. Tune cmdline.txt

Two parameters on the boot partition are worth a look, see [Kernel parameters](/post-install/boot-options):

- `video=DP-1:1920x1080@60`: the safe boot mode. Keep it, and set your real resolution from the desktop.
- `amdgpu.force_1080p=1`: caps output at 1080p60. Remove it unless you need it to get a picture at all.

## 8. Optional

- **40 CU unlock:** more GPU power on units whose disabled compute units are good; artefacts on units where they aren't. Original PS5 and Slim only, see [40 CU unlock](/hardware/gpu#40-cu-unlock).
- **Swap or zram:** a desktop with Steam open can fill the 14 GB that is left, see [Memory, VRAM and swap](#memory-and-swap).
- **Graphical glitches in a game:** add `RADV_DEBUG=nohiz %command%` to that game's Steam launch options. Don't set it globally: it costs performance in every game, and most don't need it, see [GPU performance tips](/hardware/gpu#performance-tips).
- **Steam:** not the Snap package, see [Gaming performance](#steam-and-proton).
- **Newer Mesa (Ubuntu only):** the PS5's GPU (GFX1013) picks up fixes in newer Mesa releases, and Ubuntu's own packages lag behind. The kisak PPA is the usual source there: `sudo add-apt-repository ppa:kisak/kisak-mesa` then `sudo apt upgrade`. Arch and Fedora ship recent Mesa already, and on Bazzite it comes with the image.

## Gaming performance {#gaming-performance}

Steam and Proton run on the PS5 as on any Linux PC with a mid-range RDNA2 GPU. This page has the settings that matter on the console and the limits you will run into.

### Steam and Proton

:::warning[Don't use the Snap version of Steam (Ubuntu)]
Ubuntu's Snap package of Steam runs in a sandbox that gets in the way on the PS5 images. Install Steam from apt instead (or the `.deb` from [store.steampowered.com/about](https://store.steampowered.com/about/)):

```bash
sudo dpkg --add-architecture i386
sudo apt update
sudo apt install steam
```
:::

Pick **Proton Experimental** in Steam's compatibility settings for the newest fixes, and for games with Easy Anti-Cheat or BattlEye try the dedicated **Proton EAC** or **Proton BE** builds. A game that fails on one Proton version often runs on another; a tool such as ProtonPlus makes switching easy.

### Performance tips

The basics (fan and clocks checked, 6 GB in `vram.txt`, the Wi-Fi driver) are in the [Post-install checklist](/post-install/all-distros). On top of those:

- **Render below 4K.** 1800p gives most games a large frame rate gain over 4K for little visible loss; 1440p more so.
- **Remove `idle=halt`** from `cmdline.txt` if you notice micro-stuttering.
- **Unlock the extra compute units** if your console has good ones, see [40 CU unlock](/hardware/gpu#40-cu-unlock).
- **Raise the GPU memory ceiling** with `ttm.pages_limit` for games that need more than the 6 GB setting gives, see [VRAM](/hardware/gpu#vram).
- **Add swap or zram** when a desktop with Steam and a browser open runs out of memory, see [Memory, VRAM and swap](#memory-and-swap).
- **Skip the desktop.** Gamescope started from a TTY, or an image that boots into Gaming Mode, leaves the most memory and GPU time to the game, and Gamescope's frame limiter and upscaler come with it.

### Game streaming

With a VCN-enabled kernel (see [Hardware video (VCN)](/hardware/gpu#video-engine)), streaming can use H.264 hardware encoding through VAAPI. HEVC encoding only works with I-frames, so keep streaming on H.264. Vulkan video encoding is not available on this GPU (GFX1013).

- **Sunshine and Moonlight:** set `encoder = vaapi` in Sunshine and turn HEVC and AV1 off so it stays on H.264. 1080p at 60 and at 120 Hz stream well, and a DualSense connected to the client is passed through. Without VCN the stream fails with `[h264_vulkan] Encoding of h264 is not supported by this device`.
- **Steam Link:** works with x264 software encoding at the cost of noticeable CPU time.
- **Standalone VR headsets:** WiVRn has given better results than Steam Link or ALVR for PC VR. Raise the bitrate if the picture pixelates or the audio stutters.

### Known limits

Things every PS5 Linux user runs into sooner or later, whatever the distro.

| Limit | What happens | Status |
| --- | --- | --- |
| GPU memory ceiling | A game that needs more than the GTT ceiling crashes with `Not enough memory for command submission`. Raise `ttm.pages_limit` rather than a fixed `vram.txt` carve-out, see [VRAM](/hardware/gpu#vram). | Documented fix |
| 40 CU unlock | More GPU power on units whose disabled pairs are good; artefacts, a purple tint or crashes on units where one isn't, see [40 CU unlock](/hardware/gpu#40-cu-unlock). Don't use it on a Pro. | Silicon lottery |
| HEVC encoding | The video engine corrupts colours with P-frames (red screen when streaming or recording). Use H.264, or HEVC with I-frames only, see [VCN](/hardware/gpu#using-it-with-ffmpeg). | Known not to work |
| GPU fault at session switches | Switching between a Gamescope session and a desktop can trigger a GPU page fault and `ring gfx_0.0.0 timeout`, most often at 4K120 on some TVs. It is on the compositor side; keep the desktop at 4K60 and switch sessions at the boot instead, see [Boot to the desktop](/using-linux/boot-to-desktop). On a PS5 Pro the fault isn't recovered (`GPU Recovery Failed`) and the screen stays black until a restart. If you hit it, save the coredump before restarting: `sudo cp /sys/class/drm/card0/device/devcoredump/data ~/gpu-coredump.txt`. | Open |
| `Failed to pin framebuffer: -ENOMEM` | Reported under memory pressure with a desktop and Steam running. No confirmed fix; more zram helped in one report, see [Memory and swap](#memory-and-swap). | Open |

## Memory, VRAM and swap {#memory-and-swap}

"VRAM", "GTT" and "swap" get mixed up a lot. This page separates them. The PS5 has one pool of memory, and each term below describes a different part of how that pool is used.

### One pool, not two

A gaming PC has system RAM for the CPU and separate VRAM on the graphics card. The PS5 does not: it has **16 GB of unified GDDR6** that the CPU and GPU share. About 14 GB is usable by the OS, and the rest is reserved for firmware, see [Hardware overview](/hardware/matrix#soc-original-ps5-and-slim).

On Linux this means:

- There is no copy between "system RAM" and "video RAM". Both are the same chips.
- Memory given to the GPU is memory taken away from everything else, and the other way around.

### The three terms

| Term | What it is | Where you set it |
| --- | --- | --- |
| **VRAM split** | Memory reserved up front for the GPU. This is only the **minimum**. | `vram.txt` on the FAT32 partition |
| **GTT** | Extra GPU memory the driver takes from the rest of the RAM when it needs it. This is what makes VRAM "dynamic". | `ttm.pages_limit` in `cmdline.txt` |
| **Swap** | Space on a drive (or compressed space in RAM) that Linux uses when normal RAM runs out. | A swap file, a swap partition or zram |

The first two decide **how much memory the GPU can use**. Swap is a general Linux feature for **the whole system running out of RAM**. They are separate settings.

#### What "dynamic VRAM" means

The default `vram.txt` value is 512 MB, but the GPU is not limited to that. The driver takes more memory as a game needs it. The ceiling is:

```text
(vram.txt split) + (remaining RAM not in that split) / 2
```

Raising `vram.txt` also raises that ceiling, but it locks that memory away from the rest of the system. For gaming, 6 GB in `vram.txt` is the usual choice; for everything else leave the default and, if needed, raise `ttm.pages_limit`, which gives the same ceiling without locking anything. The full explanation, the size table and a worked example are in [VRAM](/hardware/gpu#vram).

:::info[Not enough memory for command submission]
If a game crashes with `amdgpu_vm_validate() failed / Not enough memory for command submission` while plenty of RAM looks free, you have hit the GTT ceiling, not a lack of RAM. The fix is `ttm.pages_limit`, see [VRAM](/hardware/gpu#vram).
:::

### Does swap help games?

Swap helps the **system** when normal RAM is full: browsers, launchers, shader compilation and similar background work. With only 14 GB usable and the GPU taking its share from the same pool, a Linux desktop with Steam running can fill up.

What this wiki does **not** claim is that swap raises the GPU memory ceiling. The ceiling formula above only involves `vram.txt` and the remaining RAM. If a game crashes with the error above, change `ttm.pages_limit`; adding swap is not the documented fix. A different error under memory pressure, `Failed to pin framebuffer: -ENOMEM`, has gone away for one user after adding more zram; that is a lead, not a confirmed fix.

:::note[Not tested]
How the GPU driver behaves when the whole system is deep into swap has not been documented on the PS5 yet. If you test it, share your results on [Discord](https://discord.gg/ps5linux).
:::

### Choosing where swap lives

The place you put swap matters a lot, because swap is only useful if it is faster than the alternative (an out-of-memory crash).

| Option | Good for | Watch out for |
| --- | --- | --- |
| **zram** (compressed swap in RAM) | Small, fast headroom with no drive wear | Uses RAM to store the compressed pages, so it gives less headroom than a swap file |
| **Swap file on the M.2 SSD** | The best drive option: an NVMe drive is fast and large | Only available if you [installed to M.2](/installation/m2-install) |
| **Swap file on a USB SSD** | A reasonable fallback | Slower than M.2, and it shares the USB bus with everything else on the drive |
| **Swap file on a USB flash drive or SD adapter** | Avoid | Slow and wears out quickly; swapping to it can make the system freeze |

:::warning[Don't swap to the drive that holds the loader]
Your Linux drive must stay plugged in after boot: the loader reads its FAT32 partition. A swap file on that same drive is fine, but if you unplug or lose the drive while swap is in use, the system crashes.
:::

Your image may already have zram or a swap file enabled. Check before adding one:

```bash
swapon --show
free -h
```

If `swapon --show` lists a device, swap is already active and you may not need to change anything.

### Add a swap file

This creates an 8 GB swap file. Change the size to whatever you want. It works on ext4, the filesystem used by the standard images.

```bash
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

Make it permanent by adding it to `/etc/fstab`:

```bash
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Check that it is active:

```bash
swapon --show
```

:::tip[Btrfs (for example PS5 Bazzite Deck)]
Don't use `fallocate` on Btrfs. Create the file with Btrfs's own command instead, which sets up the file correctly for swap:

```bash
sudo btrfs filesystem mkswapfile --size 8G /swapfile
sudo swapon /swapfile
```
:::

#### Remove it again

```bash
sudo swapoff /swapfile
sudo rm /swapfile
```

Then delete the `/swapfile` line from `/etc/fstab`.

### Use zram instead

zram creates a compressed swap device in RAM. Nothing is written to the drive, so there is no wear, and it is fast. On systemd-based distros the usual tool is `zram-generator`. Install it with your package manager, then create the config:

```ini title="/etc/systemd/zram-generator.conf"
[zram0]
zram-size = ram / 2
compression-algorithm = zstd
```

Apply it with a reboot, then check with `swapon --show`. Some distros enable zram by default, so check first.

### Tuning how eagerly Linux swaps

The `vm.swappiness` setting controls how willingly Linux moves memory to swap. A lower value keeps more in RAM. Check the current value:

```bash
cat /proc/sys/vm/swappiness
```

Set it for the current session:

```bash
sudo sysctl vm.swappiness=10
```

To make it permanent, put `vm.swappiness=10` in a file under `/etc/sysctl.d/`. With zram, a higher value is normal, so leave the default if you use it.

## Next steps

**[Boot options (cmdline.txt)](/post-install/boot-options)**: the reference for every kernel parameter. Then:

- **PS5 Bazzite Deck:** [After installing: PS5 Bazzite Deck](/post-install/bazzite)
- **Official or self-built images:** [Other images](/post-install/not-bazzite-deck), then [Distro notes](/post-install/distro-notes)
