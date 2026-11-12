---
title: Error messages and boot problems
sidebar_label: Error messages
sidebar_position: 1
description: What to do when Linux doesn't start, shows an error, fails to update or needs repairing, on PS5 Bazzite Deck and the other images.
hardware: [original, slim, pro]
applies_to: all
---

# Error messages and boot problems

Problems with starting, updating or repairing the system, ordered by when they happen: find your message under **On this page**. Problems with one component (the picture, Wi-Fi, a controller) are on that component's page, see [Troubleshooting](/troubleshooting/getting-help#where-to-look).

## Starting Linux

### Orange light, then the PS5 OS or its login screen {#rest-mode-error-back-to-the-ps5-login-screen}

Either the power button was pressed before the orange LED stopped blinking, USB power in rest mode isn't set to **Always** (see [Required PS5 settings](/installation/booting#required-ps5-settings)), or rest mode itself failed.

The loader works by putting the console into rest mode; when the LED turns solid orange, the power button starts Linux. If the LED goes from white straight to steady orange without blinking, or the PS5 shows a rest mode error, and the power button then starts the PS5 OS, rest mode was refused or interrupted. It happens on every model, the Pro included, and the image on the drive has nothing to do with it. The usual causes:

- **USB devices that block rest mode.** Hubs, keyboards and mice on the fast ports can keep the console from entering rest mode.
- **Leftover state from a failed attempt.** After one failed start, the next one often fails too until the system is restarted fully.

Fix: plug the boot drive directly into a fast port, with nothing else on the fast ports, and connect the hub, keyboard and mouse only once Linux is up (the slow USB 2.0 port is fine for a keyboard). After a failed attempt, restart the PS5 OS completely (not into rest mode) before you jailbreak again.

### Linux doesn't start after the exploit {#linux-wont-boot-after-running-the-exploit}

