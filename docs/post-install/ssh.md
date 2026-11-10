---
title: Connect over SSH
sidebar_label: SSH
sidebar_position: 1
description: Connect to Linux on the PS5 from Windows, macOS, Linux or a phone, copy files, and fix the usual SSH errors.
hardware: [original, slim, pro]
applies_to: all
---

# Connect over SSH

SSH opens a terminal on the PS5 from another device on the same network. It works when the screen is black, and it's the easiest way to paste commands from this wiki or Discord.

## User and password per image {#ssh-availability-by-distro}

| Image | SSH on by default | Log in as |
| --- | --- | --- |
| PS5 Bazzite Deck | yes | `ps5`, password `ps5` |
| Ubuntu, Arch, CachyOS, Fedora | yes | the user you created on the first start |
| Debian | **no** (its default password is public) | the user you created; turn SSH on first: `sudo systemctl enable --now ssh.service` |
| Proxmox VE | yes | `root` |

Change a default password with `passwd`. Anyone on your network can log in with a known one.

## Find the PS5's IP address {#find-your-ps5s-ip-address}

- **On the PS5**, in a terminal: `ip -brief a`. Use the address on the line that says `UP`, on `enp…` (Ethernet) or `wlp…` (Wi-Fi).
- **Without a picture:** your router's list of connected devices shows it, named after the image (`ps5`, `ubuntu`, `archlinux` and so on).

Ethernet works from the first start on every image; use it when Wi-Fi isn't set up yet.

## Connect {#connect-over-ssh}

Replace `192.168.1.50` with your PS5's address, and `ps5` with your user if it's another image.

**Windows 10 and 11:** open **Terminal** or **PowerShell** and run:

```bash
ssh ps5@192.168.1.50
```

If Windows says `ssh` isn't recognized: **Settings → System → Optional features → Add a feature → OpenSSH Client**. [PuTTY](https://www.putty.org/) works as well: put the address under **Host Name**, port 22, then log in.

**macOS and Linux:** the same command in **Terminal**.

**Phone:** an SSH app such as Termius (iOS, Android). Add a host with the address, user and password.

The first time, it asks whether to trust the PS5's key: answer `yes`. While you type the password nothing appears on screen; type it and press Enter.

## Run commands {#run-commands}

- **`sudo` asks for the password once,** then remembers it for a few minutes. When you paste several lines that start with `sudo`, run `sudo -v` on its own first: otherwise the lines after the first go into the password prompt instead of running.
- **Copy commands without the ```` ``` ```` lines** around them.
- **Leave with `exit`.** The commands you run afterwards run on your own computer again; check the prompt (`ps5@…` is the PS5).

## Copy a file from the PS5 to your computer {#copy-files}

Example: the `ps5-report` file. `ps5-report` saves it in your home folder on the PS5 and prints its name at the end, for example `saved to /var/home/ps5/ps5-report-20261110-1236.txt`.

Copy it from **your computer**, in a new terminal window, not inside the SSH session. (A prompt starting with `ps5@` is the PS5: type `exit` first.)

**Windows**, in Terminal or PowerShell, into your Downloads folder:

```powershell
scp ps5@192.168.1.50:ps5-report-*.txt $HOME\Downloads\
```

**macOS and Linux:**

```bash
scp 'ps5@192.168.1.50:ps5-report-*.txt' ~/Downloads/
```

It asks for the PS5's password, then the file is in **Downloads**, ready to attach on Discord or GitHub.

- `ps5-report-*.txt` copies every report in the home folder. For one, use the name `ps5-report` printed, such as `ps5-report-20261110-1236.txt`.
- A path without `/` at the start is in the home folder on the PS5. Other files work the same: `ps5@192.168.1.50:/etc/fstab`.
- Don't use `{a,b}` patterns to copy several files at once: current `scp` doesn't take them.

**With a window instead of a command:** [WinSCP](https://winscp.net) on Windows, or the SFTP tab of an app such as Termius on a phone: connect with the same address, user and password, open the home folder, and drag the file to your computer or tap **Download**.

**The other way, from your computer to the PS5's home folder:** `scp myfile.txt ps5@192.168.1.50:`

## Log in without a password {#keys}

On your computer, once:

```bash
ssh-keygen -t ed25519
```

Then copy the key to the PS5. macOS and Linux:

```bash
ssh-copy-id ps5@192.168.1.50
```

Windows, in PowerShell:

```powershell
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh ps5@192.168.1.50 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

## Errors {#errors}

| Message | Cause and fix |
| --- | --- |
| `Connection timed out`, `No route to host` | Wrong address, the PS5 isn't in Linux yet, or it's on another network. Check the address in the router. If Linux didn't get as far as the network, the problem is the start, not SSH. |
| `Connection refused` | Linux runs, but SSH is off (Debian): turn it on as in the table above. |
| `Permission denied` | Wrong user or password. On PS5 Bazzite Deck the user is `ps5`, not `root` or `steam`. |
| `WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!` | Expected after switching the console to another install (a reflash, bootc instead of Legacy, another drive): each install has its own key. `ssh-keygen -R 192.168.1.50`, then connect again. If you changed nothing on the console, don't connect, and ask on Discord. |
| `ssh: command not found` (Windows) | Install the OpenSSH Client, see [Connect](#connect-over-ssh). |

With the screen black but SSH working, see [Black screen, but SSH works](/troubleshooting/display#black-screen-but-ssh-works).
