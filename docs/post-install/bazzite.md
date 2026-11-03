---
title: "After installing: PS5 Bazzite Deck"
sidebar_label: PS5 Bazzite Deck
sidebar_position: 4
description: What to do after installing PS5 Bazzite Deck, and which parts of Bazzite's own documentation apply.
hardware: [original, slim, pro]
applies_to: bazzite-deck
---

# After installing: PS5 Bazzite Deck

The PS5-specific steps (first boot, built-in commands, updates, troubleshooting) are on [PS5 Bazzite Deck](/choose/bazzite-deck). For everything that is plain Bazzite, use **[Bazzite's documentation](https://docs.bazzite.gg/)**.

## Updating

A full release updates an installed console from any earlier version in one command; each release's notes have it. Use the release marked **Latest**; releases marked **Pre-release** are test builds.

## Built-in commands


| Command | What it does |
| --- | --- |
| `ps5-report` | Collects your hardware details and the relevant logs into one file for a bug report. It only reads. |
| `ps5-perf` | CPU boost and the fan target (the console's firmware control, 80 °C by default). `ps5-perf status` shows the fan mode and speed, see [Fan control](/hardware/fan). |
| `ps5-warm-reboot` | Restarts straight back into Linux, without the PS5 OS and the loader. Experimental, `on`/`off`. |
| `ps5-bt-address` | One DualSense for the PS5 and Linux, on by default. `status`, `on`, `off`. |

Sleep (suspend-to-idle) is built in: a short press of the power button or Steam's **Sleep** puts the console to sleep and wakes it again. The GPU stays powered, so the saving is modest; it is not the PS5 OS's rest mode, and a DualSense can't wake the console.

## Boot options (cmdline.txt)


`cmdline.txt` is on the USB drive's small FAT32 partition and must stay **one single line**. To add an option, add it at the end with a space in front of it; delete it again to undo. Leave the existing entries as they are.

| Option | What it does | When to use it |
| --- | --- | --- |
| `amdgpu.force_1080p=1` | Only allows 1080p60 | A black or garbled picture you can't get past, for example after choosing a resolution your display can't show. Remove it once you've set a working resolution, see [Display recovery](/hardware/hdmi#display-recovery). |
| `usb-storage.quirks=xxxx:yyyy:u` | Turns off UAS for one USB drive (`xxxx:yyyy` from `lsusb`) | USB-C SSDs or enclosures that disconnect, freeze or show I/O errors (many have buggy UAS) |
| `usbc_dp.enable=1` | Turns on DisplayPort output on the front USB-C port | USB-C displays and the PS VR2. Not when your boot drive is in the front USB-C port. |
| `hdmi.frl_4k120=0` | Never offers 4K at 120 Hz | A TV where 4K120 misbehaves |

To turn off VRR, use Steam's setting (Settings → Display). To stop the TV from turning on with the console, turn off HDMI-CEC in the TV's settings (SIMPLINK, Anynet+, BRAVIA Sync…).

The commands on this wiki that edit `cmdline.txt` find it by themselves: on Bazzite the boot partition is mounted at `/efi`, on most other images at `/boot/efi`.

## 40 GPU compute units


The image supports the [40 CU unlock](/hardware/gpu#40-cu-unlock) on the original PS5 and the Slim. The setting is kept across updates. Don't use it on a PS5 Pro.

## Optional Decky plugins


These are community-made and not part of the image. They need [Decky Loader](https://decky.xyz): install it from Desktop Mode with the installer on its website. Decky plugins appear in Game Mode's quick access menu (the `...` button).

| Plugin | What it does |
| --- | --- |
| [PS5 hardware control](https://github.com/NotHavocc/ps5-hwcon-plugin) | Fan target or curve, live temperatures, CPU and GPU governors and clocks, LED presets. It sets the same things as `ps5-perf`: whichever was set last applies. Use a current image release: one pre-release had the fan modes swapped, and in some releases the fan target fell back to 50 °C after sleep (both fixed). There is also a desktop version, [ps5-hwcon-gui](https://github.com/NotHavocc/ps5-hwcon-gui). |

## Troubleshooting


Ask in `#bazzite-problems` on [Discord](https://discord.gg/ps5linux) and attach the report from `ps5-report`. Without a network connection, copy the report to the USB drive's FAT32 partition and take it from there on your PC:

```bash
E=$(for d in /boot/efi /efi; do sudo test -f $d/cmdline.txt && echo $d && break; done); sudo cp ~/ps5-report-*.txt $E/
```

- **The console runs but there's no picture** (wrong mode, or a mode the TV doesn't accept): see [Display recovery](/hardware/hdmi#display-recovery).
- **White light but black screen:** check that HDMI Device Link is off, try another HDMI port or TV, toggle HDCP in the PS5 settings. As a last resort, add `amdgpu.force_1080p=1` to `cmdline.txt`.
- **Black screen, but the PS5 is running:** press <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F2</kbd>, wait 2–3 seconds, then <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F1</kbd>. Over SSH: `sudo chvt 2; sleep 3; sudo chvt 1`.
- **It boots back into the PS5 menu:** you pressed the power button before the orange light stopped blinking, USB power in rest mode isn't set to **Always**, or the console's rest mode was blocked, see [Known issues](/troubleshooting/known-issues#rest-mode-error-back-to-the-ps5-login-screen).
- **Artefacts, green dots or crashes:** turn the [40 CU unlock](/hardware/gpu#40-cu-unlock) off again. For glitches in a single game, use the launch option `RADV_DEBUG=nohiz %command%`.
- **VRR:** no "Enable VRR" option means a VERDE console, a display without HDMI VRR (FreeSync-only monitors), VRR turned off for that input on the TV, or an old image release with a TV that announces no VRR maximum (update). If the screen goes dark for 2 seconds in menus, use VRR per game instead (quick access menu → Performance). OLED flicker on the desktop: set Adaptive Sync to **Automatic**, not Always.
- **Bluetooth settings find no new devices** (IW620 consoles): a bug in some earlier releases; a DualSense that was already paired kept working. Update to the current release. If a controller is refused in a loop instead, see [Bluetooth](/hardware/wifi-bluetooth#controller-refused-in-a-loop).
- **HEVC video with broken colours or a red screen** (recording, streaming with Sunshine or Moonlight): the PS5's video engine gets HEVC P-frames wrong. Use **H.264**, or encode HEVC with I-frames only (see [VCN](/hardware/gpu#using-it-with-ffmpeg)). As a Moonlight client: use H.264, or "Force software decoding" for HEVC.
- **Won't boot from an SSD in a USB enclosure:** some enclosures don't work with the loader. Try another one.
- **PS5 Pro reports 36 compute units:** the Pro's GPU firmware isn't in use yet. After every update, start Linux twice: the first start adds the firmware to the initrd, the second runs on it. If it stays at 36, the loader didn't dump the firmware, see [PS5 Pro](/hardware/ps5-pro#gpu-firmware).

## How it works


Bazzite's Game Mode never worked on the PS5 before, and it wasn't the display or Gamescope. Bazzite starts Steam through the `cardwired` service, which loads an eBPF program and needs two kernel features that the PS5 kernel configs don't enable: the **BPF LSM** (`bpf` must be in `CONFIG_LSM`) and **kernel BTF** (`CONFIG_DEBUG_INFO_BTF`). Without them, `cardwired` crash-loops and Bazzite drops you to the desktop after five attempts. See [Kernel setup](/advanced/kernel#build-a-kernel-for-bazzite-game-mode) for details.

The image is built on the [ps5-linux-image](https://github.com/ps5-linux/ps5-linux-image) builder with a recent stable kernel, rmuxnet's PS5 patch set and its own HDMI, Wi-Fi and Bluetooth fixes. The config changes, the patch order and what each patch does are on [How the PS5 Bazzite Deck image is built](/advanced/image-build). Each release ships a `VERSIONS.md` with the exact versions used. To build it yourself (Linux or WSL with Docker and about 60 GB free; it takes a couple of hours):

```bash
git clone https://github.com/VivaLaVent/ps5-bazzite-deck && cd ps5-bazzite-deck
bash build.sh
```

The output folder is printed at the end of the build.

## What applies from Bazzite's documentation

| Topic | Applies? |
| --- | --- |
| [Gaming](https://docs.bazzite.gg/Gaming/): launchers, launch options, common gaming issues | Yes |
| [Steam Gaming Mode quirks](https://docs.bazzite.gg/Handheld_and_HTPC_edition/quirks/) | Yes |
| [Installing software](https://docs.bazzite.gg/Installing_and_Managing_Software/): Bazaar (Flatpak), Homebrew, Distrobox, AppImage | Yes |
| [ujust commands](https://docs.bazzite.gg/Installing_and_Managing_Software/ujust/) | Mostly; skip the ones about updates and the bootloader |
| [Updates, rollbacks and rebasing](https://docs.bazzite.gg/Installing_and_Managing_Software/Updates_Rollbacks_and_Rebasing/), `rpm-ostree`, Bazzite Updater | **No.** PS5 Bazzite Deck isn't an ostree install ("This system was not booted via libostree"). Update with its own command, see [PS5 Bazzite Deck](/choose/bazzite-deck) |
| [Installation guides](https://docs.bazzite.gg/General/Installation_Guide/) | **No.** Install from the PS5 Bazzite Deck image |

PS5 Bazzite Deck is a community project, not made or supported by the Bazzite project. Ask PS5 questions on [Discord](https://discord.gg/ps5linux), not in Bazzite's channels.

## Next steps

- [DualSense](/using-linux/dualsense): one controller for the PS5 system and Linux
- [Hardware status](/hardware/matrix): what works on your console
- [Troubleshooting & help](/troubleshooting/getting-help)
