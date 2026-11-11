---
title: Audio
sidebar_position: 10
description: HDMI audio status on PS5 Linux, and fixes for audio going to the controller, delay and periodic hiccups.
hardware: [original, slim, pro]
applies_to: all
---

# Audio

Sound goes out over HDMI with the picture.

## Quick answers

| Problem | Do this |
| --- | --- |
| Sound comes from the controller | A DualSense on a USB cable is also a sound card. Choose the HDMI output: GNOME **Settings → Sound → Output**, KDE **System Settings → Sound**, Game Mode **Settings → Audio → Output Device**. If it keeps switching back, connect the controller over Bluetooth |
| The HDMI output is listed but silent | Switching the sound server from PipeWire to PulseAudio has helped on some images |
| No HDMI sound at all on a monitor, fine on a TV | No fix yet: use a USB or Bluetooth audio device |
| Sound lags behind the picture | Update the kernel. If it remains, set the output to **Digital Surround 5.1 (HDMI)** instead of Digital Stereo |
| A dropout every 40 seconds through a DisplayPort-to-HDMI adapter | Update the kernel |
| No sound from the controller's speaker or headphone jack | Only over USB, see [DualSense](/post-install/dualsense#controller-quirks) |
