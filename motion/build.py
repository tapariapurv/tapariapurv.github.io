#!/usr/bin/env python3
"""Generates motion/index.html from data.json. Run: python3 motion/build.py"""
import json, html, pathlib, re

D = pathlib.Path(__file__).parent
data = json.loads((D / "data.json").read_text())
sprite = (D / "sprite.svg").read_text()
e = html.escape
POPS = ["y", "b", "g", "v", "o"]


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def ext(href):
    return "" if href.startswith(("#", "mailto:")) else ' target="_blank" rel="noopener"'


def win(title, body, pop="y", cls="", meta="", attrs=""):
    return f'''<div class="win {cls}" style="--pop:var(--{pop})" {attrs}>
  <div class="win-bar"><span class="win-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="win-t">{title}</span><span class="win-m">{meta}</span></div>
  <div class="win-body">{body}</div>
</div>'''


# ── dock / nav ────────────────────────────────────────────
ICON = {
    "hero": '<rect x="3" y="4" width="18" height="13" rx="1"/><path d="M8 21h8M12 17v4"/>',
    "about": '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    "achievements": '<path d="M7 4h10v5a5 5 0 01-10 0V4z"/><path d="M7 6H4a3 3 0 003 4M17 6h3a3 3 0 01-3 4M12 14v4M8 21h8"/>',
    "certifications": '<circle cx="12" cy="9" r="6"/><path d="M9 14.5L8 22l4-2 4 2-1-7.5"/><path d="M9.5 9l1.8 1.8L14.8 7"/>',
    "latest": '<circle cx="12" cy="12" r="3"/><path d="M12 3v6M12 15v6"/>',
    "projects": '<rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/>',
    "books": '<path d="M4 4h6a2 2 0 012 2v14a2 2 0 00-2-2H4V4zM20 4h-6a2 2 0 00-2 2v14a2 2 0 012-2h6V4z"/>',
    "faq": '<path d="M4 5h16v11H9l-5 4V5z"/><path d="M9 10h6"/>',
    "contact": '<path d="M3 5h18v14H3z"/><path d="M3 6l9 7 9-7"/>',
}
NAV = [("hero", "Desktop"), ("about", "About"), ("achievements", "Awards"), ("certifications", "Certs"),
       ("latest", "Changelog"), ("projects", "Projects"), ("books", "Books"), ("faq", "FAQ"), ("contact", "Contact")]


def icon(k):
    return f'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">{ICON[k]}</svg>'


dock = "".join(
    f'<a href="#{k}" class="dk" data-k="{k}" style="--pop:var(--{POPS[i % 5]})"><span class="dk-i">{icon(k)}</span><span class="dk-l">{l}</span></a>'
    for i, (k, l) in enumerate(NAV))

SOCIAL = [("https://github.com/tapariapurv", "GitHub", "gh"), ("https://www.linkedin.com/in/purv-taparia/", "LinkedIn", "li"),
          ("https://youtube.com/@decodewithpurv", "YouTube", "yt"), ("https://tapariapurv.beehiiv.com", "Newsletter", "pen"),
          ("mailto:tapariapurv+portfolio@gmail.com", "Email", "mail")]
socials = '<div class="socs">' + "".join(
    f'<a href="{h}"{ext(h)} aria-label="{l}" class="soc" data-cursor="{l}"><svg aria-hidden="true"><use href="#i-{i}"/></svg></a>'
    for h, l, i in SOCIAL) + "</div>"

# ── hero ──────────────────────────────────────────────────
hello = f'''<p class="lead">Hi! I'm <strong>Purv</strong>, a student from Mumbai. I <a href="#projects" class="hl">build apps with AI &amp; Claude Code</a>, <a href="#projects" class="hl">design hardware</a>, and <a href="#books" class="hl">write books</a>.</p>
<p class="cmd"><span class="pr">purv@os ~ %</span> I'm a <b id="tw">Student</b><span class="caret" aria-hidden="true"></span></p>
<div class="ctas"><a href="#projects" class="btn" data-cursor="Open">View work →</a><a href="assets/Purv Taparia - Resume.pdf" class="btn ghost" target="_blank">Download resume ↗</a></div>
{socials}'''

