# Career Explorer — Session Handover

> **Last updated:** Sat Aug 01 2026
> **Skill used:** Impeccable (Risograph Field Zine world) — animate playbook + craft-floor for the collating progress beat. ALWAYS load this skill first in future sessions (see How to resume, step 2).
> **Deployed:** **live on GitHub Pages** → `https://clarencewongww.github.io/career-explorer/` (repo: `github.com/clarencewongww/career-explorer`, public, branch `main` + `.nojekyll`). Push to `main` to redeploy (up to ~10 min to publish).
> **Status:** Foundation + welcome + 24-item mixed-format quiz + fixed footer + intro greeting + light/dark mode + careers database (1,744 roles) + **reveal build complete** (real matching, career cards with country-agnostic role descriptions + day-in-life vignettes, copy migration, dark-mode card surfaces, desktop split-scroll, smart clip-aware tooltips) + **collating progress animation** (5s stamp-tile beat) + **hosted on GitHub Pages**. Workbook Section 1 is next.

---

## How to resume in a new session

1. Open a new session in this project directory: `/Users/clarencewong/Documents/Deepseek CC/career-explorer`
2. **Load the impeccable skill FIRST** — it is the required workflow for all UI work here. Follow its setup: run `node <skill-base>/scripts/context.mjs --target <surface>` once (keep cwd at the project), load the playbook reference that owns the request (e.g. `reference/animate.md`, `reference/new-work.md`), and load `reference/craft-floor.md` immediately before any UI edit.
3. Read this file first, then `PRODUCT.md`, then `DESIGN.md`, then `app.js` and `styles.css` to get current state.
4. Pick up from **"Next step"** below. The reveal is complete. The remaining work is workbook Section 1 → wire full flow → README → service worker → visual verification.
5. Before writing any UI code, reload `reference/craft-floor.md` from the skill (required by the workflow before UI editing).

---

## What this project is

**Career Explorer** is a web app (responsive, PWA) for middle-school students. They take a RIASEC-based career quiz (24 mixed-format items: 12 Likert + 6 scenario + 6 card-sort), see career suggestions (up to 4 career cards), pick one to explore in depth, then fill a seven-section guided workbook via an AI-guided dialogue experience. The workbook is a keepsake artifact of their personal reasoning about a career, not just a form. The product must be visually appealing — the **Risograph Field Zine** world, not a default web template.

See `PRODUCT.md` for full durable product truth and `DESIGN.md` for the committed visual world.

---

## Decisions confirmed during init + shape

1. **Platform:** Web, responsive, PWA-capable.
2. **Quiz scope:** In-product — users start here, take **24 mixed-format items: 12 Likert + 6 scenario + 6 card-sort (one per RIASEC letter each)** in middle-school voice. Scenario and card-sort types were re-added after an earlier Likert-only decision was revised back to mixed-format.
3. **Exploration:** One career at a time; student finishes one workbook and can return to pick another suggested career.
4. **Workbook format:** Always the same seven sections, in order: Description, Your Drivers, Your Strengths, Your Growth, Pros and Cons, Immediate Preparation, Degree Preparation.
5. **AI-guided dialogue:** Used in the workbook to guide students step-by-step through each section, surfacing resources and reflection prompts.
6. **Brand:** Fully undecided — no name, logo, voice, palette beyond what the committed world implies. Do not invent brand assets.
7. **Accessibility:** No formal standard confirmed; responsive + readable + keyboard/screen-reader friendly is the floor.

---

## The committed visual world — "Risograph Field Zine"

Brief summary (full detail in `DESIGN.md`):

