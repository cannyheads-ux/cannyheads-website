// Draws the cover building (modern glass office, trees, walkway, blue sky) as
// vector art and renders it at print resolution: brochure/assets/cover-building.png.
// Replaces the owner's small 302 px office image, which blurred on the covers.
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';

const root = '/root/cannyheads-redesign';
const require = createRequire(root + '/package.json');
const { chromium } = require('playwright');

const W = 2400, H = 2100;
const VP = { x: 2550, y: 1330 };            // vanishing point (right, a little below middle)
const lerp = (a, b, t) => a + (b - a) * t;
// Point on the line from (x, y) towards the vanishing point, at horizontal position xt.
const toward = (x, y, xt) => y + (VP.y - y) * ((xt - x) / (VP.x - x));
// Perspective spacing: equal real-world steps shrink towards the vanishing point.
const persp = (x0, x1, n) => Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n, k = 2.2;
    return lerp(x0, x1, (1 - Math.pow(1 - t, k * 0.55)) * 0.35 + t * 0.65);
});

const out = [];
const add = s => out.push(s);

/* ---------- sky ---------- */
add(`<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1F6FC2"/><stop offset=".55" stop-color="#5EA8E6"/><stop offset="1" stop-color="#CFEAFB"/></linearGradient>
<radialGradient id="sun" cx=".38" cy=".08" r=".38"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset=".35" stop-color="#FFFFFF" stop-opacity=".35"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
<linearGradient id="glassA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FD3F5"/><stop offset=".35" stop-color="#4E98D4"/><stop offset=".75" stop-color="#2A5F93"/><stop offset="1" stop-color="#1D3F63"/></linearGradient>
<linearGradient id="glassB" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2E6CA6"/><stop offset="1" stop-color="#173A5E"/></linearGradient>
<linearGradient id="glassC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9D8F4"/><stop offset="1" stop-color="#3B76AE"/></linearGradient>
<linearGradient id="refl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".55"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
<linearGradient id="path" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7D9C4"/><stop offset="1" stop-color="#C9B193"/></linearGradient>
<linearGradient id="lawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7DBB4A"/><stop offset="1" stop-color="#3F8A2C"/></linearGradient>
<radialGradient id="leaf" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#8CCB52"/><stop offset=".6" stop-color="#3E8E2E"/><stop offset="1" stop-color="#245E1E"/></radialGradient>
<filter id="soft"><feGaussianBlur stdDeviation="2"/></filter>
<filter id="cloud"><feGaussianBlur stdDeviation="18"/></filter>
</defs>`);
add(`<rect width="${W}" height="${H}" fill="url(#sky)"/>`);
// soft clouds
for (const [cx, cy, rx, ry, o] of [[560, 260, 330, 70, .55], [1500, 380, 420, 80, .45], [2050, 220, 300, 60, .5], [1150, 180, 260, 50, .4]])
    add(`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity="${o}" filter="url(#cloud)"/>`);
add(`<rect width="${W}" height="${H}" fill="url(#sun)"/>`);

/* ---------- distant buildings (right, small) ---------- */
const block = ({ x0, x1, top, bottom, floors, fill, cols }) => {
    const tl = top, tr = toward(x0, top, x1), bl = bottom, br = toward(x0, bottom, x1);
    add(`<polygon points="${x0},${tl} ${x1},${tr} ${x1},${br} ${x0},${bl}" fill="${fill}"/>`);
    for (let i = 1; i < floors; i++) {
        const y0 = lerp(tl, bl, i / floors);
        add(`<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${toward(x0, y0, x1)}" stroke="#123352" stroke-width="${Math.max(1.5, 5 * (1 - (x0 - 1300) / 1500))}" opacity=".7"/>`);
    }
    for (const x of persp(x0, x1, cols).slice(1, -1))
        add(`<line x1="${x}" y1="${toward(x0, tl, x)}" x2="${x}" y2="${toward(x0, bl, x)}" stroke="#0F2A44" stroke-width="2" opacity=".55"/>`);
};
block({ x0: 1930, x1: 2140, top: 1010, bottom: 1400, floors: 9, fill: 'url(#glassC)', cols: 6 });
block({ x0: 1680, x1: 1900, top: 860, bottom: 1430, floors: 11, fill: 'url(#glassA)', cols: 7 });

