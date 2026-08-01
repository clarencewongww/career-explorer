/* ═══════════════════════════════════════════════════════════════════════════
   Career Explorer — Behavior Layer
   Plain vanilla JS, no modules, runs via file:// URL
   ═══════════════════════════════════════════════════════════════════════════ */

// ─── State ────────────────────────────────────────────────────────────────

let state = {
  phase: 'welcome',
  user: { name: '', email: '' },
  quizIndex: 0,
  quizAnswers: {},
  riasecProfile: null,
  selectedCareer: null,
  workbookContent: {},
  revealKeptIds: [],
  revealSeenIds: [],
  revealCardIds: [],
  revealPrevCardIds: null,
  initialType: null
};

const TOTAL_STEPS = 1 + 1 + (window.QUIZ_ITEMS ? window.QUIZ_ITEMS.length : 0) + 2; // 1 welcome + 1 intro + N quiz + 1 collating/reveal + 1 workbook

function getState() {
  return { ...state };
}

function setState(partial) {
  Object.assign(state, partial);
}

// ─── RIASEC type data ─────────────────────────────────────────────────────

const RIASEC_TYPES = [
  { letter: 'R', name: 'Realistic',      desc: 'Working with tools, machines, and the outdoors.' },
  { letter: 'I', name: 'Investigative',  desc: 'Figuring out how things work, asking why.' },
  { letter: 'A', name: 'Artistic',       desc: 'Making things — writing, drawing, performing, designing.' },
  { letter: 'S', name: 'Social',         desc: 'Helping, teaching, listening, and being with people.' },
  { letter: 'E', name: 'Enterprising',   desc: 'Leading, persuading, building and selling ideas.' },
  { letter: 'C', name: 'Conventional',   desc: 'Organizing, sorting, and getting the details right.' }
];

// ─── Scoring function ─────────────────────────────────────────────────────

// Sum RIASEC letter weights across all answers; returns { R, I, A, S, E, C }
function scoreRiasecProfile(quizAnswers) {
  var profile = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  if (!window.QUIZ_ITEMS) return profile;
  for (var i = 0; i < window.QUIZ_ITEMS.length; i++) {
    var item = window.QUIZ_ITEMS[i];
    var ans = quizAnswers[item.id];
    if (ans == null) continue;
    if (item.type === 'likert') {
      // ans is 1-5; 4 or 5 counts as +1
      if (ans >= 4) profile[item.letter] = (profile[item.letter] || 0) + 1;
    } else {
      // scenario / cardsort: ans is the index of the chosen option
      var opt = item.options[ans];
      if (opt && opt.letter) profile[opt.letter] = (profile[opt.letter] || 0) + 1;
    }
  }
  // The intro's initial "best describes you" pick counts toward the profile.
  if (state.initialType && profile[state.initialType] != null) {
    profile[state.initialType] += 1;
  }
  return profile;
}

// ─── Reveal helpers ────────────────────────────────────────────────────────
// Deterministic career matching against the user's top RIASEC letters.
// The canonical RIASEC order (R, I, A, S, E, C) breaks ties.

var RIASEC_ORDER = ['R', 'I', 'A', 'S', 'E', 'C'];

// Adjacent letters on the RIASEC hexagon — used for the +0.5 "adjacent fit" bonus
var RIASEC_ADJACENT = {
  R: ['I', 'C'],
  I: ['R', 'A'],
  A: ['I', 'S'],
  S: ['A', 'E'],
  E: ['S', 'C'],
  C: ['E', 'R']
};

function riasecRank(letter) {
  for (var i = 0; i < RIASEC_ORDER.length; i++) {
    if (RIASEC_ORDER[i] === letter) return i;
  }
  return RIASEC_ORDER.length;
}

function riasecName(letter) {
  for (var i = 0; i < RIASEC_TYPES.length; i++) {
    if (RIASEC_TYPES[i].letter === letter) return RIASEC_TYPES[i].name;
  }
  return letter;
}

function riasecDesc(letter) {
  for (var i = 0; i < RIASEC_TYPES.length; i++) {
    if (RIASEC_TYPES[i].letter === letter) return RIASEC_TYPES[i].desc;
  }
  return '';
}

// ─── Type-tooltip helper ────────────────────────────────────────────────────
// Shared by the quiz RIASEC tally rows and the reveal top-3 marks. Hover/focus
// reveals the tooltip (aria-hidden toggled for assistive tech) and picks a
// placement that keeps it inside the viewport and any clipping ancestor:
//   default — to the right of the row
//   type-tooltip--flip  — to the left, when the right side would overflow
//   type-tooltip--below — below the row, when both sides would overflow
//   type-tooltip--above — above the row, when there is no room below
function attachTypeTooltip(row, tooltip) {
  row.setAttribute('tabindex', '0');
  function place() {
    var w = tooltip.offsetWidth || 180;
    var h = tooltip.offsetHeight || 90;
    var vw = document.documentElement.clientWidth;
    var vh = window.innerHeight;
    var r = row.getBoundingClientRect();
    // Respect the nearest clipping ancestor (e.g. the reveal left page is
    // overflow:hidden for the split-scroll), else the viewport.
    var clip = { left: 0, right: vw, top: 0, bottom: vh };
    var el = row.parentElement;
    while (el && el !== document.body && el !== document.documentElement) {
      var cs = getComputedStyle(el);
      if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
        var cr = el.getBoundingClientRect();
        clip.left = Math.max(clip.left, cr.left);
        clip.right = Math.min(clip.right, cr.right);
        clip.top = Math.max(clip.top, cr.top);
        clip.bottom = Math.min(clip.bottom, cr.bottom);
        break;
      }
      el = el.parentElement;
    }
    clip.left += 8; clip.right -= 8; clip.top += 8; clip.bottom -= 8;
    function fits(x1, x2, y1, y2) {
      return x1 >= clip.left && x2 <= clip.right && y1 >= clip.top && y2 <= clip.bottom;
    }
    function centeredY() {
      return [r.top + (r.height - h) / 2, r.top + (r.height + h) / 2];
    }
    tooltip.classList.remove('type-tooltip--flip', 'type-tooltip--below', 'type-tooltip--above');
    var cy = centeredY();
    if (fits(r.right + 14, r.right + 14 + w, cy[0], cy[1])) return; // default: right of the row
    if (fits(r.left - 14 - w, r.left - 14, cy[0], cy[1])) {
      tooltip.classList.add('type-tooltip--flip');
      return;
    }
    var spanX = Math.max(r.right, r.left + w);
    if (fits(r.left, spanX, r.bottom + 10, r.bottom + 10 + h)) {
      tooltip.classList.add('type-tooltip--below');
      return;
    }
    if (fits(r.left, spanX, r.top - 10 - h, r.top - 10)) {
      tooltip.classList.add('type-tooltip--above');
      return;
    }
    tooltip.classList.add('type-tooltip--below'); // last resort
  }
  function show() {
    // The row's transform creates its own stacking context, which would trap
    // the tooltip below later siblings (e.g. the next topmark row on mobile).
    // Lift the row itself while the tooltip is open so it paints on top.
    row.style.zIndex = 30;
    place();
    tooltip.setAttribute('aria-hidden', 'false');
  }
  function hide() {
    row.style.zIndex = '';
    tooltip.setAttribute('aria-hidden', 'true');
  }
  // Touch: a press opens the tooltip. Pressing the row again does NOT toggle
  // it closed (unreliable on real devices) — the tooltip carries a tiny hint
  // telling users to tap anywhere else to dismiss. Synthesized hover events
  // that follow a tap are ignored for a short window so they can't re-open or
  // close the tooltip right after the press.
  var lastTouchAt = 0;
  row.addEventListener('touchstart', function () {
    lastTouchAt = Date.now();
    if (tooltip.getAttribute('aria-hidden') !== 'false') {
      show();
    }
  });
  // A press anywhere else closes the open tooltip.
  document.addEventListener('click', function (e) {
    if (tooltip.getAttribute('aria-hidden') === 'false' && !row.contains(e.target)) {
      hide();
    }
  });
  // A mouse click on the row opens it too (trackpad/mouse users "tap" with
  // clicks — touchstart never fires for them). Clicking again while open does
  // nothing; they dismiss by moving the pointer away or clicking elsewhere.
  // Synthesized clicks that follow a real touch gesture are ignored so the
  // open-on-press isn't doubled.
  row.addEventListener('click', function () {
    if (Date.now() - lastTouchAt < 600) return;
    if (tooltip.getAttribute('aria-hidden') !== 'false') {
      show();
    }
  });
  // Pressing the open tooltip closes it (and never toggles the row beneath
  // it, thanks to stopPropagation). Clicks inside the 600ms touch window are
  // synthesized by the browser right after the opening tap — while the
  // tooltip's entrance transform is still mid-transition it sits over the
  // finger, so an ungated click would hit the tooltip and close it instantly.
  // Hidden tooltips keep pointer-events: none so they never intercept anything.
  tooltip.addEventListener('click', function (e) {
    e.stopPropagation();
    if (Date.now() - lastTouchAt < 600) return;
    hide();
  });
  // Hover/focus for pointer devices.
  row.addEventListener('mouseover', function () {
    if (Date.now() - lastTouchAt < 600) return;
    show();
  });
  row.addEventListener('mouseout', function () {
    if (Date.now() - lastTouchAt < 600) return;
    hide();
  });
  row.addEventListener('focus', function () {
    if (Date.now() - lastTouchAt < 600) return;
    show();
  });
  row.addEventListener('blur', function () {
    if (Date.now() - lastTouchAt < 600) return;
    hide();
  });
}

// Normalize a career's RIASEC letters: accepts an array (['R','I','A']) or a string ('RIA')
function careerLetters(career) {
  var letters = career && career.letters;
  if (typeof letters === 'string') return letters.split('').slice(0, 3);
  return Array.isArray(letters) ? letters.slice(0, 3) : [];
}

// 1-based rank of a letter within the user's top letters; 0 when absent
function topRank(letter, topLetters) {
  for (var i = 0; i < topLetters.length; i++) {
    if (topLetters[i] === letter) return i + 1;
  }
  return 0;
}

/**
 * Rank the user's profile into up to three top letters.
 * Descending score; ties broken by canonical RIASEC order (R, I, A, S, E, C).
 * @param {Object} profile  { R, I, A, S, E, C } scores from scoreRiasecProfile
 * @return {string[]}  up to 3 letters, best first
 */
function getUserTopLetters(profile) {
  // The intro's "best describes you" pick is the student's stated identity:
  // when a letter ties with the pick, the pick wins (ties elsewhere fall
  // back to canonical RIASEC order).
  var pick = state.initialType;
  var ranked = RIASEC_ORDER.slice().sort(function (a, b) {
    var diff = (profile[b] || 0) - (profile[a] || 0);
    if (diff !== 0) return diff;
    if (a === pick && b !== pick) return -1;
    if (b === pick && a !== pick) return 1;
    return riasecRank(a) - riasecRank(b);
  });
  return ranked.slice(0, 3);
}