- **World:** Youth-culture indie-print. Warm uncoated-paper ground carries 2–3 fluorescent riso inks per surface, halftone vignettes, hand-set display type, rubber-stamp section labels. RIASEC types appear as small ink/code marks — not six competing palettes.
- **Mode:** Operate — visitors complete a task (take quiz → pick career → fill workbook).
- **Color strategy:** Restrained. Paper neutrals + one accent ink per session. Tokens: `--paper #F4ECD8`, `--ink-black #1A1614`, `--riso-pink #FF4D7D`, `--riso-blue #1FA8FF`, `--riso-yellow #FFD93D` (full set in `:root` in styles.css).
- **Typography:** Display = **Bricolage Grotesque** (Google Fonts). Body = **Spectral** (warm humanist serif). Deliberately NOT Inter, DM Sans, Space Grotesk, Playfair, Cormorant, or any training-data default.
- **Six RIASEC marks (glyph + ink color):** R (hashed square, blue) · I (dotted diamond, pink) · A (star, yellow+black) · S (hollow circle, pink) · E (double-chevron, blue) · C (checked-square, black). Implemented as CSS mask-image data-URI SVGs (styles.css §4).
- **Motion:** One authored moment — the **page-fold transition** between every zine beat, via the View Transitions API with a graceful crossfade fallback. Reduced-motion: instant swap.
- **Layout identity:** The zine spread is the atomic unit — two-page side-by-side on desktop (≥768px), portrait single column on mobile. Visible gutter/spine, `.zine` is a CSS grid `1fr var(--gutter) 1fr`. Exception: the **reveal spread** uses a steady left page + internally scrolling right page on desktop (see override §19).
- **Anti-ruts explicitly avoided:** No "Take Our Career Quiz!" hero + button + card-grid of careers; no pastel-cute kids-app gamification; no AI-default warm-cream-plus-terracotta-over-serif static template; no glass/blur as decoration; no badges/leaderboard/points.

---

## Files on disk

```
career-explorer/
├── PRODUCT.md              ✅ Durable product truth (60 lines, schema 1)
├── DESIGN.md               ✅ Committed visual world record (~152 lines, schema 1)
├── HANDOVER.md             ✅ This file
├── index.html              ✅ Entry HTML (27 lines) — loads quiz-data.js → careers-data.js → app.js, Google Fonts, PWA links, #app mount
├── styles.css              ✅ Foundation stylesheet (2,430 lines) — 19+ sections, incl. §19 override for career cards (~2,150+), smart type tooltips, collating progress animation, dark tokens
├── app.js                  ✅ Behavior layer (1,747 lines) — state machine, foldNavigate, renderers: welcome, intro, quiz, collating (with 5s stamp-tile progress via startCollate), real reveal (matching + career cards), workbook placeholder; scoring, tooltip helper
├── quiz-data.js            ✅ 24 mixed-format items (12 Likert + 6 scenario + 6 card-sort), middle-school voice, synthetic demo content
├── careers-data.js         ✅ Career pathways database (1,744 entries, ~168KB) — O*NET-sourced Holland codes (1,032 unique) + careerexplorer.com-inspired supplementary roles (712 unique). Each entry: { id, name, letters }. Raw data only — tier, role description, and day-life vignettes are computed at render time in app.js. Attaches to window.CAREERS.
├── screenshots/            ✅ Canonical visual-verification artifacts (see convention below)
└── public/
    ├── manifest.webmanifest ✅ PWA manifest (name, start_url, icons, theme_color)
    └── icon.svg            ✅ 512×512 zine app icon (paper + pink stamp + blue RIASEC mark)
```

---

## What's complete and verified

