// Generates tasteful placeholder app screens (SVG) into public/placeholders.
// Run: node scripts/generate-placeholders.mjs
// Replace them from the admin once real screenshots are uploaded.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const W = 1179;
const H = 2556;
const OUT = join(process.cwd(), "public", "placeholders");

const projects = [
  { prefix: "mashena", name: "Mashena", accent: "#F2B45A", kind: "map" },
  { prefix: "mwaeed", name: "Mwaeed", accent: "#8FD8B8", kind: "booking" },
  { prefix: "swift", name: "Swift", accent: "#FF8D6B", kind: "commerce" },
  { prefix: "coursecraft", name: "CourseCraft", accent: "#B7A3FF", kind: "learn" },
  { prefix: "pharmacist", name: "Pharmacist", accent: "#6ED3DF", kind: "commerce" },
];

const bg = "#0F0E0D";
const surface = "#1A1816";
const line = "#2A2724";
const text = "#F2EEE6";
const muted = "#8C867D";

function shell(accent, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <radialGradient id="glow" cx="0.8" cy="0.05" r="0.9">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="acc" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${accent}"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <g fill="${text}" opacity="0.9">
    <rect x="90" y="70" width="110" height="30" rx="15"/>
    <rect x="${W - 230}" y="72" width="60" height="26" rx="6"/>
    <rect x="${W - 150}" y="72" width="60" height="26" rx="6"/>
  </g>
  ${body}
  <rect x="${W / 2 - 200}" y="${H - 50}" width="400" height="14" rx="7" fill="${text}" opacity="0.5"/>
</svg>`;
}

const bar = (x, y, w, h = 34, fill = text, op = 1) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}" opacity="${op}"/>`;

function header(name, accent) {
  return `
  <circle cx="160" cy="250" r="70" fill="${surface}" stroke="${line}" stroke-width="3"/>
  <circle cx="160" cy="250" r="26" fill="${accent}"/>
  ${bar(270, 205, 330, 40, text)}
  ${bar(270, 270, 220, 28, muted, 0.8)}
  <text x="90" y="520" font-family="Georgia, serif" font-size="150" fill="${text}">${name}</text>`;
}

function card(x, y, w, h, accent, filled = false) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="56" fill="${filled ? "url(#acc)" : surface}" stroke="${line}" stroke-width="3"/>`;
}

function listRows(y0, count, accent) {
  let s = "";
  for (let i = 0; i < count; i++) {
    const y = y0 + i * 240;
    s += card(90, y, W - 180, 200, accent);
    s += `<rect x="130" y="${y + 40}" width="120" height="120" rx="32" fill="${i === 0 ? accent : line}"/>`;
    s += bar(290, y + 55, 420 - i * 40, 34, text, 0.9);
    s += bar(290, y + 115, 260, 26, muted, 0.7);
    s += bar(W - 300, y + 75, 150, 50, accent, i === 0 ? 1 : 0.25);
  }
  return s;
}

function screenMap(p, n) {
  if (n === 1) {
    return `
    <g opacity="0.55" stroke="${line}" stroke-width="10" fill="none">
      <path d="M-50 900 C 300 800, 500 1300, 1250 1100"/>
      <path d="M200 -50 C 260 600, 900 900, 820 2600"/>
      <path d="M-50 1700 C 400 1500, 700 1900, 1250 1650"/>
      <path d="M600 -50 L 520 2600"/>
    </g>
    <path d="M300 1500 C 420 1200, 640 1250, 760 900" stroke="${p.accent}" stroke-width="18" fill="none" stroke-linecap="round" stroke-dasharray="1 34"/>
    <circle cx="300" cy="1500" r="38" fill="${text}"/>
    <circle cx="760" cy="900" r="80" fill="${p.accent}" opacity="0.25"/>
    <circle cx="760" cy="900" r="38" fill="${p.accent}"/>
    ${card(60, 1880, W - 120, 560, p.accent)}
    ${bar(130, 1960, 380, 44)}
    ${bar(130, 2040, 260, 30, muted, 0.8)}
    <rect x="130" y="2140" width="${W - 260}" height="200" rx="100" fill="url(#acc)"/>
    ${bar(W / 2 - 160, 2222, 320, 38, bg)}
    ${card(90, 160, W - 180, 150, p.accent)}
    ${bar(150, 215, 460, 40)}`;
  }
  return screenGeneric(p, n);
}

function screenGeneric(p, n) {
  if (n === 1) {
    return `${header(p.name, p.accent)}
    ${card(90, 640, W - 180, 640, p.accent, true)}
    ${bar(160, 1100, 520, 56, bg, 0.9)}
    ${bar(160, 1190, 320, 34, bg, 0.6)}
    <circle cx="${W - 240}" cy="830" r="110" fill="${bg}" opacity="0.18"/>
    ${listRows(1360, 4, p.accent)}`;
  }
  if (n === 2) {
    let chips = "";
    ["All", "New", "Popular", "Saved"].forEach((_, i) => {
      chips += bar(90 + i * 250, 600, 220, 90, i === 0 ? p.accent : surface, 1);
    });
    let grid = "";
    for (let i = 0; i < 4; i++) {
      const x = 90 + (i % 2) * 520;
      const y = 760 + Math.floor(i / 2) * 760;
      grid += card(x, y, 480, 700, p.accent);
      grid += `<rect x="${x + 30}" y="${y + 30}" width="420" height="420" rx="40" fill="${i === 1 ? p.accent : line}" opacity="${i === 1 ? 0.8 : 1}"/>`;
      grid += bar(x + 40, y + 500, 300, 36);
      grid += bar(x + 40, y + 570, 180, 28, muted, 0.8);
      grid += bar(x + 40, y + 625, 140, 40, p.accent, 0.9);
    }
    return `${bar(90, 200, 600, 70)}${bar(90, 300, 380, 36, muted, 0.8)}
    <rect x="90" y="400" width="${W - 180}" height="140" rx="70" fill="${surface}" stroke="${line}" stroke-width="3"/>
    <circle cx="170" cy="470" r="26" fill="none" stroke="${muted}" stroke-width="8"/>
    ${bar(230, 455, 340, 30, muted, 0.6)}
    ${chips}${grid}`;
  }
  return `
    <rect x="0" y="0" width="${W}" height="1100" fill="url(#acc)" opacity="0.9"/>
    <circle cx="${W / 2}" cy="560" r="230" fill="${bg}" opacity="0.2"/>
    <circle cx="${W / 2}" cy="560" r="120" fill="${bg}" opacity="0.25"/>
    <rect x="0" y="1020" width="${W}" height="${H - 1020}" rx="80" fill="${bg}"/>
    ${bar(90, 1130, 700, 70)}
    ${bar(90, 1240, 460, 36, muted, 0.8)}
    ${bar(90, 1360, W - 180, 28, muted, 0.45)}
    ${bar(90, 1420, W - 280, 28, muted, 0.45)}
    ${bar(90, 1480, W - 400, 28, muted, 0.45)}
    ${listRows(1600, 2, p.accent)}
    <rect x="90" y="2180" width="${W - 180}" height="190" rx="95" fill="url(#acc)"/>
    ${bar(W / 2 - 180, 2258, 360, 38, bg)}`;
}

function portrait() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1125" width="900" height="1125">
  <defs>
    <radialGradient id="g" cx="0.3" cy="0.2" r="1">
      <stop offset="0" stop-color="#7FB2FF" stop-opacity="0.45"/>
      <stop offset="0.6" stop-color="#161412" stop-opacity="1"/>
    </radialGradient>
  </defs>
  <rect width="900" height="1125" fill="#0B0A09"/>
  <rect width="900" height="1125" fill="url(#g)"/>
  <circle cx="450" cy="470" r="170" fill="#F2EEE6" opacity="0.08"/>
  <path d="M170 1125 C 200 820, 700 820, 730 1125 Z" fill="#F2EEE6" opacity="0.08"/>
  <text x="450" y="560" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="240" fill="#F2EEE6" opacity="0.85">AZ</text>
</svg>`;
}

mkdirSync(OUT, { recursive: true });
for (const p of projects) {
  for (const n of [1, 2, 3]) {
    const body = p.kind === "map" ? screenMap(p, n) : screenGeneric(p, n);
    writeFileSync(join(OUT, `${p.prefix}-${n}.svg`), shell(p.accent, body));
  }
}
writeFileSync(join(OUT, "portrait.svg"), portrait());
console.log(`Wrote ${projects.length * 3 + 1} placeholders to ${OUT}`);
