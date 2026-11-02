---
title: Kernel sources and patches
sidebar_position: 2
description: Where the PS5 kernel comes from, what the version numbers and branches mean, and how to apply a patch set or single patches by hand on any image.
---

# Kernel sources and patches

Every PS5 kernel is stock Linux plus one patch file and a config, and every image boots whatever kernel sits on its boot partition. This page is the map: how a kernel is put together, what the version numbers and branches mean, and how to apply patches yourself. The build and install commands are on [Kernel setup](/advanced/kernel).

## How a PS5 kernel is put together

| Part | What it is | Where |
| --- | --- | --- |
| Stock Linux | A tag from the stable tree, `v7.2.3` or `v7.3.1`. The first lines of the patch set's `.config` name it. | [git.kernel.org](https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git) |
| `linux.patch` | One `git diff` with every PS5 change: the `drivers/ps5/` drivers (HDMI chip, fan, LED, buzzer, CEC, USB-C DP, power controller), the amdgpu, xHCI, Bluetooth and Ethernet changes. | The patch set repository |
| `.config` | The kernel configuration. It also sets `CONFIG_EXTRA_FIRMWARE` to the VCN firmware in `../ps5-linux-patches/firmware`, which is why the folder name matters. | The patch set repository |
| Out-of-tree parts | The IW620 Wi-Fi driver: a separate repository upstream ([ps5-linux-mwifiex](https://github.com/ps5-linux/ps5-linux-mwifiex)), vendored in `oot/mwifiex` in rmuxnet's repository. | |
| Image patches | Patches applied on top of a patch set by an image builder, for example PS5 Bazzite Deck's `patches/`. | The image repository |

The result is a `bzImage`, an `initrd.img` built on the target distro, and a `/lib/modules/<version>` folder. The loader reads `bzImage`, `initrd.img`, `cmdline.txt` and `vram.txt` from the FAT32 boot partition and nothing else, so the kernel and the distro are independent: a kernel built for one image runs on another as long as its modules are installed there.

## Version numbers

| You see | It means |
| --- | --- |
| `7.2.3`, `7.3.1` | The stock Linux version the patch set targets. Upstream `ps5-linux-patches` is at 7.2.3, rmuxnet's repository at 7.3.1. |
| `kernel-7.2.3-fdc3eeb` | An upstream release tag: kernel 7.2.3 built from `ps5-linux-patches` commit `fdc3eeb`. Every push to `main` makes one, with `.deb`, `.pkg.tar.zst` and `.rpm` packages named `linux-ps5`. The commit is the part that tells releases apart. |
| `7.3.1-PinkSoup`, tag `7.3.1-PinkSoup-de57310` | rmuxnet's release: kernel 7.3.1, `-PinkSoup` is the local version his full-LTO builds carry (`-Clang-ThinLTO` and `-Clang-NoLTO` for the other `LTO` settings in `build.cfg`), `de57310` the commit. |
| `7.3.0-...`, `7.3.0-rc6-PinkSoup` | Older builds of the same fork, from the 7.3 port on the `meower` branch or from a release candidate. |
| PS5 Bazzite Deck `v2.0.1` | An image version. Its kernel is Linux 7.3 plus `meower` at `baee34d` plus the image's own patches; each release's `VERSIONS.md` has the exact pins. A "quick kernel" release replaces only the kernel and modules on an installed image. |

What you are running:

```bash
uname -r
cat /proc/version
```

`uname -r` gives `7.2.3` for an upstream package (its config sets no local version), `7.3.1-PinkSoup` for rmuxnet's release and a `7.3.0` kernel on PS5 Bazzite Deck (the image version is in `/etc/ps5-bazzite-deck-version`). `cat /proc/version` adds the compiler, which tells a Clang build from a GCC one.

## Repositories and branches

| Repository | Branch | What it carries |
| --- | --- | --- |
| [ps5-linux/ps5-linux-patches](https://github.com/ps5-linux/ps5-linux-patches) | `main` | The official patch set, 7.2.3. Changes land as pull requests (#43 to #67 in October and November 2026: hotplug, HDR, CEC, USB-C DP, Pro GPU, fan curve, native FRL). A package release per commit. |
| [rmuxnet/ps5-linux-patches-1](https://github.com/rmuxnet/ps5-linux-patches-1) | `shitshow` (default) | The 7.3.1 port with `build.sh`, the clock drivers, the Bluetooth fixes and the in-tree Wi-Fi driver; the `7.3.1-PinkSoup` releases are built from it. |
| | `main` | A mirror of upstream `main`. |
| | `meower` | The earlier 7.3 port (last commit `cf37af5`, 1 November 2026). PS5 Bazzite Deck builds on it at `baee34d` and carries the later `meower` commits (the fan hwmon driver, the IW620 legacy LE quirk) as its own patches. |
| | other branches | Work in progress (`VCN`, `fanfix`, `feature/ci` and so on). Not for users. |
| [Slip-Up/ps5-linux-patches](https://github.com/Slip-Up/ps5-linux-patches) | | Slip's HDMI work (native FRL, 4:2:0, ALLM, recovery), merged upstream as #63 and #67. |
| [VivaLaVent/ps5-bazzite-deck](https://github.com/VivaLaVent/ps5-bazzite-deck) | tags `vX.Y.Z` | The image. `patches/` holds its kernel patches against Linux v7.3 plus `meower`, each with a description at the top; `build.sh` section 3 is the order; `CHANGELOG.md` says what changed when and what is untested. |
| [ps5-linux/ps5-linux-image](https://github.com/ps5-linux/ps5-linux-image), [mia's fork](https://git.etawen.dev/mia/ps5-linux-image) | | The image builders. They take the patch set as a `--patches-ref` (branch, tag or commit) and build the kernel packages the images ship. |

Which feature is in which of them is on [Kernel setup](/advanced/kernel#what-is-where). rmuxnet's README sets the rules for his repository: changes go in as pull requests only, work taken from it is credited, and renamed forks of the kernel are not allowed.

## Apply a patch set by hand

The full commands are under [Build by hand](/advanced/kernel#build-by-hand). The shape is always the same, for either repository:

1. Clone the patch set and the stock kernel side by side, the patch set in a folder named `ps5-linux-patches`.
2. Check out the tag named in the first lines of `.config`.
3. `git apply ../ps5-linux-patches/linux.patch` in the kernel tree, after a dry run with `git apply --check`.
4. `cp ../ps5-linux-patches/.config .config` and `make olddefconfig` (`LLVM=1` for rmuxnet's config, which is made with Clang).
5. Build, install the modules with `INSTALL_MOD_STRIP=1`, make the initrd, copy `bzImage` and `initrd.img` to the boot partition.

A patch set only applies cleanly to the kernel version it was made for. `git apply --check` tells you before anything is touched; a failure on a different point release usually means a small context change, and `patch -p1 --dry-run` shows which hunks.

## Add single patches on top

There are two layers, and a patch is written for one of them:

- **A patch to the patch set** changes `linux.patch` and `.config` themselves. Upstream pull requests are this kind: download one with `curl -L -o pr.patch https://github.com/ps5-linux/ps5-linux-patches/pull/<number>.patch` and apply it in the `ps5-linux-patches` checkout (`git apply pr.patch` or `git am pr.patch`) **before** step 3 above. PS5 Bazzite Deck does this with upstream PR #4 (suspend-to-idle).
- **A patch to the kernel tree** changes kernel source files. PS5 Bazzite Deck's `patches/` are this kind: apply them in the kernel tree **after** step 3, in the order `build.sh` lists them, because later ones are written against the state the earlier ones leave. Each file's header says what it does and which release introduced it.

For every patch:

```bash
git apply --check <patch>
git apply <patch>
```

Some patches need a config option as well; the patch description or `build.sh` says which. Set it before `olddefconfig`:

```bash
scripts/config --enable CONFIG_MT7921E
scripts/config --disable CONFIG_PS5_GPUFREQ
make LLVM=1 olddefconfig
```

Then build as usual. Give the kernel a local version (`scripts/config --set-str CONFIG_LOCALVERSION "-mine"`) so its modules don't overwrite the ones of the kernel you are running.

:::note[Patches move between the layers]
When PS5 Bazzite Deck's or Slip's kernel-tree patches are merged upstream, they become part of `linux.patch` and applying them again fails with "patch does not apply". [What is where](/advanced/kernel#what-is-where) lists the state on 2 November 2026; `CHANGELOG.md` in the image repository and the pull requests upstream are the running record.
:::

## Put a kernel on an existing image

Nothing in the distro has to change for a new kernel except its modules and initrd:

1. Install the modules to `/lib/modules/<version>` (a package, rmuxnet's `install.sh`, or `make modules_install`).
2. Build an initrd for that version on the image (`update-initramfs`, `mkinitcpio` or `dracut`). On a PS5 Pro the GPU firmware has to be inside it, see [PS5 Pro](/hardware/ps5-pro#gpu-firmware).
3. Back up `bzImage` and `initrd.img` on the boot partition and copy the new ones over them. `cmdline.txt` and `vram.txt` stay.
4. Cold boot and start with the loader. To test a kernel without a cold boot, use [kexec](/advanced/warm-reboot).

If the new kernel doesn't boot, put the backed-up files back from any PC (the partition is FAT32). What a kernel needs beyond that is the same for every image: the IW620 Wi-Fi driver built for it (bundled in the `linux-ps5` package and in rmuxnet's release, otherwise [reinstall it](/using-linux/networking/wifi#after-a-kernel-update)), and on an image with Steam Gaming Mode the [BPF LSM and BTF](/advanced/kernel#build-a-kernel-for-bazzite-game-mode) options.
