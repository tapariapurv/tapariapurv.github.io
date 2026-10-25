# Purv Taparia — Design Principles for Claude Design

Derived from `tapariapurv.github.io`. Use these principles when building any design or UI that should match this personal brand.

---

## 1. Color System

### Dark Mode (default)

| Role | Token name | Value |
|---|---|---|
| Background base | `--bg` | `#080a0f` |
| Background secondary | `--bg2` | `#0d1117` |
| Background tertiary | `--bg3` | `#111620` |
| Surface (cards) | `--surface` | `#141b27` |
| Border (subtle) | `--border` | `rgba(255,255,255,0.07)` |
| Text primary | `--text` | `#e8edf5` |
| Text secondary | `--text2` | `#aab4c6` |
| Text muted | `--text3` | `#6b7d95` |
| Accent (teal) | `--accent` | `#00e6be` |
| Accent dim | `--adim` | `rgba(0,230,190,0.10)` |
| Accent glow | `--glow` | `rgba(0,230,190,0.28)` |
| Gold (achievements) | `--gold` | `#f5c842` |
| Gold dim | `--gdim` | `rgba(245,200,66,0.11)` |
| Coral (hardware) | `--coral` | `#ff6b6b` |
| Coral dim | `--coral-dim` | `rgba(255,107,107,0.10)` |

### Light Mode

- Background: `#fbfcfc` / `#eff5f4` (teal-tinted, so alternating sections stay visible) / `#e6efed`; surface `#ffffff`
- Border: `rgba(15,45,40,0.11)`
- Text: `#0e1726` / `#3d4a5a` / muted `#66758a` (all pass WCAG AA on white)
- Accent: `#0b7d72` (deeper teal, ~5:1 on white)
- Gold: `#b45309` (amber) · Coral: `#dc2626`
- Depth: white cards (`.tc`, `.hcard`, `.stat`, `.faq-item`) get a soft shadow, `0 1px 2px rgba(15,30,50,.04), 0 6px 20px -8px rgba(15,30,50,.10)`, because white-on-near-white has no contrast. Chips and tech tags are white with a border. Dark mode stays shadow-free.

### Usage rules

- **Teal accent** is the primary interactive color — buttons, links, section labels, cursor, stat numbers, card glow on hover.
- **Gold** is reserved for achievements, top rankings, prize amounts, and certification highlights. Never use it for generic UI.
- **Coral** is only for "hardware" or physically-built project tags. Do not use it as a general warning color.
- Backgrounds layer: `--bg` → `--bg2` for alternate sections → `--surface` for card surfaces. Never use white or light gray as a base in dark mode.

---

## 2. Typography

### Typefaces

| Family | Variable | Use |
|---|---|---|
| **Syne** (400/600/700/800) | `--ff` | All headings, body, nav logo, button text |
| **DM Mono** (300/400/500) | `--fm` | Section labels, nav links, metadata, badges, chips, code-style tags |
| **Instrument Serif** (italic) | `--fs` | Single italic word/phrase inside a heading for editorial emphasis |

Self-hosted in `assets/fonts/` (WOFF2, latin subsets): Syne variable 400–800 (plus latin-ext for ₹), DM Mono 400/500, Instrument Serif italic. Don't add Google Fonts links back; they add two third-party requests.

### Type scale

| Element | Size | Weight | Letter-spacing | Notes |
|---|---|---|---|---|
| Hero H1 | `clamp(52px, 7vw, 86px)` | 800 | `-0.04em` | Line-height 0.93 |
| Section H2 | `clamp(34px, 4vw, 50px)` | 800 | `-0.03em` | Line-height 1.05 |
| About H2 | `clamp(36px, 4.5vw, 54px)` | 800 | `-0.03em` | |
| Card title | `15–21px` | 700 | `-0.02em` | |
| Body text | `15–15.5px` | 400 | 0 | Line-height 1.78 |
| Body small | `13–13.5px` | 400 | 0 | Line-height 1.65–1.72 |
| Section label | `10.5px` | 400 | `0.14em` | DM Mono, uppercase |
| Nav / metadata | `11.5px` | 400/500 | `0.06–0.08em` | DM Mono, uppercase |
| Badges | `9–9.5px` | 400 | `0.08–0.12em` | DM Mono, uppercase, pill shape |

### Italic emphasis rule

Use `Instrument Serif italic` for exactly one word or short phrase inside large headings to add humanity and warmth. Example: "Student. Coder. *Creative Writer.*" or "PURV *TAPARIA*". Never use it for body copy.

---

## 3. Layout

- **Max content width:** 1140px, centered, 40px horizontal padding (`wrap`)
- **Section padding:** 110px top and bottom (72px on mobile)
- **Primary grid:** 2-column (50/50) for hero, about, certifications
- **Achievement grid:** 3 columns
- **Books:** a winding path, cards alternating left and right with a 1.6° tilt and a 3D book cover; the dashed road between covers draws itself as you scroll. The last two books sit behind "View More Books". On phones the alternation stays (cover left, then cover right).
- **Projects:** one horizontal row (cards `clamp(280px, 31vw, 380px)`, 16:10 screenshot on top). On desktop the section pins and vertical scroll moves the row sideways; on phones and with reduced motion it is a normal swipe row. Filter chips: All · Claude Code · Hardware.
- **Hero:** two columns. Left: polaroid photo, name, typewriter line, socials. Right: bio, buttons, six top-achievement cards (a swipe row on phones).
- **Card gap:** 14–18px

