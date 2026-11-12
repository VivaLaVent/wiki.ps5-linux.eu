---
title: "Boot options: PS5 Bazzite Deck"
sidebar_label: Boot options
sidebar_position: 2
description: PS5 Bazzite Deck's default cmdline.txt line and how to add kernel options the bootc way.
hardware: [original, slim, pro]
applies_to: bazzite-deck
---

# Boot options: PS5 Bazzite Deck

How `cmdline.txt` and `vram.txt` work, how to edit them from a PC, and every option are on [Boot options](/post-install/boot-options).

## The default line

The line is written from the system's own kernel arguments: `root=` names the partition by UUID, `ostree=` the version to start, and from v2.7.1 `firmware_class.path=/etc/firmware` lets the IW620 Wi-Fi driver find its firmware at its first load.

## Add or remove an option {#edit}

`cmdline.txt` is written from the system's own kernel arguments at every start and shutdown. Add an option the bootc way, so it survives updates and rollbacks:

```bash
sudo rpm-ostree kargs --append=amdgpu.force_1080p=1      # add
sudo rpm-ostree kargs --delete=amdgpu.force_1080p=1      # remove
```

An option added to `cmdline.txt` from a PC, for example when the screen stays black, is kept too.

Changes take effect at the next start with the loader.

Every option, and which kernel has it, is on [Boot options](/post-install/boot-options#options).

## vram.txt

`vram.txt` isn't managed by the image: updates and rollbacks leave your value alone. [PS5 Hardware Control](/post-install/decky#ps5-hardware-control) and ps5-hwcon-gui change the same file from Game Mode or the desktop.