/* ---------- main building ---------- */
// Left (shaded) side face
const L = { x: 110, top: 560, bottom: 1640 };
const F = { x0: 300, x1: 1600, top: 470, bottom: 1640 };   // front face (left edge)
add(`<polygon points="${L.x},${L.top + 40} ${F.x0},${F.top} ${F.x0},${F.bottom} ${L.x},${L.bottom}" fill="url(#glassB)"/>`);
// side-face floor lines
const floors = 10;
for (let i = 0; i <= floors; i++) {
    const yl = lerp(L.top + 40, L.bottom, i / floors), yr = lerp(F.top, F.bottom, i / floors);
    add(`<line x1="${L.x}" y1="${yl}" x2="${F.x0}" y2="${yr}" stroke="#0E2740" stroke-width="7"/>`);
}
for (const t of [.33, .66]) add(`<line x1="${lerp(L.x, F.x0, t)}" y1="${lerp(L.top + 40, F.top, t)}" x2="${lerp(L.x, F.x0, t)}" y2="${L.bottom}" stroke="#0E2740" stroke-width="4" opacity=".8"/>`);

// Front face glass
const fTR = toward(F.x0, F.top, F.x1), fBR = toward(F.x0, F.bottom, F.x1);
add(`<polygon points="${F.x0},${F.top} ${F.x1},${fTR} ${F.x1},${fBR} ${F.x0},${F.bottom}" fill="url(#glassA)"/>`);
// sky reflections: diagonal light bands
for (const [a, b, o] of [[F.x0 + 60, F.x0 + 420, .55], [F.x0 + 560, F.x0 + 760, .35], [F.x0 + 900, F.x0 + 1020, .25]]) {
    const pts = [[a, toward(F.x0, F.top, a)], [b, toward(F.x0, F.top, b)], [b - 220, toward(F.x0, lerp(F.top, F.bottom, .62), b - 220)], [a - 220, toward(F.x0, lerp(F.top, F.bottom, .62), a - 220)]];
    add(`<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="url(#refl)" opacity="${o}"/>`);
}
// tree reflections near the bottom of the glass
for (let k = 0; k < 9; k++) {
    const x = F.x0 + 80 + k * 135, y = toward(F.x0, F.bottom, x) - 90;
    add(`<ellipse cx="${x}" cy="${y}" rx="${70 - k * 4}" ry="${60 - k * 3}" fill="#2F6B3A" opacity=".35" filter="url(#soft)"/>`);
}
// floor slabs (dark bands) and mullions
for (let i = 0; i <= floors; i++) {
    const y0 = lerp(F.top, F.bottom, i / floors);
    add(`<line x1="${F.x0}" y1="${y0}" x2="${F.x1}" y2="${toward(F.x0, y0, F.x1)}" stroke="#0E2740" stroke-width="${i === 0 ? 16 : 9}"/>`);
}
for (const x of persp(F.x0, F.x1, 22).slice(1, -1))
    add(`<line x1="${x}" y1="${toward(F.x0, F.top, x)}" x2="${x}" y2="${toward(F.x0, F.bottom, x)}" stroke="#163A5C" stroke-width="${lerp(5, 2.5, (x - F.x0) / (F.x1 - F.x0))}" opacity=".85"/>`);
