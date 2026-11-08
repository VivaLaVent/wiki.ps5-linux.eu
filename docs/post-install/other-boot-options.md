---
title: "Boot options: other images"
sidebar_label: Boot options
sidebar_position: 4
description: The default cmdline.txt line of the official PS5 Linux images.
hardware: [original, slim, pro]
applies_to: not-bazzite-deck
---

# Boot options: other images

How `cmdline.txt` and `vram.txt` work, how to edit them on the PS5 or from a PC, and every option are on [Boot options](/post-install/boot-options).

## The default line

The official images:

```text title="cmdline.txt"
root=LABEL=<image> rw rootwait console=ttyTitania0 console=tty0 mitigations=off idle=halt preempt=full video=DP-1:1920x1080@60
```

`video=DP-1:1920x1080@60` starts at 1080p60. Remove it if you get a black screen.

Every option, and which kernel has it, is on [Boot options](/post-install/boot-options#options).