/**
 * Score how well a career fits the user's top letters.
 *
 * Match rules (career letter → direct match):
 *   primary   +3 when it is the user's #1, +2 when #2 or #3
 *   secondary +1.5 when the user's #1 or #2, +1 when #3
 *   tertiary  +1 when the user's #1 or #2, +0.5 when #3
 * The +0.5 adjacency bonus applies only when the career has no
 * direct match at all: if none of its letters is in the user's top
 * letters but one of their adjacent hexagon letters is, it earns
 * at most a single +0.5 for the whole career.
 *
 * @param {Object} career      { id, name, letters }
 * @param {string[]} topLetters  user's top letters (best first)
 * @return {number}  cumulative match score (0 when no relationship)
 */
function scoreCareerMatch(career, topLetters) {
  var letters = careerLetters(career);
  var score = 0;
  var hasDirectMatch = false;

  for (var i = 0; i < letters.length; i++) {
    var rank = topRank(letters[i], topLetters);
    if (rank === 0) continue; // no direct match
    hasDirectMatch = true;
    if (i === 0) {
      score += rank === 1 ? 3 : 2;
    } else if (i === 1) {
      score += rank <= 2 ? 1.5 : 1;
    } else {
      score += rank <= 2 ? 1 : 0.5;
    }
  }

  // Adjacent fit bonus — only when the career has no direct match at all,
  // and then at most a single +0.5 for the whole career.
  if (!hasDirectMatch) {
    for (var j = 0; j < letters.length; j++) {
      var neighbors = RIASEC_ADJACENT[letters[j]] || [];
      for (var k = 0; k < neighbors.length; k++) {
        if (topRank(neighbors[k], topLetters) !== 0) {
          score += 0.5;
          return score;
        }
      }
    }
  }

  return score;
}

/**
 * Descriptive tier for a career card — strength of fit, not a rank.
 * @return {string}  'strong' | 'good' | 'adjacent'
 */
function getCareerTier(career, topLetters) {
  var score = scoreCareerMatch(career, topLetters);
  if (score >= 3) return 'strong';
  if (score >= 1) return 'good';
  return 'adjacent';
}

// Conservative irregular singular forms for the -f/-fe → -ves plurals.
// Only exact, well-known English irregulars are mapped so that ordinary
// plural words like "executives" are not over-normalized.
var CAREER_IRREGULAR_SINGULARS = {
  wives: 'wife', midwives: 'midwife', housewives: 'housewife',
  lives: 'life', knives: 'knife', halves: 'half', wolves: 'wolf',
  leaves: 'leaf', calves: 'calf', thieves: 'thief', shelves: 'shelf',
  loaves: 'loaf', selves: 'self'
};

/**
 * Conservative normalized-name key used to deduplicate singular/plural career
 * variants (e.g. "Actor" vs "Actors") before card selection. Only the final
 * word is touched, and only for common English plural suffixes, so genuinely
 * different names keep distinct keys.
 * @param {string} name  Career name
 * @return {string}  lower-cased key
 */
function normalizeCareerNameKey(name) {
  var s = String(name || '').toLowerCase().replace(/\s+/g, ' ').trim();
  var words = s.split(' ');
  var last = words[words.length - 1];
  if (last.length > 3) {
    if (CAREER_IRREGULAR_SINGULARS[last]) {
      last = CAREER_IRREGULAR_SINGULARS[last];
    } else if (/sses$/.test(last)) {
      last = last.slice(0, -2);        // addresses -> address
    } else if (/ies$/.test(last)) {
      last = last.slice(0, -3) + 'y';  // libraries -> library
    } else if (/xes$/.test(last) || /ches$/.test(last) || /shes$/.test(last)) {
      last = last.slice(0, -2);        // boxes, watches, brushes
    } else if (/s$/.test(last) && !/(ss|us|is|as|os|ws)$/.test(last)) {
      last = last.slice(0, -1);        // actors -> actor
    }
  }
  words[words.length - 1] = last;
  return words.join(' ');
}

/**
 * Return a new array with singular/plural duplicate career variants removed,
 * preserving the first deterministic data entry for each equivalent name.
 * The underlying window.CAREERS dataset is not modified.
 * @param {Object[]} careers  Array of { id, name, letters }
 * @return {Object[]}  deduplicated copy, first occurrence wins
 */
function dedupeCareers(careers) {
  var seen = {};
  var out = [];
  for (var i = 0; i < careers.length; i++) {
    var key = normalizeCareerNameKey(careers[i].name);
    if (seen[key]) continue;
    seen[key] = true;
    out.push(careers[i]);
  }
  return out;
}

/**
 * Deterministic comparison for career picks: score descending, then canonical
 * RIASEC order of the career's primary letter, then original data order.
 */
function compareCareerPicks(a, b) {
  if (b.score !== a.score) return b.score - a.score;
  var ap = riasecRank(careerLetters(a.career)[0] || '');
  var bp = riasecRank(careerLetters(b.career)[0] || '');
  if (ap !== bp) return ap - bp;
  return a.idx - b.idx;
}

/**
 * Deterministically select up to four careers from window.CAREERS.
 * Careers with no direct or adjacent relationship are skipped, and
 * singular/plural variants are deduplicated before selection.
 *
 * To keep the descriptive tier system visible on the four cards, the
 * highest-scoring 'good' match (if any) and the highest-scoring 'adjacent'
 * match (if any) are reserved, then the remaining slots are filled with the
 * highest-scoring unused matches. The final set is sorted by score descending
 * with deterministic tie-breaking. If a tier has no matches, nothing is
 * invented for it.
 *
 * @param {Object} profile  { R, I, A, S, E, C } scores
 * @param {string[]} [excludeIds]  Career ids that must not be picked
 * @return {Array<{ career, score, tier }>}  up to 4 picks, best first
 */
function pickRevealCareers(profile, excludeIds) {
  var topLetters = getUserTopLetters(profile || {});
  var all = dedupeCareers(window.CAREERS || []);
  var excluded = {};
  if (excludeIds) {
    for (var e = 0; e < excludeIds.length; e++) excluded[excludeIds[e]] = true;
  }
  var matches = [];

  for (var i = 0; i < all.length; i++) {
    if (excluded[all[i].id]) continue;
    var score = scoreCareerMatch(all[i], topLetters);
    if (score <= 0) continue;
    matches.push({
      career: all[i],
      score: score,
      tier: getCareerTier(all[i], topLetters),
      idx: i
    });
  }

  matches.sort(compareCareerPicks);

  // Reserve at most one candidate per descriptive tier — the highest-scoring
  // of that tier, since matches is already sorted — so the four cards can
  // show the tier system. Then fill remaining slots with the highest-scoring
  // unused matches.
  var picks = [];
  var used = [];

  function reserveTier(tier) {
    for (var k = 0; k < matches.length; k++) {
      if (used.indexOf(k) === -1 && matches[k].tier === tier) {
        used.push(k);
        picks.push(matches[k]);
        return;
      }
    }
  }

  reserveTier('good');
  reserveTier('adjacent');

  for (var j = 0; j < matches.length && picks.length < 4; j++) {
    if (used.indexOf(j) === -1) {
      used.push(j);
      picks.push(matches[j]);
    }
  }

  picks.sort(compareCareerPicks);
  return picks;
}

// ─── Theme management ───────────────────────────────────────────────

function getCurrentTheme() {
  var saved = null;
  try { saved = localStorage.getItem('career-explorer-theme'); } catch (e) { /* localStorage may be blocked */ }
  // A saved choice wins; otherwise default to LIGHT (the site's paper look)
  // regardless of the OS setting. Toggle + persistence unchanged.
  return saved === 'light' || saved === 'dark' ? saved : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('career-explorer-theme', theme); } catch (e) { /* ignore */ }
  // Update every theme-toggle button on the page to reflect the new label
  var buttons = document.querySelectorAll('.theme-toggle');
  for (var i = 0; i < buttons.length; i++) {
    updateToggleButton(buttons[i], theme);
  }
}

function updateToggleButton(btn, theme) {
  var icon = theme === 'dark' ? '\u2600' : '\u263E'; // ☀ for "switch to light", ☾ for "switch to dark"
  var text = theme === 'dark' ? 'Light' : 'Dark';
  btn.innerHTML = '<span class="theme-toggle__icon" aria-hidden="true">' + icon + '</span><span class="theme-toggle__label">' + text + '</span>';
  btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

function toggleTheme() {
  var current = document.documentElement.getAttribute('data-theme') || getCurrentTheme();
  var next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

// ─── Reduced-motion check ─────────────────────────────────────────────────

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ─── Page-fold transition helper ──────────────────────────────────────────

/**
 * foldNavigate(updateFn)
 *
 * Orchestrates the single authored motion of the surface: the page-fold.
 * - View Transitions API supported  →  startViewTransition wrapping updateFn
 * - Fallback (no VT API)           →  crossfade via .fold-fallback classes
 * - prefers-reduced-motion         →  instant swap, no animation
 *
 * @param {Function} updateFn  Synchronous function that mutates state and DOM.
 */
function foldNavigate(updateFn) {
  // Reduced motion: instant swap, no transition at all
  if (prefersReducedMotion()) {
    updateFn();
    return;
  }

  // View Transitions API path
  if (typeof document.startViewTransition === 'function') {
    document.startViewTransition(function () {
      updateFn();
    });
    return;
  }

  // Fallback: crossfade using .fold-fallback classes from styles.css
  var app = document.getElementById('app');
  app.classList.add('fold-fallback', 'fold-fallback--out');

  // Wait a frame so the browser paints the fade-out before swapping
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      // Swap DOM while invisible
      updateFn();

      // Fade back in
      app.classList.remove('fold-fallback--out');
      app.classList.add('fold-fallback--in');

      // Clean up after the CSS transition completes (180ms in styles.css)
      setTimeout(function () {
        app.classList.remove('fold-fallback', 'fold-fallback--in');
      }, 200);
    });
  });
}

// ─── Phase → page number ──────────────────────────────────────────────────

function phaseToPage(phase, quizIndex) {
  if (phase === 'welcome')   return 1;
  if (phase === 'intro')     return 2;
  if (phase === 'quiz')      return 3 + (quizIndex || 0);
  if (phase === 'collating') return 3 + (window.QUIZ_ITEMS ? window.QUIZ_ITEMS.length : 0);
  if (phase === 'reveal')    return 3 + (window.QUIZ_ITEMS ? window.QUIZ_ITEMS.length : 0);
  if (phase === 'workbook')  return 4 + (window.QUIZ_ITEMS ? window.QUIZ_ITEMS.length : 0);
  return 1;
}

// ─── Footer helper ────────────────────────────────────────────────────────

