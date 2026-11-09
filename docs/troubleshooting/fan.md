---
title: Fan control
sidebar_position: 8
description: How the PS5 fan is controlled under Linux on each kernel, the hwmon driver's curve and temperatures, and how to adjust them.
hardware: [original, slim, pro]
applies_to: all
---

# Fan control

The console's embedded controller (EMC) runs the fan through its own "autoservo" firmware. Linux can either hand that firmware a target temperature and let it ramp the fan, or set the fan duty itself from a temperature curve. Which one you start with depends on the kernel:

| Kernel | Default | Interface |
| --- | --- | --- |
| Upstream (current packages) and [rmuxnet's kernel](/post-install/kernel) | Kernel curve, on at boot. Nothing to install. | hwmon `ps5_fan`; `pwm1_enable` `2` is the curve. |
| [PS5 Bazzite Deck](/choose/bazzite-deck) | The console's own firmware control on Sony's fan table, as on the PS5 OS (from v2.7.2; v2.6.1 to v2.7.1 with the driver's quiet table and an 80 °C target; v2.5 and v2.5.1 started on the kernel curve). | hwmon `ps5_fan`; `pwm1_enable` `2` is the curve, `3` the firmware. `target_temp` from v2.6.1 to v2.7.3. |
| Older upstream kernels | Firmware control toward `target_temp`, 80 °C by default. The oldest kernels had no fan driver at all and left the fan off until `ps5_control --fan on`. | `target_temp` only. |

## Change it from Game Mode or the desktop {#hwcon}

The easiest way is NotHavocc's PS5 Hardware Control, in two forms that do the same:

- **[ps5-hwcon-plugin](https://github.com/NotHavocc/ps5-hwcon-plugin)** for Game Mode: a [Decky Loader](/post-install/decky) plugin in the quick access menu.
- **[ps5-hwcon-gui](https://github.com/NotHavocc/ps5-hwcon-gui)** for the desktop: a window, no Decky needed.

Its **Fan** tab shows the temperatures and switches between **Target** and **Curve**. On kernels with the hwmon driver, PS5 Bazzite Deck included, it runs every setting as a kernel curve (`pwm1_enable` `2`), a target too: a target there is a curve that reaches 45% at the target and full speed 6 °C above it. **Restore on Startup** re-applies your setting at every start, because the kernel starts from its default again. On PS5 Bazzite Deck that default is the console's own control: up to version 1.4.0, Restore on Startup writes your curve without switching to it, so it takes over only once you apply a curve or preset (a fix is with its developer).

To go back to the console's own control on PS5 Bazzite Deck:

```bash
H=$(dirname $(grep -l ps5_fan /sys/class/hwmon/hwmon*/name))
echo 3 | sudo tee $H/pwm1_enable
```

A restart does the same, unless PS5 Hardware Control switches to the curve again. v2.7.2 and v2.7.3 also had `sudo ps5-perf fan default`.

## hwmon driver

Find the device:

```bash
grep -l ps5_fan /sys/class/hwmon/hwmon*/name
```

| Attribute | Meaning |
| --- | --- |
| `temp1_input` to `temp4_input` | Fan zone temperatures `MainSoC` and `Local1` to `Local3`, in millidegrees. |
| `temp5_input` | `Local4`, the ICC's sensor 18. Part of the upstream driver; rmuxnet's kernel leaves it out. |
| `pwm1` | Fan duty, 0 to 255. Read it for the current duty; write it in manual mode. |
| `pwm1_enable` | `0` = full speed, `1` = manual (`pwm1`), `2` = the kernel curve. PS5 Bazzite Deck adds `3`, the console's own control on Sony's fan table, and starts there. |
| `pwm1_auto_point1_temp` to `pwm1_auto_point8_temp`, `..._pwm` | The curve: eight temperature and duty points. |
| `pwm1_auto_point1_temp_hyst` | The temperature below which the fan stops, 45 °C by default. |
| `curve_reset` | Write `1` to restore the default curve. |

The default curve:

| MainSoC | 50 °C | 60 °C | 65 °C | 70 °C | 75 °C | 80 °C | 85 °C | 87 °C |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Duty | 10% | 30% | 40% | 50% | 65% | 80% | 95% | 100% |

Below 45 °C the fan stops. The duty follows a filtered temperature with slew limiting, so the fan doesn't hunt; above 80 °C it follows the raw reading. At **90 °C** the driver goes to full speed and stays there until the SoC is below 85 °C, then continues on the curve; on PS5 Bazzite Deck from v2.8 not in firmware mode, where the console handles its own temperature. If the hardware stops answering, the driver falls back to the firmware's own control. The boot log names the mode it started in: on upstream and rmuxnet's kernels `quiet fan curve enabled; configure through hwmonN`, on PS5 Bazzite Deck from v2.8 `firmware fan control, Sony's target N C; pwm1_enable 3 firmware, 2 curve: hwmonN`. The driver doesn't read the fan speed: there is no `fan1_input`.

A cooler, louder curve, for example 60% from 70 °C:

```bash
H=$(dirname $(grep -l ps5_fan /sys/class/hwmon/hwmon*/name))
echo 153 | sudo tee $H/pwm1_auto_point4_pwm
```

A point's temperature has to stay between its neighbours and at most 90 °C, the duties have to rise with the temperatures and the last point stays at 100%; the driver rejects anything else. Settings don't survive a reboot: put them in a systemd unit or a udev rule.

Manual duty, for example 50%:

```bash
echo 1 | sudo tee $H/pwm1_enable
echo 128 | sudo tee $H/pwm1
```

Back to the curve: `echo 2 | sudo tee $H/pwm1_enable`.

:::note[PS5 Bazzite Deck]
The image starts in firmware mode (`pwm1_enable` `3`): the console's own fan control on Sony's fan table and target, as on the PS5 OS. Sony's tables aim for 91 °C on the SoC; for a cooler chip at the cost of noise, use a curve. `ps5_fan.curve=1` in `cmdline.txt` starts with the curve instead.

- **From v2.8** Linux doesn't change the target, and the driver doesn't step in at 90 °C in firmware mode. Sony's table is uploaded at every start, the driver's quiet table only for full speed, manual and the curve (`pwm1_enable` `0` to `2`), and Sony's goes back when you return to `3`, for sleep and at shutdown. A quiet table that v2.7.1 or older left in the console is found at the start and gets the control values all of Sony's retail tables share (`quiet servo table from an older kernel, retail values restored` in the boot log).
- **v2.7.2 and v2.7.3** ran on Sony's table and target too, with `target_temp` and `ps5-perf fan` for your own target. The driver also went to full speed at 90 °C in firmware mode, which made the fan cycle under load.
- **v2.6.1 to v2.7.1** uploaded the quiet table at every start and set an 80 °C target. That kept the fan quiet, but the chip ran warm, the fan spun up at power off and restart, and the PS5 OS could start with Linux's table still in place.
- **v2.5 and v2.5.1** started on the curve and kept the firmware's lower target during sleep and shutdown.
:::

## Target temperature (older kernels, PS5 Bazzite Deck v2.6.1 to v2.7.3)

Kernels without the curve, and PS5 Bazzite Deck v2.6.1 to v2.7.3 in firmware mode, set a target SoC temperature and nothing else. The EMC's firmware then speeds the fan up or slows it down to hold that temperature; you don't set a duty or an RPM.

```text
/sys/bus/platform/devices/ps5-fan/target_temp
```

Read the current target:

```bash
cat /sys/bus/platform/devices/ps5-fan/target_temp
```

Set a lower target for more cooling at the cost of noise, for example 65 °C:

```bash
echo 65 | sudo tee /sys/bus/platform/devices/ps5-fan/target_temp
```

The driver accepts 0 to 100 °C (PS5 Bazzite Deck v2.6.1 to v2.7.3: 40 to 90 °C, and on v2.7.2 and v2.7.3 `0` for Sony's own target). On v2.7.2 and v2.7.3, `sudo ps5-perf fan 65` sets it and keeps it across restarts (`FAN_TARGET` in `/etc/ps5-bazzite-deck/perf.conf`), and `sudo ps5-perf fan default` goes back to Sony's. From v2.8 the image has no `target_temp` and ignores `FAN_TARGET`: use a curve. A very low target doesn't make the fan a "max" switch: the firmware ramps as far as it needs to for any target, and below roughly 40 °C the fan is constantly audible while the SoC temperature barely moves any more. Pick a target you are happy to listen to.

On the oldest kernels, without a fan driver, the fan stays off until `ps5_control --fan on` from [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools) turns it on; its `install.sh` installs `ps5fan.service` so that happens at every boot, see [Clocks and boost](/troubleshooting/gpu#clocks-and-boost).

## ps5ctl

[ps5ctl](https://github.com/rmuxnet/ps5ctl) is a TUI, CLI and web panel for the fan target, the LED, the buzzer and the GPU clock. It needs a kernel with `target_temp`, which rmuxnet's own kernel and PS5 Bazzite Deck from v2.8 no longer have:

```bash
sudo ps5ctl --temp 65
```

Or use the **Fan** tab in `sudo ps5ctl`.

## Standalone fan_mode kernel module

A small out-of-tree module for benchmarking, which puts the fan into one of the EMC's fixed modes (auto, max or min) instead of following a target. It talks to the EMC with the same ICC commands the driver uses.

Build it:

```bash
make -C /lib/modules/$(uname -r)/build M=$PWD obj-m=fan_mode.o modules
```

Force maximum speed:

```bash
sudo insmod fan_mode.ko zone=0 fan_mode=2 ; sudo rmmod fan_mode
```

Return to automatic mode:

```bash
sudo insmod fan_mode.ko zone=0 fan_mode=1 ; sudo rmmod fan_mode
```

There is no percentage here, only the three EMC modes; for a duty, use the hwmon driver above. Max is very loud.

## No separate GPU temperature sensor

The CPU and GPU sit on one die, so there is no GPU-only temperature. The number to watch is the APU temperature `Tctl` from `k10temp` (the current kernels bind it to the PS5's CPU model `0x48`); it covers both:

```bash
cat /sys/class/hwmon/hwmon*/temp*_label   # find Tctl
cat /sys/class/hwmon/hwmon*/temp*_input   # value in millidegrees Celsius
```

On a PS5 Pro the SMU backend adds a GPU temperature of its own, see [PS5 Pro](/troubleshooting/ps5-pro#gpu-driver).

The GPU clock is reported by the devfreq driver of your kernel: look under `/sys/class/devfreq/` for the device name (`ps5-gpufreq` on current kernels) and read its `cur_freq`. At idle the clock sits at the governor's minimum.

## Fan problems

- **The fan cycles between loud and quiet under load** (PS5 Bazzite Deck v2.7.2 and v2.7.3, the SoC between about 85 and 92 °C): the driver went to full speed at 90 °C, just under Sony's 91 °C target, and handed back below 85 °C. v2.8 leaves firmware mode to the console. On v2.7.3, `sudo ps5-perf fan 80` keeps the SoC below 90 °C.
- **The fan spins up at power off and restart** (PS5 Bazzite Deck v2.6.1 to v2.7.1, with the driver's quiet table and 80 °C target): from v2.7.2 the console runs on Sony's table throughout; report it if it still happens. On those releases, a lower target (`echo 70 | sudo tee /sys/bus/platform/devices/ps5-fan/target_temp`) shortens the spin-up.
- **The PS5 OS fan runs fast after using Linux:** up to v2.7.1 the console's fan control could keep Linux's quiet table, with its 50 °C target, after a shutdown. On consoles whose boot log shows `FanServo: Not update` (the PS5 Pro among them) the kernel has no Sony table to load, so v2.7.2 and v2.7.3 then took that table for the console's own (`ps5-perf status` shows a 50 °C target). v2.8 finds it and puts the retail values back: start v2.8 once, power off, then check the fan on the PS5 OS. If it still happens, report it with `ps5-report`.
- **Louder and hunting at idle on PS5 Bazzite Deck v2.5 and v2.5.1** (`ps5-perf status` shows `kernel curve`): the 7.3.1 kernel started on its own curve. v2.6.1 returns to the console's firmware control. Until you update, a quieter curve from [PS5 Hardware Control](#hwcon) helps.
- **Target back at 50 °C after sleep:** some PS5 Bazzite Deck releases; fixed in the current one.
- **Fan or CPU boost off:** on upstream kernels the CPU boost is off until you install `ps5-linux-tools` and enable `ps5boost.service`; older upstream kernels also needed `ps5fan.service`, current ones run a fan curve by themselves. On rmuxnet's kernel the fan curve and the GPU clock are automatic and the CPU boost is a sysfs switch; on PS5 Bazzite Deck both are on. See [Other distros](/post-install/not-bazzite-deck#fan-boost-and-clocks) and [Clocks and boost](/troubleshooting/gpu#clocks-and-boost).
