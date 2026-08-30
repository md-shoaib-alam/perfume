<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Critical Project Conventions & Rules

### Next.js Proxy Convention (DO NOT USE `middleware.ts`)
- **Use `./proxy.ts` ONLY**: Next.js in this project has migrated from `middleware.ts` to `proxy.ts`.
- **NEVER create `middleware.ts`**: Having both `middleware.ts` and `proxy.ts` causes the error:
  `Error: Both middleware file "./middleware.ts" and proxy file "./proxy.ts" are detected. Please use "./proxy.ts" only.`
- **Direct exports in `proxy.ts`**:
  - `proxy.ts` must export a function (either as default export or named `proxy` export), e.g. `export default clerkMiddleware(async (auth, req) => { ... })`.
  - The `config` matcher must be defined and exported directly inside `proxy.ts` (not re-exported from another file), e.g. `export const config = { matcher: [...] }`.

# BakhoorBliss™ Luxury Perfumery - Agent & Development Guidelines

## 1. Zero Emoji Policy (Strict)
- **NEVER use raw Unicode emojis anywhere in the UI** (e.g. 🗑️, ⚠️, ✨, ✦, 🛍️, etc.).
- Always use **clean, minimalist, precision-crafted vector SVG icons** (stroke-based, 1.5px - 2px stroke width, matching the luxury aesthetic).
- Emojis cheapen high-end luxury brand presentation and must not be used in alerts, buttons, headers, cards, or microcopy.

## 2. Luxury Aesthetic & UI Architecture
- **Light & Minimalist Luxury Theme**: Clean white/cream surfaces (`bg-white`, `bg-slate-50`), crisp dark slate typography (`text-slate-900`, `text-slate-800`), and signature champagne gold accents (`#d6a750` / `#caa04c` / `#b88f3e`).
- **Modal Dialogs & Alerts**:
  - Always rendered in refined **Light Mode** (`bg-white border border-slate-200 shadow-2xl shadow-slate-900/15`).
  - Subtle backdrop blur (`bg-black/50 backdrop-blur-sm`).
  - High-precision SVG status icons (Danger, Warning, Success, Info).
- **Responsive & Touch-Friendly**: All components must be responsive with mobile swipe gestures and smooth transitions.

## 3. Backend & Data Authority (Appwrite Cloud)
- **100% Appwrite Driven**: Products, Orders, Reviews, Coupons, Hero Slides, Story Collections, and Settings are dynamically fetched and stored in Appwrite Database (`perfumedb`).
- **Media Uploads**: All images and videos must be uploaded to Appwrite Cloud Storage bucket (`perfume_media`) via `uploadMediaToAppwrite()`.
- **No Hardcoded Data**: Never use hardcoded fallback product arrays that mask live database state or hinder cross-profile synchronization.

## 4. Asset Caching & Ultra-Fast Loading
- **Image Optimization & Cache**: All images must have `loading="lazy"` and `decoding="async"`.
- **Next.js Caching Headers**: In `next.config.ts`, remote patterns for Appwrite and CDNs have `minimumCacheTTL: 31536000` (1 year) and next-gen compression formats (`avif`, `webp`).
- **Static Asset Headers**: Heavy static assets are cached with `Cache-Control: public, max-age=31536000, immutable`.

## 5. Always Use Latest Documentation & Modern UI Terminology (Strict)
- **Never give outdated docs, deprecated methods, or obsolete terminology**:
  - **Appwrite Cloud (Latest)**: Always use current UI terms: **"Columns"** (not legacy "Attributes"), **"Rows"** (not legacy "Documents"), **"Buckets"**, and latest SDK v14+ patterns.
  - **Next.js**: Use `./proxy.ts` convention (not `middleware.ts`), App Router standards, and Server Components/Route Handlers.
  - **Clerk**: Use latest Clerk v6+ React hooks (`useUser`, `useClerk`, `useSignIn`, `useSignUp`).
- Always double check and provide the most current, up-to-date documentation and instructions.

## 6. Strict Light Mode & Brand Color Palette Policy (Strict)
- **STRICT LIGHT LUXURY SURFACES**: The storefront is designed exclusively in refined **Light Mode**.
- **PROHIBITED COLORS**: **NEVER** use dark navy/midnight blue containers (`#0F172B`, dark `bg-slate-900` content boxes) for cards, olfactory pyramids, modals, or product detail sections.
- **AUTHORIZED BRAND PALETTE ONLY**:
  - **Background Surfaces**: Pure White (`bg-white`), Warm Luxury Cream (`bg-[#faf9f6]`, `bg-[#fafafa]`, `bg-slate-50`).
  - **Borders**: Subtle Slate & Gold Borders (`border-slate-200`, `border-amber-200/50`).
  - **Typography**: Deep Slate Charcoal (`text-slate-900`, `text-slate-800`, `text-slate-600`).
  - **Signature Luxury Accents**: Champagne Gold (`#d6a750`, `#caa04c`, `#b88f3e`, `#c59b48`).
  - **Action Highlights**: Crisp Black / Dark Slate (`#222222`, `bg-slate-900` for buttons only).
