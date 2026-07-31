# Design

<!-- impeccable:design-schema 1 -->

## World

**Risograph Field Zine** — a youth-culture indie-print world. The surface reads as a sequence of printed zine pages you turn through, not a scrolling landing page. Warm uncoated-paper ground carries 2–3 fluorescent riso inks per surface, halftone vignettes, hand-set display type, and rubber-stamp section labels. RIASEC types appear as small ink/code marks — never as six competing palettes. Restrained color strategy: paper neutrals plus one accent ink per session.

The first surface (quiz → reveal → workbook Section 1) shares one vocabulary at three depths: the quiz is a stapled pamphlet, the reveal is a collated plates spread, and the workbook is a longer-stitched keepsake.

## Color Strategy

Restrained. One ink color owns a region per spread; the other two support in marks, halftone, and rule lines.

### Tokens

| Token | Value | Role |
|---|---|---|
| `--paper` | #F4ECD8 | Warm uncoated ground (primary surface) |
| `--paper-deep` | #E8DDC4 | Deeper paper (secondary, card backs) |
| `--paper-shadow` | #D9CCB2 | Paper edge/well shadow |
| `--ink-black` | #1A1614 | Near-black ink (text, stamps, halftone base) |
| `--riso-pink` | #FF4D7D | Fluorescent pink — primary riso accent |
| `--riso-blue` | #1FA8FF | Fluorescent blue — secondary riso accent |
| `--riso-yellow` | #FFD93D | Fluorescent yellow — tertiary riso accent (alert/spotlight only) |
| `--rule-line` | #C9B999 | Ruled-paper guide lines |
| `--stamp-ink` | rgba(26,22,20,0.78) | Stamp impression — slightly translucent like a second-pass print |
| `--tape` | rgba(255, 217, 61, 0.55) | Masking-tape strip |

### RIASEC ink marks

Six small marks (not six palettes) — each type carries a glyph and a single ink:
- **Realistic (R)** — hashed-square mark, `--riso-blue`
- **Investigative (I)** — dotted-diamond mark, `--riso-pink`
- **Artistic (A)** — star/asterisk mark, `--riso-yellow` over `--ink-black` outline
- **Social (S)** — hollow-circle mark, `--riso-pink`
- **Enterprising (E)** — double-chevron mark, `--riso-blue`
- **Conventional (C)** — checked-square mark, `--ink-black`

### Contrast guardrails

Fluorescent inks are decorative/stamp surfaces only; running body text never sits on a fluorescent fill. Body text is `--ink-black` on `--paper` (contrast ≥ 4.5:1 verified). On tinted paper (`--paper-deep` or colored halftone), body color stays a tinted dark derived from the underlying hue — never neutral gray.

## Typography

Two faces, deliberately chosen against the training-data default list.

### Display — Bricolage Grotesque

A constructed, opinionated grotesque with print-making energy. Load weights 400, 600, 800 from Google Fonts (link in `index.html`). Reserved for zine headlines, career-plate names, section titles, quiz prompts, and stamped labels (with `letter-spacing: 0.12em` and `text-transform: uppercase`).

Tracking: display `letter-spacing: -0.03em`. Display max size: 6rem. Line-height: 0.92–0.98 for display weight 800, up to 1.05 for weight 400.

### Body — Spectral

A warm humanist serif from Production Type; reads on uncoated paper at body size; its italic earns prominence. Load weights 300, 400, 500, 600 plus italic 400 from Google Fonts. Used for body copy, quiz answers, workbook prompts, and the AI-guided dialogue voice.

Body measure: 65–75ch. Body color `--ink-black` on `--paper`. Body line-height: 1.55.

### No monospace face

Stamp and label characters use Bricolage Grotesque with `letter-spacing: 0.10em–0.16em` and uppercase transform — never a mono face masquerading as "technical."

## Material

### Halftone

Riso halftone is simulated via CSS dot screen: layered `radial-gradient` patterns at a visible dot pitch (8–14px cell radius) applied via `mix-blend-mode: multiply` over a colored fill, with overlay opacity 0.45–0.7. Applied to fields that own a region — spread titles, plate backs, the workbook heading band — never scattered as decorative noise over neutral ground.

### Ink stamps

Rubber-stamp look via ink-colored boxes with a slight `box-shadow` offset (no spread), `transform: rotate(-1.5deg to 1.5deg)` per occurrence (varied, never uniform), minor `border-radius: 3px` corners, and `--stamp-ink` background at the impression opacity. Stamped text uses Bricolage Grotesque 600/800, letter-spaced uppercase, ink color reads as the ink on the stamp, not the paper hue behind it.

### Paper ground

Body background carries a subtle off-white paper texture: layered low-contrast `radial-gradient` noise and a faint 1px guide-rule using `--rule-line`. Pages feel like coated-but-uncoated stock — warm, with a hint of grain, never a flat color.

### Masking tape