// corner fin and roof edge
add(`<line x1="${F.x0}" y1="${F.top - 8}" x2="${F.x0}" y2="${F.bottom}" stroke="#E9F4FC" stroke-width="10"/>`);
add(`<polygon points="${L.x - 10},${L.top + 22} ${F.x0},${F.top - 26} ${F.x1},${toward(F.x0, F.top - 26, F.x1)} ${F.x1},${fTR} ${F.x0},${F.top} ${L.x - 10},${L.top + 44}" fill="#DCE6EE"/>`);
// ground-floor lobby (lighter glass + entrance)
const lobTop = lerp(F.top, F.bottom, .9);
add(`<polygon points="${F.x0},${lobTop} ${F.x1},${toward(F.x0, lobTop, F.x1)} ${F.x1},${fBR} ${F.x0},${F.bottom}" fill="#5D8DB5" opacity=".55"/>`);
const ex = F.x0 + 330;
add(`<polygon points="${ex},${toward(F.x0, lobTop, ex)} ${ex + 110},${toward(F.x0, lobTop, ex + 110)} ${ex + 110},${toward(F.x0, F.bottom, ex + 110)} ${ex},${toward(F.x0, F.bottom, ex)}" fill="#E8C27A" opacity=".75"/>`);

/* ---------- ground ---------- */
const gy = F.bottom;
// lawn (left) and walkway converging to the vanishing point
add(`<polygon points="0,${gy} ${F.x1 + 600},${toward(0, gy, F.x1 + 600)} ${W},${toward(0, gy, W) + 40} ${W},${H} 0,${H}" fill="url(#lawn)"/>`);
const p1 = [[150, H], [1250, H], [2050, toward(0, gy + 40, 2050) + 18], [1960, toward(0, gy + 40, 1960) + 6]];
add(`<polygon points="${p1.map(p => p.join(',')).join(' ')}" fill="url(#path)"/>`);
// paving lines
for (let k = 1; k < 14; k++) {
    const t = Math.pow(k / 14, 1.9), y = lerp(H, toward(0, gy + 40, 2000) + 10, t);
    const xl = lerp(150, 1960, t), xr = lerp(1250, 2050, t);
    add(`<line x1="${xl}" y1="${y}" x2="${xr}" y2="${y}" stroke="#B59C7C" stroke-width="${lerp(4, 1, t)}" opacity=".7"/>`);
}
for (const s of [.25, .5, .75]) add(`<line x1="${lerp(150, 1250, s)}" y1="${H}" x2="${lerp(1960, 2050, s)}" y2="${toward(0, gy + 40, 2000) + 12}" stroke="#B59C7C" stroke-width="2.5" opacity=".6"/>`);
// hedge along the building base
for (let x = F.x0 - 120; x < F.x1 + 80; x += 38) {
    const y = toward(F.x0, gy, x) + 8, r = lerp(46, 14, (x - F.x0) / (F.x1 - F.x0 + 200));
    add(`<ellipse cx="${x}" cy="${y}" rx="${r * 1.3}" ry="${r}" fill="url(#leaf)"/>`);
}
// lamp posts
for (const x of [1350, 1620, 1820]) {
    const y = toward(0, gy + 40, x) + 14, h = lerp(330, 120, (x - 1350) / 600);
    add(`<line x1="${x}" y1="${y}" x2="${x}" y2="${y - h}" stroke="#2B3A44" stroke-width="${lerp(9, 4, (x - 1350) / 600)}"/><circle cx="${x}" cy="${y - h}" r="${lerp(14, 6, (x - 1350) / 600)}" fill="#F4F1E6"/>`);
}

/* ---------- trees (right side) ---------- */
const tree = (x, y, s) => {
    add(`<rect x="${x - 9 * s}" y="${y - 260 * s}" width="${18 * s}" height="${260 * s}" fill="#4B3626"/>`);
    for (const [dx, dy, r] of [[0, -360, 170], [-120, -300, 130], [120, -290, 140], [-60, -470, 125], [80, -440, 120], [0, -230, 110]])
        add(`<circle cx="${x + dx * s}" cy="${y + dy * s}" r="${r * s}" fill="url(#leaf)"/>`);
};
tree(2330, 1980, 1.35); tree(2140, 1660, .95); tree(2010, 1520, .7); tree(1910, 1450, .5);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${out.join('')}</svg>`;
await fs.mkdir(root + '/brochure/assets', { recursive: true });
await fs.writeFile(root + '/brochure/assets/cover-building.svg', svg);

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
await page.screenshot({ path: root + '/brochure/assets/cover-building.png', clip: { x: 0, y: 0, width: W, height: H } });
await browser.close();
console.log('cover-building.png', W, 'x', H);