/**
 * Build a .app-footer element.
 *
 * @param {number}  page     Current page number (1-based).
 * @param {boolean} showBack Whether to include a "Back" button.
 * @param {string}  backLabel   Button label text.
 * @param {Function} backAction  Click handler for the back button.
 * @param {boolean} testSkip  TEST-ONLY: include a "Skip quiz" shortcut (see
 *                            skipToCollating). REMOVE before final deployment.
 * @return {Element}
 */
function renderFooter(page, showBack, backLabel, backAction, testSkip) {
  var footer = document.createElement('div');
  footer.className = 'app-footer';

  // Theme toggle button (always present)
  var themeBtn = document.createElement('button');
  themeBtn.type = 'button';
  themeBtn.className = 'theme-toggle';
  var currentTheme = document.documentElement.getAttribute('data-theme') || getCurrentTheme();
  updateToggleButton(themeBtn, currentTheme);
  themeBtn.addEventListener('click', toggleTheme);
  footer.appendChild(themeBtn);

  if (showBack) {
    var backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'app-footer__back';
    backBtn.textContent = backLabel || '\u2190 Back';
    if (typeof backAction === 'function') {
      backBtn.addEventListener('click', backAction);
    }
    footer.appendChild(backBtn);
  }

  // TEST-ONLY: quiz shortcut so reviewers can skip straight to the reveal.
  // ⚠️ REMOVE before final deployment (button + skipToCollating + the
  //    renderFooter call in renderQuiz).
  if (testSkip) {
    var skipBtn = document.createElement('button');
    skipBtn.type = 'button';
    skipBtn.className = 'app-footer__test';
    skipBtn.textContent = 'Skip quiz \u2192';
    skipBtn.setAttribute('aria-label', 'Skip quiz (test only)');
    skipBtn.addEventListener('click', skipToCollating);
    footer.appendChild(skipBtn);
  }

  var pageNum = document.createElement('span');
  pageNum.className = 'app-footer__page';
  pageNum.textContent = 'Page ' + page + ' of ' + TOTAL_STEPS;
  footer.appendChild(pageNum);

  return footer;
}

// ─── Render dispatcher ────────────────────────────────────────────────────

// Lazy-load career-copy.js (per-career about/day copy, ~150 KB gzipped) only
// when the reveal phase first needs it, so the first paint never pays for it.
// Cards fall back to the letter templates until it arrives; the reveal
// re-renders once it is available.
var careerCopyRequested = false;
function ensureCareerCopy(done) {
  if (window.CAREER_COPY) { done(); return; }
  if (!careerCopyRequested) {
    careerCopyRequested = true;
    var s = document.createElement('script');
    s.src = 'career-copy.js';
    s.async = true;
    s.onload = done;
    s.onerror = done;
    document.head.appendChild(s);
  } else {
    var waited = 0;
    var iv = setInterval(function () {
      waited += 50;
      if (window.CAREER_COPY || waited > 10000) {
        clearInterval(iv);
        done();
      }
    }, 50);
  }
}

function render() {
  var app = document.getElementById('app');
  var phase = state.phase;

  // Defensive: if workbook but no career selected, redirect to reveal
  if (phase === 'workbook' && state.selectedCareer == null) {
    phase = 'reveal';
  }

  var content;

  switch (phase) {
    case 'welcome':
      content = renderWelcome();
      break;
    case 'intro':
      content = renderIntro();
      break;
    case 'quiz':
      content = renderQuiz();
      break;
    case 'collating':
      content = renderCollating();
      break;
    case 'reveal':
      content = renderReveal();
      if (!window.CAREER_COPY) {
        ensureCareerCopy(function () {
          if (state.phase === 'reveal') render();
        });
      }
      break;
    case 'workbook':
      content = renderWorkbookPlaceholder();
      break;
    default:
      content = renderIntro();
  }

  app.innerHTML = '';
  app.appendChild(content);

  // Expand controls need the cards in the document to measure truncation.
  if (phase === 'reveal') {
    var expandGrid = document.querySelector('.career-cards');
    if (expandGrid) finalizeCardExpansion(expandGrid);
  }
}

// ─── Welcome page (full-page composition, no zine spread) ───────────────

function renderWelcome() {
  var journey = document.createElement('div');
  journey.className = 'journey';

  var welcome = document.createElement('section');
  welcome.className = 'welcome';

  var inner = document.createElement('div');
  inner.className = 'welcome__inner';

  // Decorative halftone band (first child so it sits behind content)
  var halftoneBand = document.createElement('div');
  halftoneBand.className = 'halftone-band halftone--pink';
  inner.appendChild(halftoneBand);

  // Section label stamp
  var label = document.createElement('div');
  label.className = 'section-label section-label--pink halftone halftone--pink';
  label.textContent = 'WELCOME \u00B7 CAREER EXPLORER';
  inner.appendChild(label);

  // Lede: H1 + subhead
  var lede = document.createElement('div');
  lede.className = 'welcome__lede';

  var h1 = document.createElement('h1');
  h1.className = 'display-1';
  h1.innerHTML = 'Hello<span class="headline__accent">.</span>';
  lede.appendChild(h1);

  var subhead = document.createElement('p');
  subhead.className = 'body-lg italic';
  subhead.textContent = 'Let\u2019s find what kind of work fits you. First, what should we call you?';
  lede.appendChild(subhead);

  inner.appendChild(lede);

  // Form
  var form = document.createElement('form');
  form.className = 'welcome__form';
  form.noValidate = true; // we handle validation ourselves

  // Name field
  var nameField = document.createElement('label');
  nameField.className = 'welcome__field';
  var nameLabel = document.createElement('span');
  nameLabel.className = 'welcome__label';
  nameLabel.textContent = 'Name';
  nameField.appendChild(nameLabel);
  var nameInput = document.createElement('input');
  nameInput.className = 'welcome__input';
  nameInput.type = 'text';
  nameInput.name = 'name';
  nameInput.autocomplete = 'given-name';
  nameInput.placeholder = 'Your first name';
  if (state.user.name) nameInput.value = state.user.name;
  nameField.appendChild(nameInput);
  form.appendChild(nameField);

  // Name error message — shown when the name is empty on submit
  var nameError = document.createElement('p');
  nameError.className = 'welcome__error';
  nameError.setAttribute('role', 'alert');
  nameError.textContent = 'Please enter your name to begin.';
  nameError.hidden = true;
  form.appendChild(nameError);

  // Email field
  var emailField = document.createElement('label');
  emailField.className = 'welcome__field';
  var emailLabel = document.createElement('span');
  emailLabel.className = 'welcome__label';
  emailLabel.innerHTML = 'Email<span class="welcome__hint">(optional \u2014 for saving your work)</span>';
  emailField.appendChild(emailLabel);
  var emailInput = document.createElement('input');
  emailInput.className = 'welcome__input';
  emailInput.type = 'email';
  emailInput.name = 'email';
  emailInput.autocomplete = 'email';
  emailInput.placeholder = 'you@example.com';
  if (state.user.email) emailInput.value = state.user.email;
  emailField.appendChild(emailInput);

  // Email error message — shown only when a non-empty value fails validation
  var emailError = document.createElement('p');
  emailError.className = 'welcome__error';
  emailError.setAttribute('role', 'alert');
  emailError.textContent = 'Please enter a valid email address, or leave it blank.';
  emailError.hidden = true;
  emailField.appendChild(emailError);
  form.appendChild(emailField);

  // Submit button
  var begin = document.createElement('button');
  begin.className = 'welcome__begin';
  begin.type = 'submit';
  begin.textContent = 'Begin \u2192';
  form.appendChild(begin);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = nameInput.value.trim();
    var email = emailInput.value.trim();
    // Name is required to proceed; email is optional but must be valid.
    if (!name) {
      nameInput.setAttribute('aria-invalid', 'true');
      nameError.hidden = false;
      nameInput.focus();
      return;
    }
    nameInput.removeAttribute('aria-invalid');
    nameError.hidden = true;
    var emailValid = email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValid) {
      emailInput.setAttribute('aria-invalid', 'true');
      emailError.hidden = false;
      emailInput.focus();
      return;
    }
    emailInput.removeAttribute('aria-invalid');
    emailError.hidden = true;
    foldNavigate(function () {
      setState({ user: { name: name, email: email }, phase: 'intro' });
      render();
    });
  });

  // Clear the errors as soon as the student keeps typing
  nameInput.addEventListener('input', function () {
    nameError.hidden = true;
    nameInput.removeAttribute('aria-invalid');
  });
  emailInput.addEventListener('input', function () {
    emailError.hidden = true;
    emailInput.removeAttribute('aria-invalid');
  });

  inner.appendChild(form);
  welcome.appendChild(inner);
  journey.appendChild(welcome);
  journey.appendChild(renderFooter(phaseToPage('welcome'), false));

  return journey;
}

// ─── Intro spread ─────────────────────────────────────────────────────────

function renderIntro() {
  // Container — uses .zine grid layout; view-transition-name: spread from CSS
  var zine = document.createElement('div');
  zine.className = 'zine intro';

  // ── Left page ──
  var left = document.createElement('div');
  left.className = 'zine__page zine__page--left';

  // Personal greeting (shown only when user has entered a name)
  if (state.user.name) {
    var greeting = document.createElement('p');
    greeting.className = 'intro__greeting';
    greeting.setAttribute('aria-label', 'Personal greeting');
    greeting.textContent = 'Hi, ' + state.user.name + '.';
    left.appendChild(greeting);
  }

  var label = document.createElement('div');
  label.className = 'section-label section-label--pink halftone halftone--pink';
  label.textContent = 'INTRO \u00B7 YOUR JOURNEY STARTS HERE';
  left.appendChild(label);

  // Decorative halftone band behind the headline
  var halftoneBand = document.createElement('div');
  halftoneBand.className = 'halftone-band halftone--pink';
  left.appendChild(halftoneBand);

  var headline = document.createElement('h1');
  headline.className = 'display-1';
  headline.innerHTML = 'Find your<br><span class="headline__accent">spark.</span>';
  left.appendChild(headline);

  var subhead = document.createElement('p');
  subhead.className = 'body-lg italic';
  subhead.textContent = 'What kind of work fits you?';
  subhead.style.marginTop = '0.6em';
  subhead.style.marginBottom = '1em';
  left.appendChild(subhead);

  var caption = document.createElement('p');
  caption.className = 'body-sm italic';
  caption.textContent = 'Tap one that you feel best describes you to begin.';
  left.appendChild(caption);

  // ── Gutter / spine ──
  var gutter = document.createElement('div');
  gutter.className = 'zine__gutter';
  gutter.setAttribute('aria-hidden', 'true');

  // ── Right page ──
  var right = document.createElement('div');
  right.className = 'zine__page zine__page--right halftone halftone--blue';

  var marks = document.createElement('div');
  marks.className = 'intro__marks';

  for (var i = 0; i < RIASEC_TYPES.length; i++) {
    var rt = RIASEC_TYPES[i];
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'intro__mark min-tap';
    btn.setAttribute('aria-label', 'Begin quiz \u2014 ' + rt.name);
    btn.addEventListener('click', (function (letter) {
      return function () {
        // The intro pick counts toward the RIASEC profile (scoreRiasecProfile)
        setState({ initialType: letter });
        goToQuiz();
      };
    })(rt.letter));

    var markSpan = document.createElement('span');
    markSpan.className = 'riasec-mark riasec-mark--' + rt.letter + ' riasec-mark--lg';
    markSpan.setAttribute('aria-hidden', 'true');
    btn.appendChild(markSpan);

    var labelWrap = document.createElement('span');
    labelWrap.className = 'intro__mark-label';

    var nameEl = document.createElement('span');
    nameEl.className = 'intro__mark-name';
    nameEl.textContent = rt.letter + ' \u00B7 ' + rt.name;
    labelWrap.appendChild(nameEl);

    var descEl = document.createElement('span');
    descEl.className = 'intro__mark-desc';
    descEl.textContent = rt.desc;
    labelWrap.appendChild(descEl);

    btn.appendChild(labelWrap);
    marks.appendChild(btn);
  }

  right.appendChild(marks);

  // ── Callout (left-page footer area) ──
  var callout = document.createElement('div');
  callout.className = 'callout';

  var calloutH4 = document.createElement('h4');
  calloutH4.textContent = 'if you\u2019ve done a Holland test before, you\u2019ll recognise these.';
  callout.appendChild(calloutH4);
  left.appendChild(callout);

  // ── Assemble spread ──
  zine.appendChild(left);
  zine.appendChild(gutter);
  zine.appendChild(right);

  // ── Footer (back button only when user has entered a name) ──
  var container = document.createElement('div');
  container.className = 'journey';
  container.appendChild(zine);
  var hasBack = !!state.user.name;
  var backLabel = '\u2190 Start over';
  var backAction = goToWelcome;
  container.appendChild(renderFooter(phaseToPage('intro'), hasBack, hasBack ? backLabel : null, backAction));

  return container;
}

