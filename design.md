# design.md — ilmarlopez.com v2 (locked)

Source of truth: `design/hallmark/f/` (shape "Depth Is Time", genre modern-minimal). Approved by Ilmar on 2026-11-24. It replaces the earlier direction "Live System" (`design/hallmark/d/`), which stays in the repo only as history. Change this file only with explicit approval.

## Concept
An engineer's portfolio where depth is time: the newest role stands in front, and scrolling flies the camera back through the roles that built it. Light, restrained, one accent. Not decorative, no serif, no metaphor objects.

## Tokens (OKLCH). Never hardcode colours outside tokens.
| Token | Light | Dark |
|---|---|---|
| `--color-paper` | oklch(97.5% 0.006 250) | oklch(16% 0.015 260) |
| `--color-paper-2` | oklch(94.5% 0.01 250) | oklch(20% 0.018 260) |
| `--color-paper-3` | oklch(90% 0.015 250) | oklch(26% 0.02 260) |
| `--color-ink` | oklch(20% 0.02 260) | oklch(96% 0.006 250) |
| `--color-ink-2` | oklch(32% 0.025 260) | oklch(86% 0.012 250) |
| `--color-muted` | oklch(45% 0.025 260) | oklch(74% 0.02 255) |
| `--color-rule` | oklch(86% 0.012 250) | oklch(30% 0.02 260) |
| `--color-accent` (coral, the only signal) | oklch(66% 0.19 33) | oklch(70% 0.18 35) |
| `--color-focus` | oklch(50% 0.2 33) | oklch(76% 0.17 38) |
| `--color-error-text` (form errors) | oklch(52% 0.19 27) | oklch(76% 0.15 27) |
| `--color-field` (footer) | oklch(19% 0.02 260) | oklch(12% 0.012 260) |
| `--scene-soft-top` (top layer of the Work stack) | oklch(88% 0.04 255) | oklch(38% 0.06 255) |

`--scene-soft-side` is unused in this direction and is not ported. Dark mode: `:root[data-theme="dark"]` plus `prefers-color-scheme` unless `data-theme="light"`. Toggle stored by the user.

## Type
- Display: Rethink Sans. Body: Hanken Grotesk (Google Fonts; self-host via `@nuxt/fonts` in v2).
- Scale: `--text-display: clamp(2.75rem, 6vw, 5.5rem)`, `--text-display-s: clamp(2.25rem, 4vw + 0.5rem, 3.75rem)`, `--text-section: clamp(2rem, 2.5vw + 1rem, 3.5rem)`, `--text-title: clamp(1.25rem, 0.75vw + 0.875rem, 1.625rem)`, `--text-lead: clamp(1.125rem, 0.35vw + 1rem, 1.375rem)`, base 1rem. Display tracking -0.02em; the `h1` uses -0.04em.
- Labels and captions: body face, one size smaller, no caps and no tracking.

## Layout, shape, motion
- Container 1440px, gutter 64px (24px at ≤ 60rem, 16px at ≤ 40rem). Radius 4px for cards and tiles, pill for buttons. Hairline 1px rules, no shadows.
- One filled primary button (ink); secondary is outline.
- Motion: `--ease-out cubic-bezier(0.16,1,0.3,1)`, durations 120/220/420ms. Hero heights in `svh`. Content visible by default; hidden-at-rest states only under a `.js` class.
- Scroll: native. Anchors glide with `scroll-behavior: smooth`, only under `prefers-reduced-motion: no-preference`. The theme crossfades with a View Transition (220ms).
- `prefers-reduced-motion`: no flight, the roles are a plain list, figures show their final value at once, bars are drawn, no reveal, no transitions on the Work stack.