stats = '''<ul class="stats">
<li><a href="#achievements"><b>#1</b><span>International Rank</span></a></li>
<li><a href="#books"><b data-count="5">5</b><span>Books Published</span></a></li>
<li><a href="assets/Arduino Junior Certification.pdf" target="_blank"><b data-count="96" data-suffix="%">96%</b><span>Arduino Score</span></a></li>
<li><a href="#achievements"><b>₹50K</b><span>Prize Won (IEO)</span></a></li>
</ul>'''

photo = '<img src="assets/purv.webp" alt="Purv Taparia smiling, wearing a yellow T-shirt" width="480" height="552" fetchpriority="high" decoding="async" draggable="false">'

STICK = [("✳ Claude Code", "o", "-8"), ("5 books", "g", "6"), ("Arduino ×2", "b", "-4"), ("Mumbai", "v", "9")]
stickers = "".join(f'<span class="stk s{i}" style="--pop:var(--{p});--r:{r}deg" aria-hidden="true" data-cursor="Fling">{t}</span>'
                   for i, (t, p, r) in enumerate(STICK))

hero = f'''<section id="hero" class="desk" data-l="Desktop">
<canvas id="dots" aria-hidden="true"></canvas>
<div class="desk-in">
  <p class="eb intro">01 · Hello, I'm</p>
  <h1 class="name" id="name"><span class="ln">Purv</span> <span class="ln">Taparia</span></h1>
  {win("purv.webp", photo, "y", "w-photo intro", "480×552", 'data-drag')}
  {win("hello.txt", hello, "b", "w-hello intro", "UTF-8", 'data-drag')}
  {win("stats.app", stats, "g", "w-stats intro", "live", 'data-drag')}
  {stickers}
  <a class="cue intro" href="#about"><i aria-hidden="true"></i>Scroll to boot the rest</a>
</div>
</section>'''

# ── about ─────────────────────────────────────────────────
SKILLS = [
    ("Programming", ["HTML &amp; CSS", "JavaScript", "TypeScript", "Python", "C++", "Swift &amp; SwiftUI", "Block Coding"]),
    ("Web &amp; App Development", ["React", "Next.js", "Tailwind CSS", "GSAP Animation", "Firebase", "SQLite", "Streamlit", "Chrome Extensions", "Git &amp; GitHub", "Vercel &amp; GitHub Pages"]),
    ("Hardware &amp; Robotics", ["Arduino", "ESP8266 / NodeMCU", "NeoPixels", "Sensors &amp; Radar", "Breadboards &amp; LEDs", "3D-Printed Enclosures"]),
    ("Artificial Intelligence", ["Claude / Anthropic", "Claude Code (hooks, skills, commands)", "Google Antigravity", "Local LLMs (Ollama)", "Prompt Engineering", "Veo 3.1", "Nano Banana Pro"]),
    ("Data &amp; Finance", ["Web Scraping", "PDF Data Extraction", "REST APIs", "Stock Market Analysis", "Excel (formulas, macros)", "PowerPoint"]),
    ("Creative Writing", ["Descriptive Stories", "Essays &amp; Paragraphs"]),
]
skills_body = '<p class="t-cmd"><span class="pr">purv@os ~ %</span> <span class="typed">ls ~/skills --all</span></p>' + "".join(
    f'<div class="sk" style="--pop:var(--{POPS[i % 5]})"><h3><span aria-hidden="true">drwx</span> {n}/</h3><ul class="chips">' +
    "".join(f"<li>{c}</li>" for c in cs) + "</ul></div>" for i, (n, cs) in enumerate(SKILLS))

