---
title: Prerequisites
description: PS5 settings, hardware and host machine you need before installing Linux.
---

# Prerequisites

## Required PS5 settings

Set these **before** you jailbreak and send the Linux loader. If you reset your PS5 settings or reinstall the firmware, set them again. Forgetting them is the most common reason Linux fails to boot.

1. **Supply power to USB in rest mode** (required to boot):
   **Settings → System → Power Saving → Features Available in Rest Mode → Supply Power to USB Ports → Always**
2. **Disable HDMI Device Link** (required):
   **Settings → HDMI → Enable HDMI Device Link → Off**

**Recommended:**

- Disable automatic updates: **Settings → System → System Software → System Software Update and Settings**
- Disable automatic error reporting: **Settings → System → System Software → Report System Software Errors Automatically**

## Hardware

- A USB drive of 64 GB or more, formatted FAT32 or exFAT (an external SSD is preferred)
- A USB keyboard and mouse

## Host machine

You need a Linux PC, or a Windows PC with WSL, to prepare the image. Make sure these tools are installed: `dd`, `docker` and `socat`.

## Linux knowledge

This wiki assumes you are comfortable with the Linux command line. If you are new to Linux, work through a basic tutorial first; it will save you a lot of frustration. [learnshell.org](https://www.learnshell.org/) is a good free, interactive place to start.