## Signature: Depth is time (the flight)
- Static first: the hero, then the roles as a plain list. With JS and no reduced motion, the `flight` class turns it into a scene: a `.journey` runway of 480svh with a sticky viewport, `perspective: 1100px` (900px at ≤ 40rem), origin 76% 34% (60% 36% on a phone).
- Planes: the hero and the four roles, 820px apart in depth. Scroll sets `--x --y --z --o --po` on each plane. The camera dwells near each plane (easing over 0.22 to 0.78 of its slice) and eases toward the scroll with an exponential smoothing of about 90ms. Planes still ahead stay opaque so the nearer ones hide them and only their ink fades; passed planes fade as a whole.
- On load the roles arrive from depth (700ms, nearest first, 80ms apart) and the depth ruler comes in last.
- Depth ruler at the bottom: a hairline with a coral fill, and the labels Now · Stori · Home & Media · California Web · UTT. The label of the role in front takes the ink; passed labels soften.
- On a phone the cards behind the hero sit in the band between the nav and the hero text. The offset is solved from the perspective, so any screen height works.
- Only the plane in front receives pointer and keyboard focus. Links of the planes behind stay in the page for screen readers.

## Role cards (drawing sheets)
- A type-set monogram (St, HM, CW, UTT; the newest is filled), the name, the role, and a state: "Active" with the one coral dot on the page that means live, "Ended", or "Education". The name of the live role links to `https://www.storicard.com/` in a new tab; no other card links out.
- Summary, then a readout: **Period** and **Duration**. Duration is a real figure computed from the dates, counting the first and the last month, and it counts up once when the plane arrives (700ms). Screen readers get the final value only.
- Timeline: a small chart with a row per role on one shared scale (January 2017 to today), newest first. The role the card is about is in ink with its name in bold; the others are grey. A coral hairline marks today. One hairline per January; years labelled every second year (every third on a phone). Behind roles draw first, the card's own bar last.
- UTT has no dates, so it has no readout and no chart.

## Selected work: stack inspector
- Pick a project and its layers pull apart in 3D (700ms, 60ms stagger, labels fade in after 300ms). Labels are billboards beside each layer, with a dashed guide.
- The drawing (diamond, guide, widest label) always fits its stage: the stack is sized from the stage width with container units, shrinks if it must, and is centred as one piece on one column.

## Say hi
- A native `<dialog>`. It arrives from slightly behind (220ms in, 120ms out). Once sent, the form recedes toward the hero's vanishing point and the confirmation comes forward.
- A coral progress line along the top edge while the request is in flight. Fields have a visible label, a reserved helper line that the error replaces, and a 52px control; the focus ring is ink. No Cancel button: the close control and Esc do it. Errors keep the data and offer the `mailto`.
- On a phone it is a sheet from the bottom edge that rides above the keyboard (`--kb` and `--vvh` come from `visualViewport`).

## Sections
Hero and Experience (the flight) · About · Selected work (4 public repos in the stack inspector) · Tools (Languages, Frontend, Cloud, Practice) · Contact (Say hi dialog → Web3Forms, `me@ilmarlopez.com`, CV) · Footer (All versions, Version 1 archived).

## Content rules
- No internal Stori projects; use public GitHub repos only.
- Socials: GitHub, LinkedIn, DEV, CodePen. Photo `/img/hero/me.jpg`. CV `/files/Ilmar-Lopez-CV.pdf` (PDF, 1 page), opened in a new tab; the old `/files/cv-en.pdf` redirects to it.
- Never invent metrics, clients or links; use `TODO(ilmar): ...`.

## Guardrails
- Run `node .agents/skills/hallmark/scripts/sloplint.mjs <files> --genre modern-minimal`; ship clean (0 FAIL, 0 REFLEX, 0 WARN; the one ANSWERED finding F4 keeps its stamp).
- One scroll pattern per page (the flight). The page uses more motion primitives than Hallmark's recommended three; Ilmar accepted this when approving `design/hallmark/f/`.
- Tokens for all colours and fonts. Lighthouse ≥ 95 and JS budget per spec.