Send the Linux loader as the only payload. If etaHEN, kstuff or anything else ran first, restart the PS5, jailbreak again and send only the loader, see [Booting Linux](/installation/booting#send-the-linux-loader).

### "Unknown format", or the loader says "Couldn't find bzImage" (system software 4.x) {#gpt-first-lba}

On PS5 system software 4.x, the PS5 can't read a drive flashed with a PS5 Bazzite Deck image older than v2.11: one field of its partition table (first usable LBA 2048) trips a bug in that system software. Newer system software and Legacy drives aren't affected.

- **Flash v2.11 or newer,** or
- **fix the drive you have** from a PC. It changes that one field, not your data, and only shows what it would do without `--apply`:

  ```bash
  curl -fsSLO https://raw.githubusercontent.com/VivaLaVent/ps5-bazzite-deck/main/bootc/tools/gpt-first-lba.py
  sudo python3 gpt-first-lba.py /dev/sdX --apply
  ```

  macOS: `/dev/rdiskN`, after `diskutil unmountDisk diskN`. Windows: run it on the `.img` before flashing, `python gpt-first-lba.py ps5-bazzite-deck-bootc-vX.Y.img --apply`.

### "Could not create PS5 WiFi firmware directory" {#could-not-create-ps5-wifi-firmware-directory}

Harmless. The loader carries on and Linux boots; look elsewhere if the boot fails.

### Emergency shell: `/dev/disk/by-label/bazzite-deck does not exist` {#emergency-shell}

PS5 Bazzite Deck stops in an emergency shell with `/dev/disk/by-label/bazzite-deck does not exist` or `Not all disks have been found`: the system partition wasn't found. Drives flashed with Rufus showed this; check the image's checksum and flash it again with balenaEtcher, see [Flash the image](/installation/flash#check-the-download).

### CachyOS image doesn't boot {#cachyos-image-doesnt-boot}

The official CachyOS image can panic right after the orange LED stops blinking. Nobody has filed an issue with the panic text yet; if it happens to you, open one on [ps5-linux-image](https://github.com/ps5-linux/ps5-linux-image/issues) so it can be linked here. Until then, use Ubuntu, Arch or [PS5 Bazzite Deck](/choose/bazzite-deck). The [package repository](/post-install/package-repository#fix-scripts-for-older-images) has a `fix-cachyos.sh` for images that do boot.

Individual reports of CachyOS running with a current upstream kernel exist, but the wiki editors haven't confirmed one. Treat them as a lead, not as a fix.

Older CachyOS images needed this Gamescope session fix for a different problem:

```bash
sed -i 's/-steamos3//' /usr/bin/gamescope-session-ps5
```

### "Repairing" or "PS5 wasn't turned off properly" {#repairing-or-ps5-wasnt-turned-off-properly}

Expected after a Linux session, and harmless.

## Using Linux

### The screen saver froze the screen {#the-screen-saver-froze-the-screen}

The screen saver is broken on the PS5 and can't be dismissed once it starts. SSH in from another device and run `sudo reboot`, then turn the screen saver off in the desktop's power settings before any long install or download.

### Game Mode doesn't start after installing a Decky plugin {#game-mode-doesnt-start-after-installing-a-decky-plugin}

PS5 Bazzite Deck with [Decky Loader](/post-install/decky): Remove the plugin from Desktop Mode: delete its folder under `~/homebrew/plugins/`, then switch to Game Mode again. If that isn't enough, `ujust setup-decky uninstall` removes Decky completely.

### A warm reboot hangs {#a-warm-reboot-hangs}

PS5 Bazzite Deck with `ps5-warm-reboot on`: on consoles with the IW620 chip, Wi-Fi and Bluetooth may not come back after one. Hold the power button until the console turns off, then start Linux with the loader. If it keeps happening, turn warm reboots off with `ps5-warm-reboot off` and report it in `#bazzite-problems` on [Discord](https://discord.gg/ps5linux) with the file `ps5-report` saves.

### The firewall says `failed` {#firewall}

PS5 Bazzite Deck up to v2.7.3: `firewall-cmd --state` says `failed`. The kernel lacks the NetBIOS helper that the samba-client service in Fedora's default zone needs; v2.8 has it. On older releases, this starts the firewall without that service:

```bash
sudo firewall-offline-cmd --zone=FedoraWorkstation --remove-service=samba-client
sudo systemctl restart firewalld
```

On v2.8 or newer, `--add-service=samba-client` in the same command puts the service back.

### Settings or drivers missing at random {#modules-or-sysctl-settings-not-loading}

Things fail at random after boot: a driver is missing, `/etc/sysctl.d` values are not applied, or a service behaves differently from one boot to the next.

:::note[Not for PS5 Bazzite Deck]
This concerns distros where you manage the kernel and services yourself. PS5 Bazzite Deck users: not seen on that image; report it in #bazzite-problems if you think you hit it.
:::

#### Cause

`ps5-stage-firmware.service` can create a systemd ordering cycle. To break the cycle, systemd skips one of the units in it, and the ones skipped can be `systemd-sysctl` and `systemd-modules-load`. Nothing visible fails, so the symptom is only that settings are missing.

:::note[Not tested]
Reported with the official CachyOS image. Other images may not have this service. Check with the command below before you change anything.
:::

#### Check for the cycle

```bash
journalctl -b | grep -i "ordering cycle"
```

No output means you don't have this problem.

#### Fix

Add one line under `[Unit]` in the service file:

```bash
sudo systemctl edit --full ps5-stage-firmware.service
```

```ini
[Unit]
DefaultDependencies=no
```

Reboot, then run the check again. It should print nothing.

## Updates and kernels

### Updates fail: `Failed to start ostree-finalize-staged.service` {#bazzite-deck-v25-updates-fail}

On v2.5, every update and `bootc switch` fails with `Failed to start ostree-finalize-staged.service` (`Unit greenboot-set-rollback-trigger.service is masked`). Later images are fixed; on v2.5, run the fix under [Updating from v2.5](/updating/bootc#updating) once.

v2.5's **OS Update Channel** in Steam also switches to Bazzite's own images, which can't start on a PS5: don't use it on v2.5. From v2.5.1 it lists Stable and Beta of PS5 Bazzite Deck.

### Steam: "Update Error" {#steam-update-error}

PS5 Bazzite Deck up to v2.6.3: Steam's update button can't update the PS5 (Bazzite's updater behind it doesn't run with the PS5 kernel). Update with `sudo bootc upgrade` instead, see [Updating](/updating/bootc#updating). From v2.7 Steam finds no update.

### "No update available" {#no-update-available}

Your channel has nothing newer. On **Stable**, that is the release marked **Latest**: to get a pre-release, switch to Beta, see [Stable or Beta](/updating/bootc#update-channels). [Which version runs](/updating/bootc#which-version-runs) shows what you have.

### Legacy update: "this is not a PS5 Bazzite Deck install" {#legacy-update-this-is-not-a-ps5-bazzite-deck-install}

Legacy installs are no longer updated, so this command no longer applies. Switch to bootc, see [Switching from Legacy](/updating/legacy).

### Black screen after a kernel update on an M.2 install {#kernel-update-breaks-m2-boot}

Two different problems get reported under this name.

**Official and community images:** some users who updated the kernel on an M.2 install got a black screen afterwards and had to go back to the kernel the image shipped with. There is no tracked issue and no confirmed cause, and it hasn't been re-tested with the current upstream packages. If you hit it, report it on [ps5-linux-patches](https://github.com/ps5-linux/ps5-linux-patches/issues) with `dmesg`. To go back, reinstall the previous kernel package through a chroot, see [Recovery via chroot](/troubleshooting/error-messages#recovery-via-chroot).

**PS5 Bazzite Deck:** the kernel and initrd always have to come from the USB drive's `boot` partition, which is where the update script puts them. A loader that takes `bzImage` and `initrd.img` from somewhere else (a second drive, a copy on the M.2) starts the **old kernel with the new modules**: the network is gone and the log is full of `disagrees about version of symbol`. Boot with only the USB drive's boot partition in reach of the loader, see [Install to the internal M.2](/installation/m2-bazzite-deck).

### Package repository errors {#package-repository}

**"certificate is not yet valid" when refreshing the repository:** the PS5's clock is wrong. Force a time sync with `sudo chronyc makestep`, or set the time manually with `sudo timedatectl set-time "YYYY-MM-DD HH:MM:SS"`.

**"Could not resolve host: repo.etawen.dev" inside rpm-ostree on Bazzite:** systemd-resolved is stuck. Run `sudo systemctl restart systemd-resolved`.

**`rpm-ostree` refuses with "This system was not booted via libostree" on Bazzite:** the loader's boot chain doesn't create `/run/ostree-booted`. Run `sudo touch /run/ostree-booted`, then `sudo rpm-ostree install ...` works. To reboot, use `sudo sync && sudo sh -c 'echo b > /proc/sysrq-trigger'`, because the `rpm-ostree-systemctl` wrapper swallows `systemctl reboot`.

**"ld-linux-aarch64.so.1 not found" during `dnf upgrade`:** you have an old, badly converted RPM. Upgrade to a current package: `sudo dnf upgrade --setopt=gpgcheck=0 linux-ps5`.

**`fatal error: linux/errno.h: No such file or directory` when compiling on Debian/Ubuntu:** newer `linux-ps5` packages no longer ship `/usr/include/linux/*`, to stop clashing with the distro's own headers. If you upgraded from a flashed image, the old headers were removed and the distro ones were never installed. Fix it with `sudo apt install linux-libc-dev`. On Arch: `sudo pacman -S linux-api-headers`. On Fedora: `sudo dnf install kernel-headers`.

**`/boot/efi exists but is not mounted, attempting to mount...` during install:** this is normal. If you also see `ERROR: could not mount EFI partition; aborting`, mount `/dev/disk/by-label/boot` at `/boot/efi` yourself and run the install again.

**No Wi-Fi networks on Bazzite (NetworkManager stuck):** older Bazzite builds used `iwd` as the Wi-Fi backend, which doesn't work with the IW620 driver; current ones use `wpa_supplicant` again, see [Wi-Fi](/troubleshooting/wifi#bazzite-no-wi-fi-networks).

## Recovery via chroot {#recovery-via-chroot}

If your install no longer boots but you have access to another Linux system (booted from another USB drive, or another machine), you can chroot into your install to fix it.

:::note[Not for PS5 Bazzite Deck]
This page is for installs you manage with a package manager. PS5 Bazzite Deck users: go back to the previous version with `sudo bootc rollback`, see [Rolling back](/updating/bootc#rolling-back); `ROLLBACK.txt` on the boot partition explains how to start it from a PC.
:::

### Find your partition

```bash
lsblk -f
```

Look for the ext4 partition: `nvme0n1p1` for an M.2 install made with `m2_install.sh`, or `sdXN` for a USB drive.

### Chroot into an M.2 install

```bash
sudo mkdir -p /mnt/ps5root
sudo mount /dev/nvme0n1p1 /mnt/ps5root

sudo mount --bind /dev  /mnt/ps5root/dev
sudo mount --bind /proc /mnt/ps5root/proc
sudo mount --bind /sys  /mnt/ps5root/sys
sudo mount --bind /run  /mnt/ps5root/run

sudo chroot /mnt/ps5root

# Make your fixes here, then:
exit

sudo umount /mnt/ps5root/{run,dev,proc,sys}
sudo umount /mnt/ps5root
```

### Common fixes inside the chroot

- **Reinstall the kernel:** `dpkg -i /tmp/linux-ps5_*.deb` (the package you want to go back to)
- **Create a user** (for example when Ubuntu went black before setup finished):

  ```bash
  adduser <username>
  usermod -aG sudo <username>
  ```

- **Fix home folder permissions:** `chown -R <user>:<user> /home/<user>`

### Reinstall the kernel on a USB drive

If your external USB drive no longer boots, reinstall the kernel `.deb` through a chroot. Replace `sdXN` with the root filesystem partition and use the kernel package you want to install.

```bash
sudo mkdir -p /mnt/usb
sudo mount /dev/sdXN /mnt/usb

sudo mount --bind /dev      /mnt/usb/dev
sudo mount --bind /dev/pts  /mnt/usb/dev/pts
sudo mount --bind /proc     /mnt/usb/proc
sudo mount --bind /sys      /mnt/usb/sys
sudo mount --bind /run      /mnt/usb/run

sudo cp ./linux-ps5_<version>_amd64.deb /mnt/usb/tmp/

sudo chroot /mnt/usb /bin/bash

cd /tmp
dpkg -i linux-ps5_<version>_amd64.deb
```

When you're done, `exit` the chroot and unmount everything in reverse order, as in the M.2 example above.
