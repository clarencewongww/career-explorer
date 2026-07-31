/* ═══════════════════════════════════════════════════════════════════════════
   Career Explorer — Quiz Data

   Demo content. 24 middle-school-context items:
     - 12 Likert items (2 per RIASEC letter R, I, A, S, E, C)
     -  6 Scenario items (1 per RIASEC letter)
     -  6 Card-sort items (1 per RIASEC letter)

   Scoring:
     - Likert: +1 toward the item's letter when the student picks 4 (Agree)
       or 5 (Strongly agree); otherwise 0.
     - Scenario & Card-sort: +1 toward the chosen option's letter.

   Replace with production copy when ready.
   ═══════════════════════════════════════════════════════════════════════════ */

window.QUIZ_ITEMS = [
  // ─── Realistic (R) — Likert ─────────────────────────────────────────────
  { id: 'likert-r1', type: 'likert', letter: 'R', prompt: "I can spend a whole afternoon fixing a bike, building a model, or figuring out how something works with my hands." },
  { id: 'likert-r2', type: 'likert', letter: 'R', prompt: "I'd rather be outside doing something physical than inside reading or doing a puzzle." },

  // ─── Investigative (I) — Likert ─────────────────────────────────────────
  { id: 'likert-i1', type: 'likert', letter: 'I', prompt: "When I see something I don't understand, I have to figure out why before I move on." },
  { id: 'likert-i2', type: 'likert', letter: 'I', prompt: "I like doing experiments or research projects where the answer isn't obvious yet." },

  // ─── Artistic (A) — Likert ──────────────────────────────────────────────
  { id: 'likert-a1', type: 'likert', letter: 'A', prompt: "I get into a zone when I'm drawing, writing music, painting, or making something new." },
  { id: 'likert-a2', type: 'likert', letter: 'A', prompt: "If a school project could be a poster, video, or story instead of a slideshow, I always pick the creative one." },

  // ─── Social (S) — Likert ────────────────────────────────────────────────
  { id: 'likert-s1', type: 'likert', letter: 'S', prompt: "When a friend is upset, I drop what I'm doing to listen and help." },
  { id: 'likert-s2', type: 'likert', letter: 'S', prompt: "I'd rather help a class understand a hard topic than beat the class at a test." },

  // ─── Enterprising (E) — Likert ──────────────────────────────────────────
  { id: 'likert-e1', type: 'likert', letter: 'E', prompt: "If there's a group project, I usually end up being the one who organises the team." },
  { id: 'likert-e2', type: 'likert', letter: 'E', prompt: "I like pitching ideas to people and getting them excited about something." },

  // ─── Conventional (C) — Likert ──────────────────────────────────────────
  { id: 'likert-c1', type: 'likert', letter: 'C', prompt: "I'm the person who keeps the group chat on track and reminds people about deadlines." },
  { id: 'likert-c2', type: 'likert', letter: 'C', prompt: "I find it satisfying to sort things — a tidy folder, a clean desk, a finished checklist." },

  // ═════════════════════════════════════════════════════════════════════════
  //  SCENARIO ITEMS  (1 per RIASEC letter)
  // ═════════════════════════════════════════════════════════════════════════

  // ─── Realistic (R) — Scenario ───────────────────────────────────────────
  {
    id: 'scenario-r1',
    type: 'scenario',
    letter: 'R',
    prompt: "It's a Saturday and you have free time. Which sounds most fun?",
    options: [
      { label: "Building something in the garage or fixing up your bike.", letter: 'R' },
      { label: "Reading a book about how the world works.", letter: 'I' },
      { label: "Making a short film or zine about your week.", letter: 'A' }
    ]
  },

  // ─── Investigative (I) — Scenario ───────────────────────────────────────
  {
    id: 'scenario-i1',
    type: 'scenario',
    letter: 'I',
    prompt: "You're in science class and the teacher shows something weird. What's your first thought?",
    options: [
      { label: "I want to know exactly why that happens.", letter: 'I' },
      { label: "I wonder what it would look like if we tried it ourselves.", letter: 'R' },
      { label: "I want to write down exactly what the teacher said.", letter: 'C' }
    ]
  },

  // ─── Artistic (A) — Scenario ────────────────────────────────────────────
  {
    id: 'scenario-a1',
    type: 'scenario',
    letter: 'A',
    prompt: "Your class has to make a project about your favourite book. Which would you pick?",
    options: [
      { label: "Draw the cover or make a poster of the main scene.", letter: 'A' },
      { label: "Write a structured report with sections and bullet points.", letter: 'C' },
      { label: "Act out a scene with friends for the class.", letter: 'S' }
    ]
  },

  // ─── Social (S) — Scenario ──────────────────────────────────────────────
  {
    id: 'scenario-s1',
    type: 'scenario',
    letter: 'S',
    prompt: "A new student joins your class and is sitting alone at lunch. What do you do?",
    options: [
      { label: "Go sit with them and ask them if they want company.", letter: 'S' },
      { label: "Invite them to join your group project later.", letter: 'E' },
      { label: "Give them space — they'll find their people.", letter: 'R' }
    ]
  },

  // ─── Enterprising (E) — Scenario ────────────────────────────────────────
  {
    id: 'scenario-e1',
    type: 'scenario',
    letter: 'E',
    prompt: "Your friends want to start a small business — a bake sale or a club. What role do you take?",
    options: [
      { label: "I'm the one pitching the idea and getting everyone excited.", letter: 'E' },
      { label: "I'll keep track of the money and make the schedule.", letter: 'C' },
      { label: "I'll design the logo and the posters.", letter: 'A' }
    ]
  },

  // ─── Conventional (C) — Scenario ────────────────────────────────────────
  {
    id: 'scenario-c1',
    type: 'scenario',
    letter: 'C',
    prompt: "Your class is doing a group trip and someone has to plan the details. What's your style?",
    options: [
      { label: "I'll make the checklist, the timeline, and the budget.", letter: 'C' },
      { label: "I'll get everyone on board and keep morale up.", letter: 'E' },
      { label: "I'll research the best places to go and what we can learn.", letter: 'I' }
    ]
  },

  // ═════════════════════════════════════════════════════════════════════════
  //  CARD-SORT ITEMS  (1 per RIASEC letter)
  // ═════════════════════════════════════════════════════════════════════════

  // ─── Realistic (R) — Card-sort ──────────────────────────────────────────
  {
    id: 'cardsort-r1',
    type: 'cardsort',
    letter: 'R',
    prompt: "Pick the one you'd rather do this weekend.",
    options: [
      { label: "Build a treehouse out of scrap wood with a friend.", letter: 'R' },
      { label: "Spend the day drawing characters for a comic.", letter: 'A' }
    ]
  },

  // ─── Investigative (I) — Card-sort ──────────────────────────────────────
  {
    id: 'cardsort-i1',
    type: 'cardsort',
    letter: 'I',
    prompt: "Which one grabs you more?",
    options: [
      { label: "Take apart an old gadget to see how it works.", letter: 'I' },
      { label: "Volunteer at the animal shelter for the afternoon.", letter: 'S' }
    ]
  },

  // ─── Artistic (A) — Card-sort ───────────────────────────────────────────
  {
    id: 'cardsort-a1',
    type: 'cardsort',
    letter: 'A',
    prompt: "If you had two free hours, which would you pick?",
    options: [
      { label: "Make a song or short film about something you care about.", letter: 'A' },
      { label: "Organize your whole room, label everything, and reset.", letter: 'C' }
    ]
  },

  // ─── Social (S) — Card-sort ─────────────────────────────────────────────
  {
    id: 'cardsort-s1',
    type: 'cardsort',
    letter: 'S',
    prompt: "Which would you rather help with?",
    options: [
      { label: "Tutor a younger student who's struggling with a subject.", letter: 'S' },
      { label: "Help your family fix something around the house.", letter: 'R' }
    ]
  },

  // ─── Enterprising (E) — Card-sort ───────────────────────────────────────
  {
    id: 'cardsort-e1',
    type: 'cardsort',
    letter: 'E',
    prompt: "A group needs a leader for a project. You\u2026",
    options: [
      { label: "Step up \u2014 you're good at getting people moving.", letter: 'E' },
      { label: "Offer to do the research and figure out the plan.", letter: 'I' }
    ]
  },

  // ─── Conventional (C) — Card-sort ───────────────────────────────────────
  {
    id: 'cardsort-c1',
    type: 'cardsort',
    letter: 'C',
    prompt: "Which kind of task do you actually enjoy?",
    options: [
      { label: "Filing, sorting, and labelling a messy drawer until it's perfect.", letter: 'C' },
      { label: "Pitching an idea to a room of people.", letter: 'E' }
    ]
  }
];