about = f'''<section id="about" class="ink" data-l="About">
<div class="wrap">
  <div class="readme">
    <p class="eb">02 · README.md</p>
    <p class="big" id="readme"><strong>Purv Taparia</strong> is a Mumbai-based student, <mark style="--pop:var(--y)">5× published author</mark>, and self-taught coder who has won <mark style="--pop:var(--g)">International Rank 1</mark> in the English Olympiad and holds <mark style="--pop:var(--b)">Arduino and Anthropic Claude certifications</mark> — building hardware, software, and books before finishing primary school.</p>
  </div>
  <div class="about-cols">
    <h2 class="h2 split">Student. Author. Coder &amp; <em>Blogger.</em></h2>
    <div class="about-txt">
      <p class="rv">Hi! I am <strong>Purv Taparia</strong>, a student from Grade 5 at <strong>Chatrabhuj Narsee School, Mumbai</strong>. I built this portfolio from the ground up to showcase my creative and technical abilities.</p>
      <p class="rv">I have many skills in AI — using models like <strong>Veo 3.1</strong> and <strong>Nano Banana Pro</strong> for video and image creation, and AI tools for Excel, PowerPoint and writing. I hold Anthropic's <a href="assets/Claude 101 Certificate.pdf" target="_blank" class="hl">Claude 101</a>, <a href="assets/Claude Code 101 Certificate.pdf" target="_blank" class="hl">Claude Code 101</a> and <a href="assets/Claude Code in Action Certificate.pdf" target="_blank" class="hl">Claude Code in Action</a> certifications.</p>
      <p class="rv">I program in <strong>HTML, CSS, JavaScript, TypeScript, Python, C++ and Swift</strong>, build web apps with React and Next.js and native Apple apps with SwiftUI, and build <a href="#projects" class="hl">real hardware projects</a> with Arduino and ESP8266. I have <a href="#books" class="hl">published 5 books</a> across Bribooks and Amazon, and write a <a href="https://tapariapurv.beehiiv.com" target="_blank" class="hl">newsletter on Beehiiv</a> sharing thoughts and updates.</p>
      <p class="rv">This portfolio is a living document — I add new projects, achievements and books as I complete them, rather than letting it go stale.</p>
      <p class="fresh rv">Last updated <time datetime="2026-10-30">30 October 2026</time> · Live since <time datetime="2025-03-17">March 2025</time></p>
    </div>
  </div>
  {win("Terminal — skills", skills_body, "o", "w-term", "zsh · 80×24")}
</div>
</section>'''

TICK1 = ["Built with Claude Code", "International Rank 1", "5x Published Author", "Anthropic Certified", "Arduino &amp; NeoPixels"]
TICK2 = ["HTML · CSS · Python · C++", "Roller Skating", "Chrome Extensions", "Air Quality Monitor", "AI &amp; Prompt Engineering"]
ticker = '<div class="tick" aria-hidden="true">' + "".join(
    f'<div class="strip {c}"><div class="strip-in">' + "".join(f"<span>{t}</span>" for t in L * 2) + "</div></div>"
    for c, L in (("s1", TICK1), ("s2", TICK2))) + "</div>"