// ─── Quiz item renderer ────────────────────────────────────────────────────

function renderQuiz() {
  var items = window.QUIZ_ITEMS;
  if (!items || !items.length) {
    // Fallback if no quiz data loaded — render a simple empty spread
    var fallbackZine = document.createElement('div');
    fallbackZine.className = 'zine';
    var fbLeft = document.createElement('div');
    fbLeft.className = 'zine__page zine__page--left';
    var fbLabel = document.createElement('div');
    fbLabel.className = 'section-label section-label--pink';
    fbLabel.textContent = 'QUIZ \u00B7 NO DATA';
    fbLeft.appendChild(fbLabel);
    var fbGutter = document.createElement('div');
    fbGutter.className = 'zine__gutter';
    fbGutter.setAttribute('aria-hidden', 'true');
    var fbRight = document.createElement('div');
    fbRight.className = 'zine__page zine__page--right';
    fallbackZine.appendChild(fbLeft);
    fallbackZine.appendChild(fbGutter);
    fallbackZine.appendChild(fbRight);
    var fbContainer = document.createElement('div');
    fbContainer.className = 'journey';
    fbContainer.appendChild(fallbackZine);
    return fbContainer;
  }

  var idx = state.quizIndex;
  var item = items[idx];
  var total = items.length;

  var zine = document.createElement('div');
  zine.className = 'zine';

  // ── Left page (delegated to renderQuizLeftPage) ──
  var left = renderQuizLeftPage(item, idx, total);

  // ── Gutter / spine ──
  var gutter = document.createElement('div');
  gutter.className = 'zine__gutter';
  gutter.setAttribute('aria-hidden', 'true');

  // ── Right page ──
  var right = document.createElement('div');
  right.className = 'zine__page zine__page--right halftone halftone--blue';

  // Prompt on right page (for likert, cardsort — prompt goes here)
  if (item.type !== 'scenario') {
    var prompt = document.createElement('h2');
    prompt.className = 'display-2';
    prompt.textContent = item.prompt;
    right.appendChild(prompt);
  }

  // ── Render options by type ──
  if (item.type === 'likert') {
    renderLikert(item, right);
  } else if (item.type === 'scenario') {
    renderScenario(item, right);
  } else if (item.type === 'cardsort') {
    renderCardsort(item, right);
  }

  // ── Assemble spread ──
  zine.appendChild(left);
  zine.appendChild(gutter);
  zine.appendChild(right);

  var container = document.createElement('div');
  container.className = 'journey';
  container.appendChild(zine);
  // TEST-ONLY: pass true to show the "Skip quiz" footer shortcut. REMOVE
  // before final deployment.
  container.appendChild(renderFooter(phaseToPage('quiz', idx), true, '\u2190 Back', goToPrevQuizItem, true));

  return container;
}

// ── Likert sub-renderer ──

function renderLikert(item, rightPage) {
  var labels = [
    { num: 1, label: 'Strongly\ndisagree' },
    { num: 2, label: 'Disagree' },
    { num: 3, label: 'Neutral' },
    { num: 4, label: 'Agree' },
    { num: 5, label: 'Strongly\nagree' }
  ];

  var likert = document.createElement('div');
  likert.className = 'quiz-likert';

  var currentAnswer = state.quizAnswers[item.id];

  for (var i = 0; i < labels.length; i++) {
    var opt = labels[i];
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quiz-option';
    if (currentAnswer === opt.num) {
      btn.classList.add('quiz-option--selected');
    }

    // aria-label: "Strongly disagree: {prompt}" or "Strongly agree: {prompt}"
    var ariaWord = opt.label.replace('\n', ' ');
    btn.setAttribute('aria-label', ariaWord + ': ' + item.prompt);

    var numSpan = document.createElement('span');
    numSpan.className = 'quiz-option__number';
    numSpan.textContent = opt.num;
    btn.appendChild(numSpan);

    var labelSpan = document.createElement('span');
    labelSpan.className = 'quiz-option__label';
    // Use innerHTML for the line break in "Strongly\ndisagree" and "Strongly\nagree"
    labelSpan.innerHTML = opt.label;
    btn.appendChild(labelSpan);

    btn.addEventListener('click', (function (val) {
      return function () {
        var answers = Object.assign({}, state.quizAnswers);
        answers[item.id] = val;
        state.quizAnswers = answers;
        goToNextQuizItem();
      };
    }(opt.num)));

    likert.appendChild(btn);
  }

  rightPage.appendChild(likert);
}

// ── Scenario sub-renderer ──

function renderScenario(item, rightPage) {
  // Helper subtitle (prompt stays on left page via display-2)
  var scenarioHelper = document.createElement('p');
  scenarioHelper.className = 'quiz-scenario__helper';
  scenarioHelper.textContent = 'Pick the one that sounds most like you';
  rightPage.appendChild(scenarioHelper);

  var scBlock = document.createElement('div');
  scBlock.className = 'quiz-scenario';

  var currentAnswer = state.quizAnswers[item.id];

  for (var i = 0; i < item.options.length; i++) {
    var opt = item.options[i];
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quiz-option--scenario';
    if (currentAnswer === i) {
      btn.classList.add('quiz-option--selected');
    }
    btn.setAttribute('aria-label', opt.label);

    var labelText = document.createElement('span');
    labelText.textContent = opt.label;
    btn.appendChild(labelText);

    btn.addEventListener('click', function (index) {
      return function () {
        var answers = Object.assign({}, state.quizAnswers);
        answers[item.id] = index;
        state.quizAnswers = answers;
        goToNextQuizItem();
      };
    }(i));

    scBlock.appendChild(btn);
  }

  rightPage.appendChild(scBlock);
}

// ── Card-sort sub-renderer ──

function renderCardsort(item, rightPage) {
  var csBlock = document.createElement('div');
  csBlock.className = 'quiz-cardsort';

  var currentAnswer = state.quizAnswers[item.id];
  var cards = [];
  var hasSelection = currentAnswer != null;

  for (var i = 0; i < item.options.length; i++) {
    var opt = item.options[i];
    var card = document.createElement('button');
    card.type = 'button';
    card.className = 'quiz-cardsort__card';
    card.textContent = opt.label;

    if (hasSelection && currentAnswer === i) {
      card.classList.add('quiz-cardsort__card--selected');
      card.setAttribute('aria-label', opt.label);
    } else if (hasSelection) {
      card.classList.add('quiz-cardsort__card--unselected');
      card.setAttribute('aria-label', 'Not this one');
    } else {
      card.setAttribute('aria-label', opt.label);
    }

    card.addEventListener('click', function (index) {
      return function () {
        // If already answered, ignore
        if (state.quizAnswers[item.id] != null) return;

        var answers = Object.assign({}, state.quizAnswers);
        answers[item.id] = index;
        state.quizAnswers = answers;

        // Visually mark selection
        var allCards = csBlock.querySelectorAll('.quiz-cardsort__card');
        for (var c = 0; c < allCards.length; c++) {
          if (c === index) {
            allCards[c].classList.add('quiz-cardsort__card--selected');
            allCards[c].classList.remove('quiz-cardsort__card--unselected');
            allCards[c].setAttribute('aria-label', item.options[c].label);
          } else {
            allCards[c].classList.add('quiz-cardsort__card--unselected');
            allCards[c].classList.remove('quiz-cardsort__card--selected');
            allCards[c].setAttribute('aria-label', 'Not this one');
          }
        }

        // Brief pause then advance
        setTimeout(goToNextQuizItem, 280);
      };
    }(i));

    cards.push(card);
    csBlock.appendChild(card);
  }

  // If already answered before render, mark cards appropriately
  // (handled above in the loop)

  rightPage.appendChild(csBlock);
}

// ── Quiz left-page builder ──

