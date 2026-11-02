---
title: Audio
sidebar_position: 2
description: HDMI audio status and fixes for common audio problems.
---

# Audio

HDMI audio works on most monitors and TVs, but not all of them. On displays where it doesn't work at all, there is no fix yet.

## Audio plays through the controller instead of HDMI

If a DualSense is connected over USB, Linux may pick the controller as the default audio output.

**Fix (Ubuntu/GNOME):**

1. Press the Super key and type "Sound".
2. Open the **Sound** settings.
3. Under **Output**, select your HDMI device.

**Alternative:** switching from PipeWire to native PulseAudio has fixed audio issues for some users.

## No HDMI audio at all

Some monitors don't receive HDMI audio from the PS5. This is a known issue with no fix yet. Use a USB or Bluetooth audio device instead.

## Audio hiccup every 40 seconds (DP-to-HDMI adapters)

If you use an active DisplayPort-to-HDMI adapter and hear a short audio hiccup roughly every 40 seconds, the cause is a clock mismatch in the amdgpu display clock manager: the driver expects a DP audio clock of 5988740, but the hardware runs at 6000000.

A two-line fix to `dcn201_clk_mgr.c` has been merged into `ps5-linux-patches`. Update your kernel and the problem should be gone.

## HDMI audio delay

A kernel fix for HDMI audio delay and desync has been merged, so update your kernel first.

Some users also needed to change the output format afterwards, which is especially noticeable during video playback. Open the **Sound** settings and switch from **Digital Stereo (HDMI)** to **Digital Surround 5.1 (HDMI)**.