# ── achievements ──────────────────────────────────────────
ACH = [
    ("01", "International Rank", "International", "International English Olympiad (IEO)", "y",
     '<span class="hi">International Rank 1</span> in Grade 1<br>School Rank 1 in Grade 2 (39/40)<br><span class="hi">International Rank 1</span> in Grade 3 Level 1 (40/40)<br>Won <span class="hi">Rs. 50,000</span> in Grade 3 Level 2 (40/40, International Rank 1)', "40/40"),
    ("02", "International Rank", "International", "ICSO / National Cyber Olympiad", "g",
     '<span class="hi">International Rank 2</span> in Grade 3<br>Scored 39/40 marks<br>Won <span class="hi">Rs. 8,333</span>', "39/40"),
    ("94", "All-India Rank", "National", "Mathematics (IPM)", "v",
     'Achieved <span class="hi">94th Rank</span> in the All-India Open Mathematics Scholarship Examination Mega-Final in Grade 2', "Mega-Final"),
    ("03", "District Place", "Athletics", "Roller Skating", "o",
     '3rd Place — 3rd Mumbai Suburban Roller Athletics District Competition<br>5th Place — 3rd Maharashtra Roller Athletics State Competition<br>5th Place — 3rd Roller Athletics National Competition', "3 podiums"),
]
reel = '<span class="reel"><span>' + "".join(f"<i>{d}</i>" for d in range(10)) + "</span></span>"
ach_cards = "".join(f'''<article class="ach" style="--pop:var(--{p});--i:{i}" data-rank="{r}" data-lbl="{lbl}">
  <div class="ach-top"><span class="tag">{t}</span><span class="ach-rank" aria-hidden="true">#{int(r)}</span></div>
  <h3>{h}</h3><p>{b}</p><span class="ach-foot" aria-hidden="true">{f}</span>
</article>''' for i, (r, lbl, t, h, p, b, f) in enumerate(ACH))

achievements = f'''<section id="achievements" data-l="Awards">
<div class="ach-pin">
<div class="wrap ach-wrap">
  <div class="ach-l">
    <p class="eb">03 · Leaderboard</p>
    <h2 class="h2 split">Achieve<em>ments</em></h2>
    <div class="odo" aria-hidden="true"><span class="odo-h">#</span>{reel}{reel}</div>
    <p class="odo-l" aria-hidden="true"><span>International Rank</span></p>
    <div class="recog"><p class="eb">Certified &amp; recognized by</p>
      <span class="tag">Arduino Education</span><span class="tag">Anthropic Academy</span><span class="tag">International English Olympiad (IEO)</span><span class="tag">International Cyber Olympiad (ICSO)</span><span class="tag">IPM Mathematics Scholarship</span></div>
  </div>
  <div class="ach-stack">{ach_cards}</div>
</div>
</div>
</section>'''

# ── certifications ────────────────────────────────────────
CERTS = [
    ("Arduino Official", 96, "96%", "Arduino Junior Certification", "Passed with <strong>96%</strong>",
     "Passed the Arduino Junior Certification exam with <strong>96%</strong>, covering electronics fundamentals, circuits, and programming microcontrollers with the Arduino platform.",
     [("assets/Arduino Junior Certification.pdf", "View certificate ↗")], "b"),
    ("Anthropic Academy", 100, "✓", "Claude 101 Certification", "Completed — Claude Projects, AI workflows, productivity",
     "Completed Anthropic Academy's Claude 101 Certification. Includes topics such as how to work with Claude, use Claude Projects, and boost productivity with Claude.",
     [("assets/Claude 101 Certificate.pdf", "View certificate ↗")], "o"),
    ("Anthropic Academy", 100, "8/8", "Claude Code in Action Certification", "Completed with a perfect <strong>8/8</strong> quiz score",
     "Completed Anthropic Academy's Claude Code in Action course, scoring a perfect <strong>8/8</strong> on the quiz. Covers Claude Code, hooks, skills, commands, and the .claude directory.",
     [("assets/Claude Code in Action Certificate.pdf", "View certificate ↗"), ("https://verify.skilljar.com/c/ghgqrf8euxh7", "Verify ↗")], "y"),
    ("Anthropic Academy", 100, "✓", "Claude Code 101 Certification", "Completed — September 2026",
     "Completed Anthropic Academy's Claude Code 101 course. Covers the agentic loop, Plan Mode, the Explore → Plan → Code → Commit workflow, context management, CLAUDE.md, subagents, skills, MCP servers and hooks.",
     [("assets/Claude Code 101 Certificate.pdf", "View certificate ↗"), ("https://verify.skilljar.com/c/hdh53pci5vhz", "Verify ↗")], "v"),
    ("Arduino Education", 91, "91%", "Arduino Senior Certification", "Passed with <strong>91%</strong> — October 2026",
     "Passed the official Arduino Certification exam in Electronics and Physical Computing with <strong>91%</strong>, issued by the Arduino Education Team.",
     [("assets/Arduino Senior Certification.pdf", "View certificate ↗"), ("https://certifications.arduino.cc/certificate/4e02fdbf-d55f-4417-ac29-0e64b3ef22bb", "Verify ↗")], "g"),
]


