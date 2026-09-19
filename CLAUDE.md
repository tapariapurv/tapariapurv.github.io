# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This is Purv Taparia's personal portfolio: a static site with no build system, package manager, or test suite — plain HTML/CSS/JS deployed directly via GitHub Pages.

- `index.html` — the entire single-page site (hero, about, achievements, certifications, projects, books, FAQ, contact), with all CSS and JS inline. Large file (~3.9k lines); also holds six `<script type="application/ld+json">` blocks (Person, WebSite, WebPage, BreadcrumbList, software-projects ItemList, FAQPage).
- `privacy.html`, `terms.html` — standalone legal pages, same visual system as the main site.
- `assets/Purv Taparia - Resume.pdf` — the resume, linked from the hero "Download Resume" button. It's a PDF edited outside this repo; flag bio changes to Purv rather than trying to edit it. (`Resume Old.pdf` is the previous version.)
- `assets/og-image.png` — social preview image referenced by `og:image`, `twitter:image`, and the Person JSON-LD. Don't delete it.
- `sitemap.xml` — referenced from `robots.txt`; add any new top-level page to it.
- `css/style.css`, `js/main.js`, `js/animations.js` — legacy files, **not loaded by any page**. Edit the inline `<style>`/`<script>` in `index.html` instead.
- `llms.txt` — a plain-text bio summary for AI crawlers; kept separate from the HTML but must stay factually in sync with it.
- `.design-sync/design-principles.md` — the authoritative design system reference (color tokens, type scale, card/button specs, motion curves). Read this before making any visual change rather than reverse-engineering CSS.
- `archive/old-site` branch — holds a previous version of the site (`old-site/`) that was removed from `gh-pages` to cut dead weight; not present in the working tree on `gh-pages`.

## Working locally

No install/build step. Open `index.html` directly in a browser, or serve the directory with any static server (e.g. `python3 -m http.server`) to test relative paths and fonts.

## Deployment

`gh-pages` is both the default/main branch and the branch GitHub Pages serves live — there is no separate build/output branch. Anything committed to `gh-pages` and pushed goes live immediately at tapariapurv.github.io. Treat pushes to `gh-pages` accordingly.

## Bio facts must stay in sync

Purv's grade, school, and other biographical facts are duplicated in multiple places and must be updated together whenever they change:
- `index.html`: hero `.hero-desc`, `#about` intro paragraph, the hero cards and marquee, the FAQ JSON-LD `text` fields (two occurrences), and the Person JSON-LD (`alumniOf`, `award` grade references).
- `assets/Purv Taparia - Resume.pdf`: Education section (PDF, edited outside the repo — remind Purv to regenerate it).
- `llms.txt`: intro line and About section.
- `privacy.html`: the "Children's privacy" section currently says the school name *is* published — keep this wording consistent with whatever is actually shown elsewhere on the site.

## llms.txt must mirror every site content change

`llms.txt` is a full plain-text mirror of the site's content, not just a bio. Whenever anything visible on the site changes — a project, achievement, certification, book, skill, or link is added, edited, or removed — make the matching change in `llms.txt` in the same commit. Its sections map to `index.html` like this:
- **Key Achievements** ↔ `#achievements`
- **Certifications** ↔ `#certifications`
- **Published Books** ↔ `#books`
- **Technical Skills** ↔ the skill groups in `#about`
- **Projects** ↔ `#projects` (every card, same order, with `[Mon YYYY]` date, tech, and the card's link if it has one). Software projects also get an entry in the "Software Projects" ItemList JSON-LD in `index.html`. The FAQ "What projects…" answer just links to `#projects`, so it doesn't need updating.
- **Links** ↔ hero/contact links

Before committing, diff the site against `llms.txt` for the section you touched — it has drifted before (missing projects and certifications).

## Freshness dates must be updated on every content change

Whenever `index.html`, `privacy.html`, or `terms.html` content changes, update **every** date field before committing — these are deliberate SEO/GEO freshness signals, not incidental:
- `index.html`: the `<meta property="article:modified_time">` tag, two `"dateModified"` fields in the JSON-LD blocks near the top of `<head>`, the FAQ JSON-LD/visible-text answer to "Is this portfolio actively maintained?" (says "It was last updated on ..." in prose, two occurrences — schema copy and visible `<summary>/<p>` pair), and the visible `<div class="freshness">...Last updated <time datetime="...">` in the About section.
- `privacy.html`: `<div class="updated">Last updated: ...</div>`.
- `terms.html`: `<div class="updated">Last updated: ...</div>`.

Grep for `Last updated\|dateModified\|modified_time` across `*.html` (excluding `old-site` if it's ever reintroduced) to catch all instances before every commit — dates can be hardcoded in prose sentences, not just in date-labeled fields, so don't rely on grepping only structural markers.

## Design system

Full spec is in `.design-sync/design-principles.md`. Key tokens to reuse rather than re-derive:
- Fonts: **Syne** (headings/body, weights 400–800), **DM Mono** (labels/metadata/nav), **Instrument Serif italic** (exactly one emphasized word per major heading).
- Dark mode is default: bg `#080a0f`, surface `#141b27`, accent teal `#00e6be`, gold `#f5c842` (achievements only), coral `#ff6b6b` (hardware project tags only).
- Cards use the `.tc` tilt-card pattern (mouse-tracked radial shine, 3D tilt on hover, spring easing `cubic-bezier(0.34, 1.56, 0.64, 1)`).
- Section labels follow the `.slabel` pattern (small horizontal rule + DM Mono uppercase label).
