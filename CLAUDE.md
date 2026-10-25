# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This is Purv Taparia's personal portfolio: a static site with no build system, package manager, or test suite — plain HTML/CSS/JS deployed directly via GitHub Pages.

- `index.html` — the entire single-page site (hero, about, achievements, certifications, latest/changelog, projects, books, FAQ, contact), with all CSS inline (JS lives in `assets/site.js`). Large file (~3.9k lines); also holds six `<script type="application/ld+json">` blocks (Person, WebSite, WebPage, BreadcrumbList, software-projects ItemList, FAQPage).
- `assets/site.js` — all page behaviour (loaded with `defer` and a `?v=` cache-busting query; bump it when the file changes). Only the tiny theme/crawler flag script stays inline at the top of `<head>`.
- `assets/fonts/` — self-hosted WOFF2 fonts (Syne, DM Mono, Instrument Serif). Don't re-add Google Fonts links.
- `404.html` — custom not-found page (noindex, not in the sitemap).
- `privacy.html`, `terms.html` — standalone legal pages, same visual system as the main site.
- `assets/Purv Taparia - Resume.pdf` — the resume, linked from the hero "Download Resume" button. It's a PDF edited outside this repo; flag bio changes to Purv rather than trying to edit it. (`Resume Old.pdf` is the previous version.)
- `assets/og-image.png` — social preview image referenced by `og:image`, `twitter:image`, and the Person JSON-LD. Don't delete it.
- `sitemap.xml` — referenced from `robots.txt`; add any new top-level page to it.
- `llms.txt` — a plain-text bio summary for AI crawlers; kept separate from the HTML but must stay factually in sync with it.
- `.design-sync/design-principles.md` — the authoritative design system reference (color tokens, type scale, card/button specs, motion curves). Read this before making any visual change rather than reverse-engineering CSS.
- `archive/old-site` branch — holds a previous version of the site (`old-site/`) that was removed from `gh-pages` to cut dead weight; not present in the working tree on `gh-pages`.

## Working locally

No install/build step. Open `index.html` directly in a browser, or serve the directory with any static server (e.g. `python3 -m http.server`) to test relative paths and fonts.

## Deployment

`gh-pages` is both the default/main branch and the branch GitHub Pages serves live — there is no separate build/output branch. Anything committed to `gh-pages` and pushed goes live immediately at tapariapurv.github.io. Treat pushes to `gh-pages` accordingly.

## Bio facts must stay in sync

Purv's grade, school, and other biographical facts are duplicated in multiple places and must be updated together whenever they change:
- `index.html`: `#about` intro paragraph (the hero `.hero-desc` deliberately stays a short headline — "a student from Mumbai" — with no grade or school), the hero cards and marquee, the "Who is Purv Taparia?" FAQ answer (JSON-LD `text` + visible `<p>`), and the Person JSON-LD (`alumniOf`, `award` grade references).
- `assets/Purv Taparia - Resume.pdf`: Education section (PDF, edited outside the repo — remind Purv to regenerate it).
- `llms.txt`: intro line and About section.
- `privacy.html`: the "Children's privacy" section currently says the school name *is* published — keep this wording consistent with whatever is actually shown elsewhere on the site.

## llms.txt must mirror every site content change