def seal(score, label):
    teeth = "".join(f'<path d="M50 2 L53 9 L47 9Z" transform="rotate({a} 50 50)"/>' for a in range(0, 360, 15))
    return f'''<svg class="seal" viewBox="0 0 100 100" aria-hidden="true">
  <g class="seal-teeth">{teeth}</g><circle cx="50" cy="50" r="40" class="seal-bg"/>
  <circle cx="50" cy="50" r="33" class="seal-tr"/><circle cx="50" cy="50" r="33" class="seal-v" pathLength="100" style="--to:{score}"/>
  <text x="50" y="57" text-anchor="middle">{label}</text></svg>'''


certs = "".join(f'''<article class="cert" style="--pop:var(--{p})">
  <div class="cert-top"><span class="issuer"><span class="file" aria-hidden="true">PDF</span>{iss}</span>{seal(sc, lb)}</div>
  <h3>{t}</h3><p class="cert-note">{note}</p><p>{d}</p>
  <div class="lnks">{"".join(f'<a href="{h}" target="_blank" rel="noopener" class="lnk">{l}</a>' for h, l in links)}</div>
</article>''' for iss, sc, lb, t, note, d, links, p in CERTS)

certifications = f'''<section id="certifications" class="ink" data-l="Certs">
<div class="wrap">
  <div class="sec-hd"><div><p class="eb">04 · ~/Certificates</p><h2 class="h2 split">Certifi<em>cations</em></h2></div>
  <p class="note rv">Every certificate opens as a PDF, and most can be verified with the issuer.</p></div>
  {win("Finder — ~/Certificates", '<div class="finder-bar" aria-hidden="true"><span>5 items</span><span>Sorted by: date earned</span></div><div class="cert-grid">' + certs + "</div>", "b", "w-finder", "5 items")}
</div>
</section>'''

# ── changelog ─────────────────────────────────────────────
TAGCLS = {"t-live": "live", "t-ai": "ai", "t-hw": "hw", "t-wip": "wip", "t-cert": "cert", "t-book": "book", "t-win": "win", "t-ms": "ms"}
n_commits = sum(len(m["entries"]) for m in data["log"])
rows, k = [], n_commits
for m in data["log"]:
    ents = []
    for en in m["entries"]:
        tags = "".join(f'<span class="tag {c}">{t}</span>' for c, t in en["tags"])
        inner = f'<span class="c-hash" aria-hidden="true">#{k:02d}</span><span class="c-top"><span class="c-title">{e(en["title"])}</span>{tags}</span><span class="c-desc">{e(en["desc"])}</span>'
        k -= 1
        ents.append(f'<a class="commit" href="{e(en["href"])}"{ext(en["href"])}>{inner}</a>' if en["href"] else f'<div class="commit">{inner}</div>')
    d = m["date"]
    date_html = f'<span class="log-date">{d.split(" · ")[0]}<small>{d.split(" · ")[1]}</small></span>' if " · " in d else f'<time class="log-date" datetime="{d}">{d}</time>'
    rows.append(f'<li class="month" data-d="{e(d.split(" · ")[0])}">{date_html}<div class="commits">{"".join(ents)}</div></li>')

