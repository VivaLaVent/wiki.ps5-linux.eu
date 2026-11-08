---
title: "Build your own: other images"
sidebar_label: Other images
sidebar_position: 2
description: "Build an official PS5 Linux image or only the PS5 kernel yourself from current sources."
hardware: [original, slim, pro]
applies_to: not-bazzite-deck
---

# Build your own: other images

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

## Only the kernel {#only-the-kernel}

On an image that already runs, you don't need a new image to change the kernel: install rmuxnet's release, build his or the official patch set with `build.sh` or by hand, and copy the result to the boot partition, see [Kernel setup](/post-install/kernel). The loader starts whatever `bzImage` and `initrd.img` are on the boot partition, so a kernel built for one image runs on another as long as its modules are installed there.