`llms.txt` is a full plain-text mirror of the site's content, not just a bio. Whenever anything visible on the site changes — a project, achievement, certification, book, skill, or link is added, edited, or removed — make the matching change in `llms.txt` in the same commit. Its sections map to `index.html` like this:
- **Key Achievements** ↔ `#achievements`
- **Certifications** ↔ `#certifications`
- **Published Books** ↔ `#books`
- **Technical Skills** ↔ the skill groups in `#about`
- **Changelog** ↔ `#latest` (month-by-month history, newest first — projects, certifications and milestones; only the newest month shows, older ones sit behind "View Full History" as `.log-extra` rows. When a new month starts, add it as the first `<li>` (no `.log-extra`), add `.log-extra` to the previous month, and keep the whole history)
- **AI emphasis is deliberate.** Purv's positioning leads with AI building: the hero line, typewriter words (`AI Builder`), title/meta, Person `jobTitle`. Any project built with Claude Code gets a `<span class="proj-tag t-ai">✳ Claude Code</span>` badge on both its project card and its changelog row, and "built with Claude Code" in `llms.txt` (source of truth: the resume's project badges).
- Changelog rows without an exact month (Olympiads, which are only known by grade) use `<span class="log-date">2024–25<small>Grade 3</small></span>` instead of `<time>`. Grade 5 = school year 2026–27, and the school year runs June to March. Don't invent months.
- **Projects** ↔ `#projects` (every card, same order, with `[Mon YYYY]` date, tech, and the card's link if it has one). Software projects also get an entry in the "Software Projects" ItemList JSON-LD in `index.html`. The FAQ "What projects…" answer just links to `#projects`, so it doesn't need updating.
- **Links** ↔ hero/contact links

Before committing, diff the site against `llms.txt` for the section you touched — it has drifted before (missing projects and certifications).

## Freshness dates must be updated on every content change

Whenever `index.html`, `privacy.html`, or `terms.html` content changes, update **every** date field before committing — these are deliberate SEO/GEO freshness signals, not incidental:
- `index.html`: the `<meta property="article:modified_time">` tag, two `"dateModified"` fields in the JSON-LD blocks near the top of `<head>`, the FAQ JSON-LD/visible-text answer to "Is this portfolio actively maintained?" (says "It was last updated on ..." in prose, two occurrences — schema copy and visible `<summary>/<p>` pair), and the visible `<div class="freshness">...Last updated <time datetime="...">` in the About section.
- `privacy.html`: `<div class="updated">Last updated: ...</div>`.
- `terms.html`: `<div class="updated">Last updated: ...</div>`.

Grep for `Last updated\|dateModified\|modified_time` across `*.html` (excluding `old-site` if it's ever reintroduced) to catch all instances before every commit — dates can be hardcoded in prose sentences, not just in date-labeled fields, so don't rely on grepping only structural markers.

## Every new feature: required checks

Before calling any feature or content change done, confirm all of these. Each one has broken on this site before.

**Google Search Console (SEO)**
- Googlebot must see the content. A tiny script at the top of `<head>` adds `html.js` (and `html.bot` for crawler user agents). Everything that hides content is keyed to those classes: `.rev` reveals, collapsed `.log-extra` months, the `.bk-more` books, the book-picker panels, and the pinned horizontal projects row. `html.bot` (and no-JS visitors) get the plain, fully expanded page. Any new hidden-until-JS element must follow the same pattern (hide only under `.js`, show under `.bot`), or Search Console's Live Test screenshots it blank. Don't serve bots different *content*; that is cloaking.
- Content must be real text in the HTML (not injected only by JS, not only in images), with one `<h1>` on the page and `<h2>`/`<h3>` in order.
- Links are crawlable `<a href>`; external ones use `target="_blank"`. Images get descriptive `alt`.
- Keep the structured data valid: new projects go in the "Software Projects" ItemList JSON-LD. The FAQPage JSON-LD must contain **exactly** the questions visible in `#faq` — hidden-only FAQ markup violates Google's structured-data policy. The FAQ is intentionally trimmed to questions whose answers aren't already on the page; don't re-add ones that repeat About/Books/Projects. Validate with Google's Rich Results Test after pushing.
- New top-level pages go in `sitemap.xml` with a `<lastmod>`, and get their own `<title>`, meta description, canonical and OG tags. Pages that shouldn't rank get `<meta name="robots" content="noindex, follow">` (like the `old-portfolio` repo). Don't block them in robots.txt, or crawlers can't read the noindex tag.
- No artificial load delays. The old page-loader overlay was removed in the October 2026 redesign; don't add one back. The hero photo (`assets/purv.webp`) is the LCP image and is preloaded, so keep it small (WebP, ~25 KB).
- PDFs in `assets/` are indexed by Google, so set a real `/Title` and `/Author` ("Purv Taparia — ...") on any new PDF.
- After pushing, tell Purv to run URL Inspection → Live Test in Search Console and resubmit `sitemap.xml`.

**AI assistants and chatbots (GEO / `llms.txt`)**
- Mirror the change in `llms.txt` in the same commit (see the section map above), with the same facts, dates and links as the page.
- State facts plainly and specifically (names, numbers, month and year) so AI tools can quote them. Keep the Person JSON-LD (`sameAs`, `knowsAbout`, `award`, `jobTitle`) in sync with the visible bio.

**Analytics**
- The site uses **Umami** (`cloud.umami.is` script in `<head>`) for analytics and a `google-site-verification` meta tag for Search Console. There is no Google Analytics. Never remove or duplicate either tag. If a feature adds an important CTA, consider a `data-umami-event="..."` attribute so clicks are tracked.

**Design and QA (anything that touches the UI)**
- Build from `.design-sync/design-principles.md` tokens and existing classes (`.slabel`, `.sec-title` + one `<em>` italic word, `.proj-tag t-live/t-wip/t-hw`, `--ease`/`--spring`). Keep section backgrounds alternating `--bg` / `--bg2`.
- Playful hero toys (flingable stickers, the name magnet, cursor spotlight, card tilt, confetti) run only for mouse users wider than 960px (`toys` in the script). Phones get only a tap squish and a speech bubble, and the photo uses `touch-action: pan-y` so it never blocks scrolling. Purv wants the phone site kept light: put new interactive effects behind the same gate.
- Look at it before shipping: screenshot desktop (~1300px) and phone (375px and 320px) in **both dark and light themes**. Headless Chrome won't go narrower than 500px, so wrap the page in a narrow `<iframe>` for phone widths. Check hover and focus states, long titles wrapping, missing links (non-link rows), and no horizontal overflow.

## Design system

Full spec is in `.design-sync/design-principles.md`. Key tokens to reuse rather than re-derive:
- Fonts: **Syne** (headings/body, weights 400–800), **DM Mono** (labels/metadata/nav), **Instrument Serif italic** (exactly one emphasized word per major heading).
- Dark mode is default: bg `#080a0f`, surface `#141b27`, accent teal `#00e6be`, gold `#f5c842` (achievements only), coral `#ff6b6b` (hardware project tags only).
- Cards use the `.tc` tilt-card pattern (mouse-tracked radial shine, 3D tilt on hover, spring easing `cubic-bezier(0.34, 1.56, 0.64, 1)`).
- Section labels follow the `.slabel` pattern (small horizontal rule + DM Mono uppercase label).