latest = f'''<section id="latest" data-l="Changelog">
<div class="wrap">
  <div class="sec-hd"><div><p class="eb">05 · git log --all</p><h2 class="h2 split">Month by <em>month</em></h2></div>
  <p class="note rv">Everything I've shipped, published and won, newest first. {n_commits} commits since 2022.</p></div>
  <div class="log-grid">
    <div class="log-side" aria-hidden="true"><div class="big-date"><span class="bd-in">Oct 2026</span></div><div class="bd-meta"><span class="bd-n">{n_commits:02d}</span> commits · HEAD → main</div></div>
    <ol class="log"><span class="rail" aria-hidden="true"><i></i></span>{"".join(rows)}</ol>
  </div>
</div>
</section>'''

# ── projects ──────────────────────────────────────────────
pcs = []
for i, p in enumerate(data["projects"]):
    cls = " ".join(c for c in p["tagcls"])
    tags = "".join(f'<span class="tag {c}">{e(t)}</span>' for c, t in zip(p["tagcls"], p["tags"]))
    href = p["links"][0][0] if p["links"] else ""
    if p["img"]:
        im = f'<img src="{p["img"]}" alt="{e(p["alt"])}" width="800" height="500" loading="lazy" decoding="async">'
    else:
        im = f'<span class="noshot" aria-hidden="true"><b>{e(p["title"])}</b><span>{"no screenshot · hardware" if "t-hw" in cls else "no screenshot yet"}</span></span>'
    shot = f'<a class="pc-shot" href="{href}" target="_blank" rel="noopener" data-cursor="Open">{im}</a>' if href else f'<div class="pc-shot" data-cursor="Open">{im}</div>'
    links = "".join(f'<a href="{h}" class="lnk" target="_blank" rel="noopener">{e(l)}</a>' for h, l in p["links"])
    body = f'''{shot}<div class="pc-body"><div class="pc-meta">{tags}</div><h3 class="pc-title">{e(p["title"])}</h3>
<p class="pc-desc">{e(p["desc"])}</p><ul class="pc-tech">{"".join(f"<li>{e(t)}</li>" for t in p["tech"])}</ul>
<div class="lnks">{links}</div></div>'''
    pcs.append(win(f'{slug(p["title"])}.app', body, POPS[i % 5], f"pc {cls}", f'{i + 1:02d}/{len(data["projects"])}', f'data-f="{cls}"'))

projects = f'''<section id="projects" class="ink" data-l="Projects">
<div class="pj-pin">
  <div class="wrap pj-hd">
    <div><p class="eb">06 · ~/Applications</p><h2 class="h2 split">Pro<em>jects</em></h2></div>
    <div class="pj-ctl">
      <div class="filt" role="group" aria-label="Filter projects"><button type="button" aria-pressed="true" data-f="all">All</button><button type="button" aria-pressed="false" data-f="t-ai">✳ Claude Code</button><button type="button" aria-pressed="false" data-f="t-hw">⬡ Hardware</button></div>
      <div class="pj-meta" aria-hidden="true"><b id="pj-n">01</b> / <span id="pj-t">{len(pcs)}</span><span class="pj-bar"><i></i></span></div>
    </div>
  </div>
  <div class="track" id="track">{"".join(pcs)}</div>
</div>
</section>'''

# ── books ─────────────────────────────────────────────────
bks = []
for i, b in enumerate(data["books"]):
    bks.append(f'''<article class="bk" style="--pop:var(--{POPS[i % 5]});--i:{i}">
  <a class="book" href="{b["link"]}" target="_blank" rel="noopener" aria-hidden="true" tabindex="-1" data-cursor="Read">
    <span class="b-front"><img src="{b["img"]}" alt="" width="400" height="600" loading="lazy" decoding="async"></span>
    <span class="b-spine"><b>{e(b["title"])}</b><i>PT</i></span><span class="b-pages"></span><span class="b-back"></span>
  </a>
  <div class="bk-txt"><span class="bk-n" aria-hidden="true">0{i + 1}</span><p class="bk-genre">{e(b["genre"])}</p><h3 class="bk-title">{e(b["title"])}</h3>
  <p class="bk-desc">{e(b["desc"])}</p><a href="{b["link"]}" class="btn pop" target="_blank" rel="noopener">{b["cta"]}</a></div>
</article>''')