### Border radius

| Token | Value | Use |
|---|---|---|
| `--r` | `12px` | Stats, small elements |
| `--rl` | `20px` | Standard cards, chips |
| `--rxl` | `28px` | Large/featured project cards |

---

## 4. Card Design

All cards follow the **tilt card** (`.tc`) pattern:

- Background: `--surface` (`#141b27`)
- Border: `1px solid --border` (barely visible)
- Border radius: `--rl` (20px)
- On hover: border-color shifts to `--glow` (teal), box-shadow adds a two-layer glow
- **Shine overlay:** an absolutely-positioned pseudo-element with a radial gradient that tracks the mouse cursor position (`opacity: 0` → `1` on hover)
- **Top accent line:** some cards (achievements) reveal a 2px horizontal gradient line at the top edge on hover: `linear-gradient(90deg, transparent, --accent, transparent)`
- **Gold variant:** achievement cards can use `--gold` instead of `--accent` for border and accent line

### Card hover box-shadow

```css
box-shadow:
  0 0 0 1px rgba(0, 230, 190, 0.22),
  0 20px 60px rgba(0, 230, 190, 0.12),
  0 40px 80px rgba(0, 0, 0, 0.35);
```

For gold cards:
```css
box-shadow:
  0 0 0 1px rgba(245, 200, 66, 0.18),
  0 20px 60px rgba(245, 200, 66, 0.09),
  0 40px 80px rgba(0, 0, 0, 0.35);
```

---

## 5. Interactive Elements

### Primary button (`.btn-p`)

- Background: `--accent` (`#00e6be`)
- Text: `--bg` (near-black) — this is intentional; the button is teal with dark text
- Font: DM Mono, 11.5px, 0.08em spacing
- Padding: `13px 26px`, border-radius `8px`
- Hover: `translateY(-2px)` + `box-shadow: 0 12px 36px --glow`
- Include a small inline arrow SVG icon (→)

### Ghost button (`.btn-g`)

- Border: `1px solid --border`
- Text: `--text2`
- Hover: border-color → `--glow`, text → `--accent`, `translateY(-2px)`

### Nav CTA

- Border: `1px solid --glow`, text: `--accent`, border-radius `6px`
- Hover: background fills with `--accent`, text becomes `--bg`

### Links / proj-link style

- Color: `--accent`
- On hover: gap between text and arrow icon expands (`gap` animation)
- Transition: spring easing `cubic-bezier(0.34, 1.56, 0.64, 1)`

---

## 6. Badges and Status Tags

Three badge variants (pill shape, `border-radius: 100px`):

| Variant | Background | Text | Border |
|---|---|---|---|
| Gold | `--gdim` | `--gold` | `1px solid --g-border` |
| Teal | `--adim` | `--accent` | `1px solid --glow` |
| Muted | `--bg3` | `--text2` | `1px solid --border` |

Three status tags for projects:

| Tag | Background | Text | Border |
|---|---|---|---|
| Live (●) | `--adim` | `--accent` | `--glow` |
| In Progress (◐) | `--gdim` | `--gold` | `--g-border` |
| Hardware (⬡) | `--coral-dim` | `--coral` | `--coral-border` |

Font for all: DM Mono, 9–9.5px, letter-spacing 0.08–0.12em, uppercase.

---

## 7. Section Labels

All section labels use a consistent `.slabel` pattern:

```
  ——  SECTION NAME
```

- A 22px × 1px horizontal rule (in `--accent`) appears before the text via `::before`
- Text: DM Mono, 10.5px, letter-spacing 0.14em, uppercase, color `--accent`
- Margin-bottom 18px before the heading

---

## 8. Stat Blocks

Stats display in a 2×2 mosaic grid with 2px gap (no visible gap — borders touch):

- Each stat: `--surface` background, `1px solid --border`
- Corner rounding applied per-corner so the group looks like one rounded rectangle
- Number: Syne 800, 34px, letter-spacing -0.04em, color `--accent`
- Label: DM Mono, 10.5px, letter-spacing 0.06em, uppercase, `--text2`
- Hover: border-color → `--glow`

---

## 9. Skill Chips

```
[icon] Label text
```

- Icon: inline 12×12 SVG (`.ci`), colored `--accent`. Simple Icons for brand logos, Lucide for generic concepts. No emoji.

- Background: `--bg3`
- Border: `1px solid --border`, border-radius `6px`
- Padding: `5px 11px`, gap `6px`
- Font: DM Mono, 11px, `--text2`
- Hover: background → `--adim`, border → `--glow`, text → `--accent`

---

## 10. Motion & Easing