| Component | Status | Verified by |
|---|---|---|
| `PRODUCT.md` (init output) | ✅ Written & user-approved | User said "looks good" |
| `DESIGN.md` (committed world) | ✅ Written | Read back identical |
| `index.html` — script order quiz-data.js → careers-data.js → app.js, Google Fonts, PWA manifest link, theme-color, #app mount | ✅ Written | Loaded via local server in browser |
| `styles.css` — tokens, halftone, zine grid, stamps, RIASEC glyphs, display/body type, callout, ruled-line input, tape, page-fold transition, quiz UI, intro spread, footer, dark tokens, §19 career-card override | ✅ Written | Vision agent verified rendering on desktop & mobile |
| `app.js` — state machine, `scoreRiasecProfile`, `foldNavigate`, renderers (welcome, intro, quiz, collating, reveal, workbook placeholder), navigation actions, mounted on load | ✅ Written | Fold navigation exercised live |
| `quiz-data.js` — 24 mixed-format items, middle-school voice, synthetic demo content header | ✅ Written | File read back |
| `careers-data.js` — 1,744 careers, 0 duplicates, 0 malformed, all RIASEC letters valid; primary distribution R=591 / I=304 / A=124 / S=251 / E=227 / C=247 | ✅ Validated | id uniqueness, RIASEC validity, distribution checks |
| **Welcome page** — section stamp "WELCOME · CAREER EXPLORER", "Hello." headline, name/email ruled-line form, "Begin →" CTA | ✅ Verified | Vision agent |
| **Intro spread** — pink stamp "INTRO · YOUR JOURNEY STARTS HERE", "Find your spark" headline, greeting "Hi, {name}.", six clickable RIASEC marks, sticky-note callout, halftone texture | ✅ Verified | Vision agent, desktop + mobile, light + dark |
| **24-item quiz** — Likert (5 stamped 56×56 cells), scenario (3 stacked options), card-sort (2 cards); progress strip + RIASEC tally + rotating tip on left page | ✅ Verified | Desktop 1440×900 & mobile 375×812 |
| **Fixed footer** — Back button always visible at viewport bottom; page numbering 1–28 | ✅ Verified | Code review + visual check |
| **Light/dark mode switcher** — `☾ Dark` / `☀ Light` in footer; tokens invert on `[data-theme="dark"]`; respects `prefers-color-scheme`; persists in `localStorage` | ✅ Verified | Desktop 1920×1080 & mobile 375×812, both modes |
| **Reveal matching contract** — `scoreCareerMatch`/`getCareerTier`/`pickRevealCareers`: top-3 letters primary `+3/+2`, secondary `+1.5/+1`, tertiary `+1/+0.5`; adjacency `+0.5` only when no direct match; RIASEC hexagon R↔I/C, I↔R/A, A↔I/S, S↔A/E, E↔S/C, C↔E/R; tiers strong ≥3 / good ≥1 / else adjacent; up to 4 picks, tier-aware, re-sorted by score desc with RIASEC_ORDER tie-break | ✅ Verified | Console + browser checks |
| **`renderReveal`** — left page: live region, "REVEAL · CAREER MATCHES" stamp, "A few paths to explore", "What stood out" top-3 rows (now with type tooltips), copy, callout; right page: "CAREER CARDS" stamp + card grid; empty state "We couldn't find a match yet…"; footer "← Back to quiz" | ✅ Verified | Browser + screenshots |
| **Career cards** — `renderCareerCard`: name, RIASEC marks, tier stamp (STRONG FIT / GOOD FIT / ADJACENT FIT), country-agnostic role blurb ("ABOUT THIS ROLE" + 1–2 sentences from `ROLE_DESCRIPTIONS`), halftone day-in-life vignette ("A DAY AT WORK"), "Discover more →" (44px min target) opening the workbook via `selectedCareer` | ✅ Verified | Vision + browser checks |
| **Copy migration** — plates → cards terminology; "REVEAL · CAREER MATCHES", "A few paths to explore", "What stood out", "CAREER CARDS", "Discover more →", callout "Each label shows how closely a career connects with your answers…" | ✅ Verified | Grep + browser text checks |
| **Dark-mode card surfaces** — opaque `#44372A` card fill, `#A88E67` border, offset shadow; `.reveal .career-card { z-index: 2 }` stops halftone bleed over card faces | ✅ Verified | Computed styles + pixel checks |
| **Desktop split-scroll** — left reveal page steady (`overflow: hidden`), right page internal `overflow-y: auto` above fixed footer; mobile normal single-column document scroll | ✅ Verified | Scroll behavior + pixel checks |
| **Collating progress animation** — 5-second "calculation" beat after the last answer: six RIASEC stamp tiles (`R I A S E C`, ink-colored fills, scale-press stamp-in) on a paper strip fill one-by-one over ~4.1s while a pink Bricolage percentage ticks 0→100% and italic captions rotate ("Folding your answers in…", "Counting the six stacks…", …), then "Ready!" holds until the fold to reveal at 5s. `startCollate()` drives it; `role="status"` sr-only live region announces start + "Your career matches are ready."; reduced motion = instant fill + ~450ms beat. Scroll resets to top on entering collating and reveal. | ✅ Verified | Desktop + mobile mid-animation samples, reduced-motion timing (reveal ≈0.9s) |
| **Smart type tooltips** — shared `attachTypeTooltip` + `.type-tooltip` (right / `--flip` left / `--below` / `--above`, clip-aware placement); used by quiz tally rows and reveal top-3 marks. Interaction is channel-picked per device: pointer → hover/focus; touch (`hover: none`) → tap toggles, tap-away closes. Tooltip stays `pointer-events: none` even when shown so taps pass through. `aria-hidden` toggled on show/hide. | ✅ Verified | 9 viewports, touch + hover |
| **Role descriptions** — `ROLE_DESCRIPTIONS` map (6 letters, country-agnostic: no salary/currency/education-system references), `buildRoleDescription` (primary sentence + optional "It also leans into …" line) | ✅ Written | Code review + browser text checks |
| **Browser verification pass** — 51/51 checks (opacity, borders, stacking, no halftone bleed, all text/CTAs visible, right scroll reaches last CTA, left page steady, no horizontal overflow, mobile full scroll) | ✅ Verified | Playwright/Chromium, profile R5 I4 A3 S2 E1 C0 |
| **Screenshots** — welcome, intro, quiz, reveal (light + dark, desktop + mobile) canonical files in `screenshots/` | ✅ Written | Vision agent inspection |

