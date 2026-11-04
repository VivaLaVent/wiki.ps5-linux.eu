# Style guide

Rules for writing and editing pages on the PS5 Linux Wiki. This file lives in the repository root, outside `docs/`, so it is **not published** on the website.

Read it before adding or changing a page. When a page breaks a rule, fix the page, or change this guide in the same commit.

## 1. Scope

- The wiki assumes the PS5 is **already jailbroken**. Cover booting Linux and getting the hardware to work properly.
- Mention the jailbreak only as "run your jailbreak, then send the Linux loader". Never explain how to jailbreak.
- No emulators, launchers or general Linux software guides. PS5-specific things (fan curve, boost, VCN, display modes) are in scope.
- Don't link to other wikis or guides as a source of instructions. Credit people on the [Credits](docs/about/credits.md) page instead.
- Only write what is confirmed. If something is untested, say so in a `:::note[Not tested]` callout. Don't present a guess, a Discord remark or LLM-written text as fact.

## 2. Page structure

Every page follows this order, and nothing else is added at the end.

1. **Front matter**
2. **One `#` heading**, the same as `title`
3. **Opening paragraph**: one to three sentences saying what the page covers, or a callout if the reader must know something first
4. **`##` sections** in the order the reader needs them
5. **The last section's content**, and then the page ends

### What a page does not have

- **No summary, recap, conclusion or "key takeaways"** section. The opening paragraph already tells the reader what the page is about. Put the important points where they apply, in a callout.
- **No "See also" or "Related pages" lists.** Link inline, where the topic is mentioned.
- **No table of contents.** The "On this page" sidebar is generated.
- **No horizontal rules (`---`)** in the body.

The one exception: pages that are a **step-by-step path** (everything under `getting-started/` and `installation/`) may end with a `## Where to go next` section of two to four links. Reference and how-to pages never do.

A `## Summary` heading is not allowed. If a page has data that needs a lead-in before a table (like the M.2 Gen3 results), call the section by what it contains, for example `## Results by firmware`.

## 3. Front matter

```yaml
---
title: Short page title
sidebar_label: Optional shorter label
sidebar_position: 3
description: One sentence, ending with a full stop.
---
```

| Key | Rule |
| --- | --- |
| `title` | Required. Sentence case (only the first word and proper nouns are capitalised). Same text as the `#` heading. |
| `description` | Required. One sentence, 60 to 160 characters, ending with a full stop. It is used for search results and link previews. |
| `sidebar_position` | Required on every page inside a category. Numbers start at 1 and follow the order in `sidebars.ts`. |
| `sidebar_label` | Only when the title is too long for the sidebar. Don't set it just to repeat the title. |
| `slug` | Only for the front page (`intro.md`). Paths come from the file name. |

Other keys are not used. Don't add `tags`, `keywords`, `authors` or `last_update`.

## 4. Writing

### Voice

- Talk to the reader as **"you"**. Use the imperative for steps ("Run", "Edit", "Reboot").
- Short sentences, plain words. Prefer the common word: "use", not "utilise".
- Present tense. Avoid "will" and "should" when you mean "does".
- No filler: "simply", "just", "obviously", "of course", "please note", "it is important to note that".
- No humour, memes, slang or jokes at anyone's expense. No emoji outside the status symbols in section 8.
- Write for someone who has never used Linux on a console. Explain a term the first time it appears on a page, or link to where it is explained.

### Language

- **British spelling** ("colour", "initialise", "organisation"), except in code, commands, file names and product names.
- Spell out acronyms on first use per page when they aren't obvious: "hypervisor (HV)", "compute units (CUs)".
- Numbers: write words for one to nine in prose, digits for 10 and above, and **always digits with units** ("8 GB", "60 Hz", "3 seconds").
- Units: a space between the number and the unit ("16 GB", "3.5 GHz", "120 Hz"). Resolution shorthand has no space ("1080p", "4K").
- Use a full stop at the end of every sentence, including those in table cells. Bullet fragments don't take one.
- Don't use long dashes as punctuation. Use a colon, a comma, brackets or two sentences.

### Naming

Use these exact forms. If you see another form, change it.

