---
title: Audio
sidebar_position: 2
description: HDMI audio status on PS5 Linux, and fixes for audio going to the controller, delay and periodic hiccups.
---

# Audio

Sound goes out over HDMI together with the picture, and on most TVs and monitors that is all there is to it. The cases where it isn't are below.

## Audio plays through the controller instead of HDMI

A DualSense on a USB cable is also a sound card, and some desktops make it the default output. Pick the HDMI output in the sound settings instead; on GNOME that is **Settings → Sound → Output**, on KDE **System Settings → Sound**. If the desktop keeps switching back, remove the DualSense from the list of outputs in the sound settings, or connect it over Bluetooth, where it carries no audio.

If the HDMI output is listed but stays silent, switching the sound server from PipeWire to PulseAudio has helped on some images.

## No HDMI audio at all

A few monitors get no sound from the console at all, while the same cable and the same mode give sound on a TV. There is no fix for this yet. Use a USB or Bluetooth audio device on those monitors.

## Audio hiccup every 40 seconds (DP-to-HDMI adapters)

A short dropout about every 40 seconds with an active DisplayPort-to-HDMI adapter came from amdgpu's display clock manager, which assumed a DP audio clock of 5988740 where the hardware runs at 6000000. The fix is in `dcn201_clk_mgr.c` in every current kernel; update if you still hear it.

## HDMI audio delay

Sound that lags behind the picture was a kernel bug and has been fixed in the PS5 patch set; update first. If the lag remains, change the output format in the sound settings from **Digital Stereo (HDMI)** to **Digital Surround 5.1 (HDMI)**, which has cured the remaining cases, most noticeably in video playback.
