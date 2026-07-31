# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Middle school students exploring potential careers. They arrive after completing an in-product career quiz that suggests careers fit for them, then enter a guided, step-by-step workbook experience to explore a suggested career in depth. Each session is focused on one career at a time; the student can finish one and return to explore another suggested career in its own workbook.

The immediate user is the student themselves — doing this as part of career exploration at school or independently. There is no confirmed second audience (e.g., teacher dashboard, parent view) at this time.

## Product Purpose

`career-explorer` helps a middle school student move from "I got some career suggestions" to "I genuinely understand this career and how it connects to me." It does this by guiding them through a structured, conversational workbook that asks them to articulate — in their own words — what the career is, why they're drawn to it, what strengths they bring, what they'd need to grow, the trade-offs, and the concrete academic steps to get there.

Success means the student finishes a workbook with a deeper, personal understanding of whether this career fits them — not just facts about the job, but their own reasoned reflection on it. The workbook is a keepsake artifact of that thinking.

## Positioning

The meaningfully different mechanism is an AI-guided dialogue that walks the student through each section of the workbook step by step — surfacing relevant career resources, prompting reflection questions, and helping them shape their own answers. Unlike a static questionnaire or a one-shot career article, it accompanies the student through a structured thinking process and makes the experience engaging rather than bureaucratic. It is visually appealing by intent and design.

## Operating Context

- The product is a web app, responsive and usable on mobile, intended to be installable/usable as a PWA.
- Typical session: one student, one device, one career workbook at a time, minutes to tens of minutes per career.
- Entry: via an in-product career quiz whose results suggest careers to explore. After finishing (or setting aside) one workbook, the student can select another suggested career to explore in depth.

## Capabilities and Constraints

1. In-product career quiz that produces career suggestions the student can pick from.
2. Guided, AI-driven workbook experience, one career per workbook, step-by-step through seven fixed sections.
3. The workbook always contains the same seven sections in order: Description, Your Drivers, Your Strengths, Your Growth, Pros and Cons, Immediate Preparation, Degree Preparation.
4. Each section surfaces relevant resources to support the student's answer (e.g., career profile links, "Day in the Life" real-world examples, relevant course and degree information).
5. The student fills the workbook in their own words; the AI guides, prompts, and offers supporting material but the answers are the student's.
6. A student can explore multiple suggested careers sequentially, each in its own complete workbook.
7. Responsive web app, mobile-usable, PWA-capable.

## Brand Commitments

Undecided. No name, logo, voice, typography, or palette has been confirmed. Do not invent brand assets.

## Evidence on Hand

- One full worked-example workbook showing the intended output for "Genetic Counselor / Clinical Psychologist" including the seven sections and their filled-in content by a real middle-school student. This is an authoritative reference for the artifact the product produces; future design and content work should treat it as the template of record.
- Resource links in the example point to `careerexplorer.com` career pages. The relationship (if any) between this product and that site is not confirmed; treat them as reference links, not a declared partnership unless the user confirms otherwise. Do not fabricate testimonials, customers, partnerships, or endorsements.

## Product Principles

1. **Guided, not bureaucratic.** The workbook is a conversation, not a form. The AI companion makes each section feel like an engaging, step-by-step discovery, not homework to grind through.
2. **Personal reasoning over facts alone.** Each section asks the student to articulate, in their own words, what the career means to them — not just read a job description. The product's value is the student's own reflection.
3. **One career at a time, fully.** Each workbook completes a focused exploration of one career. Students can explore several sequentially; each gets its own complete artifact.
4. **Visually appealing by design.** The experience should be beautiful and engaging — this is a revealed ambition of the product, not a nice-to-have. A middle-school student should want to be in it.
5. **Portable and accessible by default.** Web, responsive, mobile-friendly, PWA. Nothing in the experience should assume desktop or a single device class.

## Accessibility & Inclusion

No product-specific accessibility standard has been confirmed beyond responsive/usable-on-mobile. Treat responsive layout, readable typography, and keyboard/screen-reader friendliness as the floor; raise it if the user later specifies a formal standard (e.g., WCAG 2.2 AA) — recorded as an open decision, not a confirmed commitment.
