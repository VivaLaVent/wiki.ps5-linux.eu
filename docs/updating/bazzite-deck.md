---
title: "Updating: PS5 Bazzite Deck"
sidebar_label: PS5 Bazzite Deck
sidebar_position: 1
description: "PS5 Bazzite Deck updates with bootc. Legacy installs, from before v2.5, are no longer supported: switch to bootc."
hardware: [original, slim, pro]
applies_to: bazzite-deck
---

# Updating: PS5 Bazzite Deck

Every command runs on the PS5, in a terminal (Desktop Mode → **Konsole**) or over SSH (password `ps5`). Check which install you have:

```bash
test -e /run/ostree-booted && echo bootc || echo legacy
```

`ps5-report` says the same on its **Install** line.

- **[bootc](/updating/bootc):** everything installed from a bootc disk image. Stable or Beta, a specific release, rolling back.
- **[Legacy](/updating/legacy):** installs from before v2.5. No longer supported or updated from v2.13 on: switch to bootc, in place or by flashing.