books = f'''<section id="books" data-l="Books">
<div class="bk-pin">
<div class="wrap">
  <div class="sec-hd"><div><p class="eb">07 · ~/Library</p><h2 class="h2 split">Published <em>books</em></h2></div>
  <p class="note rv">I am a <strong>published author</strong> with 5 books across Bribooks and Amazon — covering fiction, adventure, and finance for young readers. Writing is a core part of who I am, alongside my technical work. I also publish a <a href="https://tapariapurv.beehiiv.com" target="_blank" class="hl">newsletter on Beehiiv →</a></p></div>
  <div class="shelf">{"".join(bks)}<span class="plank" aria-hidden="true"></span></div>
</div>
</div>
</section>'''

# ── faq / contact ─────────────────────────────────────────
FAQ = [("Who is Purv Taparia?", "Purv Taparia is a student from Grade 5 at Chatrabhuj Narsee School, Mumbai, India, who is a 5x published author, an International Rank 1 English Olympiad winner, a self-taught coder working with HTML, CSS, Python, C++ and Arduino, and the writer of a newsletter on Beehiiv."),
       ("Is this portfolio actively maintained?", "Yes. This portfolio was first published in March 2025 and is updated regularly as Purv completes new projects, achievements, and publications. It was last updated on 30 October 2026.")]
chat = '<div class="chat">' + "".join(
    f'<div class="qa"><p class="msg q"><span class="who" aria-hidden="true">You</span>{e(q)}</p><span class="typing" aria-hidden="true"><i></i><i></i><i></i></span><p class="msg a"><span class="who" aria-hidden="true">Purv</span>{e(a)}</p></div>'
    for q, a in FAQ) + "</div>"
faq = f'''<section id="faq" class="ink" data-l="FAQ">
<div class="wrap faq-wrap">
  <div><p class="eb">08 · Messages</p><h2 class="h2 split">Quick <em>answers</em></h2><p class="note rv">Two things people ask me most, answered in a chat window.</p></div>
  {win("Messages — Purv", chat, "g", "w-chat", "● online")}
</div>
</section>'''

contact = f'''<section id="contact" data-l="Contact">
<div class="wrap contact">
  <p class="eb">09 · New message</p>
  <h2 class="chl" id="chl">Say hi.</h2>
  <p class="lead rv">Feel free to reach out for collaborations or just to say hi! I am open to collaborations, projects, and conversations — based in Mumbai, India.</p>
  <div class="mail rv">
    <a href="mailto:tapariapurv+portfolio@gmail.com?subject=Reaching%20Out&amp;body=Hi%20Purv%2C%0A%0AI%20found%20you%20on%20your%20portfolio%20website%20and%20I%20would%20like%20to%20talk%20to%20you" class="mail-a" data-cursor="Write">&gt; tapariapurv+portfolio@gmail.com</a>
    <button type="button" class="btn copy" id="copy"><span class="cp"><span>Copy email</span><span>Copied ✓</span></span></button>
  </div>
  {socials}
</div>
</section>'''

footer = '''<footer>
  <div>© 2026 Purv Taparia. All rights reserved. · Est. March 2025</div>
  <div class="f-l"><a href="https://tapariapurv.github.io/privacy.html" target="_blank" rel="noopener">Privacy Policy</a><a href="https://tapariapurv.github.io/terms.html" target="_blank" rel="noopener">Terms of Use</a><a href="https://tapariapurv.github.io/old-portfolio" target="_blank" rel="noopener">View old portfolio ↗</a>
  <button type="button" id="off" class="off">⏻ Shut down</button></div>
</footer>'''

BOOT = ["PURV/OS 5.0 — Mumbai build 2026.10", "checking memory ............ 10 years OK", "mounting /books ............ 5 found",
        "mounting /apps ............. 16 found", "loading certificates ....... 5 verified", "linking claude-code ........ ✳ ready", "starting desktop"]
