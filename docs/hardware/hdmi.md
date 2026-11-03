---
title: HDMI chip
sidebar_position: 4
description: How the PS5's HDMI chip works, why only certain modes exist, and how VRR, 4K120 over FRL, SCDC and the RGB range are driven from Linux.
---

# HDMI chip

The GPU does not drive the HDMI port directly. It sends DisplayPort to a separate HDMI chip, and the kernel programs that chip over I2C through the console's ICC for every mode. This page explains what the chip can do and what the PS5 patches do with it. The user-facing side (resolutions, black screens) is on [Display output](/using-linux/display).

:::info[Where the patches live]
HDR, CEC, hotplug, 4K120 over FRL with its fallback and ALLM are in upstream `ps5-linux-patches` and in rmuxnet's kernel. The VRR, mode, RGB range and link lock patches are PS5 Bazzite Deck only, in its [`patches/`](https://github.com/VivaLaVent/ps5-bazzite-deck/tree/main/patches) folder; each file starts with a description of what it does. See [Kernel setup](/advanced/kernel#what-is-where).
:::

## The two HDMI chips

| Chip | Consoles | Extras |
| --- | --- | --- |
| FLAVA3 | Most consoles | 1440p at 120 Hz, 4K at 120 Hz over FRL, HDR, VRR |
| VERDE | Some later models | 1080p60, 1080p120, 1440p60 and 4K60 only |

Check which one you have:

```bash
sudo dmesg | grep "HDMI IC Type"
```

## Why only certain modes exist

The chip has no general-purpose mode set. For each resolution it has a fixed setup: a mode index written to registers `0x7227` and `0x7070`, a PHY configuration and a block of InfoFrame registers. The kernel replays Sony's setup for the mode the compositor asked for. A mode the chip has no setup for cannot be output, whatever the GPU or the display can do. That rules out 165 Hz, ultrawide resolutions and every other mode not in the table below.

The GPU feeds the chip over an internal DisplayPort link of four lanes at HBR3. That link is wide enough for every mode below, but the driver used to train it at the lowest rate a mode needs, and the chip sometimes failed to sync at those lower rates. `ps5-hdmi-link-lock.patch` trains it at the full rate for every mode; the same idea by hand is on [Lock the display link](/troubleshooting/display-link-lock).

| Mode | Timing the chip expects | FLAVA3 | VERDE | Status |
| --- | --- | --- | --- | --- |
| 1080p60 | CEA VIC 16 | ✅ | ✅ | Confirmed |
| 1080p120 | CEA VIC 63 | ✅ | ✅ | Confirmed |
| 1440p60 | VESA DMT reduced blanking | ✅ | ✅ | Confirmed |
| 1440p120 | CVT-RB, same high-bandwidth setup as 4K60 | ✅ | ❌ | Confirmed |
| 4K60 | CEA VIC 97 | ✅ | ✅ | Confirmed |
| 4K120 | CEA VIC 118 over FRL, Sony's index `0x0b` | ✅ | ❌ | Confirmed on some TVs, fails on others (see below) |
| 1080p100, 1440p100, 4K100 | VIC 64, CVT-RB, VIC 117 (index `0x0a`) | ⚠️ | ❌ | Not tested: offered as an experiment only |
| 165 Hz, ultrawide, anything else | | ❌ | ❌ | Known not to work: no setup in the chip |

`ps5-hdmi-modes.patch` offers these modes whenever the display's limits allow them, even if its EDID doesn't list them, drops the display's own 1440p variants (the chip only accepts the timing above), marks 1080p60 as preferred so a new display starts there, and skips modes a display accepts only as YCbCr 4:2:0. It also gives both 1440p syncs the standard polarity and shape on FLAVA3, because the chip shifts the picture by the pulse width when a polarity differs. `ps5-hdmi-100hz-test.patch` adds the 100 Hz modes.

## VRR on FLAVA3

Confirmed at 4K60, 1080p120, 1440p60 and 1440p120 on HDMI VRR TVs. Not available on VERDE.

VRR did not work because of the GPU side, not the chip. Captures of what the PS5 OS sends narrowed it down. Three things have to be true at once:

1. **A timing packet every frame.** Sony's GPU sends the chip a DisplayPort extension SDP with header `39 04` carrying the source timing, from the adaptive-sync slot. On the chip it replaces amdgpu's FreeSync SDP. Without it the chip's follow mode gives a black picture.
2. **DPCD `0x107` MSA-ignore bit kept clear.** The chip drops its input lock when the bit is set, but follows a variable frame length with valid MSA.
3. **Follow mode switched on step by step**, only after the packet flows: registers `0x6064`, `0x1047`, `0x600c`, `0x6224` and `0x6c07`, 250 ms apart, plus a FreeSync SPD in the chip's SPD slot `0x7240` for the TV. The picture stays muted until the chip has switched over, so you see a short black instead of a drifting picture.