function renderQuizLeftPage(item, idx, total) {
  var left = document.createElement('div');
  left.className = 'zine__page zine__page--left halftone halftone--pink';

  var typeLabel = item.type.toUpperCase();
  var stampText = 'QUIZ \u00B7 ' + typeLabel + ' \u00B7 ' + (idx + 1) + ' of ' + total;

  // 1. Stamp
  var label = document.createElement('div');
  label.className = 'section-label section-label--pink halftone halftone--pink';
  label.textContent = stampText;
  left.appendChild(label);

  // For scenario items, show prompt on left page too
  if (item.type === 'scenario') {
    var leftPrompt = document.createElement('h2');
    leftPrompt.className = 'display-2';
    leftPrompt.textContent = item.prompt;
    left.appendChild(leftPrompt);
  }

  // 2. Progress strip — 12-cell item tracker
  var strip = document.createElement('div');
  strip.className = 'progress-strip';

  for (var i = 0; i < total; i++) {
    var cell = document.createElement('div');
    cell.className = 'progress-strip__cell';
    if (state.quizAnswers[window.QUIZ_ITEMS[i].id] != null) {
      cell.classList.add('progress-strip__cell--done');
    }
    if (i === idx) {
      cell.classList.add('progress-strip__cell--current');
    }
    cell.setAttribute('aria-label', 'Question ' + (i + 1) + (state.quizAnswers[window.QUIZ_ITEMS[i].id] != null ? ' answered' : ' unanswered'));
    strip.appendChild(cell);
  }
  left.appendChild(strip);

  // 3. RIASEC tally — running count of answers per letter
  var tallyHeading = document.createElement('p');
  tallyHeading.className = 'riasec-tally__heading';
  tallyHeading.textContent = 'Your type so far';
  left.appendChild(tallyHeading);

  var profile = scoreRiasecProfile(state.quizAnswers);

  var tally = document.createElement('div');
  tally.className = 'riasec-tally';

  for (var j = 0; j < RIASEC_TYPES.length; j++) {
    var rt = RIASEC_TYPES[j];
    var row = document.createElement('div');
    row.className = 'riasec-tally__row';
    row.setAttribute('tabindex', '0');

    var markSpan = document.createElement('span');
    markSpan.className = 'riasec-mark riasec-mark--' + rt.letter;
    markSpan.setAttribute('aria-hidden', 'true');
    row.appendChild(markSpan);

    var countSpan = document.createElement('span');
    countSpan.className = 'riasec-tally__count';
    countSpan.textContent = profile[rt.letter];
    row.appendChild(countSpan);

    var tooltip = document.createElement('span');
    tooltip.className = 'type-tooltip';
    tooltip.setAttribute('aria-hidden', 'true');
    tooltip.setAttribute('role', 'tooltip');
    tooltip.innerHTML = '<span class="type-tooltip__name">' + rt.letter + ' \u00B7 ' + rt.name + '</span><span class="type-tooltip__desc">' + rt.desc + '</span><span class="type-tooltip__hint">Tap elsewhere to dismiss</span>';
    row.appendChild(tooltip);

    attachTypeTooltip(row, tooltip);

    tally.appendChild(row);
  }
  left.appendChild(tally);

  // 4. Tip callout — rotates based on progress quartile; scenario items get
  //    their own prompt-fitting tip. "Almost there." is reserved for the final
  //    stretch (last 4 items) so it never shows prematurely mid-quiz.
  var tipIdx = Math.floor(idx / 4);
  var tips = [
    'No wrong answers. Go with your gut.',
    'You\'re not being scored \u2014 you\'re just describing yourself.',
    'Trust your first instinct \u2014 it\u2019s usually the truest.'
  ];
  var scenarioTip = 'Imagine it really happening \u2014 pick the reaction that feels most like you.';

  var tipCallout = document.createElement('div');
  tipCallout.className = 'callout';
  tipCallout.style.maxWidth = '280px';

  var tipH4 = document.createElement('h4');
  var tipText = total - idx <= 4
    ? 'Almost there \u2014 just a few questions left.'
    : tips[Math.min(tipIdx, tips.length - 1)];
  tipH4.textContent = item.type === 'scenario' ? scenarioTip : tipText;
  tipCallout.appendChild(tipH4);
  left.appendChild(tipCallout);

  return left;
}

// ─── Collating moment ─────────────────────────────────────────────────────

// How long the collating "calculation" beat lasts before the reveal.
var COLLATE_MS = 5000;

// Rotating micro-captions under the stamp tiles while the answers tally.
var COLLATE_CAPTIONS = [
  'Collating your answers\u2026',
  'Tallying the six letter themes\u2026',
  'Sorting by what stood out\u2026',
  'Finding close matches\u2026',
  'Nearly there\u2026'
];

var COLLATE_TILES = [
  { letter: 'R', cls: 'collate-progress__tile--r' },
  { letter: 'I', cls: 'collate-progress__tile--i' },
  { letter: 'A', cls: 'collate-progress__tile--a' },
  { letter: 'S', cls: 'collate-progress__tile--s' },
  { letter: 'E', cls: 'collate-progress__tile--e' },
  { letter: 'C', cls: 'collate-progress__tile--c' }
];

// Drives the collating progress widget: RIASEC stamp tiles fill one by one,
// a percentage ticks 0→100 over ~4.1s, captions rotate, then the spread folds
// to the reveal at COLLATE_MS. Reduced motion: instant fill, brief beat, fold.
function startCollate() {
  var el = document.querySelector('.collate-progress');
  if (!el) return;
  var tileEls = el.querySelectorAll('.collate-progress__tile');
  var pctEl = el.querySelector('.collate-progress__pct');
  var captionEl = el.querySelector('.collate-progress__caption');
  var statusEl = el.querySelector('.collate-progress__status');
  var tiles = tileEls.length;
  var finished = false;
  function goReveal() {
    if (finished) return;
    finished = true;
    foldNavigate(function () {
      setState({ phase: 'reveal' });
      render();
      window.scrollTo(0, 0);
    });
  }
  if (prefersReducedMotion()) {
    for (var k = 0; k < tiles; k++) tileEls[k].classList.add('collate-progress__tile--done');
    pctEl.textContent = '100%';
    captionEl.textContent = 'Ready!';
    if (statusEl) statusEl.textContent = 'Your career matches are ready.';
    setTimeout(goReveal, 450);
    return;
  }
  var t0 = Date.now();
  var fillMs = COLLATE_MS * 0.82;
  var stepMs = fillMs / tiles;
  var timer = setInterval(function () {
    var elapsed = Date.now() - t0;
    var progress = Math.min(1, elapsed / fillMs);
    for (var i = 0; i < tiles; i++) {
      if (elapsed >= i * stepMs) tileEls[i].classList.add('collate-progress__tile--done');
    }
    pctEl.textContent = Math.round(progress * 100) + '%';
    captionEl.textContent = progress >= 1
      ? 'Ready!'
      : COLLATE_CAPTIONS[Math.min(COLLATE_CAPTIONS.length - 1, Math.floor(progress * COLLATE_CAPTIONS.length))];
    if (elapsed >= COLLATE_MS) {
      clearInterval(timer);
      if (statusEl) statusEl.textContent = 'Your career matches are ready.';
      goReveal();
    }
  }, 60);
}

function renderCollating() {
  var zine = document.createElement('div');
  zine.className = 'zine collating';

  // ── Left page ──
  var left = document.createElement('div');
  left.className = 'zine__page zine__page--left';

  var label = document.createElement('div');
  label.className = 'section-label section-label--blue';
  label.textContent = 'QUIZ \u00B7 COLLATING';
  left.appendChild(label);

  var headline = document.createElement('h1');
  headline.className = 'display-1';
  headline.innerHTML = 'Collating<span class="headline__accent">\u2026</span>';
  left.appendChild(headline);

  // RIASEC stamp-tile progress — filled by startCollate()
  var progress = document.createElement('div');
  progress.className = 'collate-progress';

  var tiles = document.createElement('div');
  tiles.className = 'collate-progress__tiles';
  tiles.setAttribute('aria-hidden', 'true');
  for (var t = 0; t < COLLATE_TILES.length; t++) {
    var tile = document.createElement('span');
    tile.className = 'collate-progress__tile ' + COLLATE_TILES[t].cls;
    tile.textContent = COLLATE_TILES[t].letter;
    tiles.appendChild(tile);
  }
  progress.appendChild(tiles);

  var meta = document.createElement('div');
  meta.className = 'collate-progress__meta';
  meta.setAttribute('aria-hidden', 'true');
  var pct = document.createElement('span');
  pct.className = 'collate-progress__pct';
  pct.textContent = '0%';
  meta.appendChild(pct);
  var caption = document.createElement('span');
  caption.className = 'collate-progress__caption';
  caption.textContent = COLLATE_CAPTIONS[0];
  meta.appendChild(caption);
  progress.appendChild(meta);

  var status = document.createElement('span');
  status.className = 'sr-only collate-progress__status';
  status.setAttribute('role', 'status');
  status.textContent = 'Tallying your answers\u2026';
  progress.appendChild(status);

  left.appendChild(progress);

  // ── Gutter / spine ──
  var gutter = document.createElement('div');
  gutter.className = 'zine__gutter';
  gutter.setAttribute('aria-hidden', 'true');

  // ── Right page ──
  var right = document.createElement('div');
  right.className = 'zine__page zine__page--right halftone halftone--yellow';

  var foldLabel = document.createElement('div');
  foldLabel.className = 'section-label section-label--yellow';
  foldLabel.textContent = 'TALLYING';
  right.appendChild(foldLabel);

  var para = document.createElement('p');
  para.className = 'body';
  para.textContent = 'We\u2019re collating your answers into your RIASEC profile. Four careers are about to surface.';
  right.appendChild(para);

  // ── Assemble spread ──
  zine.appendChild(left);
  zine.appendChild(gutter);
  zine.appendChild(right);

  var container = document.createElement('div');
  container.className = 'journey';
  container.appendChild(zine);
  container.appendChild(renderFooter(phaseToPage('collating'), false));

  return container;
}

// ─── Reveal spread ─────────────────────────────────────────────────────────

// Country-agnostic role description lines per RIASEC letter — no salary,
// currency, or education-system references. Built into a short card blurb.
var ROLE_DESCRIPTIONS = {
  R: 'Hands-on work with tools, machines, or the outdoors \u2014 building, fixing, and making things work.',
  I: 'Curious, investigative work \u2014 asking why, testing ideas, and figuring out how things work.',
  A: 'Creative work \u2014 designing, composing, and shaping something new.',
  S: 'People-first work \u2014 helping, teaching, coaching, and supporting others.',
  E: 'Action-driven work \u2014 leading, persuading, and turning ideas into plans.',
  C: 'Orderly work \u2014 organizing, tracking, and keeping systems running smoothly.'
};

// Build a short role blurb from the career's letters (deterministic).
// When per-career copy exists (career-copy.js, lazy-loaded at reveal), use it.
function buildRoleDescription(career) {
  var copy = window.CAREER_COPY && window.CAREER_COPY[career.id];
  if (copy && copy.about) return [copy.about];
  var letters = careerLetters(career);
  var primary = letters.length ? letters[0] : 'R';
  var out = [ROLE_DESCRIPTIONS[primary] || ROLE_DESCRIPTIONS.R];
  if (letters.length > 1) {
    var secondary = ROLE_DESCRIPTIONS[letters[1]];
    if (secondary) {
      out.push('It also leans into ' + secondary.charAt(0).toLowerCase() + secondary.slice(1));
    }
  }
  return out;
}

// Deterministic synthetic day-in-life vignette lines per RIASEC letter.
// Used to build the halftone day-in-life block on each card — no external images.
var DAYLIFE_LINES = {
  R: 'Out on the floor by nine — tools out, sleeves up, something built, fixed, or running by close.',
  I: 'Long stretches of deep focus — experiments, data, and the why behind the way things work.',
  A: 'Studio hours and sketchbooks — making, composing, and shaping something that did not exist this morning.',
  S: 'A people-first day — listening, teaching, coaching, and moving someone a step forward.',
  E: 'Pitches, plans, and momentum — rallying people and turning an idea into a done deal.',
  C: 'Systems, schedules, and clean stacks — the quiet satisfaction of everything exactly where it belongs.'
};

