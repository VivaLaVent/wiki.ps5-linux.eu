---
title: "Updating: bootc"
sidebar_label: bootc
sidebar_position: 1
description: "Update a bootc PS5 Bazzite Deck install: the one-time fix for v2.6.2 or older, Stable or Beta, a specific release, checking the version and rolling back."
hardware: [original, slim, pro]
applies_to: bazzite-deck
---

# Updating: bootc

Every command runs on the PS5, in a terminal (Desktop Mode → **Konsole**) or over SSH (password `ps5`).

## On v2.6.2 or older: once, first {#before-updating}

On v2.6.2 or older, or on an install from one of their disk images, run this once. It prints `ready to update`; without it every update and switch fails with `Failed to start ostree-finalize-staged.service`. On newer installs it does no harm.

```bash
sudo rm -f /etc/systemd/system/greenboot-set-rollback-trigger.service
printf '[Unit]\nDescription=No greenboot rollbacks on the PS5\n\n[Service]\nType=oneshot\nExecStart=/usr/bin/true\nRemainAfterExit=yes\n' | sudo tee /etc/systemd/system/greenboot-set-rollback-trigger.service >/dev/null
sudo systemctl daemon-reload && sudo systemctl start ostree-finalize-staged.service && echo "ready to update"
```

## Stable or Beta {#update-channels}

| Channel | Follows |
| --- | --- |
| **Stable** | The release marked **Latest**, plus Bazzite's weekly updates |
| **Beta** | The newest pre-release, plus Bazzite's weekly updates |

To change channel, switch. The switch downloads the channel's newest build, which takes over at the next start with the loader; no update is needed afterwards.

```bash
sudo bootc switch ghcr.io/vivalavent/ps5-bazzite-bootc:beta
```

```bash
sudo bootc switch ghcr.io/vivalavent/ps5-bazzite-bootc:stable
```

Steam's **Settings → System → OS Update Channel** does the same switch. Between releases, both channels are rebuilt with Bazzite's base updates: an update then installs the same release with a newer build number. Stable is built from the release marked **Latest** itself, so a change reaches it only with the next stable release.

**A specific release:** switch to its version tag, for example `:v2.7.3` instead of `:beta`. The console then stays on that release, without weekly updates, until you switch to `:stable` or `:beta` again.

## Update {#updating}

Already on the channel you want:

```bash
sudo bootc upgrade
```

The update takes over at the next start with the loader; on a PS5 Pro, start with the loader once more for its GPU firmware.

- **`No update available`** means your channel has nothing newer, not that something is broken. On **Stable** that is the release marked **Latest**; pre-releases are only on **Beta**.
- **Steam's update button doesn't update the PS5.** Bazzite's updater behind it needs a security module the PS5 kernel doesn't run. Up to v2.6.3 Steam shows **Update Error**; from v2.7 it finds nothing. Steam may also show SteamOS patch notes: those are Valve's notes for its channel, not this image's.
- **Your channel decides the kernel:** Stable gets the kernel of the release marked **Latest**, Beta the newest pre-release's. `uname -r` shows `7.3.1-viva` across several releases; the release itself is on the `deck=` line, see [Which version runs](#which-version-runs).
- **The loader isn't part of the update.** The `.elf` on your USB stick or in your payload manager stays as it is; replace it only when the release notes say so.
- **`mount: (hint) your fstab has been modified`** before the update starts is harmless.
- **The first start after an update** can still use the old VRAM size; power off and start with the loader once more, see [VRAM](/troubleshooting/gpu#vram).

### Packages you installed yourself {#layered-packages}

On bootc, `dnf install` changes don't survive an update. Prefer Flatpak (Bazaar), Homebrew or Distrobox, as on any Bazzite. A system package layered with `sudo rpm-ostree install <package>` stays through updates, but `bootc upgrade` and `bootc switch` refuse a system with layered packages. Update with `sudo rpm-ostree upgrade` instead, and change channel with `rpm-ostree rebase`, which keeps them:

```bash
sudo rpm-ostree rebase ostree-image-signed:docker://ghcr.io/vivalavent/ps5-bazzite-bootc:beta
```

`rpm-ostree status` lists the layered packages.

## Which version runs {#which-version-runs}

```bash
grep -E '^(deck|version)=' /usr/share/ps5-bazzite-bootc/VERSION
```

`deck=` is the release (for example `v2.6.3`), `version=` the image build (`20261106.25`: the build date and a number). `ps5-report`'s **Install** line shows the channel and the build, `fastfetch` the release. `uname -r` shows only the kernel (`7.3.1-viva`), which is the same in several releases.

## Rolling back {#rolling-back}

The previous version stays on the drive after every update. To go back to it:

1. Run `sudo bootc rollback`.
2. **Power off** (not restart), then start with the loader as usual. With [warm reboots](/post-install/warm-reboot-bazzite-deck) on, a restart would skip the loader. Any loader starts the version you rolled back to, because it is already in place on the boot partition; use bazzite-bootc-loader from your release anyway, so the manual rollback below works with the same loader.
3. Check which version runs, see [Which version runs](#which-version-runs).

Running `sudo bootc rollback` again, then powering off, takes you forward to the newer version.

The loader doesn't need to know about rollbacks: at every shutdown, `ps5-bootc-sync` puts the version that starts next on the boot partition as `bzImage`, `initrd.img` and `cmdline.txt`, and keeps the previous version's kernel under `ostree/<id>/`. `ROLLBACK.txt` on the boot partition names both, and describes how to start the previous version from a PC if a new version doesn't start at all. That manual rollback **needs bazzite-bootc-loader**: it uses `path-override.txt`, and only this loader applies it to `cmdline.txt` and `vram.txt` as well as to the kernel and initrd. Another loader would start the previous kernel with the new version's `cmdline.txt`.
