---
title: Buzzer
sidebar_position: 10
description: Make the PS5's built-in piezo buzzer beep from Linux through the kernel driver's sysfs interface.
---

# Buzzer

The small piezo speaker in the console, the one that beeps when you press the power button, can be driven from Linux. The PS5 kernel's buzzer driver sends the request over the ICC, the same path the LED driver uses.

## Sysfs interface

```text
/sys/class/misc/ps5_buzzer/beep
```

Write a level from 0 to 3:

| Value | Sound |
| --- | --- |
| 0 | Silent |
| 1 | Short beep |
| 2 | Error beep |
| 3 | Long beep |

```bash
echo 1 | sudo tee /sys/class/misc/ps5_buzzer/beep   # short
echo 2 | sudo tee /sys/class/misc/ps5_buzzer/beep   # error
echo 3 | sudo tee /sys/class/misc/ps5_buzzer/beep   # long
```

A second attribute, `stop`, exists for the driver's pattern player (`/dev/ps5_buzzer` with the `PS5_BUZZER_PLAY` ioctl) and interrupts a pattern that is playing. The three beeps above don't need it.

```bash
echo 1 | sudo tee /sys/class/misc/ps5_buzzer/stop
```

## ps5ctl

[ps5ctl](https://github.com/rmuxnet/ps5ctl) names the three levels:

```bash
sudo ps5ctl --buzz --list      # Short, Error, Long
sudo ps5ctl --buzz Short
```

Or use the **Buzzer** tab in `sudo ps5ctl`.