| Write | Not |
| --- | --- |
| PS5, PS5 Slim, PS5 Pro | PS5s, Ps5, "Playstation" |
| PS5 OS (the console's own system software) | PS5 system, stock firmware |
| PS5 Bazzite Deck | Bazzite Deck, Bazzite-Deck, the Bazzite image |
| bootc (how PS5 Bazzite Deck is built, lower case) and Legacy (installs from before v2.5) | classic, BootC, the ostree version |
| bazzite-bootc-loader | bootc loader, Bazzite loader |
| Linux loader (the payload that boots Linux) | the exploit, the payload |
| Wi-Fi | WiFi, wifi, Wifi (except in commands, file names and quoted log lines) |
| M.2 | M2, m.2 |
| DualSense | Dual Sense, DS5 |
| Steam | steam (except in commands) |
| Discord | the discord |

Capitalise the words in a UI path the way the interface does, and join the steps with an arrow: **Settings → Screen and Video → Video Output**.

## 5. Headings

- `#` once per page. `##` for sections, `###` for subsections. Don't go deeper than `###`.
- **Sentence case**: "Install to the internal M.2", not "Install To The Internal M.2".
- A heading names the topic or the task. Prefer "Fix a black screen" or "Black screen after login" over "Troubleshooting black screens".
- Don't end a heading with a colon or full stop.
- Number a heading ("1. Install the drive") only when the page is a strict sequence of steps that must be done in order.
- Headings are link targets. Don't rename one without searching for `#its-old-slug` across `docs/`.
- Avoid duplicate heading text on the same page.

## 6. Page types

Pick one type per page and use its shape.

| Type | Lives in | Shape |
| --- | --- | --- |
| **Walkthrough** | `getting-started/`, `installation/` | Numbered steps or `## 1.`, `## 2.` sections, then `## Where to go next` |
| **How-to** | `using-linux/`, parts of `advanced/` | One task or problem per `##` section. Steps first, background in a `<details>` block if needed |
| **Reference** | `hardware/` | Facts in tables and short sections. No steps unless a procedure is the point |
| **Troubleshooting** | `troubleshooting/` | One symptom per `##`/`###` heading, named after what the reader sees. Cause, then fix |

## 7. Callouts

Docusaurus admonitions, always with a title when the callout is more than one sentence:

```md
:::warning[Short title]
Content.
:::
```

| Type | Use for | Don't use for |
| --- | --- | --- |
| `:::note` | Neutral extra context, scope, "not tested" | Anything the reader must act on |
| `:::info` | Background that explains why something is the way it is | Warnings |
| `:::tip` | An optional shortcut or a better way | Required steps |
| `:::warning` | Something that can cause a failure, data loss or a black screen | Mere inconvenience |
| `:::danger` | Permanent damage or data loss | Anything recoverable. Rarely used |

Rules:

- **At most one or two callouts per `##` section.** If everything is a warning, nothing is.
- The title is short (under about 50 characters) and in sentence case. It states the subject or the risk, not "Warning" or "Note".
- Don't nest callouts. Code blocks inside callouts are fine.
- Two callouts mark the image distinction, and only these two:
  - `:::tip[PS5 Bazzite Deck]` when a page's instructions differ for that image (what's already done there, or its own steps), with a link.
  - `:::note[Not for PS5 Bazzite Deck]` at the top of a page or section that only applies to the other images (Ubuntu, Arch, Fedora, CachyOS, Debian), so Bazzite Deck readers can skip it.
- Callouts that point to a unit-specific condition name it in the title: `:::warning[Original PS5 and Slim only]`.

## 8. Tables, lists and status symbols

### Tables

- Use a table when you compare items across the same attributes, or list settings and values. Use a list for steps and for items without attributes.
- Every table has a header row with real column names. No empty headers; use a list instead.
- Left-align text. Keep cells short; move long explanations below the table.
- Keep the first column as the thing being described (a setting, a part, a key).

### Lists

- Numbered lists only for steps in a fixed order. Bullets for everything else.
- One idea per item. Keep parallel items in the same form (all imperatives, or all noun phrases).
- Start the item with a bold lead-in only when readers will scan for it: `- **Wi-Fi/Bluetooth chip:** …`.

### Status symbols