Two custom easing curves used throughout:

| Name | Value | Use |
|---|---|---|
| `--ease` | `cubic-bezier(0.16, 1, 0.3, 1)` | Standard reveals, color transitions |
| `--spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Button hover lift, gap animations, back-to-top scale |

### Entry animations

Elements enter via `fsu` (fade-slide-up):
```css
@keyframes fsu {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

Stagger delays: `.d1` = 0.1s, `.d2` = 0.2s, `.d3` = 0.3s, `.d4` = 0.4s.

For scroll-triggered elements, use IntersectionObserver with threshold 0.1 and -36px bottom rootMargin.

### 3D card tilt

On mouse move over cards: `perspective(800px) rotateX(±11deg) rotateY(±11deg) scale(1.028)`.  
On mouse leave: spring easing back to identity over 0.5s.

---

### Smooth motion (October 2026 redesign)

| Token | Value | Use |
|---|---|---|
| `--soft` | `cubic-bezier(0.22, 1, 0.36, 1)` | Default for reveals, cards, covers, panels: glides to rest with no overshoot |
| `--gentle` | `cubic-bezier(0.34, 1.25, 0.64, 1)` | Small buttons, chips and social icons: a hint of bounce |

- Scroll reveals: `opacity` + `translateY(16px)`, 0.9–1s on `--soft`.
- Anything driven by scroll or the pointer (the projects row, the books road, the name magnet) eases toward its target in a `requestAnimationFrame` loop instead of jumping, and the loop stops once it settles.
- Animate only `transform` and `opacity`.
- **Playful toys are desktop-only** (fine pointer, wider than 960px): flingable stickers around the photo, name letters that dodge the cursor, a cursor spotlight, tilting achievement cards, confetti on photo click. Phones get only a tap squish and a speech bubble. Crawlers (`html.bot`) and reduced-motion users get none of it.

## 11. Navigation

- Fixed top, transparent until scrolled 40px then: `background: rgba(8,10,15,0.88)`, `backdrop-filter: blur(20px)`, `border-bottom: 1px solid --border`
- Logo: Syne 800, 16px, letter-spacing -0.02em. First letter in `--accent`.
- Nav links: DM Mono, 11.5px, uppercase, `--text2` default. Hover: `--text`. Underline on hover via `::after` scaleX transition.
- CTA button in nav uses the nav-CTA style (see §5).

---

## 12. Marquee / Ticker

A scrolling strip between hero and content:

- Background: `--accent` (a tilted teal tape strip, text in `--ink`); was `--bg2`
- Border top + bottom: `1px solid --border`
- Items: DM Mono, 10.5px, letter-spacing 0.10em, uppercase, `--text2`
- Separator: `✦` in `--accent` (font-size 14px)
- Animation: `translateX(-50%)` over 22s linear infinite (duplicate items for seamless loop)

---

## 13. Social Icon Hover Colors

Each social platform has a specific hover state (glow matching platform brand):

| Platform | Color | Box-shadow |
|---|---|---|
| GitHub | `#ffffff` | `0 0 18px rgba(255,255,255,0.22), 0 0 36px rgba(255,255,255,0.08)` |
| LinkedIn | `#0A66C2` | `0 0 18px rgba(10,102,194,0.35), 0 0 36px rgba(10,102,194,0.15)` |
| YouTube | `#FF0000` | `0 0 18px rgba(255,0,0,0.25), 0 0 36px rgba(255,0,0,0.10)` |
| Email/Generic | `--accent` | `0 0 18px --aglow, 0 0 36px --aglow2` |

---

## 14. Voice & Tone

- **Confident but not arrogant.** State achievements with specific numbers (International Rank 1, 40/40, Rs. 50,000).
- **Youthful enthusiasm.** First-person, direct, occasionally exclamatory ("Hi! I am...").
- **Precise.** Name exact tools, languages, platforms — never vague ("and more" is acceptable but names come first).
- **Human warmth in headings.** Use Instrument Serif italic for one emotional or personal phrase per major heading.
- **Section labels name the essence**, not the contents: "Recognition" not "Achievements List", "Built by Me" not "My Projects", "Writing" not "Books Section".

---

## 15. Do / Don't

| Do | Don't |
|---|---|
| Use `--accent` teal as the primary interactive color | Use blue as a primary accent — this brand is teal |
| Keep backgrounds very dark (`#080a0f`) | Use gray-800 or navy — the bg is near-black with a blue-black tint |
| Use Syne for headings, DM Mono for metadata | Mix in system fonts or use Syne for small labels |
| Apply glow box-shadows on hover | Use hard drop-shadows without glow |
| Use gold sparingly, only for top achievements | Use gold as a general highlight color |
| Maintain the 2px subtle border on all cards | Use thick borders or fully borderless cards |
| Use `clamp()` for heading sizes | Fix heading sizes without fluid scaling |
| Keep section padding generous (110px) | Compress sections — this design breathes |
| Translate elements up 2–4px on hover | Use scale-only hover effects |

---

*Generated from analysis of tapariapurv.github.io · June 2026*
