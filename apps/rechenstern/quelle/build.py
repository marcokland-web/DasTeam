"""Baut die installierbare GitHub-Pages-Fassung von Rechenstern (Deploy-Dennis).

Aufruf: python3 -I build.py <zielordner>
- CSS und JS in eigene Dateien (Content-Security-Policy ohne Inline-Code)
- Web-Manifest und komplettes Icon-Set im Familienstil (Logo-Luisa)
"""
import json, math, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
os.makedirs(os.path.join(OUT, "icons"), exist_ok=True)
src = open(os.path.join(HERE, "rechenstern.html"), encoding="utf-8").read()

early = re.search(r'<script id="early">(.*?)</script>', src, re.S)
open(os.path.join(OUT, "early.js"), "w", encoding="utf-8").write(early.group(1) + "\n")
src = src.replace(early.group(0), '<script src="early.js"></script>')
css = re.search(r"<style>\n?(.*?)</style>", src, re.S).group(1)
css += "\n/* Eigenständige App: Abstand zur Statusleiste */\nhtml{padding-top:env(safe-area-inset-top,0px)}\n"
js = re.search(r"<script>\n?(.*?)</script>", src, re.S).group(1)
src = re.sub(r"<style>.*?</style>", '<link rel="stylesheet" href="style.css">', src, flags=re.S)
src = re.sub(r"<script>.*?</script>", '<script src="app.js"></script>', src, flags=re.S)
src = "\n".join(l for l in src.split("\n") if 'name="claude:viewport-fit-sides"' not in l)
import collections
_blocks = re.findall(r'const STR = \{(.*?)\n\};', js, re.S) + re.findall(r'Object\.assign\(STR, \{(.*?)\n\}\);', js, re.S)
_keys = [k for blk in _blocks for k in re.findall(r'(?:^|[\s,{])([A-Za-z][A-Za-z0-9_]*):\[\"', blk)]
if len(_blocks) < 2: sys.exit("Textblöcke nicht gefunden")
_dup = [k for k, c in collections.Counter(_keys).items() if c > 1]
_set = set(_keys)
_clash = [k for k in _set if k.endswith("N") and k[:-1] in _set and ('t("' + k + '"') in js]
if _clash:
    sys.exit("Textschlüssel kollidiert mit der Namens-Variante: " + ", ".join(sorted(_clash)))
if _dup:
    sys.exit("doppelte Textschlüssel (würden sich überschreiben): " + ", ".join(sorted(_dup)))
if "style=" in src or "style=" in js.replace("e.style", "").replace(".style.", ""):
    sys.exit("Inline-Style gefunden: verstößt gegen die Content-Security-Policy")

cut = src.index('<div class="app"')
head, body = src[:cut].rstrip(), src[cut:].rstrip()
CSP = ("default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' https://asfwbuptsfcrgmmgdgim.supabase.co; manifest-src 'self'; "
       "base-uri 'none'; form-action 'none'; object-src 'none'")
APP = "\n".join([
    '<link rel="icon" id="favicon" href="icons/icon.svg" type="image/svg+xml">',
    '<link rel="icon" href="icons/favicon-32.png" sizes="32x32" type="image/png">',
    '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">',
    '<link rel="manifest" href="manifest.webmanifest">',
    '<meta name="apple-mobile-web-app-title" content="Rechenstern">',
    '<meta name="apple-mobile-web-app-capable" content="yes">',
    '<meta name="mobile-web-app-capable" content="yes">',
    '<meta name="apple-mobile-web-app-status-bar-style" content="default">',
    '<meta name="theme-color" content="#FAF7F2" media="(prefers-color-scheme: light)">',
    '<meta name="theme-color" content="#141012" media="(prefers-color-scheme: dark)">',
    '<meta name="description" content="Rechenstern: das Einmaleins-Spiel des Familien-App-Studios">',
])
head = head.replace('<link rel="icon" id="favicon" href="data:,">', APP)
page = ('<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        f'<meta http-equiv="Content-Security-Policy" content="{CSP}">\n'
        + head + "\n</head>\n<body>\n" + body + "\n</body>\n</html>\n")
