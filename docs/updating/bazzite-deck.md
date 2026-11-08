---
title: "Updating: PS5 Bazzite Deck"
sidebar_label: PS5 Bazzite Deck
sidebar_position: 1
description: "Find out whether your PS5 Bazzite Deck is a bootc or a Legacy install; each updates its own way."
hardware: [original, slim, pro]
applies_to: bazzite-deck
---

# Updating: PS5 Bazzite Deck

Every command runs on the PS5, in a terminal (Desktop Mode → **Konsole**) or over SSH (password `ps5`). Which install you have decides how it updates:

```bash
test -e /run/ostree-booted && echo bootc || echo legacy
```

`ps5-report` says the same on its **Install** line.

- **[bootc](/updating/bootc):** everything installed from a bootc disk image. Stable or Beta, a specific release, rolling back.
- **[Legacy](/updating/legacy):** installs from before v2.5. Updates in place with a script.
