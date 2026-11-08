---
title: "Updating: PS5 Bazzite Deck"
sidebar_label: PS5 Bazzite Deck
sidebar_position: 1
description: "Update PS5 Bazzite Deck with one command, switch between Stable and Beta, see which version runs, and roll back."
hardware: [original, slim, pro]
applies_to: bazzite-deck
---

# Updating: PS5 Bazzite Deck

## Update {#updating}

On the PS5, in a terminal (Desktop Mode → **Konsole**) or over SSH (password `ps5`).

**On v2.6.2 or older,** or installed from one of their disk images: run this once first. It prints `ready to update`, and without it the update fails with `Failed to start ostree-finalize-staged.service`:

```bash
sudo rm -f /etc/systemd/system/greenboot-set-rollback-trigger.service
printf '[Unit]\nDescription=No greenboot rollbacks on the PS5\n\n[Service]\nType=oneshot\nExecStart=/usr/bin/true\nRemainAfterExit=yes\n' | sudo tee /etc/systemd/system/greenboot-set-rollback-trigger.service >/dev/null
sudo systemctl daemon-reload && sudo systemctl start ostree-finalize-staged.service && echo "ready to update"
```

Then update:

```bash
sudo bootc upgrade && sudo systemctl reboot
```

The new version downloads, and the console restarts through the PS5 OS: start Linux with the loader as usual, and once more on a PS5 Pro for its GPU firmware. If it gives you trouble, [roll back](#rolling-back).

- **`No update available`** means your channel has nothing newer, not that something is broken. On **Stable** that is the release marked **Latest**; pre-releases are only on **Beta**.
- **Steam's update button doesn't update the PS5.** Bazzite's updater behind it needs a security module the PS5 kernel doesn't run. Up to v2.6.3 Steam shows **Update Error**; from v2.7 it finds nothing. Steam may also show SteamOS patch notes: those are Valve's notes for its channel, not this image's.
- **Your channel decides the kernel:** Stable gets the kernel of the release marked **Latest**, Beta the newest pre-release's. `uname -r` shows `7.3.1-viva` across several releases; the release itself is on the `deck=` line, see [Which version runs](#which-version-runs).
- **The loader isn't part of the update.** The `.elf` on your USB stick or in your payload manager stays as it is; replace it only when the release notes say so.
- **`mount: (hint) your fstab has been modified`** before the update starts is harmless.
- **The first start after an update** can still use the old VRAM size; power off and start with the loader once more, see [VRAM](/troubleshooting/gpu#vram).

## Packages you installed yourself {#layered-packages}

On bootc, `dnf install` changes don't survive an update. Prefer Flatpak (Bazaar), Homebrew or Distrobox, as on any Bazzite. For a system package that has to be part of the system, layer it with `sudo rpm-ostree install <package>` and from then on update with **`sudo rpm-ostree upgrade`** instead of `sudo bootc upgrade`, which refuses to update a system with layered packages. Layered packages are kept through updates and rollbacks; `rpm-ostree status` lists them.

## Stable or Beta {#update-channels}

| Channel | Follows |
| --- | --- |
| **Stable** | The release marked **Latest**, plus Bazzite's weekly updates |
| **Beta** | The newest pre-release, plus Bazzite's weekly updates |

Switch to Beta, then start with the loader:

```bash
sudo bootc switch ghcr.io/vivalavent/ps5-bazzite-bootc:beta && sudo systemctl reboot
```

Back to Stable:

```bash
sudo bootc switch ghcr.io/vivalavent/ps5-bazzite-bootc:stable && sudo systemctl reboot
```

Steam's **Settings → System → OS Update Channel** does the same switch. The switch downloads the channel's image and takes over at the next start. Between releases, both channels are rebuilt with Bazzite's base updates: an update then installs the same release with a newer build number. Stable is built from the release marked **Latest** itself, so a change reaches it only with the next stable release.

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

## Legacy installs {#legacy}

Installs from before v2.5 (`ps5-report` shows `legacy` on its **Install** line) update in place to the release marked **Latest**:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/VivaLaVent/ps5-bazzite-deck/main/tools/update-latest.sh)
```

Then power off and start with the loader. Add a version (for example `v2.7`) at the end for a specific release. Switching to bootc is recommended, see [Built with bootc](/choose/bazzite-deck#built-with-bootc).