// Build up to three vignette lines from the career's RIASEC letters
// (deterministic). When per-career copy exists, use its day-in-life lines.
function buildDayLife(career) {
  var copy = window.CAREER_COPY && window.CAREER_COPY[career.id];
  if (copy && copy.day && copy.day.length) return copy.day.slice(0, 3);
  var letters = careerLetters(career);
  var order = letters.length ? letters : ['R'];
  var used = [];
  var lines = [];
  for (var i = 0; i < order.length && lines.length < 3; i++) {
    if (used.indexOf(order[i]) !== -1) continue;
    used.push(order[i]);
    lines.push(DAYLIFE_LINES[order[i]] || DAYLIFE_LINES.R);
  }
  return lines;
}

// Expanded-card copy state, keyed by career id so it survives keep/shuffle
// re-renders (the DOM is rebuilt, but the id stays the same while shown).
var expandedCardIds = {};

// True when a copy element is actually hiding words: it is display:none
// (compact scope hides the 3rd vignette line) or its content overflows the
// clamped box. Non-truncated cards must NOT show the expand control — a
// "See more" that reveals nothing is misleading.
function isCardCopyTruncated(el) {
  var cs = getComputedStyle(el);
  if (cs.display === 'none') return true;
  return el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1;
}

// Decide per-card expand-button visibility AFTER the card is in the DOM
// (layout must exist to measure truncation) and re-apply the persisted
// expanded state. Runs on every reveal render and on window resize.
function finalizeCardExpansion(grid) {
  var cards = grid.querySelectorAll('.career-card');
  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    var id = card.getAttribute('data-id');
    var isExpanded = !!(id && expandedCardIds[id]);
    var truncated = false;
    var texts = card.querySelectorAll('.career-card__about-text, .career-card__daylife-line');
    for (var t = 0; t < texts.length; t++) {
      if (isCardCopyTruncated(texts[t])) { truncated = true; break; }
    }
    var btn = card.querySelector('.career-card__expand');
    if (!btn) continue;
    if (isExpanded) card.classList.add('career-card--expanded');
    // The control exists only when the COLLAPSED card hides words.
    btn.hidden = !truncated;
    if (truncated) {
      btn.textContent = isExpanded ? 'See less' : 'See more';
      btn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    }
  }
}

// Re-evaluate the expand controls when the viewport changes width (wide →
// compact cards truncate; narrow → full-size cards show everything).
var cardResizeTimer = null;
window.addEventListener('resize', function () {
  clearTimeout(cardResizeTimer);
  cardResizeTimer = setTimeout(function () {
    if (state.phase !== 'reveal') return;
    var grid = document.querySelector('.career-cards');
    if (grid) finalizeCardExpansion(grid);
  }, 150);
});

// Build a single .career-card article for one pick. kept marks the card as
// kept (stamp state + data-kept), and the whole card toggles keep on tap.
// fresh marks a card whose content is newly shown this render — it gets the
// stamp-in entrance animation (see .career-card--fresh in styles.css).
function renderCareerCard(pick, kept, fresh) {
  var career = pick.career;
  var letters = careerLetters(career);
  var tier = pick.tier;

  var article = document.createElement('article');
  article.className = 'career-card';
  article.setAttribute('data-id', career.id);
  article.setAttribute('data-kept', kept ? 'true' : 'false');
  if (kept) article.classList.add('career-card--kept');
  if (fresh) article.classList.add('career-card--fresh');

  // Name row: career name + corner keep stamp share one flex line, so long
  // names wrap inside their own space and NEVER run underneath the stamp
  // (it was absolutely positioned and covered multi-line names).
  var nameRow = document.createElement('div');
  nameRow.className = 'career-card__name-row';

  var nameEl = document.createElement('h3');
  nameEl.className = 'career-card__name';
  nameEl.textContent = career.name;
  nameRow.appendChild(nameEl);

  // Corner keep stamp — the accessible toggle for keep. It calls
  // stopPropagation so the whole-card tap handler below never double-fires.
  var keepBtn = document.createElement('button');
  keepBtn.type = 'button';
  keepBtn.className = 'career-card__keep min-tap';
  keepBtn.setAttribute('aria-pressed', kept ? 'true' : 'false');
  keepBtn.textContent = kept ? 'KEPT \u2713' : 'KEEP';
  keepBtn.addEventListener('click', (function (c) {
    return function (e) {
      e.stopPropagation();
      toggleKeep(c.id);
    };
  })(career));
  nameRow.appendChild(keepBtn);

  article.appendChild(nameRow);

  // RIASEC marks
  var riasec = document.createElement('div');
  riasec.className = 'career-card__riasec';
  riasec.setAttribute('aria-label', 'RIASEC code: ' + letters.join(''));
  for (var i = 0; i < letters.length; i++) {
    var mark = document.createElement('span');
    mark.className = 'riasec-mark riasec-mark--' + letters[i];
    mark.setAttribute('aria-hidden', 'true');
    mark.title = letters[i] + ' \u00B7 ' + riasecName(letters[i]);
    riasec.appendChild(mark);
  }
  article.appendChild(riasec);

  // Tier stamp — exactly one descriptive tier per card
  var tierText;
  if (tier === 'strong') tierText = 'STRONG FIT';
  else if (tier === 'good') tierText = 'GOOD FIT';
  else tierText = 'ADJACENT FIT';

  var tierEl = document.createElement('div');
  tierEl.className = 'career-card__tier';
  var stamp = document.createElement('span');
  stamp.className = 'career-card__tier-stamp section-label career-card__tier--' + tier;
  stamp.textContent = tierText;
  tierEl.appendChild(stamp);
  article.appendChild(tierEl);

  // Short country-agnostic role description — plain text, no box
  var about = document.createElement('div');
  about.className = 'career-card__about';

  var aboutCaption = document.createElement('span');
  aboutCaption.className = 'career-card__about-caption';
  aboutCaption.textContent = 'ABOUT THIS ROLE';
  about.appendChild(aboutCaption);

  var aboutLines = buildRoleDescription(career);
  for (var a = 0; a < aboutLines.length; a++) {
    var aboutText = document.createElement('span');
    aboutText.className = 'career-card__about-text';
    aboutText.textContent = aboutLines[a];
    about.appendChild(aboutText);
  }
  article.appendChild(about);

  // Synthetic halftone day-in-life block (no external images)
  var daylife = document.createElement('div');
  daylife.className = 'career-card__daylife career-card__daylife--synthetic';

  var caption = document.createElement('span');
  caption.className = 'career-card__daylife-caption';
  caption.textContent = 'A DAY AT WORK';
  daylife.appendChild(caption);

  var lines = buildDayLife(career);
  for (var j = 0; j < lines.length; j++) {
    var line = document.createElement('span');
    line.className = 'career-card__daylife-line';
    line.textContent = lines[j];
    daylife.appendChild(line);
  }
  article.appendChild(daylife);

  // Expand/collapse control for the about + day-life copy — created hidden;
  // finalizeCardExpansion() (after the card is in the DOM) shows it ONLY when
  // the collapsed card actually truncates words, so a "See more" that reveals
  // nothing never appears.
  var expandBtn = document.createElement('button');
  expandBtn.type = 'button';
  expandBtn.className = 'career-card__expand';
  expandBtn.hidden = true;
  expandBtn.setAttribute('aria-expanded', 'false');
  expandBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var nowExpanded = article.classList.toggle('career-card--expanded');
    if (nowExpanded) expandedCardIds[career.id] = true;
    else delete expandedCardIds[career.id];
    expandBtn.textContent = nowExpanded ? 'See less' : 'See more';
    expandBtn.setAttribute('aria-expanded', nowExpanded ? 'true' : 'false');
  });

  // Accessible discover-more action — opens the selected career's workbook (44px min target from .min-tap)
  var openBtn = document.createElement('button');
  openBtn.type = 'button';
  openBtn.className = 'career-card__discover min-tap';
  openBtn.textContent = 'Discover more \u2192';
  openBtn.setAttribute('aria-label', 'Discover more about ' + career.name);
  openBtn.addEventListener('click', (function (c) {
    return function () {
      setState({ selectedCareer: c });
      goToWorkbook();
    };
  })(career));

  // CTA row: Discover more + See more/less side by side, so the expand control
  // costs no extra card height (desktop compact fit stays intact).
  var ctaRow = document.createElement('div');
  ctaRow.className = 'career-card__cta-row';
  ctaRow.appendChild(openBtn);
  ctaRow.appendChild(expandBtn);
  article.appendChild(ctaRow);

  // Whole-card tap toggles keep — but never for Discover-more, the stamp,
  // or the expand/collapse control
  article.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.career-card__discover')) return;
    if (e.target.closest && e.target.closest('.career-card__keep')) return;
    if (e.target.closest && e.target.closest('.career-card__expand')) return;
    toggleKeep(career.id);
  });

  return article;
}

// { id: career } map over the deduplicated dataset — shared by the reveal
// renderer (id → displayed card) and the shuffle builder (kept lookup).
function getCareerByIdMap() {
  var all = dedupeCareers(window.CAREERS || []);
  var byId = {};
  for (var i = 0; i < all.length; i++) byId[all[i].id] = all[i];
  return byId;
}

// Compute the next grid after a shuffle. Kept cards never move; on desktop the
// remaining slots swap in place (slot-stable), on mobile fresh suggestions
// sort to the top and kept cards drop to the bottom (reserving their slots so
// they can never be pushed off-grid).
function buildShuffledPicks() {
  var profile = state.riasecProfile || {};
  var topLetters = getUserTopLetters(profile);
  var excluded = state.revealKeptIds.concat(state.revealSeenIds);
  var freshPicks = pickRevealCareers(profile, excluded);
  var byId = getCareerByIdMap();

  var keptPicks = [];
  for (var k = 0; k < state.revealKeptIds.length; k++) {
    var keptCareer = byId[state.revealKeptIds[k]];
    if (!keptCareer) continue;
    keptPicks.push({
      career: keptCareer,
      score: scoreCareerMatch(keptCareer, topLetters),
      tier: getCareerTier(keptCareer, topLetters),
      idx: -1
    });
  }

  var picks;
  if (window.innerWidth >= 768 && state.revealCardIds.length) {
    var usedFresh = {};
    var nextFresh = 0;
    var ordered = [];
    var prevIds = state.revealCardIds;
    for (var s = 0; s < prevIds.length; s++) {
      if (state.revealKeptIds.indexOf(prevIds[s]) !== -1 && byId[prevIds[s]]) {
        var lockedCareer = byId[prevIds[s]];
        ordered.push({
          career: lockedCareer,
          score: scoreCareerMatch(lockedCareer, topLetters),
          tier: getCareerTier(lockedCareer, topLetters),
          idx: -1
        });
      } else {
        while (nextFresh < freshPicks.length && usedFresh[freshPicks[nextFresh].career.id]) nextFresh++;
        if (nextFresh < freshPicks.length) {
          ordered.push(freshPicks[nextFresh]);
          usedFresh[freshPicks[nextFresh].career.id] = true;
          nextFresh++;
        }
      }
    }
    for (; nextFresh < freshPicks.length && ordered.length < 4; nextFresh++) {
      if (usedFresh[freshPicks[nextFresh].career.id]) continue;
      ordered.push(freshPicks[nextFresh]);
      usedFresh[freshPicks[nextFresh].career.id] = true;
    }
    picks = ordered.slice(0, 4);
  } else if (window.innerWidth >= 768) {
    picks = freshPicks.slice(0, 4);
  } else {
    var freshRoom = Math.max(0, 4 - keptPicks.length);
    picks = freshPicks.slice(0, freshRoom).concat(keptPicks).slice(0, 4);
  }
  return picks;
}