Three more rules come from testing:

- **HDMI VRR only.** The chip's follow mode is HDMI VRR. A monitor that announces only AMD FreeSync (no VRR range in its HDMI Forum block) resynced and blanked at every refresh change, so such displays are not offered VRR, the same as on the PS5 OS. The log says why.
- **48 Hz floor.** TVs often announce 40 Hz as their minimum, where OLEDs flicker visibly. The range used never goes below 48 Hz, the PS5 OS's own floor: below it, frames are doubled at 120 Hz modes, and 60 Hz modes keep a fixed 60 Hz. A TV with a higher minimum keeps it.
- **An open-ended maximum counts as HDMI VRR.** Some TVs announce HDMI VRR with a minimum and `VRRmax` 0, which the HDMI specification defines as "up to the highest refresh rate". Early versions of the patch read that as "no HDMI VRR" and refused it; the current one takes the maximum from the FreeSync range, or 120 Hz. The range is also read from the HF-SCDB block that newer TVs use instead of the VSDB. The log says why a display is or isn't offered VRR.

Sources: `ps5-vrr.patch`, `ps5-vrr-stock-setup.patch` (the chip only follows when every setup includes Sony's full PHY tail and VSync block), `ps5-vrr-min-48.patch`, `ps5-vrr-hdmi-only.patch`, `ps5-vrr-follow-guard.patch` and `ps5-vrr-hdmi-range.patch` in the [`patches/`](https://github.com/VivaLaVent/ps5-bazzite-deck/tree/main/patches) folder.

:::tip[PS5 Bazzite Deck]
Steam's VRR setting switches it. From a shell: `gamescopectl adaptive_sync 0` (or `1`) after exporting `XDG_RUNTIME_DIR` and `GAMESCOPE_WAYLAND_DISPLAY=gamescope-0`, see [Display recovery](/troubleshooting/display-recovery).
:::

## 4K120 over HDMI 2.1 FRL

Confirmed on several HDMI 2.1 TVs; fails on others that announce 4K120 but don't take the console's FRL link. FLAVA3 only.

The setup is Sony's own for its 4K120 mode (mode id 211 in the PS5 OS), ported from the console's kernel:

- VIC 118 gets Sony's mode index `0x0b` and its own basic-config tail.
- After the PHY setup, the chip gets the "SCEI"/"PS5" SPD and an event sequence (`0x30`) that it runs by itself once the FRL link is up: AVI with the VIC, IT content, game content type.
- The additional config is the FRL variant: no TMDS scrambling or SCDC; the output is started in FRL mode and the chip trains the link itself.
- On the internal DP link, 4K120 travels as YCbCr 4:2:2, amdgpu's own fallback when RGB doesn't fit in four lanes at HBR3.

Because a TV that can't take the link was left black at every boot, there is a gate and a fallback:

- **EDID gate.** 4K120 is offered only when the display announces FRL at 4 lanes × 8 Gbps or more (HF-VSDB or HF-SCDB `Max_FRL_Rate` ≥ 4) and YCbCr 4:2:2, and the chip's own FRL report (bits 3:1 of byte 0 of its EDID notification) isn't 1 to 3.
- **Link check.** After a 4K120 setup, bit 6 of register `0x7019` (set while the chip sends FRL; `0x43` on a trained link) is polled for up to 6.5 seconds. If it never comes on, 4K120 is withheld for that display until a new EDID arrives, amdgpu switches to the same size at the highest refresh rate still offered, and userspace is told to re-probe.

**A stuck TV:** after a failed 4K120 attempt some TVs stay dark at every mode. Unplug the TV's power for a minute (standby isn't enough), then start the console again. `hdmi.frl_4k120=0` in `cmdline.txt` stops 4K120 from being offered at all.