import shutil
shutil.copyfile(os.path.join(HERE, "sw.js"), os.path.join(OUT, "sw.js"))
for name, content in [("index.html", page), ("style.css", css), ("app.js", js)]:
    open(os.path.join(OUT, name), "w", encoding="utf-8").write(content)

manifest = {
    "name": "Rechenstern", "short_name": "Rechenstern", "lang": "de", "dir": "ltr",
    "description": "Das Einmaleins-Spiel mit Sternen, Abzeichen und Belohnungen",
    "id": "./", "start_url": "./", "scope": "./", "display": "standalone", "orientation": "any",
    "background_color": "#FAF7F2", "theme_color": "#5A1028",
    "icons": [
        {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
        {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
        {"src": "icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        {"src": "icons/icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any"},
    ],
}
json.dump(manifest, open(os.path.join(OUT, "manifest.webmanifest"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)

# Icon „Rechenstern“: goldener Linienstern mit Mal-Zeichen auf Bordeaux
def star(cx, cy, R, r):
    pts = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 else R
        pts.append(f"{cx + rr * math.cos(a):.2f} {cy + rr * math.sin(a):.2f}")
    return "M" + "L".join(pts) + "Z"
DEFS = ('<defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">'
        '<stop offset="0" stop-color="#8C2545"/><stop offset="1" stop-color="#5A1028"/></linearGradient>'
        '<linearGradient id="g" x1="0" y1="10" x2="0" y2="54" gradientUnits="userSpaceOnUse">'
        '<stop offset="0" stop-color="#F0D08A"/><stop offset="1" stop-color="#C8963E"/></linearGradient></defs>')
def mark(scale, sw=2.6, small=False):
    x = "" if small else '<path d="M28.4 30.2l7.2 7.2M35.6 30.2l-7.2 7.2" stroke="url(#g)" stroke-width="2.8" stroke-linecap="round"/>'
    return (f'<g transform="translate(32 32) scale({scale}) translate(-32 -32)">'
            f'<path d="{star(32, 33.6, 21, 9.2)}" fill="none" stroke="url(#g)" stroke-width="{sw}" stroke-linejoin="round"/>{x}</g>')
def svg(bg, scale, **k):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">{DEFS}{bg}{mark(scale, **k)}</svg>'
full = '<rect width="64" height="64" fill="url(#b)"/>'
rounded = '<rect width="64" height="64" rx="14.4" fill="url(#b)"/>'
variants = {
    "apple-touch-icon.png": (svg(full, 1.0), 180),
    "icon-192.png": (svg(rounded, 1.0), 192),
    "icon-512.png": (svg(rounded, 1.0), 512),
    "maskable-512.png": (svg(full, 0.86), 512),
    "favicon-32.png": (svg(rounded, 1.18, sw=4.2, small=True), 32),
}
open(os.path.join(OUT, "icons", "icon.svg"), "w", encoding="utf-8").write(svg(rounded, 1.0) + "\n")
jobs = []
for name, (content, size) in variants.items():
    p = os.path.join(OUT, "icons", name.replace(".png", ".render.svg"))
    open(p, "w", encoding="utf-8").write(content)
    jobs.append({"svg": p, "png": os.path.join(OUT, "icons", name), "size": size})
render = r"""
const { chromium } = require("/opt/node-tools/node_modules/playwright");
const fs = require("fs");
(async () => {
  const jobs = JSON.parse(process.argv[1]);
  const b = await chromium.launch({ executablePath: "/opt/google/chrome/chrome" });
  for (const j of jobs) {
    const p = await b.newPage({ viewport: { width: j.size, height: j.size }, deviceScaleFactor: 1 });
    const svg = fs.readFileSync(j.svg, "utf8").replace("<svg ", `<svg width="${j.size}" height="${j.size}" `);
    await p.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
    await p.screenshot({ path: j.png, omitBackground: true, clip: { x: 0, y: 0, width: j.size, height: j.size } });
    await p.close();
  }
  await b.close();
})();
"""
subprocess.run(["node", "-e", render, json.dumps(jobs)], check=True)
for j in jobs:
    os.remove(j["svg"])
print("gebaut:", sorted(os.listdir(OUT)), sorted(os.listdir(os.path.join(OUT, "icons"))))
