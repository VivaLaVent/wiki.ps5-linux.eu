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

Use Steam's update button (**Settings → System**) or `sudo bootc upgrade` in a terminal. The new version downloads in the background and takes over at the next start: restart, then start with **bazzite-bootc-loader**. If it gives you trouble, [roll back](#rolling-back). Releases marked **Pre-release** are test builds: Steam's **Stable** channel doesn't install them, its **Beta** channel does (**Settings → System → OS Update Channel**).

**Legacy installs** (`ps5-report` shows `legacy` on its **Install** line) update in place with the command in the release's notes, then power off and start with the loader. Switching to bootc is recommended, see [Built with bootc](/choose/bazzite-deck#built-with-bootc).

:::warning[Updating from v2.5]
On v2.5, every update fails with `Failed to start ostree-finalize-staged.service` (`Unit greenboot-set-rollback-trigger.service is masked`). Run this once on the PS5 before updating; it prints `ready to update`, and the change stays through all later updates:

```bash
sudo rm -f /etc/systemd/system/greenboot-set-rollback-trigger.service
printf '[Unit]\nDescription=No greenboot rollbacks on the PS5\n\n[Service]\nType=oneshot\nExecStart=/usr/bin/true\nRemainAfterExit=yes\n' | sudo tee /etc/systemd/system/greenboot-set-rollback-trigger.service >/dev/null
sudo systemctl daemon-reload && sudo systemctl start ostree-finalize-staged.service && echo "ready to update"
```
:::

## Rolling back

The previous version stays on the drive after every update. To go back to it:

1. Run `sudo bootc rollback`.
2. **Power off** (not restart), then start with **bazzite-bootc-loader**. With [warm restarts](/advanced/warm-reboot#ps5-bazzite-deck) on, a restart would skip the loader.
3. Check which version runs:

   ```bash
   sudo rpm-ostree status
   sed -n 's/^deck=//p' /usr/share/ps5-bazzite-bootc/VERSION
   ```

Running `sudo bootc rollback` again, then powering off, takes you forward to the newer version.

The loader doesn't need to know about rollbacks: at every shutdown, `ps5-bootc-sync` puts the version that starts next on the boot partition as `bzImage`, `initrd.img` and `cmdline.txt`, and keeps the previous version's kernel under `ostree/<id>/`. `ROLLBACK.txt` on the boot partition names both, and describes how to start the previous version from a PC if a new version doesn't start at all.

## Built-in commands


| Command | What it does |
| --- | --- |
| `ps5-report` | Collects your hardware details and the relevant logs into one file for a bug report. It only reads. |
| `ps5-perf` | CPU boost and the fan target (the console's firmware control, 80 °C by default). `ps5-perf status` shows the fan mode and speed, see [Fan control](/hardware/fan). |
| `ps5-warm-reboot` | Restarts straight back into Linux, without the PS5 OS and the loader. Off by default, `on`/`off`/`status`, see [Warm restarts](/advanced/warm-reboot#ps5-bazzite-deck). |
| `ps5-bt-address` | One DualSense for the PS5 and Linux, on by default. `status`, `on`, `off`. |

Sleep (suspend-to-idle) is built in: a short press of the power button or Steam's **Sleep** puts the console to sleep and wakes it again. The GPU stays powered, so the saving is modest; it is not the PS5 OS's rest mode, and a DualSense can't wake the console.

## Boot options (cmdline.txt)

All options, PS5 Bazzite Deck's default line and how to edit it are on **[Boot options](/post-install/boot-options)**. The ones you're most likely to need: `amdgpu.force_1080p=1` for a picture you can't get past, `usb-storage.quirks=…` for a USB drive that disconnects, `usbc_dp.enable=1` for a USB-C display. To turn off VRR, use Steam's setting (Settings → Display). To stop the TV from turning on with the console, turn off HDMI-CEC in the TV's settings.

## 40 GPU compute units


The image supports the [40 CU unlock](/hardware/gpu#40-cu-unlock) on the original PS5 and the Slim. The setting is kept across updates. Don't use it on a PS5 Pro.

## Decky Loader and PS5 Hardware Control

[Decky Loader](/using-linux/decky) adds plugins to Game Mode's quick access menu: `ujust setup-decky install` in Desktop Mode installs it. Its [PS5 Hardware Control](/using-linux/decky#ps5-hardware-control) plugin sets the fan, CPU and GPU clocks, the light bar and VRAM from Game Mode; [ps5-hwcon-gui](https://github.com/NotHavocc/ps5-hwcon-gui) does the same on the desktop. Both are community-made and not part of the image.

## Troubleshooting


The first steps for the screen, Game Mode, Bluetooth and Wi-Fi are on [Common problems](/troubleshooting/common-problems). Ask in `#bazzite-problems` on [Discord](https://discord.gg/ps5linux) and attach the report from `ps5-report`. Without a network connection, copy the report to the USB drive's FAT32 partition and take it from there on your PC:

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
- **An update or `bootc switch` fails with `Failed to start ostree-finalize-staged.service`:** v2.5's image; run the fix under [Updating](#updating) once.
- **Won't boot from an SSD in a USB enclosure:** some enclosures don't work with the loader. Try another one.
- **PS5 Pro: black screen in D3D12 games** (Dragon's Dogma 2, and others under vkd3d), SSH still works, `GPU Recovery Failed: -110` in the log: v2.1.6 to v2.5.1 replaced part of the Pro's GPU firmware, fixed in v2.6.1, see [Command-processor microcode](/hardware/ps5-pro#cp-microcode).
- **PS5 Pro reports 36 compute units:** the Pro's GPU firmware isn't in use yet. After every update, start Linux twice: the first start adds the firmware to the initrd, the second runs on it. If it stays at 36, the loader doesn't dump the firmware on your firmware version, see [PS5 Pro](/hardware/ps5-pro#gpu-firmware).

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
| [Updates, rollbacks and rebasing](https://docs.bazzite.gg/Installing_and_Managing_Software/Updates_Rollbacks_and_Rebasing/), `rpm-ostree`, Bazzite Updater | **Partly.** `sudo bootc upgrade`, `sudo bootc rollback`, `sudo bootc status` and `rpm-ostree kargs` work; don't rebase to Bazzite's own images, they can't start on the PS5. Legacy installs: no ("This system was not booted via libostree"). See [Updating](#updating) |
| [Installation guides](https://docs.bazzite.gg/General/Installation_Guide/) | **No.** Install from a PS5 Bazzite Deck image, see [PS5 Bazzite Deck](/choose/bazzite-deck#download-and-extract) |

PS5 Bazzite Deck is a community project, not made or supported by the Bazzite project. Ask PS5 questions on [Discord](https://discord.gg/ps5linux), not in Bazzite's channels.

## Next steps

- [DualSense](/using-linux/dualsense): one controller for the PS5 system and Linux
- [Hardware status](/hardware/matrix): what works on your console
- [Troubleshooting & help](/troubleshooting/getting-help)