Workbook resource callouts get a translucent yellow masking-tape strip (`--tape`), `box-shadow: 0 2px 6px rgba(0,0,0,0.12)`, slight rotation `rotate(-3deg)` to `rotate(2deg)`.

## Motion

The authored moment of this surface is the **page-fold transition** between every zine beat. It is the *only* orchestrated motion; there are no scattered entrance fades, no parallax, no hover scale effects.

Implemented via the **View Transitions API** with a graceful fallback: when unsupported (`!document.startViewTransition`), swap page content with a short (180ms) `opacity` crossfade so the journey still reads as "turning the page."

The transition itself: the outgoing spread folds away along its central gutter (desktop) or right edge (mobile) — a 3D-ish `perspective translateY/rotateY` — while the incoming spread opens in from the opposite fold. Duration 380–480ms cubic-bezier ease-out. One transition per beat. Same transition between quiz items.

## Layout

### Zine spread

- **Desktop (≥768px):** two-page side-by-side spread. Left page = context (prompt stamp, resources, prior spread's echo); right page = the active beat (quiz item, career plates, workbook prompt). A visible spine/gutter between them (1px `--paper-shadow` rule + 8px gutter).
- **Mobile (<768px):** collapses to a single portrait page. Spread becomes one page at a time. Layout does not become a single-column landing page — it becomes a zine page in portrait orientation.
- Page aspect ratio: ~1.41:1 (ISO A-series paper proportions). On desktop each page of the spread is half-width.

### Atomic regions (never card-grid)

No gridded card neighborhoods. The spread is composed of named regions per section: a stamped section label band, a headline block, an illustrated vignette plate, a prompt field with ruled lines, and a resource/sticky-note strip. The composition varies per beat — quiz spreads differ from reveal spreads differ from workbook spreads — within the same vocabulary.

### Section label band

Stamped label per beat (e.g., QUIZ · LIKERT · 3 of 9, REVEAL · YOUR TYPE, WORKBOOK · DESCRIPTION). One band per spread, always in the top-left or top-right of the left page.

### Rule lines

Workbook input fields use ruled-paper lines (`repeated-linear-gradient` from `--rule-line` every 30px). Inputs sit on top transparent, with the rule visible through their rule-row guide.

## States

- **first-run / empty:** the default — no saved progress; the zine opens on the intro spread.
- **in-progress quiz:** the page-fold animates forward/back through items; `Back` returns one item.
- **quiz collating:** the reveal entry — a 5-second authored beat (built pass 2026-08): six RIASEC stamp tiles fill one by one on a paper strip, a percentage ticks 0→100%, italic captions rotate, "Ready!" holds, then the page folds to the reveal. Loading placeholder reads "Collating…". Reduced motion: instant fill + short beat.
- **reveal:** career cards (up to 4) are arranged across the right spread page (desktop: right page scrolls under a steady left page; mobile: single column); hovering/tapping a card exposes "Discover more →".
- **workbook in-progress:** ruled-line input accepts typing; an AI-guided dialogue thread appears alongside/stitched into the spread; section progress stamps fill in as sections advance.

## Accessibility

- Body text ≥ 4.5:1 against paper ground; large text and stamps ≥ 3:1.
- All controls hold ≥ 44px hit target on touch.
- Keyboard: the page-fold transition respects `prefers-reduced-motion` and falls back to an instant content swap with no perspective transform; card-sort left/right arrows work with `←/→` keys; Likert scaled on a 5-key range with `1–5` or arrow keys.
- `aria-live` region on the guided dialogue so screen readers receive assistant turns without losing form focus.
- Type sizes use `rem` so user font-size preferences apply.

## Responsive

| Breakpoint | Behavior |
|---|---|
| < 480px | portrait single page; halftone dot radius scales to 6px; display face steps down one weight class; touch targets stay ≥ 44px |
| 480–767px | portrait single page, rules tighten; plate fields single column |
| ≥ 768px | two-page spread with visible gutter |
| ≥ 1200px | spread increases margin; type scales up; halftone pitch widens for richer density |

## What ships with this world (first build)

Five reusable components:

1. **Zine spread** — the page-fold-aware spread container
2. **Career plate** — name, RIASEC mark, tier stamp, day-in-life vignette photo, "Open workbook →" action
3. **Workbook prompt block** — stamped section label, prompt heading, ruled-line input
4. **Resource callout** — masking-tape strip with resource links, related to the workbook section
5. **Page-fold transition** — the single signature motion of the surface

## Out of bounds (this world does not)

- No gamification: no badges, no leaderboards, no point totals, no "rarity" as a status symbol (tier marks on career plates are descriptive labels, not military ranks)
- No glass or blur as decoration
- No default Inter / DM Sans / Space Grotesk / Playfair Display / Cormorant typeface choices
- No card-grid-as-page-structure
- No fabricated testimonials, customer logos, or partnership claims
- No flat terracotta-over-cream AI-default rendition; the riso inks are real fluorescent saturation, not a beige wash