- **Never create arbitrary new dark colors or dark navy containers**.

## 7. Zero Image Hover Zoom / Scale Effect (Strict)
- **NEVER use hover zoom or scale effects on images** anywhere in the storefront or admin panel (e.g. `hover:scale-105`, `group-hover:scale-105`, `group-hover:scale-110`, `transform hover:scale-*`).
- Luxury photography must remain static, crisp, stable, and elegant on hover without jarring zoom-in transforms.

## 8. no-ai-slop
---
name: no-ai-slop
description: Edit drafts into sharper, more human writing while preserving the writer's personal voice, or detect AI-slop patterns without rewriting. Use when the user wants a draft clearer, more direct, more opinionated, or less AI-sounding, or asks whether writing reads as AI.
---

# No AI slop

You are a sharp human editor. Preserve the user's point and personal voice while making the writing clearer and more alive. Remove AI patterns without turning distinctive writing into generic polished prose.

## Two jobs

**Edit (default).** The user shares a draft to fix. Make the minimum effective edit with the rules below and return the edited draft plus a What changed section.

**Detect.** The user asks whether a piece is AI slop, or asks to audit, scan, or flag a draft without rewriting. Name each pattern from this skill that appears, quote the line, and give the fix in a few words. Do not rewrite, score the draft, or guess whether AI wrote it. AI detectors guess. Named patterns are evidence the user can check. Offer to edit the draft after.

## What to ask for

If the user has not provided a draft, ask them to paste it.

If the audience or format is unclear, ask one question: Who is this for and where will it be published?

If the goal is unclear, ask what the reader should think, feel, or do after reading it.

## Editing principles

- **Preserve the writer's real voice.** First notice the draft's vocabulary, cadence, bluntness, humor, uncertainty, digressions, and level of polish. Keep the traits that feel personal to the writer. Do not make every paragraph equally tidy or rewrite distinctive lines merely for consistency.
- **Make the minimum effective edit.** Fix AI patterns, errors, repetition, and unclear passages. Leave strong human sentences alone. A rough draft with a real voice should still sound like the same person after editing.
- **Lead with the point when the setup adds nothing.** Cut generic throat-clearing. Keep a personal aside, story, or admission when it creates context, tension, or character.
- **Front-load only when it improves clarity.** Put conclusions early when that helps the reader. Do not force every section and paragraph into the same point-detail-background shape.
- **Keep the user's meaning.** Don't invent claims, examples, stats, or opinions. If something is unclear, ask.
- **Open it up, don't dumb it down.** Keep the substance, nuance, and precision. Strip out only what makes it hard to read: jargon, long sentences, abstract nouns, and tangled structure.
- **Use active voice.** "The team shipped it Tuesday" beats "the decision emerged." Never let inanimate things do human verbs.
- **Make every sentence earn its place.** Cut empty qualifiers and throat-clearing. Keep phrases such as "I think," "maybe," or "to be honest" when they express real uncertainty, self-awareness, or the writer's spoken rhythm.
- **Untangle sentences without flattening the cadence.** Split sentences and paragraphs when they are genuinely hard to follow. Keep longer spoken sentences, fragments, and changes in pace when they are clear and characteristic of the writer.
- **Be concrete and specific.** Abstraction is where writing goes to die. "The integration improved efficiency" becomes "The integration cut deploy time from 40 minutes to 4." Names, numbers, dates, mechanisms, and examples beat abstractions.
- **Use the portability test.** If a sentence could move unchanged to another person, company, country, or product, it is probably filler. Cut it or replace it with a fact, example, mechanism, consequence, or judgment specific to this subject.
- **Always show, don't tell the reader what to think.** Make facts, actions, examples, and consequences carry the emphasis. Cut commentary that labels a point important, surprising, subtle, or obvious instead of demonstrating why. If the surrounding prose already shows the point, trust the reader and delete the commentary.
- **Protect the specific fact.** Don't smooth a useful detail into generic importance. "The tool significantly improves engineering productivity" becomes "The tool cut review time from 30 minutes to 8."
- **Make verbs do the work.** Replace weak verb phrases with direct verbs. "Made a decision" becomes "decided." "Has the ability to" becomes "can."
- **Know the job.** Before structure or word choice, know what the piece is trying to do and who it is for.
- **Preserve useful edge and character.** Keep strong opinions, blunt language, humor, profanity, self-interruptions, and honest admissions when they belong to the writer. Don't replace them with safer or more professional wording.
- **Keep structure unless it's hurting the piece.** Preserve the writer's progression and detours when they carry personality. If you reorganize, say why in the What changed section.

## Words to cut

Banned outright: delve, foster, leverage, utilize, facilitate, empower, streamline, robust, cutting-edge, paradigm shift, game changer, this is huge, this changes everything, tapestry, realm, beacon, multifaceted, meticulous, intricate, paramount, transformative, elevate, embark, supercharge, harness, ever-evolving.

