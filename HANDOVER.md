# Career Explorer — Session Handover

> **Last updated:** Sat Aug 01 2026
> **Skill used:** Impeccable (Risograph Field Zine world) — animate playbook + craft-floor for the collating progress beat. ALWAYS load this skill first in future sessions (see How to resume, step 2).
> **Deployed:** **live on GitHub Pages** → `https://<username>.github.io/career-explorer/` (repo: `github.com/<owner>/career-explorer`, public, branch `main` + `.nojekyll`). Push to `main` to redeploy (up to ~10 min to publish).
> **Status:** Foundation + welcome + 24-item mixed-format quiz (email-validated form, intro type pick counts toward the score) + fixed footer + intro greeting + light/dark mode + careers database (1,744 roles) + **reveal build complete** (real matching, career cards with country-agnostic role descriptions + day-in-life vignettes, copy migration, dark-mode card surfaces, desktop split-scroll, smart clip-aware tooltips) + **collating progress animation** (5s stamp-tile beat) + **keep & regenerate** (students keep cards and shuffle fresh matches) + **smooth shuffle** (compact desktop cards fit one view; mobile fresh-first + auto-scroll; stamp-in feedback) + **mobile content-driven layout** (no dead space / forced scroll) + **hosted on GitHub Pages**. Workbook Section 1 is next.

---

## How to resume in a new session