**Session switches at 4K120:** on some TVs, switching between Gaming Mode and the desktop while the output is 4K120 triggers a GPU fault. It is a compositor-side problem; keep the desktop at 4K60 and use 4K120 in Gaming Mode only. On a PS5 Pro a GPU fault is not recovered, see [PS5 Pro](./ps5-pro.md#starting-linux-fails-on-the-pro).

Sources: `ps5-hdmi-frl-4k120.patch` and `ps5-hdmi-4k120-guard.patch`.

## SCDC and TVs that drop to HDMI 1.4 modes

Some TVs announce their HDMI 2.1 EDID at boot and then, a few seconds after the console sets up 1080p60, re-announce an HDMI 1.4 EDID: 340 MHz, 4K only as 4:2:0, nothing above 60 Hz, no VRR. The cause is SCDC traffic the TV expects from an HDMI 2.x source. Two patches write it at every video setup for sinks that talk SCDC (an HDMI Forum VSDB with `SCDC_Present`, or 4K / 4:2:0 modes in the EDID); 1080p-only HDMI 1.4 TVs never get SCDC traffic.

| Patch | Writes | Status |
| --- | --- | --- |
| `ps5-hdmi-scdc-source-version.patch` | SCDC Source Version = 1, through the chip's DDC write descriptor at `0x7a80` | Confirmed on a TV with the symptom |
| `ps5-hdmi-scdc-tmds-config.patch` | SCDC `TMDS_Config` at every setup, `0x00` when not scrambling, as a PC driver does | Not tested |

## RGB range

The GPU sends full-range RGB on the internal link, but the AVI InfoFrame's quantization field (PB3 bits Q1:Q0, chip register `0x7226` bits 3:2) stayed "default". TVs read "default" as limited for TV timings (1080p, 4K60) and as full for PC timings (1440p), so 1080p had crushed blacks while 1440p looked right. The driver now sends "full" explicitly for RGB output.

CTA-861 codes the field as 0 default, 1 limited, 2 full. A first version wrote the parameter value itself, so "1 = full" went out as limited and every resolution was too dark on TVs set to Auto. `ps5-hdmi-rgb-range-encoding.patch` maps the parameter to the right codes.

`hdmi.rgb_range=1` is full (default), `2` limited, `0` sends no flag and lets the TV decide. VERDE consoles already declare full range and don't need this.

## Kernel parameters

In every current kernel (upstream `main`, rmuxnet's kernel, PS5 Bazzite Deck):

| Parameter | What it does |
| --- | --- |
| `amdgpu.force_1080p=1` | Only allows 1080p60. A safe mode to get a picture back, see [Display recovery](/troubleshooting/display-recovery). |
| `hdmi.frl_4k120=0` | Never offers 4K at 120 Hz. For a TV where 4K120 misbehaves. |
| `ps5_cec.one_touch_play=0` | Don't turn the TV on and switch it to the console at boot. |
| `usbc_dp.enable=1` | DisplayPort output on the front USB-C port, for USB-C displays and the PS VR2. Off by default because programming the port's policy can reset a boot drive plugged in there. |

Upstream `main` and rmuxnet's kernel (the native FRL work; not in PS5 Bazzite Deck, which has its own 4K120 path):

| Parameter | What it does |
| --- | --- |
| `hdmi.frl_yuv420=<0,1,2>` | 4:2:0 over native FRL: 0 off, 1 as a fallback (default), 2 preferred when the mode permits it. |
| `hdmi.frl_recovery=0` | Turns off the bounded retries after a failed FRL link. |
| `hdmi.allm=<0,1,2>` | Auto low latency mode on FLAVA3 for TVs that support it: 0 off, 1 while the content type is Game (default), 2 always. |
| `hdmi.hdcp_mode=<n>` | HDCP on the HDMI output, applied at the next mode set: 0 on, 1 off, 2 on with HDCP 2.2, 3 off with the HDCP 2.2 bit set (default), -1 keep. |
| `hdmi.extended_modes=<0,1,2>` | The modes the chip has setups for but the EDID doesn't list: 0 off, 1 offered (default), 2 offered and preferred. |

Read-only state in `/sys/module/hdmi/parameters/`: `frl_rate` and `frl_rate_max` (the chip's FRL rates), `frl_failed` (write `N` to try FRL again on this display), `allm_sink`, `allm_active` and `recovery_status`.

PS5 Bazzite Deck only:

| Parameter | What it does |
| --- | --- |
| `hdmi.vrr=0` | Never offers VRR. |
| `hdmi.rgb_range=<0,1,2>` | AVI RGB quantization flag: 1 full (default), 2 limited, 0 none. |
| `hdmi.icc_trace=1` | Logs every message to the chip and its reply. Debugging only, very noisy. |
| `hdmi.vrr_measure=1` | Logs the measured frame intervals every 2 seconds while VRR is on. Debugging only. |

All of them go in `cmdline.txt`, see [Kernel parameters](/advanced/kernel#kernel-parameters-cmdlinetxt).
