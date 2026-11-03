---
title: Capture cards
sidebar_position: 11
description: What to expect from HDMI capture cards with PS5 Linux, which modes tend to work, and the EDID and HDCP settings that help.
---

# Capture cards

To the kernel a capture card is a display: it reads the card's EDID and offers the modes the card announces, so a card that shows nothing has the same causes as a monitor that shows nothing. Work through [Troubleshooting a black screen](/using-linux/display#troubleshooting-a-black-screen) first.

## Which modes work

Cards differ in which of the console's modes they accept. The pattern across reports:

| Mode | Typical result |
| --- | --- |
| 1080p60 | Works on every card that works at all |
| 1440p60 | Works on cards that announce it, often only after trimming the card's EDID (below) |
| 1080p120, 1440p120, 4K60, HDR | Mixed: some 4K cards take them, many show nothing, and a card that handles 4K60 HDR from the PS5 OS can still only take 1080p60 from Linux |

If a card is black at a higher mode, pick a lower one from a shell, see [Display recovery](/troubleshooting/display-recovery), and leave `video=DP-1:1920x1080@60` in `cmdline.txt` so each boot starts at 1080p60.

## Trim the card's EDID

Most cards let you choose which EDID profiles they present to the source. A black screen at 1440p60 with the defaults has been fixed by:

1. removing every profile above 1440p in the card's own HDMI or EDID settings,
2. removing `video=DP-1:1920x1080@60` from `cmdline.txt`, so the desktop can switch to 1440p,
3. giving the GPU more reserved memory, `vram.txt` at `80000000` (2 GB), see [VRAM](/hardware/gpu#vram).

## Firmware of the card

The same card model works for one person and stays black for another. The difference is often the card's own firmware. Update it from the vendor's tool before you look for the cause on the console.

## HDCP

Whether a card wants HDCP on, HDCP off, or an HDCP-stripping splitter in front of it depends on the card. Try both HDCP settings in the PS5 OS first; if the card still sees no signal, a splitter that removes HDCP usually gets it through.

## Switching between a TV and a capture card

With both a display and a capture card connected through a switch, moving the output from one to the other at runtime works some of the time. On an X11 desktop, `arandr` (a graphical front end for `xrandr`) lets you re-enable the output after a switch; on Wayland, use the desktop's display settings or `kscreen-doctor` over SSH, see [Display recovery](/troubleshooting/display-recovery#3-change-the-mode-from-a-desktop). When the picture doesn't come back, a restart is the reliable way.
