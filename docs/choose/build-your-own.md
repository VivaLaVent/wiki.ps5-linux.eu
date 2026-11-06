---
title: Build your own image
sidebar_label: Build your own
sidebar_position: 3
description: Build an official image, PS5 Bazzite Deck or only the PS5 kernel yourself from current sources, and what each needs.
hardware: [original, slim, pro]
applies_to: all
---

# Build your own image

Every image is a normal distro plus the same PS5 parts: a patched kernel on the boot partition, the Wi-Fi driver and a few services. You can build any of them yourself from current sources:

| What | Build it when | Needs |
| --- | --- | --- |
| [An official image](#official-image) | You want a distro the release doesn't have yet, or a newer kernel than the release images | Docker, about 30 GB free |
| [PS5 Bazzite Deck](#ps5-bazzite-deck) | You change the image or its patches | Docker, Podman, about 60 GB free |
| [Only the kernel](#only-the-kernel) | You already run Linux on the PS5 and want a newer or patched kernel | The distro's kernel build tools, on the PS5 or a PC |

The kernel is the part that differs between images. How it is put together, what its version strings mean and how to add single patches is on [Kernel sources and patches](/choose/kernel-sources).

## An official image {#official-image}

The official [ps5-linux-image](https://github.com/ps5-linux/ps5-linux-image) builder makes the same images as its release page: Ubuntu, Arch, CachyOS and Fedora, or only the kernel packages. It needs Docker and about 30 GB of free disk space.

```bash
# On Windows, run this inside WSL (install it first with: wsl --install)
sudo apt update && sudo apt install docker.io -y
sudo service docker start
sudo usermod -aG docker $USER
newgrp docker

git clone https://github.com/ps5-linux/ps5-linux-image
cd ps5-linux-image
chmod +x ./build_image.sh

# Single distro: ubuntu2604, arch, cachyos or fedora
./build_image.sh --distro ubuntu2604
./build_image.sh --distro cachyos

# Multi-distro (Ubuntu + Arch + CachyOS, 32 GB image)
./build_image.sh --distro all

# Build only the kernel packages (.deb / .pkg.tar.zst), no image
./build_image.sh --kernel-only

# Build against a specific ps5-linux-patches branch, tag or commit
./build_image.sh --distro arch --patches-ref main
```

Images are written to `output/`; kernel-only builds go to `linux-bin/`. A second run reuses the kernel and root filesystem from the cache; `--clean` starts from scratch.

:::tip[WSL running out of memory during the build?]
Create or edit `C:\Users\<you>\.wslconfig` and raise the memory limit:

```ini title="C:\Users\<you>\.wslconfig"
[wsl2]
memory=8GB
```

Then restart WSL with `wsl --shutdown`.
:::

## PS5 Bazzite Deck {#ps5-bazzite-deck}

A kernel package built with the same builder plus the image's own patches, then a bootc image on top of Bazzite's. The kernel config changes, the patch order and the build commands are on [How the PS5 Bazzite Deck image is built](/choose/image-build).

## Only the kernel {#only-the-kernel}

On an image that already runs, you don't need a new image to change the kernel: install rmuxnet's release, build his or the official patch set with `build.sh` or by hand, and copy the result to the boot partition, see [Kernel setup](/post-install/kernel). The loader starts whatever `bzImage` and `initrd.img` are on the boot partition, so a kernel built for one image runs on another as long as its modules are installed there.

## Next steps

**[Flash the image to USB](/installation/flash)**, then start Linux and work through the first boot.