Only in status tables, and always together with a word, never alone:

| Symbol | Meaning |
| --- | --- |
| ✅ | Working |
| ⚠️ | Working with limits, or workaround needed |
| ❌ | Not working |

## 9. Code and commands

- Always give the language on a code block: `bash`, `text`, `ini`, `c`. Use `text` for file contents and output, `bash` for commands.
- Add `title="..."` when the block is the contents of a named file: ` ```text title="cmdline.txt" `.
- Show commands the reader should type exactly, without a `$` prompt. Use `sudo` where it is needed instead of telling the reader to become root.
- Placeholders go in angle brackets: `<your-username>`, `<ps5-ip>`.
- One command per line. Don't chain unrelated steps with `&&` to save space.
- Say where a command runs when it isn't obvious: on the PS5 in Linux, on a PC, or over SSH.
- Inline code for: commands, file names, paths, kernel parameters, package names, config keys, and values the reader types. Not for emphasis.
- Bold for **UI labels the reader clicks** and for a short lead-in. Don't bold whole sentences.
- A long command output is not pasted into a page. Show the lines that matter.

## 10. Links

- **Internal links** to other pages: use the site path, `/section/page`, with an anchor when you mean a section: `[VRAM](/hardware/gpu#vram)`.
- **Between pages in the same folder** the relative `./page.md` form is also fine. Don't mix both styles in one paragraph.
- Link text says what the reader gets: `[Display recovery](/troubleshooting/display-recovery)`. Never "click here" or a bare URL.
- Link to a topic the **first time it matters on a page**, not every time it is mentioned.
- External links: official docs and project repositories (`github.com/ps5-linux/...`). They open in the same tab. Don't link to anything that explains how to jailbreak.
- Scripts users can download live in `static/scripts/` and are linked with `pathname:///scripts/...` so Docusaurus doesn't treat them as pages.
- Check that links work: `npm run build` fails on broken links.

## 11. Images

The wiki has **no images**. Describe things in text, tables and code blocks. If an image would really be essential, add it to the list in an issue first and agree on a style before adding it.

## 12. Files and naming

- Page file names are lower-case, words joined with hyphens: `m2-compatibility.md`. They match the page's topic, not its title wording.
- Use `.md`. Use `.mdx` only when a page needs components such as `<Tabs>`.
- Folders are the sidebar categories: `getting-started`, `installation`, `using-linux`, `hardware`, `advanced`, `troubleshooting`, `about`.
- Every new page is added to `sidebars.ts` in the same commit.
- Don't rename or move a page without checking inbound links (`grep -r "old-name" docs/`).

## 13. Before you commit

- [ ] Front matter is complete (section 3) and the `#` heading matches `title`.
- [ ] No `## Summary`, recap, "See also" or conclusion section (section 2).
- [ ] Headings are in sentence case with no level skipped.
- [ ] Product and term names match the table in section 4.
- [ ] Every code block has a language; file contents have a `title`.
- [ ] Every claim is confirmed, or marked as not tested.
- [ ] The page is in `sidebars.ts`.
- [ ] `npm run build` passes with no broken links.

## Structure (November 2026)

- **One source of truth per topic.** Each hardware component has one page under Hardware reference; its setup and troubleshooting live there. Other pages link to it instead of repeating it. Status changes go into the table on [Hardware status](docs/hardware/matrix.md) first.
- **After installing has three layers:** All distros (applies everywhere), Other images (what PS5 Bazzite Deck already does), Distro notes (package-manager differences only), plus a PS5 Bazzite Deck page that points to docs.bazzite.gg for plain-Bazzite topics.
- **Moving or merging a page:** add a redirect in `docusaurus.config.ts` (`@docusaurus/plugin-client-redirects`) so old links keep working.
- **Front matter on every page:** `title`, `description` (quote both if they contain `: `), `hardware` (`[original, slim, pro]` or a subset) and `applies_to` (`all`, `bazzite-deck` or `not-bazzite-deck`). No firmware or kernel version fields: they go stale within weeks.
- **Tone, after docs.bazzite.gg:** task-named pages, hub pages with bold link lists, one idea per paragraph, numbered steps, and "order reflects the recommendation" where options are ranked.