function renderReveal() {
  var profile = state.riasecProfile || {};
  var topLetters = getUserTopLetters(profile);
  var excluded = state.revealKeptIds.concat(state.revealSeenIds);
  // The grid renders EXACTLY what revealCardIds holds, in that order — keeping
  // a card only flips the kept flag and never reorders or swaps cards. Only
  // the shuffle action replaces ids; it stashes the previous order in
  // revealPrevCardIds so the fresh-card stamp-in can tell what changed.
  var prevForFresh = state.revealPrevCardIds !== null
    ? state.revealPrevCardIds
    : (state.revealCardIds || []).slice();
  state.revealPrevCardIds = null;

  var byId = getCareerByIdMap();
  var picks = [];
  var gridIds = state.revealCardIds || [];
  if (gridIds.length) {
    for (var o = 0; o < gridIds.length; o++) {
      var displayed = byId[gridIds[o]];
      if (!displayed) continue;
      picks.push({
        career: displayed,
        score: scoreCareerMatch(displayed, topLetters),
        tier: getCareerTier(displayed, topLetters),
        idx: -1
      });
    }
  } else {
    // First visit — pick the top matches; the empty state shows if none exist.
    picks = pickRevealCareers(profile, excluded).slice(0, 4);
    state.revealCardIds = picks.map(function (p) { return p.career.id; });
  }
  var zine = document.createElement('div');
  zine.className = 'zine reveal';

  // ── Left page — match context ──
  var left = document.createElement('div');
  left.className = 'zine__page zine__page--left';

  // Accessible results announcement — concise polite live region, announced on arrival
  var summary = document.createElement('p');
  summary.className = 'sr-only reveal__summary';
  summary.setAttribute('role', 'region');
  summary.setAttribute('aria-label', 'Your results are ready');
  summary.setAttribute('aria-live', 'polite');
  summary.textContent = 'Your career matches are ready below.';
  left.appendChild(summary);

  var label = document.createElement('div');
  label.className = 'section-label section-label--pink';
  label.textContent = 'REVEAL \u00B7 CAREER MATCHES';
  left.appendChild(label);

  var headline = document.createElement('h2');
  headline.className = 'display-2';
  headline.textContent = 'A few paths to explore';
  left.appendChild(headline);

  // What stood out — the user's three highest-scoring letters
  var marksHeading = document.createElement('p');
  marksHeading.className = 'reveal__marks-heading';
  marksHeading.textContent = 'What stood out';
  left.appendChild(marksHeading);

  var marks = document.createElement('div');
  marks.className = 'reveal__topmarks';
  for (var i = 0; i < topLetters.length; i++) {
    var letter = topLetters[i];
    var row = document.createElement('div');
    row.className = 'reveal__topmark';
    row.setAttribute('aria-label', 'Rank ' + (i + 1) + ': ' + letter + ' \u00B7 ' + riasecName(letter));

    var markSpan = document.createElement('span');
    markSpan.className = 'riasec-mark riasec-mark--' + letter + ' riasec-mark--lg';
    markSpan.setAttribute('aria-hidden', 'true');
    row.appendChild(markSpan);

    var meta = document.createElement('span');
    meta.className = 'reveal__topmark-meta';

    var rankEl = document.createElement('span');
    rankEl.className = 'reveal__topmark-rank';
    rankEl.textContent = 'No. ' + (i + 1);
    meta.appendChild(rankEl);

    var nameEl = document.createElement('span');
    nameEl.className = 'reveal__topmark-name';
    nameEl.textContent = letter + ' \u00B7 ' + riasecName(letter);
    meta.appendChild(nameEl);

    row.appendChild(meta);

    var tooltip = document.createElement('span');
    tooltip.className = 'type-tooltip type-tooltip--reveal';
    tooltip.setAttribute('aria-hidden', 'true');
    tooltip.setAttribute('role', 'tooltip');
    tooltip.innerHTML = '<span class="type-tooltip__name">No. ' + (i + 1) + ' \u00B7 ' + letter + ' \u00B7 ' + riasecName(letter) + '</span><span class="type-tooltip__desc">' + riasecDesc(letter) + '</span><span class="type-tooltip__hint">Tap elsewhere to dismiss</span>';
    row.appendChild(tooltip);

    attachTypeTooltip(row, tooltip);

    marks.appendChild(row);
  }
  left.appendChild(marks);

  // Explanatory copy
  var copy = document.createElement('p');
  copy.className = 'body';
  copy.textContent = 'We matched your answers with ' +
    (window.CAREERS ? window.CAREERS.length : 0) +
    ' careers. Here are a few paths connected to the things you enjoy.';
  left.appendChild(copy);

  var callout = document.createElement('div');
  callout.className = 'callout';
  var calloutH4 = document.createElement('h4');
  calloutH4.textContent = 'Each label shows how closely a career connects with your answers. Follow the one that makes you curious.';
  callout.appendChild(calloutH4);
  left.appendChild(callout);

  // ── Gutter / spine ──
  var gutter = document.createElement('div');
  gutter.className = 'zine__gutter';
  gutter.setAttribute('aria-hidden', 'true');

  // ── Right page — career cards ──
  var right = document.createElement('div');
  right.className = 'zine__page zine__page--right halftone halftone--yellow';

  var rightLabel = document.createElement('div');
  rightLabel.className = 'section-label section-label--blue';
  rightLabel.textContent = 'CAREER CARDS';
  right.appendChild(rightLabel);

  // Keep & regenerate action bar
  var actions = document.createElement('div');
  actions.className = 'reveal__actions';

  var helperCopy = document.createElement('p');
  helperCopy.className = 'reveal__actions-copy';
  helperCopy.textContent = 'Tap a card to keep it \u2014 kept cards stay when you shuffle.';
  actions.appendChild(helperCopy);

  var counter = document.createElement('span');
  counter.className = 'reveal__counter';
  counter.setAttribute('aria-live', 'polite');
  counter.setAttribute('aria-atomic', 'true');
  counter.textContent = state.revealKeptIds.length + ' of ' + picks.length + ' kept';
  actions.appendChild(counter);

  var allKept = picks.length > 0;
  for (var q = 0; q < picks.length; q++) {
    if (state.revealKeptIds.indexOf(picks[q].career.id) === -1) {
      allKept = false;
      break;
    }
  }

  if (picks.length > 0 && allKept) {
    var done = document.createElement('p');
    done.className = 'reveal__done';
    done.textContent = 'All kept \u2014 you\u2019re set!';
    actions.appendChild(done);
  } else if (picks.length > 0) {
    var shuffleBtn = document.createElement('button');
    shuffleBtn.type = 'button';
    shuffleBtn.className = 'reveal__shuffle min-tap';
    shuffleBtn.textContent = 'Show me different careers \u2192';
    shuffleBtn.addEventListener('click', function () {
      // The currently displayed cards are now "seen" — future shuffles exclude them.
      var next = state.revealSeenIds.slice();
      for (var s = 0; s < state.revealCardIds.length; s++) {
        var id = state.revealCardIds[s];
        if (next.indexOf(id) === -1) next.push(id);
      }
      state.revealSeenIds = next;
      var newPicks = buildShuffledPicks();
      state.revealPrevCardIds = state.revealCardIds.slice();
      state.revealCardIds = newPicks.map(function (p) { return p.career.id; });
      refreshReveal();
      // Mobile: bring the fresh cards into view. refreshReveal renders
      // synchronously; one rAF makes sure layout is fresh before measuring.
      if (window.innerWidth < 768) {
        requestAnimationFrame(function () {
          var grid = document.querySelector('.career-cards');
          if (!grid) return;
          var gridTop = grid.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: gridTop - 12,
            behavior: prefersReducedMotion() ? 'auto' : 'smooth'
          });
        });
      }
    });
    actions.appendChild(shuffleBtn);
  }

  right.appendChild(actions);

  // ── Search a career — a picked result replaces the first unkept card ──
  var searchSection = document.createElement('section');
  searchSection.className = 'reveal__search';

  var searchLabel = document.createElement('label');
  searchLabel.className = 'reveal__search-label';
  searchLabel.setAttribute('for', 'career-search');
  searchLabel.textContent = 'SEARCH A CAREER';
  searchSection.appendChild(searchLabel);

  var searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.id = 'career-search';
  searchInput.className = 'reveal__search-input min-tap';
  searchInput.placeholder = 'Type a career name\u2026';
  searchInput.setAttribute('autocomplete', 'off');
  searchInput.setAttribute('aria-controls', 'career-search-results');
  searchSection.appendChild(searchInput);

  var searchNote = document.createElement('p');
  searchNote.className = 'reveal__search-note';
  searchNote.setAttribute('role', 'status');
  searchNote.setAttribute('aria-live', 'polite');
  searchNote.textContent = 'Picking a result swaps it in for one of your unkept cards.';
  searchSection.appendChild(searchNote);

  var searchResults = document.createElement('ul');
  searchResults.id = 'career-search-results';
  searchResults.className = 'reveal__search-results';
  searchResults.setAttribute('aria-label', 'Career search results');
  searchResults.hidden = true;
  searchSection.appendChild(searchResults);

  // Replace the first unkept grid slot with the searched career; when the
  // grid has room (or is empty), the result is appended as a new card instead.
  var replaceWithSearchPick = (function () {
    return function (career) {
      var byId = getCareerByIdMap();
      var grid = state.revealCardIds.slice();
      var slot = -1;
      for (var g = 0; g < grid.length; g++) {
        if (state.revealKeptIds.indexOf(grid[g]) === -1) { slot = g; break; }
      }
      if (slot === -1 && grid.length < 4) slot = grid.length;
      if (slot === -1) {
        searchNote.textContent = 'You\u2019ve kept every card \u2014 unkeep one to make room.';
        return;
      }
      if (grid.indexOf(career.id) !== -1) {
        searchNote.textContent = career.name + ' is already on your board.';
        return;
      }
      var replaced = grid[slot];
      grid[slot] = career.id;
      state.revealPrevCardIds = state.revealCardIds.slice();
      state.revealCardIds = grid;
      // The swapped-out career counts as seen, so shuffles won't bring it back.
      if (replaced) {
        var seen = state.revealSeenIds.slice();
        if (seen.indexOf(replaced) === -1) seen.push(replaced);
        state.revealSeenIds = seen;
      }
      refreshReveal();
      var freshInput = document.getElementById('career-search');
      if (freshInput) freshInput.focus();
    };
  })();

  searchInput.addEventListener('input', function () {
    var raw = searchInput.value.trim();
    var q = raw.toLowerCase().replace(/[\s-]+/g, '');
    searchResults.innerHTML = '';
    searchNote.textContent = 'Picking a result swaps it in for one of your unkept cards.';
    if (!q) {
      searchResults.hidden = true;
      return;
    }
    var all = dedupeCareers(window.CAREERS || []);
    var matches = [];
    for (var m = 0; m < all.length && matches.length < 8; m++) {
      var hay = all[m].name.toLowerCase().replace(/[\s-]+/g, '');
      if (hay.indexOf(q) !== -1) {
        matches.push({ career: all[m], hay: hay });
      }
    }
    // Exact/prefix name matches first, so "Carpenter" beats
    // "Cabinetmakers and Bench Carpenters" for the query "carpenter".
    matches.sort(function (a, b) {
      var aPref = a.hay.indexOf(q) === 0 ? 0 : 1;
      var bPref = b.hay.indexOf(q) === 0 ? 0 : 1;
      if (aPref !== bPref) return aPref - bPref;
      return a.career.name.length - b.career.name.length;
    });
    if (!matches.length) {
      searchNote.textContent = 'No careers match \u201C' + raw + '\u201D.';
      searchResults.hidden = true;
      return;
    }
    searchResults.hidden = false;
    for (var r = 0; r < matches.length; r++) {
      (function (career) {
        var item = document.createElement('li');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'reveal__search-result min-tap';
        btn.textContent = career.name;
        var letters = document.createElement('span');
        letters.className = 'reveal__search-result-letters';
        letters.setAttribute('aria-hidden', 'true');
        letters.textContent = ' \u00B7 ' + careerLetters(career).join('');
        btn.appendChild(letters);
        btn.addEventListener('click', function () {
          replaceWithSearchPick(career);
        });
        item.appendChild(btn);
        searchResults.appendChild(item);
      })(matches[r].career);
    }
  });

  right.appendChild(searchSection);

  var cards = document.createElement('div');
  cards.className = 'career-cards';
  cards.setAttribute('aria-label', 'Suggested career cards');

  if (!picks.length) {
    var none = document.createElement('p');
    none.className = 'body';
    none.textContent = 'We couldn\u2019t find a match yet. Try the quiz again to see new ideas.';
    cards.appendChild(none);
    var exhausted = document.createElement('p');
    exhausted.className = 'reveal__exhausted';
    exhausted.textContent = 'No more new matches \u2014 you\u2019ve seen them all.';
    cards.appendChild(exhausted);
  } else {
    for (var p = 0; p < picks.length; p++) {
      var isKept = state.revealKeptIds.indexOf(picks[p].career.id) !== -1;
      var isFresh = prevForFresh.indexOf(picks[p].career.id) === -1;
      cards.appendChild(renderCareerCard(picks[p], isKept, isFresh));
    }
  }
  right.appendChild(cards);

  // ── Assemble spread ──
  zine.appendChild(left);
  zine.appendChild(gutter);
  zine.appendChild(right);

  var container = document.createElement('div');
  container.className = 'journey';
  container.appendChild(zine);
  container.appendChild(renderFooter(phaseToPage('reveal'), true, '\u2190 Back to quiz', goToQuiz));

  return container;
}