boot = '<div id="boot" aria-hidden="true"><div class="boot-in"><div class="boot-logo">PURV<span>/</span>OS</div><ul>' + \
       "".join(f"<li>{l}</li>" for l in BOOT) + '</ul><div class="boot-bar"><i></i></div><p class="boot-skip">click or press any key to skip</p></div></div>'

modal = '''<div id="modal" hidden><div class="m-scrim"></div><div class="m-win win" role="dialog" aria-modal="true" aria-labelledby="m-title">
<div class="win-bar"><span class="win-dots"><button type="button" class="m-x" aria-label="Close window"></button><i></i><i></i></span><span class="win-t" id="m-file"></span><span class="win-m">esc to close</span></div>
<div class="win-body m-body"><div class="m-shot"></div><div class="m-info"></div></div></div></div>'''

page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>(function(){{var h=document.documentElement,u=navigator.userAgent,b=/bot|crawl|spider|slurp|lighthouse|headless|preview/i.test(u),r=matchMedia('(prefers-reduced-motion: reduce)').matches;h.classList.add('js');if(b)h.classList.add('bot');if(!b&&!r)h.classList.add('motion');try{{var t=localStorage.getItem('pos-theme');if(t)h.dataset.theme=t;if(!sessionStorage.getItem('pos-booted')&&!b&&!r)h.classList.add('booting')}}catch(e){{}}}})();</script>
<title>Purv Taparia — Purv/OS</title>
<meta name="description" content="Purv Taparia, a student from Mumbai who builds apps with AI and Claude Code, designs hardware and has published 5 books. A motion-design edition of his portfolio.">
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="https://tapariapurv.github.io/">
<meta property="og:title" content="Purv Taparia — Purv/OS"><meta property="og:image" content="https://tapariapurv.github.io/assets/og-image.png">
<meta name="theme-color" content="#141414">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/inter-tight.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/purv.webp" as="image">
<link rel="stylesheet" href="style.css?v=1">
</head>
<body>
{sprite}
{boot}
<a class="skip" href="#about">Skip to content</a>
<header class="menubar">
  <a href="#hero" class="mb-logo" aria-label="Purv/OS home"><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="1" y="1" width="30" height="30" fill="var(--y)" stroke="currentColor" stroke-width="2"/><path d="M10 25V7h7a5.5 5.5 0 010 11h-7" fill="none" stroke="#141414" stroke-width="3.2"/></svg><b>Purv<span>/</span>OS</b></a>
  <span class="mb-sec" aria-hidden="true"><span class="mb-sec-in">Desktop</span></span>
  <span class="mb-r"><span class="mb-clock" aria-label="Time in Mumbai"><span id="clock">--:--</span> IST</span>
  <button type="button" class="mb-theme" id="theme" aria-label="Toggle dark mode"><span class="sun">☀</span><span class="moon">☾</span></button>
  <a href="assets/Purv Taparia - Resume.pdf" target="_blank" class="mb-cv">Resume ↗</a></span>
  <span class="mb-prog" aria-hidden="true"><i></i></span>
</header>
<main>
{hero}
{about}
{ticker}
{achievements}
{certifications}
{latest}
{projects}
{books}
{faq}
{contact}
</main>
{footer}
<nav class="dock" aria-label="Sections">{dock}</nav>
{modal}
<div id="crt" aria-hidden="true"><p>Purv/OS has shut down.<br><button type="button" id="on">⏻ Power on</button></p></div>
<div id="cursor" aria-hidden="true"><span class="c-ring"><span class="c-lbl"></span></span><span class="c-dot"></span></div>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/Flip.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/Draggable.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/InertiaPlugin.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrambleTextPlugin.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.4/dist/lenis.min.js" defer></script>
<script src="app.js?v=1" defer></script>
</body>
</html>
'''
(D / "index.html").write_text(page)
print("wrote", D / "index.html", len(page), "bytes")