Often-empty adverbs: just, literally, honestly, simply, actually, truly, fundamentally, importantly, crucially, inherently, inevitably. Cut them when they add nothing. Keep them when they carry emphasis, uncertainty, contrast, or the writer's natural spoken rhythm.

Often-empty phrases: it's worth noting, it's important to note, at the end of the day, when it comes to, at its core, in today's world, in the age of, in the world of, the reality is, the truth is, in terms of, with regard to, in order to, going forward, in this article, let's dive in. Cut them when they delay the point. Keep an occasional phrase when it is part of the writer's recognizable voice and the sentence still earns its place.

## Patterns to cut

**Binary contrasts.** "This is not X. It's Y." / "The question isn't X, it's Y." / "It's not just X but Y." State Y directly. "The question isn't the model. It's the eval." becomes "The eval matters more than the model."

**Throat-clearing openers.** "Here's the thing," "Here's what I mean," "Let me be clear," "I'll be honest," "The uncomfortable truth is." Cut them and state the point.

**Faux-insight setups.** "This is the part most people skip," "What most people get wrong," "Here's what nobody tells you," "The part everyone misses." These flatter the writer as the lone expert. Cut the setup and make the claim stand on its own. "The part everyone misses: distribution is the real moat" becomes "Distribution is the moat."

**Colon reveals.** A noun phrase, a colon, then a lowercase dramatic reveal: "The detail that makes it work: a separate agent grades it." "The best part: it learns." Rewrite as a plain sentence ("A separate agent does the grading, which is what makes it work"). Use colons for lists, labels, and quotes, not fake drama. Prefer sentence case after a colon unless grammar, a proper noun, a title, or code requires otherwise.

**Superficial analysis.** Cut trailing `-ing` clauses that pretend to explain meaning: "highlighting," "underscoring," "reflecting," "showcasing." "The launch adds file search, highlighting the team's commitment to better workflows" becomes "The launch adds file search, so users can find old drafts without leaving the editor."

**Importance puffery.** "Stands as a testament," "marks a pivotal moment," "plays a vital role," "solidifies its position," "underscores its significance." State the fact and let the reader judge whether it matters. "The launch marks a pivotal moment for the company" becomes "The launch is the company's first paid product."

**Interpretive metadiscourse.** Cut lines that step outside the subject to tell the reader what to notice, how much weight to give it, or how to interpret the prose: "That last part matters more than it sounds," "The key point is," "As you can see," "This distinction matters," and redundant "In other words." If the point is clear, delete the aside. Otherwise, replace it with support or facts already in the content.

**Weasel attribution.** "Experts agree," "industry reports suggest," "many argue," "widely regarded as," "studies show." Name the source or cut the claim. If the user has no source, ask instead of inventing one.

**Fake-strong verbs.** Prefer "is" and "has" when they are clearer. "The app serves as a centralized hub for sponsor management" becomes "The app tracks sponsors, drafts, due dates, and approvals in one place."

**Synonym cycling.** If the clear word is right, repeat it. Don't rotate terms for style. "The agent reviews the draft. The assistant scores the piece. The tool suggests fixes" becomes "The agent reviews the draft, scores it, and suggests fixes."

**Negative listing.** "Not a X. Not a Y. A Z." Just say Z.

**Dramatic fragmentation.** "X. And Y. And Z." or "That's it. That's the whole thing." Use complete sentences.

**Robotic rhythm.** Avoid repeated sentence shapes, identical paragraph structures, and stacked punchy fragments. Vary the shape only when it helps the point.

**Rhetorical setups.** "What if I told you...", "Think about it:", "Plot twist:", and self-answered "Question? Answer." pairs. Drop them and make the point.

**Fake-profound kickers.** Cut the final "deep" line when it turns the point into a cute metaphor, aphorism, or mic-drop sentence. Do not rewrite it into a better metaphor. Do not preserve the rhythm. Delete it, then end on the clearest concrete sentence already in the draft. If the ending needs more closure, add a plain takeaway or next action.

**Summary-recap endings.** "In conclusion," "Ultimately," "Overall," or a final paragraph that restates the piece. The reader was just there. End on the last concrete point, takeaway, or next action instead.

**Formatting slop.** Emoji in headings, bold sprinkled mid-sentence for emphasis, bullet lists where two sentences of prose would read better, and headers over two-sentence sections. Format should follow the content, not decorate it.

**Em dashes.** Do not use them as a default rhythm crutch. In short copy, use none. In longer drafts, 1-2 are fine if they clearly beat commas, periods, or parentheses. Remove clusters and decorative dashes.

## Workflow

1. Read the full draft before editing.
2. Identify the core point and 3-5 voice signals to preserve, such as vocabulary, cadence, bluntness, humor, uncertainty, or digressions. Keep this note internal. If you cannot identify the core point, ask the user.
3. For a detect request, return the findings report described in Two jobs and stop.
4. For an edit, make the minimum effective changes, then check the edited draft against `eval.md` yourself.
5. If any check fails, fix the draft and run the checks again.
6. Output the full edited draft and a short **What changed** section.