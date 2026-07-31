# Career Explorer

A RIASEC-based career quiz and guided workbook for middle-school students. Take a 24-item mixed-format quiz, see your top career matches as zine-style career cards, and pick one to explore in depth.

Visual world: **Risograph Field Zine** — warm paper, fluorescent riso inks, halftone textures, and hand-set display type (Bricolage Grotesque + Spectral). No build step, no server, no dependencies.

## Run it

Open `index.html` in a browser. That's it.

For testing the PWA/service worker behavior, serve the folder locally:

```sh
python3 -m http.server
# http://localhost:8000
```

## Project layout

| File | Purpose |
|---|---|
| `index.html` | Entry point; loads `quiz-data.js` → `careers-data.js` → `app.js` |
| `app.js` | Behavior layer: state machine, page-fold navigation, quiz, collating animation, reveal matching + career cards, workbook placeholder |
| `styles.css` | All styling — zine tokens, halftone, layouts (incl. §19 reveal override) |
| `quiz-data.js` | The 24 quiz items (12 Likert + 6 scenario + 6 card-sort) — **demo content**, replace before production |
| `careers-data.js` | 1,744 careers with RIASEC codes (`window.CAREERS`) |
| `public/` | PWA manifest + app icon |
| `PRODUCT.md`, `DESIGN.md`, `HANDOVER.md` | Product truth, visual world, session handover |

## Extending

- **Careers:** edit `careers-data.js` (each entry: `{ id, name, letters }`). Tier, role description, and day-in-life copy are generated at render time from the career's RIASEC letters — per-career researched copy is planned content work.
- **Quiz:** edit `quiz-data.js`.
- **Matching:** the reveal logic (`scoreCareerMatch`, `getCareerTier`, `pickRevealCareers` in `app.js`) computes up to 4 tiered picks from the user's top letters.
- **Workbook:** Sections 2–7 (Your Drivers, Your Strengths, Your Growth, Pros and Cons, Immediate Preparation, Degree Preparation) and saved progress are planned but not built.

## Planned but not built

- Workbook Section 1 (Description) real implementation (currently a stub)
- Offline support via `sw.js` (registered but not yet present)
- Browse-all-careers surface
