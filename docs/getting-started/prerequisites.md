---
title: Prerequisites
description: PS5 settings, hardware and host machine you need before installing Linux.
sidebar_position: 3
---

# Prerequisites

Two console settings, a drive, and a PC to prepare it: that is all Linux on the PS5 needs. Get the settings right first, because a wrong one costs you the most time later.

## Required PS5 settings

Change these in the PS5 OS **before** you jailbreak and send the Linux loader. A settings reset or a firmware reinstall clears them, so check them again after either. A missing setting here is behind most "Linux won't boot" reports.

1. **Supply power to USB in rest mode** (required to boot):
   **Settings → System → Power Saving → Features Available in Rest Mode → Supply Power to USB Ports → Always**
2. **Disable HDMI Device Link** (required):
   **Settings → HDMI → Enable HDMI Device Link → Off**

**Recommended:**

- Disable automatic updates: **Settings → System → System Software → System Software Update and Settings**
- Disable automatic error reporting: **Settings → System → System Software → Report System Software Errors Automatically**

## Hardware

- A USB drive of 64 GB or more for the official and community images (32 GB for [PS5 Bazzite Deck](/installation/bazzite-deck)). An external SSD boots and loads much faster than a flash drive. Flashing erases the drive, so its current contents and format don't matter.
- A USB keyboard and mouse for the first setup.

## Host machine

A PC that can write the image to the drive and send the loader: Linux, or Windows with WSL. You need `dd` (or Rufus on Windows) for the image and `socat` for the loader. Docker is only needed if you [build an image yourself](/installation/linux-image#build-your-own-image).

## Linux knowledge

You will spend time in a terminal: editing a file on the boot partition, running an install script, reading a log. Nothing here needs more than the command line basics, but if those are new to you, an introductory shell tutorial such as [learnshell.org](https://www.learnshell.org/) pays for itself before you start.