1. Open a new session in the project directory (the folder that contains this file).
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
├── styles.css              ✅ Foundation stylesheet (2,766 lines) — 19+ sections, incl. §19 override for career cards (~2,150+), smart type tooltips, collating progress animation, compact desktop card scope + stamp-in keyframe, dark tokens
├── app.js                  ✅ Behavior layer (1,951 lines) — state machine, foldNavigate, renderers: welcome, intro, quiz, collating (with 5s stamp-tile progress via startCollate), real reveal (matching + career cards + keep/regenerate + viewport-aware ordering), workbook placeholder; scoring, tooltip helper
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
| **Keep & regenerate** — each card toggles kept (whole-card tap OR `.career-card__keep` stamp button, `aria-pressed`); the grid renders exactly `state.revealCardIds` so keeping NEVER reorders or swaps cards; `.reveal__shuffle` ("Show me different careers →") replaces non-kept cards via `buildShuffledPicks()` excluding `revealKeptIds` + `revealSeenIds` (zero repeats across rounds); counter chip (aria-live "N of M kept"); all-kept → `.reveal__done` "All kept — you're set!"; exhausted pool → `.reveal__exhausted` hint; `toggleKeep`/`refreshReveal` re-render in place with scroll restoration; reset on quiz retake, preserved across workbook round-trip | ✅ Verified | Harness A–O + keep-static: keep1→shuffle3→keep2→shuffle1→all-kept, 3-round zero-duplicate, keep-change-free grid, keyboard, dark, mobile, reduced motion |
| **Smooth shuffle** — desktop ≥768: compact cards (line-clamped about/daylife, ~260–265px tall) so the 2×2 grid + action bar fit the right page with NO scrolling (verified 1440×900 / 1280×800 / 1024×768: `scrollHeight == clientHeight`); grid is **slot-stable** via `state.revealCardIds` (kept cards never move; shuffle swaps only non-kept slots). Mobile <768: **fresh-first** ordering (fresh reserve slots so kept cards can't be pushed off-grid) + **auto-scroll** (smooth; instant under reduced motion) to the grid top after shuffle. Freshly changed cards get `career-card--fresh` with a 260ms stamp-in keyframe (`animation: none` under reduced motion). | ✅ Verified | Harness A–K (3 runs): desktop fit ×3 viewports, slot-stability, mobile fresh-first + landing, all-kept, exhaustion, round-trip, reset, reduced motion, dark, 0 errors, regression green |
| **Copy migration** — plates → cards terminology; "REVEAL · CAREER MATCHES", "A few paths to explore", "What stood out", "CAREER CARDS", "Discover more →", callout "Each label shows how closely a career connects with your answers…" | ✅ Verified | Grep + browser text checks |
| **Dark-mode card surfaces** — opaque `#44372A` card fill, `#A88E67` border, offset shadow; `.reveal .career-card { z-index: 2 }` stops halftone bleed over card faces | ✅ Verified | Computed styles + pixel checks |
| **Desktop split-scroll** — left reveal page steady (`overflow: hidden`), right page internal `overflow-y: auto` above fixed footer; mobile normal single-column document scroll | ✅ Verified | Scroll behavior + pixel checks |
| **Collating progress animation** — 5-second "calculation" beat after the last answer: six RIASEC stamp tiles (`R I A S E C`, ink-colored fills, scale-press stamp-in) on a paper strip fill one-by-one over ~4.1s while a pink Bricolage percentage ticks 0→100% and italic captions rotate ("Folding your answers in…", "Counting the six stacks…", …), then "Ready!" holds until the fold to reveal at 5s. `startCollate()` drives it; `role="status"` sr-only live region announces start + "Your career matches are ready."; reduced motion = instant fill + ~450ms beat. Scroll resets to top on entering collating and reveal. | ✅ Verified | Desktop + mobile mid-animation samples, reduced-motion timing (reveal ≈0.9s) |
| **Smart type tooltips** — shared `attachTypeTooltip` + `.type-tooltip` (right / `--flip` left / `--below` / `--above`, clip-aware placement); used by quiz tally rows and reveal top-3 marks. Interaction is channel-picked per device: pointer → hover/focus; touch (`hover: none`) → tap toggles, tap-away closes. Tooltip stays `pointer-events: none` even when shown so taps pass through. The open row is lifted to `z-index: 30` so `--below` tooltips paint above later siblings (the top-3 rows' transforms create stacking contexts). `aria-hidden` toggled on show/hide. | ✅ Verified | 9 viewports, touch + hover, stacking check |
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
28. **Reveal was a one-shot list of 4 careers** — students had no way to curate. Added keep & regenerate: whole-card tap + `.career-card__keep` stamp (aria-pressed) toggle `state.revealKeptIds`; `.reveal__shuffle` merges shown ids into `state.revealSeenIds` and re-renders fresh picks (never repeats); kept cards pin to the front of the grid (`keptPicks.concat(freshPicks).slice(0,4)`); counter "N of M kept" is aria-live; all-kept → done note; empty pool → exhausted hint; `refreshReveal()` preserves right-page scrollTop + window.scrollY; resets on retake (`goToQuiz`/`goToIntro`/`goToWelcome`), preserved across workbook round-trip. Verified with a 15-section harness (user's exact keep→shuffle sequence, zero duplicates across 3 shuffle rounds, keyboard, dark, mobile, reduced motion) + full regression.
29. **Shuffling meant scrolling for the new cards** — kept-front pinning + tall cards meant new suggestions landed below the fold. Fixed with a viewport-aware smooth-shuffle: desktop ≥768 gets a compact card scope (line-clamped blurb/vignette, tighter paddings; cards ~260–265px) so all 4 cards + action bar fit the right page with zero scrolling (measured `scrollHeight == clientHeight` at 1440×900 / 1280×800 / 1024×768); ordering is slot-stable via `state.revealCardIds` (kept cards stay in their slots; shuffle swaps only non-kept slots). Mobile <768 sorts **fresh-first** (fresh reserve slots so kept cards can never be pushed off-grid) and auto-scrolls (smooth, instant for reduced motion) to the grid top after a shuffle; fresh cards stamp in via `career-card--fresh` (260ms keyframe, disabled under reduced motion). Two real bugs were caught during the parallel build: compact overflowed at 1280/1024 (fixed by further tightening + line clamps) and the literal `freshPicks.concat(keptPicks).slice(0,4)` dropped kept cards when ≥4 fresh existed (fixed by reserving slots).
30. **Keeping a card reordered/swapped the grid** — `renderReveal` re-derived picks on every render, so a keep toggle on mobile re-sorted cards fresh-first and could swap content. Fixed: the grid now renders EXACTLY `state.revealCardIds` (declarative); keeping only flips the kept flag (`renderCareerCard(pick, kept, fresh)`); ordering logic moved into `buildShuffledPicks()`, called only by the shuffle handler, which stashes the previous order in `state.revealPrevCardIds` for the stamp-in detection. Verified: keep/unkeep changes zero names and zero positions on desktop AND mobile; shuffle still swaps in place on desktop and fresh-first on mobile.
31. **Mobile top-3 tooltips hidden behind the next row** — `.reveal__topmark` rows have `transform: rotate(±0.6deg)`, which creates a stacking context that trapped the `--below` tooltip (z-index 10) below the NEXT row in DOM order (iPhone single-column layout). Fixed in `attachTypeTooltip`: while a tooltip is open the row itself is lifted to `z-index: 30` (cleared on hide), so the tooltip paints above sibling rows and the career cards (z-index 2). Verified on 375×812 touch (tap each row — tooltip fully on top, overlapping row visible beneath) + desktop hover + tooltip regression suite.
32. **Welcome accepted any email** — the email field took any text. Now validated on submit: a non-empty value must match a basic email pattern (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`); blank is allowed. Invalid → inline `.welcome__error` (role=alert), `aria-invalid` on the input, focus returned; the error clears as the student types. Verified: invalid blocks, valid/blank proceed.
33. **Intro type pick didn't count toward the score** — tapping a RIASEC mark on intro just started the quiz. It now records `state.initialType` and `scoreRiasecProfile` adds +1 to that letter, so the pick shows up in the in-quiz tally and the final profile (and the test-skip demo profile). Reset with a full restart (`goToWelcome`).
34. **Mobile pages had dead space / forced scrolling** — `.zine__page { min-height: 50vh }` plus stretched rows forced every stacked page past one viewport. Mobile now: pages hug content (`.zine { min-height: 0; gap: 10px }`, `.journey .zine { flex: 0 1 auto }`, tighter page padding + quiz callout margin) so short phases (quiz items, intro→collating) fit the screen and only scroll when content genuinely overflows. The collating beat keeps a full-screen moment via `.zine.collating { min-height: calc(100vh - 32px) }`. Verified at 375×812: quiz/collating/welcome docH = viewport + 40px footer pad (no forced scroll), reveal scrolls only for real content; footer (incl. the test-only skip button) fits without overflow.
35. **Polish pass on mobile** — (a) the fixed footer was 32px tall while its 44px-min buttons overflowed it vertically at every width; the mobile bar is now 44px so Back/theme/skip/page all fit with zero overflow (verified 320–430px). (b) Fitting pages still scrolled 40px because `body { padding-bottom: 40px }` always added scroll height; the clearance moved into the content — `body` padding is 0 on mobile and `.reveal .career-cards` gets `padding-bottom: 64px` so the last CTA clears the 44px footer — docH now equals the viewport exactly on fitting pages (no scroll at all). (c) Tooltips on mobile: tapping the row toggles, and tapping the OPEN tooltip itself closes it (`pointer-events: auto` while visible + click-to-close with stopPropagation; hidden tooltips stay pointer-events none), instead of the tap leaking to the row beneath and opening that row's tooltip.
36. **Footer now 44px on ALL viewports + dynamic viewport heights** — (a) the 44px bar fix applied to desktop too (the 32px bar let the 44px-min buttons overflow it at every width); `calc(100vh - 32px)` references became `calc(100vh - 44px)` and the body clearance 48px. (b) Fitting pages still rubber-banded / scrolled on real phones: `100vh` sizes to the LARGEST viewport (address-bar hidden), so pages were taller than the visible area. All viewport-sized rules now use `100dvh` (dynamic viewport height, with `100vh` fallback): body, .journey, .zine, .zine.reveal (desktop), .zine.collating, welcome — pages size to the VISIBLE area so fitting content never scrolls. (c) Tooltip touch logic rewritten to be media-query-independent: `touchstart` toggles directly (works on phones AND hybrids where `(hover: none)` lies), with a 600ms guard that ignores synthesized hover events following a tap; hover/focus path unchanged for pointer devices. Verified: press→open, press→close, tooltip-press→close (next row untouched), tap-away→close on phone + hybrid contexts; desktop hover intact; tooltips never clip (9-viewport sweep).
37. **iOS Safari: quiz pages wouldn't scroll + elastic on fitting pages** — `html, body { overflow-x: clip }` (added to hide hidden-tooltip ghost overflow) breaks vertical scrolling and rubber-band behavior on iOS. The clip moved to `.journey { overflow-x: clip }` — same ghost containment (verified zero horizontal overflow + tooltips never clipped), but the document scroller is untouched. Added `overscroll-behavior-y: contain` on html for Android/Chrome bounce. Tooltips also gained a **mouse-click toggle on the row** (guarded by the 600ms touch window so synthesized clicks after taps don't double-toggle) — pressing the element a second time with a trackpad/mouse now closes it, exactly like touch. Verified: tall quiz items (13/17) scroll to their max with no horizontal overflow; fitting items (0) don't scroll; mouse hover→open, click→close, click→open; phone tap→open, tap→close.
38. **"Tap again to dismiss" scraped + REAL cause of the flaky tooltip found** — pressing the row a second time no longer does anything (unreliable on real devices). Tooltips now carry a **tiny hint line, "Tap elsewhere to dismiss"** (9px, dashed divider, shown ONLY on touch/coarse pointers via `@media (hover: none), (pointer: coarse)`). The real bug behind the old behavior: on touch, the opening tap's **synthesized click** (fires ~0–30ms after touchend) hit-tests the tooltip's *visual mid-transition position* — the tooltip's entrance transform (`translate(0,-50%)` → `translateY(4px)`) interpolates over 180ms, so for the first ~30ms the tooltip sits ON TOP OF THE FINGER → the click landed on the tooltip → its press-to-close handler closed it instantly. Fixed by gating the tooltip's click handler with the same 600ms touch window (synthesized post-tap clicks ignored; deliberate tooltip presses still close). This also explains the on-again/off-again behavior the user saw. Verified: tap→opens and STAYS open, second tap→no-op, tap-away→closes, hint visible (phone) / hidden (desktop); full regression + 9-viewport sweep pass.
39. **Light mode is now the default** — new visitors (no saved preference) get light mode regardless of the OS `prefers-color-scheme`. `getCurrentTheme()` no longer consults `matchMedia`; a saved choice (via the ☾/☀ toggle) still wins and persists in localStorage. Verified: OS-dark + no pref → light; OS-light + no pref → light; saved dark → dark; toggle → flips both ways.
40. **Per-career "About this role" + "Day in the life" for all 1,515 careers** — previously every card showed the same 6 RIASEC-letter template blurbs. Now: (a) **careers-data.js deduped** 1,743 → 1,515 by merging plural/singular twins (`Actor`/`Actors`, `Actuary`/`Actuaries`, 228 removed); the reveal copy reads `window.CAREERS.length` so counts self-update. (b) **career-copy.js (new, ~542 KB raw / ~152 KB gzipped)** — `window.CAREER_COPY = { id: { about, day: [3 lines] } }`, generated ONCE by 10 parallel agents under a strict style guide (plain factual, country-agnostic, no salary/currency/education references, about 100–150 chars, day lines 55–90 chars, no first/second person). (c) **Lazy-loaded** — `ensureCareerCopy()` injects `career-copy.js` only when the reveal phase first renders; cards fall back to the letter templates until it arrives and the reveal re-renders on load (fallback also covers a failed fetch). `buildRoleDescription`/`buildDayLife` prefer `CAREER_COPY[id]`. QA: id coverage 1,515/1,515, zero duplicates, zero length/structure violations, forbidden-word sweep clean (only name-substring false positives like `harbor-master`/`university-professor` ids), cards verified showing per-career copy (phone + desktop), full regression suites green. Agent-run caveats: 5 of 10 first-wave agents returned empty results (never wrote their file) — recovered by re-running with smaller chunks; one agent's chunk (06) shipped ~80 day lines under the 55-char minimum and was replaced by a clean parallel pass (06a/06b).
41. **Career search on the reveal page** — a "SEARCH A CAREER" box (right page, above the cards) live-filters the 1,515 careers (space/hyphen-insensitive matching; prefix/exact-name matches rank first, e.g. "carpenter" → Carpenter before "Cabinetmakers and Bench Carpenters"). Picking a result **replaces the first unkept card** (or appends when the grid has room); the swapped-out career joins `revealSeenIds` so shuffles don't re-offer it; the searched pick keeps `revealPrevCardIds`/fresh stamp-in. Guards: career already on the board → "already on your board" note; all cards kept → "unkeep one to make room". Input keeps focus after the swap; note is aria-live. Verified phone (kept card untouched, slot 2 replaced with Zoo Keeper, full card shape incl. tier) + desktop + all-kept + already-shown.
42. **"See more / See less" on career cards + collating copy** — (a) About + day-life blurbs are now clamped short by default on ALL viewports (about 2 lines / day 1 line mobile; the existing 1-line teasers on desktop compact) with a **See more** control that expands the full text (`.career-card--expanded` unclamps and unhides the compact-hidden 3rd vignette line), toggling back to **See less** with `aria-expanded`; expanded state persists across keep/shuffle re-renders (`expandedCardIds` by career id) and never toggles keep (stopPropagation + closest guard). The control shares a `.career-card__cta-row` with "Discover more →" so it adds ZERO card height — the 1440×900 compact fit still measures `scrollHeight == clientHeight`; at spread widths (1024/1280) the row wraps once and the right page uses its built-in internal scroll (~58–78px). (b) Collating copy no longer says "stacking": label `STACKING` → `TALLYING`, sr-only status → "Tallying your answers…", caption "Counting the six stacks…" → "Tallying the six letter themes…".
43. **"What stood out" rows equalized (twice)** — rows were `width: fit-content` so each followed its word length and read like ranking bars. First pass made them `width: 100%` (full column); user found full-width too blocky. Final: `.reveal__topmarks { width: fit-content; max-width: 100% }` + rows `width: 100%` — all three rows match the WIDEST row's length (178–190px across 375/768/1024/1440), never the full column, never ragged. Tooltips still place correctly; regression green.
44. **KEEP stamp no longer covers long career names** — `.career-card__keep` was `position: absolute; top: 10px; right: 10px` over the top-right corner, so multi-line names (e.g. "Woodworking Machine Setters, Operators, and Tenders, Except Sawing") ran underneath it. The stamp now lives at the end of a new `.career-card__name-row` flex line (name `flex: 1 1 auto; min-width: 0` wraps in its own space, stamp `flex: 0 0 auto` keeps its rotated paper-stamp look, 44px target, KEPT ✓ state, dark-mode overrides). Verified: name box vs stamp rect gap ≈ 10.7px in BOTH kept and unkept states at 375/1024/1440 for 2–5 line names; whole-card tap still toggles keep; stamp tap still toggles without double-fire.
45. **"See more / See less" only when words are actually hidden** — the control was on every card, but on narrow views the full-width cards show all the copy, so a "See more" that revealed nothing was misleading. (a) Mobile (≤767px) clamps were REMOVED — mobile cards always show the full about + all 3 day-life lines, no control. (b) Desktop compact keeps its teaser clamps (1-line about/day + hidden 3rd vignette line), and a new post-render pass `finalizeCardExpansion()` measures each card's copy (scrollHeight vs clientHeight, display:none counts as truncated) and shows the button ONLY when the collapsed card truncates words; a debounced resize listener re-evaluates when crossing breakpoints (verified: 1440→4 buttons, 375→0 buttons, back→4). Expanded state still persists across keep/shuffle re-renders and the button text/aria stay correct. Suites green.
46. **Intro pick wins ties + demo-profile mutation fixed** — (a) `getUserTopLetters` now treats the intro "best describes you" pick as the student's stated identity: on a score tie the pick outranks the other letter (ties elsewhere still fall back to RIASEC order). Verified: pick I + skip → I at No. 1 (R5 I5 tie); pick R → R, I, A unchanged; pick A → R, A, I (A ties I at 2nd). (b) `skipToCollating` was doing `profile = DEMO_PROFILE; profile[pick] += 1` — mutating the shared constant so every later skip permanently inflated that letter. Now clones (`Object.assign({}, DEMO_PROFILE)`) before the +1; verified profile stays R5 I5 across repeated skips.
47. **Split-scroll for every phase + mobile footer clearance + opaque light cards + name-required welcome + "Explore Careers" rebrand** — (a) **Split-scroll now applies to ALL phases on ≥768px**, not just the reveal: `.zine` is fixed at `calc(100dvh - 44px)` above the footer, every `.zine__page` is `height: 100%` with internal `overflow-y: auto` (`overscroll-behavior: contain`, `scroll-padding-bottom`, touch smoothing), the left page stays steady (`overflow: hidden`), the right page scrolls — no full-page scrolling on wide screens for intro/quiz/collating/reveal. The clip-aware `place()` tooltip logic already constrains to the left page's box, so tally/top-3 tooltips flip/below as needed and are never clipped (verified by the 9-viewport sweep: 81/81 probes in-viewport, zero clipped — rows 3–4 of the 768–834px tally now flip left, which is exactly the clip box working). (b) **Footer clearance moved into content**: `body { padding-bottom: 0 }` (fitting pages never full-page scroll); mobile right pages get `padding-bottom: 72px` so the last quiz option / card CTA always clears the fixed 44px footer; the old `.reveal .career-cards { padding-bottom: 64px }` mobile rule was removed in favor of the page-wide padding. (c) **Light-mode card surface now opaque** — `.reveal { --card-surface: var(--paper) }` (was `--paper-deep`), matching the dark-mode opaque treatment so the halftone field never bleeds through card faces. (d) **Name required on the welcome form** — submitting with an empty name shows a new `.welcome__error` ("Please enter your name to begin.", `role=alert`), sets `aria-invalid` + focus on the input, and clears as the student types; email remains optional-but-valid. (e) **Brand renamed "Career Explorer" → "Explore Careers"** — welcome stamp ("WELCOME · EXPLORE CAREERS"), `<title>`, noscript text, manifest `name`/`short_name` ("Explore Careers"/"Explore"), and `public/icon.svg` updated to match. Verified by verify-batch6 (14/14) + full regression suites green. ⚠️ Regression note from this session's verification: the Playwright sweep `sweep2.cjs` FATALed tapping `.riasec-tally__heading` on touch — the open tooltip (taller since the touch-only "Tap elsewhere to dismiss" hint) is vertically centered on its row and its top overhang covers the heading, so the dismissal tap hit the tooltip and timed out. This reproduces at HEAD (batch fully reverted) and at mobile viewports where the new overflow rules don't apply — the batch is NOT the cause. Product placement is correct (tooltips never clipped; tap-elsewhere dismisses); the fix was harness-side: dismiss by tapping the page background at (10,10) and assert every `.type-tooltip` closed before the next row.
48. **Collating copy + dark-mode search/layer lift + left-page internal scroll + Career Explorer logo & brand** — (a) **Collating copy** says "collating", not "folding": caption 0 in `COLLATE_CAPTIONS` is "Collating your answers…" and the right-page paragraph reads "We're collating your answers into your RIASEC profile. Four careers are about to surface." (the sr-only "Tallying your answers…" status is untouched). (b) **Dark-mode search field** uses the card tokens — `.reveal__search` is `background: var(--card-surface)` / `border: 1.5px dashed var(--card-border)`, so in dark mode it renders fully opaque `#44372A` exactly like the career cards (light mode unchanged: solid paper + paper-shadow border). (c) **Right-page (and left-page) content paints above the halftone dots** — `.zine__page--right > *` and `.zine__page--left > *` get `position: relative; z-index: 2` (plus `.reveal__actions > *` for the nested shuffle button / kept counter / helper copy), so in dark mode the screen-blended dots can never sit over the labels, actions, or counter; a guard keeps the intro `.halftone-band` absolutely positioned behind the headline. (d) **Desktop left page scrolls internally for tall content** — `.zine__page--left` in the ≥768px split-scroll block is now `overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; -webkit-overflow-scrolling: touch`, and `.journey .zine` no longer flex-grows (`flex: 0 1 auto`), so long scenario prompts (e.g. item 13 "science class") overflow the panel and scroll inside the left page instead of scrolling the document at short-wide viewports (verified: 1440×600 left scrollHeight 789 > client 556, scrollTop reaches 233; right page scrolls internally on tall likert items; full 9-suite regression incl. the tooltip sweep green). (e) **Logo + brand restored to "Career Explorer"** — `public/icon.svg` stamp is now a two-line rotated **CAREER / EXPLORER** pink stamp surrounded by six career emojis (🛠️🎨🤝💼🔬🗂️); `<title>` → "Career Explorer", noscript copy updated, manifest `name`/`short_name` → "Career Explorer"/"Careers", and the welcome stamp reads "WELCOME · CAREER EXPLORER". Verified by verify-batch7 (16/16) + full regression suites green.
49. **Scenario questions now show their own tip callout — "Imagine it really happening — pick the reaction that feels most like you." — instead of the generic "Almost there."** (quartile tips unchanged for likert/cardsort).

---

## Open items / known limitations in current build

- **TEST-ONLY: "Skip quiz →" footer shortcut** — `skipToCollating()`, the `.app-footer__test` button + CSS, and the `renderFooter(..., true)` call in renderQuiz are marked `⚠️ REMOVE before final deployment`; the skip uses partial answers only when ≥8 answered, else a fixed demo profile (`R5 I4 A3 S2 E1 C0`), and logs its choice to the console.
- **Workbook is a stamped placeholder** (`renderWorkbookPlaceholder`). Next step: real `renderWorkbook()` for Section 1 (Description).
- **PWA service worker not yet implemented.** `index.html` registers `sw.js` via `navigator.serviceWorker.register('sw.js').catch(()=>{});` — the only console error on the live site is its 404. No offline shell yet; manifest + icon are live and correct (verified `application/manifest+json`).
- **Quiz content is demo content** — `quiz-data.js` header clearly labels all items as synthetic; replace before production.
- **Careers data is raw (id/name/letters only)** — tier, role descriptions, and day-in-life vignettes are deterministic templates computed at render time in `app.js`. Researched per-career copy (real descriptions, resources with careerexplorer.com URLs, real vignettes) is future content work; the PRODUCT.md worked example ("Genetic Counselor / Clinical Psychologist") is the content-template-of-record.
- `screenshots/to-review-for-edits.png` is a user-provided reference image, not an artifact; can be deleted once no longer needed.

---

## Deployment (GitHub Pages)

- **Live URL:** `https://<username>.github.io/career-explorer/`
- **Repo:** `github.com/<owner>/career-explorer` (public, required for free-plan Pages)
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
| `reveal-kept-desktop.png` | Reveal with kept cards + action bar, desktop |
| `reveal-kept-mobile.png` | Reveal with a kept card + action bar, mobile |
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

"Welcome (name required) + 24-item mixed-format quiz + fixed footer + light/dark mode + 1,744-career database (window.CAREERS) + real reveal (matching, up to 4 career cards with country-agnostic role descriptions + day-in-life vignettes, opaque light/dark surfaces, smart clip-aware tooltips, keep & regenerate with zero-repeat shuffles, smooth shuffle: compact desktop cards fit one view, mobile fresh-first + auto-scroll, stamp-in) + split-scroll on ALL wide-screen phases (left steady, right internal scroll, no full-page scroll) + mobile footer clearance (last quiz option/CTA above the bar) + 5s collating progress beat + **Explore Careers** rebrand (icon/manifest/title) all shipped, verified, and **live on GitHub Pages** (`<username>.github.io/career-explorer`). Workbook Section 1 (Description) is the next build — replace renderWorkbookPlaceholder. Load the impeccable skill before any UI work."