// Toggle a career's kept state on the reveal grid, then re-render in place
function toggleKeep(careerId) {
  var next = state.revealKeptIds.slice();
  var idx = next.indexOf(careerId);
  if (idx === -1) next.push(careerId);
  else next.splice(idx, 1);
  state.revealKeptIds = next;
  refreshReveal();
}

// Re-render the reveal spread in place. render() never animates on its own
// (foldNavigate is only used by nav actions), so this preserves the right
// page's internal scroll and the window scroll across the rebuild.
function refreshReveal() {
  var oldRight = document.querySelector('.reveal .zine__page--right');
  var scrollTop = oldRight ? oldRight.scrollTop : 0;
  var winY = window.scrollY;
  render();
  var newRight = document.querySelector('.reveal .zine__page--right');
  if (newRight) {
    newRight.scrollTop = Math.max(0, Math.min(scrollTop, newRight.scrollHeight - newRight.clientHeight));
  }
  window.scrollTo(0, winY);
}

// ─── Placeholder: Workbook ────────────────────────────────────────────────

function renderWorkbookPlaceholder() {
  var career = state.selectedCareer;
  var letters = career ? careerLetters(career) : [];

  var zine = document.createElement('div');
  zine.className = 'zine';

  var left = document.createElement('div');
  left.className = 'zine__page zine__page--left';

  var label = document.createElement('div');
  label.className = 'section-label section-label--yellow';
  label.textContent = 'WORKBOOK \u00B7 IN PREPARATION';
  left.appendChild(label);

  var heading = document.createElement('h2');
  heading.className = 'display-2';
  heading.textContent = career ? 'Workbook: ' + career.name : 'Workbook coming soon';
  left.appendChild(heading);

  var para = document.createElement('p');
  para.className = 'body';
  para.textContent = career
    ? 'Your selected career is ' + career.name + '. This is where you will explore it in depth \u2014 day-in-the-life vignettes, resource links, and guided prompts. (This screen is a stub; the workbook will land in a later build pass.)'
    : 'Explore your chosen career in depth \u2014 day-in-the-life vignettes, resource links, and guided prompts. (This screen is a stub; the workbook will land in a later build pass.)';
  left.appendChild(para);

  var gutter = document.createElement('div');
  gutter.className = 'zine__gutter';
  gutter.setAttribute('aria-hidden', 'true');

  var right = document.createElement('div');
  right.className = 'zine__page zine__page--right halftone halftone--yellow';

  // Echo the selected career's RIASEC marks on the right page
  if (career && letters.length) {
    var marks = document.createElement('div');
    marks.className = 'career-card__riasec';
    marks.setAttribute('aria-label', 'RIASEC code: ' + letters.join(''));
    for (var i = 0; i < letters.length; i++) {
      var mark = document.createElement('span');
      mark.className = 'riasec-mark riasec-mark--' + letters[i] + ' riasec-mark--lg';
      mark.setAttribute('aria-hidden', 'true');
      marks.appendChild(mark);
    }
    right.appendChild(marks);

    var rightPara = document.createElement('p');
    rightPara.className = 'body-sm italic';
    rightPara.textContent = 'Selected from your reveal spread. Use \u201CBack to results\u201D to pick a different career.';
    right.appendChild(rightPara);
  }

  zine.appendChild(left);
  zine.appendChild(gutter);
  zine.appendChild(right);

  var container = document.createElement('div');
  container.appendChild(zine);
  container.appendChild(renderFooter(phaseToPage('workbook'), true, '\u2190 Back to results', goToReveal));

  return container;
}

// ─── Navigation actions ───────────────────────────────────────────────────

function goToWelcome() {
  foldNavigate(function () {
    setState({
      phase: 'welcome',
      quizIndex: 0,
      quizAnswers: {},
      riasecProfile: null,
      revealKeptIds: [],
      revealSeenIds: [],
      revealCardIds: [], revealPrevCardIds: null,
      initialType: null
      // user is NOT touched — preserved
    });
    render();
  });
}

function goToIntro() {
  foldNavigate(function () {
    setState({ phase: 'intro', quizIndex: 0, quizAnswers: {}, riasecProfile: null, revealKeptIds: [], revealSeenIds: [], revealCardIds: [], revealPrevCardIds: null });
    // user is preserved
    render();
  });
}

function goToQuiz() {
  foldNavigate(function () {
    setState({ phase: 'quiz', quizIndex: 0, quizAnswers: {}, riasecProfile: null, revealKeptIds: [], revealSeenIds: [], revealCardIds: [], revealPrevCardIds: null });
    render();
  });
}

// TEST-ONLY: score what the student answered, or use the fixed demo profile
// when the partial answers carry too little signal (fewer than a third of the
// quiz answered — the letter counts are then mostly ties, so the top-3 letters
// would be decided by the RIASEC tie-break rather than real data). Logs what
// it used so testers can see the profile behind the reveal.
// ⚠️ REMOVE before final deployment (also the app-footer__test button in
//    renderFooter and its renderQuiz call).
var DEMO_PROFILE = { R: 5, I: 4, A: 3, S: 2, E: 1, C: 0 };
var SKIP_MIN_ANSWERS = 8;

function skipToCollating() {
  var profile = scoreRiasecProfile(state.quizAnswers);
  var answered = 0;
  for (var key in state.quizAnswers) {
    if (state.quizAnswers[key] != null) answered++;
  }
  var source;
  if (answered < SKIP_MIN_ANSWERS) {
    // Clone the demo profile — mutating DEMO_PROFILE itself would permanently
    // inflate the intro-picked letter across every later skip.
    profile = Object.assign({}, DEMO_PROFILE);
    if (state.initialType && profile[state.initialType] != null) {
      profile[state.initialType] += 1; // the intro pick still counts
    }
    source = 'demo profile (only ' + answered + ' of 24 answered — too little signal)';
  } else {
    source = 'partial answers (' + answered + ' of 24)';
  }
  console.log('[test skip] using ' + source + ' → top letters ' + getUserTopLetters(profile).join(''));
  setState({ riasecProfile: profile });
  foldNavigate(function () {
    setState({ phase: 'collating' });
    render();
    window.scrollTo(0, 0);
    startCollate();
  });
}

function goToNextQuizItem() {
  var nextIndex = state.quizIndex + 1;
  if (nextIndex < window.QUIZ_ITEMS.length) {
    foldNavigate(function () {
      setState({ quizIndex: nextIndex });
      render();
    });
  } else {
    // Last item answered — score and go to collating
    var profile = scoreRiasecProfile(state.quizAnswers);
    setState({ riasecProfile: profile });
    foldNavigate(function () {
      setState({ phase: 'collating' });
      render();
      window.scrollTo(0, 0);
      startCollate();
    });
  }
}

function goToPrevQuizItem() {
  if (state.quizIndex === 0) {
    foldNavigate(function () {
      setState({ phase: 'intro', quizIndex: 0, quizAnswers: {}, riasecProfile: null });
      render();
    });
    return;
  }
  foldNavigate(function () {
    setState({ quizIndex: state.quizIndex - 1 });
    render();
  });
}

function goToReveal() {
  foldNavigate(function () {
    setState({ phase: 'reveal' });
    render();
  });
}

function goToWorkbook() {
  foldNavigate(function () {
    setState({ phase: 'workbook' });
    render();
  });
}

// ─── Init (deferred script — DOM is already parsed) ──────────────────────

// Apply the saved/system theme BEFORE the first render so the page paints in the right colors
applyTheme(getCurrentTheme());
render();