---

## Issues fixed during build

1. `.intro { display: contents }` overrode the `.zine` grid → removed.
2. Page was ~2.3× viewport height → fixed.
3. RIASEC marks too small at 22px → added `riasec-mark--lg` (clamp 32–44px).
4. No halftone visible → applied `halftone--pink`/`halftone--blue` + `halftone-band` disk.
5. Callout was full-width → `max-width: 420px`.
6. No riso accents on intro → pink stamps, headline accent, pink hover states.
7. Footer overlapping content on mobile → fixed positioning + `padding-bottom: 40px` on body.
8. Rubber-stamp texture missing → subtle box-shadow + text-shadow ink-bleed.
9. Headline one-color → "type?" wrapped in pink italic `<span class="headline__accent">`.
10. Likert label 8px → 10px for legibility inside the 56×56 cell.
11. Scenario item type restored when quiz returned to mixed format (12 + 6 + 6 = 24).
12. Quiz left page was empty → `renderQuizLeftPage()` with progress strip, tally, tip callout.
13. **RIASEC tally tooltip clipped on small viewports** — moved from above to the right of the row (`left: calc(100% + 8px)` + arrow/tape).
14. **Tooltip `aria-hidden` not toggling** — added dynamic toggle on hover/focus.
15. Footer hidden on scrollable pages → `position: fixed; bottom: 0` + body padding.
16. Welcome page added (name/email for future email-results feature; stored in `state.user`).
17. Intro copy revised — "Six ink-marks" line removed; "Find your spark" + "What kind of work fits you?".
18. Quiz expanded 12 → 24 items; progress-strip cells 18px → 12px.
19. Page count 15 → 28.
20. Intro right page readability — solid paper background on marks, halftone softened to 0.3/0.2.
21. **Copy migration** — reveal/plates → career cards: "REVEAL · CAREER MATCHES", "A few paths to explore", "What stood out", "CAREER CARDS", "Discover more →", new callout, empty state, live region "Your career matches are ready below."; removed all user-facing "YOUR TYPE / TOP MARKS / PLATES / OPEN WORKBOOK".
22. **Yellow halftone bled over mobile card faces** — `.reveal .career-card { z-index: 2 }` with `isolation: isolate`.
23. **Dark cards read as flat grid cells** — opaque `--card-surface: #44372A`, border `--card-border: #A88E67`, offset shadow; `.career-card` itself now carries the surface background.
24. **Mobile tooltip overflow for right-most tally rows** — tooltip always opened right of the row and exited the viewport in the 3-column mobile tally (A, C) and full-width rows at 481–767px. Fixed with shared `attachTypeTooltip()` which measures the viewport and picks right / `--flip` (left) / `--below` placement; reveal top-3 marks now get the same tooltips (No. N · letter · name + description). Hidden (opacity 0) tooltips still extended the document's scroll width, so `html, body { overflow-x: clip }` was added — visible tooltips are always placed inside the viewport, so nothing gets clipped.
25. **Tooltips invisible on touch devices** — hover-only tooltips never appear on phones (iOS Safari doesn't focus divs on tap). Fixed: `attachTypeTooltip` picks one channel per device — pointer devices keep hover/focus; touch devices (`hover: none`) get tap-to-toggle with tap-away close (touchstart records pre-gesture state so the synthesized click can't mis-toggle). Open tooltips keep `pointer-events: none` so they never block taps on covered content.
26. **Tooltips clipped at narrow windows** — the reveal left page is `overflow: hidden` (split-scroll), so the top-3 tooltip was invisible at ~768px (iPad portrait / narrow window); `below`-mode tooltips could also be cut off at the bottom edge. Fixed: `place()` now walks up to the nearest clipping ancestor (or viewport) and picks the first placement that fits fully — right → `--flip` (left) → `--below` → new `--above` → last-resort below. Verified across 9 viewports (320–1280 × touch/hover, heights 500–1112).
27. **Collating was a ~720ms blank beat** — the collating→reveal timeout was 720ms with no visual work. Replaced with a 5s authored moment (`COLLATE_MS = 5000`): RIASEC stamp tiles fill one by one, percentage ticks 0→100% over ~4.1s, captions rotate, "Ready!" holds, then the fold to reveal (handled in `startCollate()`, called from the last quiz item's `goToNextQuizItem`). Reduced motion: instant fill + ~450ms beat. Also added `window.scrollTo(0, 0)` on entering collating and reveal so mobile never lands mid-scroll on the moment pages.

---

## Open items / known limitations in current build

- **Workbook is a stamped placeholder** (`renderWorkbookPlaceholder`). Next step: real `renderWorkbook()` for Section 1 (Description).
- **PWA service worker not yet implemented.** `index.html` registers `sw.js` via `navigator.serviceWorker.register('sw.js').catch(()=>{});` — the only console error on the live site is its 404. No offline shell yet; manifest + icon are live and correct (verified `application/manifest+json`).
- **Quiz content is demo content** — `quiz-data.js` header clearly labels all items as synthetic; replace before production.
- **Careers data is raw (id/name/letters only)** — tier, role descriptions, and day-in-life vignettes are deterministic templates computed at render time in `app.js`. Researched per-career copy (real descriptions, resources with careerexplorer.com URLs, real vignettes) is future content work; the PRODUCT.md worked example ("Genetic Counselor / Clinical Psychologist") is the content-template-of-record.
- `screenshots/to-review-for-edits.png` is a user-provided reference image, not an artifact; can be deleted once no longer needed.

---

## Deployment (GitHub Pages)

- **Live URL:** `https://clarencewongww.github.io/career-explorer/`
- **Repo:** `github.com/clarencewongww/career-explorer` (public, required for free-plan Pages)
- **Publishing source:** branch `main`, root `/` (legacy build), `.nojekyll` at root disables Jekyll per docs.
- **Redeploy:** push to `main`; Pages auto-builds (up to ~10 min to publish). Screenshots and `.DS_Store` are gitignored.
- **Verified live:** full quiz → collating → reveal → workbook flow, 4 career cards with `ABOUT THIS ROLE`, manifest `200 application/manifest+json`, Google Fonts load, dark mode. Only console error: `sw.js` 404 (known open item).
- **PWA note:** `sw.js` will register once added, giving offline support on the live https origin.

---

## Next step: Workbook Section 1 (Description)

Replace `renderWorkbookPlaceholder()` with `renderWorkbook()` for **Section 1: Description** only.

### Structure

- **Section label stamp:** `WORKBOOK · DESCRIPTION`
- **Career name plate** at the top of the left page — the selected career (`state.selectedCareer`), with its RIASEC marks displayed.
- **Guided dialogue column** on the left page: alternating `.guided-dialogue__assistant` (Bricolage, pink left border) and `.guided-dialogue__prompt` (Spectral italic) turns. Container has `aria-live: polite`.
- **Prompt block** on the right page: "Describe in your own words what this career means and what your day-to-day would look like." in Bricolage display type.
- **Ruled-line textarea** below the prompt: existing `.ruled-input` CSS (repeating-linear-gradient ruled lines, 30px row pitch, transparent background). Min 4 visible rows.
- **Resource callout** below the textarea: `.callout` with `<h4>Resources</h4>` and career links (content future work; can start from the card's role description + day-in-life vignette as base copy). `.tape` strip already styled.
- **Day-in-the-Life plate** on the right side: the reveal card already shows the synthetic vignette; the workbook can reuse the same `buildDayLife` lines as the base copy for this plate.
- **Back button** — returns to reveal (already wired via `goToReveal`).
- **Sections 2–7 are deferred** — not part of this first-build scope per the confirmed shape brief.

### Implementation outline

1. Rename `renderWorkbookPlaceholder` → `renderWorkbook` and build the Section 1 spread per the structure above.
2. Persist the student's Section 1 draft in `state.workbookContent` (per section key), so a back-and-forth between reveal and workbook doesn't lose text.
3. Verify on desktop 1440×900 and mobile 375×812 (light + dark), including the Back flow.

---

## Final step: wire full flow + README + service worker

1. `TOTAL_STEPS` = 1 + 1 + 24 + 2 = 28 (welcome + intro + 24 quiz + collating/reveal + workbook) — confirmed in app.js.
2. Ensure `foldNavigate` consistently handles Back navigation (backward page-fold) alongside Forward.
3. Add `sw.js` — minimal service worker: cache `index.html`, `styles.css`, `app.js`, `quiz-data.js`, `careers-data.js`, `public/manifest.webmanifest`, `public/icon.svg` for offline shell. Will activate on the live GitHub Pages origin.
4. ~~Write `README.md`~~ — done (committed with the initial GitHub push; see Deployment section).
5. Run finishing reviewer per impeccable skill spec §7: critique build against DESIGN.md and shape brief, list material gaps, apply fixes, re-inspect.
6. Update DESIGN.md with any settled tokens that shifted during the build.

---

## Verification pass + finish

- Desktop 1440×900 screenshot of each phase (intro → each quiz item type → collating → reveal → workbook Section 1), light + dark.
- Mobile 375×812 screenshot of each phase.
- Page-fold transition between every adjacent phase pair — verify smooth and correct direction.
- Tooltips: hover/focus every tally row and every reveal top-mark on mobile — no tooltip may exit the viewport (right/flip/below placement).
- Vision agent audit against DESIGN.md.
- Apply fixes, re-inspect.

---

## Screenshots convention

The `screenshots/` folder holds the latest visual-verification artifacts. Filenames are stable and descriptive — each round of visual verification overwrites the files in this folder with the same canonical names.

Canonical filenames:

| File | Content |
|---|---|
| `welcome-desktop.png` | Welcome page, desktop (empty form) |
| `welcome-desktop-filled.png` | Welcome page, desktop (form filled) |
| `welcome-mobile.png` | Welcome page, mobile |
| `intro-desktop.png` | Intro greeting, desktop |
| `intro-desktop-dark.png` | Intro page, desktop, dark mode |
| `intro-mobile.png` | Intro greeting, mobile |
| `intro-mobile-dark.png` | Intro page, mobile, dark mode |
| `quiz-likert-desktop.png` | Likert item, desktop |
| `quiz-scenario-desktop.png` | Scenario item, desktop |
| `quiz-cardsort-desktop.png` | Card-sort item, desktop |
| `quiz-mobile.png` | Quiz item, mobile |
| `quiz-mobile-scrolled.png` | Quiz item, mobile (scrolled to show footer) |
| `collating-desktop.png` | Collating progress mid-animation, desktop |
| `collating-mobile.png` | Collating progress mid-animation, mobile |
| `reveal-desktop.png` | Reveal, desktop |
| `reveal-desktop-dark.png` | Reveal, desktop, dark mode |
| `reveal-desktop-dark-bottom.png` | Reveal, desktop, dark (right page scrolled to bottom) |
| `reveal-mobile.png` | Reveal, mobile (full page) |
| `reveal-mobile-dark.png` | Reveal, mobile, dark mode (full page) |

Dark mode screenshots (filenames ending in `-dark.png`) are paired with their light mode counterparts — same page, same viewport, with `[data-theme="dark"]` applied.

`to-review-for-edits.png` is a user-provided reference image, not a test artifact.

The folder is not committed to git (if/when the project becomes a git repo) since these are test artifacts, not source.

---

## Key references to load when resuming

- **This file** (`HANDOVER.md`)
- `PRODUCT.md` — confirmed product truth
- `DESIGN.md` — committed visual world tokens, motion, layout rules
- `styles.css` — actual implemented tokens, all section layouts (the CSS is the live authority; DESIGN.md is the durable record)
- `app.js` — state machine; real renderers (welcome, intro, quiz, collating, reveal); `scoreRiasecProfile`, matching helpers, `attachTypeTooltip`, `ROLE_DESCRIPTIONS`/`buildRoleDescription`, `DAYLIFE_LINES`/`buildDayLife`; workbook placeholder
- `quiz-data.js` — 24 mixed-format items (12 Likert + 6 scenario + 6 card-sort), synthetic demo content
- In the skill: `reference/craft-floor.md` (load before any UI edit), `reference/new-work.md` §6 Build + §7 Inspect-and-finish

---

## One-line state for a quick pickup

"Welcome + 24-item mixed-format quiz + fixed footer + light/dark mode + 1,744-career database (window.CAREERS) + real reveal (matching, up to 4 career cards with country-agnostic role descriptions + day-in-life vignettes, dark-mode surfaces, desktop split-scroll, smart clip-aware tooltips) + 5s collating progress beat all shipped, verified, and **live on GitHub Pages** (clarencewongww.github.io/career-explorer). Workbook Section 1 (Description) is the next build — replace renderWorkbookPlaceholder. Load the impeccable skill before any UI work."
