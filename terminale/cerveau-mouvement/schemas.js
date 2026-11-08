/* Schémas de l'activité « Le cerveau et le mouvement volontaire ».
   Chaque fonction renvoie le code d'une image SVG. Deux styles : couleur (page) ou trait (fiche à imprimer).
   Option corr : la fiche affiche les réponses (corrigé). */
(function (g) {
'use strict';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
let uid = 0;

/* boîte de légende de la fiche : vide, ou remplie en mode corrigé */
function box(x, y, w, h, n, txt, corr, anchor) {
  const tx = anchor === 'end' ? x + w - 8 : x + 8;
  return `<g class="lbox"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/>` +
    (n ? `<text class="lnum" x="${x - 4}" y="${y - 4}" text-anchor="end">${n}</text>` : '') +
    (corr && txt ? `<text class="ans" x="${tx}" y="${y + h / 2 + 5}" text-anchor="${anchor === 'end' ? 'end' : 'start'}">${esc(txt)}</text>` : '') + `</g>`;
}
function lead(x1, y1, x2, y2) { return `<line class="lead" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><circle class="dot" cx="${x2}" cy="${y2}" r="2.6"/>`; }

/* ================= 1. Cerveau en vue latérale (hémisphère gauche) ================= */
const OUT = 'M 70 215 C 62 150 120 80 210 60 C 290 40 390 42 460 70 C 530 98 580 150 584 210 C 588 250 570 272 540 280 C 500 288 470 282 440 290 C 400 312 360 330 300 332 C 250 334 214 318 196 292 C 186 276 188 262 196 252 C 170 252 150 262 120 260 C 90 256 74 240 70 215 Z';
const SYL = 'M 198 250 C 250 236 330 224 392 206 C 408 200 418 192 426 180';
const CS = 'M 336 45 C 330 78 322 100 318 120 C 314 140 300 152 298 172 C 296 192 290 206 286 220';
const PO = 'M 498 82 C 492 150 482 220 470 284';
const TP = 'M 426 182 C 446 200 462 214 480 226';
const CER = 'M 432 296 C 470 286 540 282 574 272 C 592 300 574 338 532 350 C 490 362 448 348 432 322 Z';
const STEM = 'M 386 296 C 390 330 394 370 400 430 L 436 430 C 432 376 432 330 436 300 Z';
const LOBES = {
  frontal: 'M 0 0 L 336 0 L 336 45 C 330 78 322 100 318 120 C 314 140 300 152 298 172 C 296 192 290 206 286 220 L 290 229 L 260 235 L 230 242 L 198 250 L 0 420 Z',
  parietal: 'M 336 0 L 500 0 L 498 82 L 494 120 L 490 160 L 484 200 L 480 226 L 462 212 L 446 198 L 426 182 L 410 197 L 392 206 L 360 215 L 330 224 L 300 228 L 290 229 L 286 220 C 290 206 296 192 298 172 C 300 152 314 140 318 120 C 322 100 330 78 336 45 Z',
  occipital: 'M 500 0 L 640 0 L 640 430 L 470 300 L 470 284 L 480 226 L 484 200 L 490 160 L 494 120 L 498 82 Z',
  temporal: 'M 198 250 L 230 242 L 260 235 L 290 229 L 330 224 L 360 215 L 392 206 L 410 197 L 426 182 L 446 198 L 462 212 L 480 226 L 470 284 L 470 430 L 150 430 L 180 262 Z'
};
const GYRI = ['M 110 150 C 140 120 180 110 220 112', 'M 96 200 C 130 180 170 176 210 182', 'M 160 80 C 200 70 240 76 270 92',
  'M 300 52 C 294 84 286 110 282 130 C 278 150 266 166 262 190 C 260 204 256 214 252 224', 'M 120 236 C 150 226 176 224 204 228',
  'M 372 52 C 366 84 360 108 356 128 C 352 148 342 160 340 182 C 339 196 336 206 334 214', 'M 372 130 C 400 126 430 130 460 150',
  'M 400 80 C 420 92 440 100 470 104', 'M 420 170 C 440 160 460 162 476 176', 'M 222 278 C 270 262 330 252 390 238 C 410 232 430 228 450 232',
  'M 232 308 C 280 300 340 292 400 278 C 420 274 440 274 456 270', 'M 520 150 C 540 160 556 180 566 200', 'M 506 220 C 526 230 546 240 566 244',
  'M 190 140 C 210 150 230 150 250 142', 'M 520 110 C 540 120 552 132 560 150'];
const AIRES = {
  motrice: { nom: 'Aire motrice primaire', svg: `<path d="${CS}" transform="translate(-13 1)" fill="none" stroke-width="24"/>`, col: '#E8590C' },
  premotrice: { nom: 'Aire prémotrice', svg: `<path d="${CS}" transform="translate(-38 2)" fill="none" stroke-width="25"/>`, col: '#F2A33A' },
  prefrontal: { nom: 'Cortex préfrontal', svg: '<path d="M 0 0 L 292 0 L 284 50 L 276 100 L 268 130 L 252 160 L 246 200 L 238 236 L 0 300 Z"/>', col: '#7FB069' },
  somato: { nom: 'Aire somatosensorielle', svg: `<path d="${CS}" transform="translate(15 -1)" fill="none" stroke-width="24"/>`, col: '#3B8BD4' },
  visuelle: { nom: 'Aire visuelle', svg: '<ellipse cx="562" cy="214" rx="34" ry="62"/>', col: '#B565A7' },
  auditive: { nom: 'Aire auditive', svg: '<ellipse cx="330" cy="243" rx="44" ry="11" transform="rotate(-12 330 243)"/>', col: '#2BA69B' },
  broca: { nom: 'Aire de Broca', svg: '<ellipse cx="224" cy="222" rx="26" ry="14" transform="rotate(-15 224 222)"/>', col: '#D6336C' },
  wernicke: { nom: 'Aire de Wernicke', svg: '<ellipse cx="432" cy="220" rx="28" ry="15" transform="rotate(-25 432 220)"/>', col: '#845EF7' }
};

function cerveauLateral(o) {
  o = o || {}; const id = 'cl' + (++uid);
  const print = !!o.print, corr = !!o.corr;
  let s = `<svg class="sch cl${print ? ' pr' : ''}" viewBox="0 0 640 440" role="img" aria-label="${esc(o.aria || "Vue latérale de l'hémisphère cérébral gauche : lobes frontal, pariétal, temporal et occipital, sillon central, sillon latéral, cervelet et tronc cérébral.")}">`;
  s += `<defs><clipPath id="${id}c"><path d="${OUT}"/></clipPath></defs>`;
  s += `<g data-k="tronc"><path class="stem" d="${STEM}"/></g>`;
  s += `<g data-k="cervelet"><path class="cer" d="${CER}"/><path class="fol" d="M 446 306 C 490 300 540 296 578 290 M 446 318 C 490 314 540 310 576 306 M 452 332 C 490 330 530 326 566 322 M 470 344 C 500 344 530 340 552 336"/></g>`;
  s += `<path class="brain" d="${OUT}"/>`;
  s += `<g clip-path="url(#${id}c)">`;
  if (!print || o.lobeFill) for (const [k, d] of Object.entries(LOBES)) s += `<path class="lobe lobe-${k}" data-k="${k}" d="${d}"/>`;
  if (o.aires) for (const [k, a] of Object.entries(AIRES)) s += `<g class="aire" data-a="${k}" style="--ac:${a.col}">${a.svg}</g>`;
  s += `<path class="gyr" d="${GYRI.join(' ')}"/></g>`;
  s += `<path class="brain-o" d="${OUT}"/>`;
  s += `<path class="sul" data-k="central" d="${CS}"/><path class="sul" data-k="lateral" d="${SYL}"/>`;
  s += `<path class="bound" d="${PO} ${TP}"/>`;
  if (o.hand) s += `<g class="hand"><circle cx="305" cy="121" r="10"/><text x="305" y="104" text-anchor="middle">main</text></g>`;
  if (o.motorFill) s += `<g clip-path="url(#${id}c)"><path class="motor-corr" d="${CS}" transform="translate(-13 1)" fill="none" stroke-width="24"/></g><path class="sul" d="${CS}"/>`;
  if (print) {
    // légendes à compléter
    s += box(110, 140, 120, 30, '1', 'Lobe frontal', corr) + box(380, 96, 120, 30, '2', 'Lobe pariétal', corr) +
      box(262, 268, 128, 30, '3', 'Lobe temporal', corr) + box(500, 196, 118, 30, '4', 'Lobe occipital', corr, 'end');
    s += lead(400, 20, 334, 52) + box(402, 6, 150, 28, '5', 'Sillon central', corr);
    s += lead(150, 392, 280, 232) + box(14, 392, 150, 28, '6', 'Sillon latéral', corr);
    s += `<text class="given" x="612" y="388" text-anchor="end">Cervelet</text>` + lead(580, 376, 540, 330).replace('class="dot"', 'class="dot"');
    s += `<text class="given" x="470" y="428" text-anchor="end">Tronc cérébral</text>` + lead(474, 418, 412, 404);
    s += `<text class="given" x="20" y="34">Avant</text><path class="arr" d="M 20 44 L 70 44"/>`;
  }
  return s + '</svg>';
}

/* ================= 2. La tête et l'encéphale ================= */
function tete(o) {
  o = o || {}; const print = !!o.print, corr = !!o.corr;
  const T = 'translate(100 76) scale(0.58)';
  let s = `<svg class="sch tete${print ? ' pr' : ''}" viewBox="0 0 480 560" role="img" aria-label="Tête vue de profil : dans la boîte crânienne, l'encéphale formé du cerveau, du cervelet et du tronc cérébral, prolongé par la moelle épinière dans la colonne vertébrale.">`;
  s += `<path class="skin" d="M 132 140 C 160 92 230 64 300 66 C 390 68 450 120 458 205 C 464 258 452 306 428 336 C 414 356 404 384 402 420 L 398 560 L 214 560 L 218 432 C 214 414 200 402 178 400 C 156 398 134 394 124 382 C 114 372 116 358 120 350 C 112 346 110 338 114 332 C 108 328 108 320 114 316 C 110 312 108 306 112 302 C 102 300 88 298 86 290 C 86 282 96 268 108 252 C 112 242 116 232 120 224 C 124 200 124 168 132 140 Z"/>`;
  // colonne vertébrale
  let v = ''; for (let y = 338; y < 556; y += 25) v += `<rect class="vert" x="318" y="${y}" width="50" height="20" rx="6"/>`;
  s += `<g data-k="crane"><path class="skull" d="${OUT}" transform="${T} translate(327 190) scale(1.075) translate(-327 -190)"/><path class="skull" d="${CER}" transform="${T} translate(503 316) scale(1.16) translate(-503 -316)"/></g>`;
  s += v;
  s += `<g data-k="moelle"><path class="cord" d="M 334 322 L 352 322 L 350 560 L 336 560 Z"/></g>`;
  s += `<g transform="${T}"><g data-k="tronc"><path class="stem" d="${STEM}"/></g>`;
  s += `<g data-k="cervelet"><path class="cer" d="${CER}"/><path class="fol" d="M 446 306 C 490 300 540 296 578 290 M 446 318 C 490 314 540 310 576 306 M 452 332 C 490 330 530 326 566 322 M 470 344 C 500 344 530 340 552 336"/></g>`;
  s += `<g data-k="cerveau"><path class="brain" d="${OUT}"/><path class="gyr" d="${GYRI.join(' ')} ${CS} ${SYL}"/></g></g>`;
  // œil
  s += `<path class="face-l" d="M 128 236 C 136 232 146 232 152 236"/>`;
  if (print) {
    s += lead(250, 38, 262, 118) + box(176, 8, 150, 30, '1', 'Cerveau', corr);
    s += lead(150, 112, 176, 130) + box(4, 84, 150, 30, '2', 'Boîte crânienne', corr);
    s += lead(462, 300, 412, 254) + box(332, 300, 140, 30, '3', 'Cervelet', corr);
    s += lead(150, 470, 330, 286) + box(6, 456, 150, 30, '4', 'Tronc cérébral', corr);
    s += lead(462, 470, 352, 470) + box(332, 486, 140, 30, '5', 'Moelle épinière', corr);
  }
  return s + '</svg>';
}

/* ================= 3. Neurones pyramidaux ================= */
function rnd(seed) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function branch(x, y, ang, len, w, depth, r, out) {
  const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
  const mx = (x + x2) / 2 + (r() - 0.5) * len * 0.25, my = (y + y2) / 2 + (r() - 0.5) * len * 0.25;
  out.push(`<path d="M ${x.toFixed(1)} ${y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke-width="${w.toFixed(2)}"/>`);
  if (depth > 0) {
    const n = 2;
    for (let i = 0; i < n; i++) branch(x2, y2, ang + (i ? 1 : -1) * (0.35 + r() * 0.35), len * (0.6 + r() * 0.15), w * 0.65, depth - 1, r, out);
  }
}
function neurone(cx, cy, sc, seed, parts) {
  const r = rnd(seed), dend = [], basal = [], ax = [];
  // dendrite apicale et touffe
  const top = cy - 165 * sc, xt = cx + (r() - 0.5) * 16 * sc;
  dend.push(`<path d="M ${cx} ${cy - 15 * sc} C ${cx + (r() - .5) * 10 * sc} ${cy - 70 * sc} ${xt} ${cy - 110 * sc} ${xt} ${top}" stroke-width="${(3.2 * sc).toFixed(2)}"/>`);
  for (let i = 0; i < 4; i++) {
    const t = 0.3 + i * 0.16, yy = cy - 15 * sc - (165 - 15) * sc * t;
    branch(cx + (xt - cx) * t, yy, -Math.PI / 2 + (i % 2 ? 0.9 : -0.9), 26 * sc, 1.4 * sc, 1, r, dend);
  }
  for (let i = 0; i < 4; i++) branch(xt, top, -Math.PI / 2 + (i - 1.5) * 0.45, 30 * sc, 1.8 * sc, 2, r, dend);
  // dendrites de la base
  for (let i = 0; i < 5; i++) branch(cx + (i - 2) * 6 * sc, cy + 8 * sc, Math.PI / 2 + (i - 2) * 0.55, 34 * sc, 2 * sc, 2, r, basal);
  // axone
  ax.push(`<path d="M ${cx} ${cy + 10 * sc} C ${cx + 2 * sc} ${cy + 80 * sc} ${cx - 3 * sc} ${cy + 140 * sc} ${cx + 1 * sc} ${cy + 210 * sc}" stroke-width="${(1.3 * sc).toFixed(2)}"/>`);
  branch(cx + 1 * sc, cy + 90 * sc, Math.PI / 2 + 0.7, 30 * sc, 0.9 * sc, 1, r, ax);
  branch(cx, cy + 150 * sc, Math.PI / 2 - 0.7, 26 * sc, 0.9 * sc, 1, r, ax);
  const soma = `<path d="M ${cx} ${cy - 18 * sc} Q ${cx + 6 * sc} ${cy - 2 * sc} ${cx + 13 * sc} ${cy + 9 * sc} Q ${cx} ${cy + 14 * sc} ${cx - 13 * sc} ${cy + 9 * sc} Q ${cx - 6 * sc} ${cy - 2 * sc} ${cx} ${cy - 18 * sc} Z"/>`;
  const noyau = `<circle cx="${cx}" cy="${cy + 1 * sc}" r="${4.2 * sc}"/>`;
  if (!parts) return `<g class="nrn"><g class="dd">${dend.join('')}${basal.join('')}</g><g class="ax">${ax.join('')}</g><g class="so">${soma}</g></g>`;
  return `<g class="nrn sel"><g data-k="dendrites" class="dd">${dend.join('')}${basal.join('')}</g><g data-k="axone" class="ax">${ax.join('')}</g><g data-k="corps" class="so">${soma}</g><g data-k="noyau" class="no">${noyau}</g></g>`;
}
function pyramidaux(o) {
  o = o || {};
  let s = `<svg class="sch pyr" viewBox="0 -24 600 444" role="img" aria-label="Neurones pyramidaux du cortex : un corps cellulaire en forme de pyramide, une longue dendrite vers le haut, des dendrites à la base et un axone vers le bas.">`;
  s += `<rect class="bg" y="-24" width="600" height="444"/>`;
  const pos = [[60, 210, .72, 3], [140, 196, .8, 5], [215, 214, .66, 8], [370, 204, .78, 11], [450, 214, .7, 14], [530, 198, .82, 17], [110, 300, .5, 21], [480, 300, .5, 23]];
  for (const [x, y, sc, sd] of pos) s += neurone(x, y, sc, sd);
  s += neurone(295, 208, 1.0, 31, true);
  s += `<g class="scale"><line x1="500" y1="396" x2="580" y2="396"/><text x="540" y="388" text-anchor="middle">50 µm</text></g>`;
  return s + '</svg>';
}
function neuroneFiche(o) {
  o = o || {}; const corr = !!o.corr;
  let s = `<svg class="sch pr nfi" viewBox="0 -30 520 460" role="img" aria-label="Un neurone pyramidal à légender.">`;
  s += neurone(250, 205, 1.05, 31, true);
  s += lead(110, 40, 248, 70) + box(10, 22, 130, 28, '1', 'Dendrites', corr);
  s += lead(380, 190, 262, 200) + box(380, 176, 130, 28, '2', 'Corps cellulaire', corr);
  s += lead(110, 214, 248, 206) + box(10, 200, 110, 28, '3', 'Noyau', corr);
  s += lead(380, 360, 254, 360) + box(380, 346, 130, 28, '4', 'Axone', corr);
  return s + '</svg>';
}

/* ================= 4. Cellules gliales ================= */
function gliales(o) {
  o = o || {}; const print = !!o.print, corr = !!o.corr;
  let s = `<svg class="sch gli${print ? ' pr' : ''}" viewBox="0 0 600 440" role="img" aria-label="Les cellules du cerveau : un capillaire sanguin, un astrocyte en étoile relié au capillaire et aux neurones, un oligodendrocyte qui forme la gaine de myéline autour des axones, une cellule de la microglie près de bactéries, et des neurones reliés par des synapses.">`;
  // capillaire
  s += `<g data-k="capillaire"><path class="cap-o" d="M 70 440 C 90 330 110 230 150 150 C 170 110 190 60 200 0"/><path class="cap" d="M 70 440 C 90 330 110 230 150 150 C 170 110 190 60 200 0"/>`;
  if (!print) s += '<ellipse class="rbc" cx="101" cy="300" rx="9" ry="5" transform="rotate(-75 101 300)"/><ellipse class="rbc" cx="139" cy="180" rx="9" ry="5" transform="rotate(-62 139 180)"/><ellipse class="rbc" cx="176" cy="88" rx="9" ry="5" transform="rotate(-68 176 88)"/>';
  s += '</g>';
  // neurones
  const nrn = (x, y, axd) => `<g data-k="neurone" class="ne"><path class="ne-d" d="M ${x} ${y} l -22 -26 m 22 26 l 4 -34 m -4 34 l 26 -22 m -26 22 l -30 4 m 30 -4 l 28 10"/><circle class="ne-s" cx="${x}" cy="${y}" r="13"/><path class="ne-a" d="${axd}"/></g>`;
  s += nrn(390, 96, 'M 390 109 L 390 330 C 390 344 398 352 410 356');
  s += nrn(532, 110, 'M 532 123 L 532 300 C 532 330 520 352 490 368');
  s += `<g data-k="neurone" class="ne"><path class="ne-d" d="M 470 396 l -30 -24 m 30 24 l -40 6 m 40 -6 l 30 -26 m -30 26 l 36 8"/><circle class="ne-s" cx="470" cy="396" r="13"/></g>`;
  // gaine de myéline + oligodendrocyte
  s += `<g data-k="oligodendrocyte" class="oli"><path class="oli-p" d="M 462 212 C 440 200 420 196 396 186 M 462 212 C 440 220 420 236 396 244 M 462 212 C 490 200 510 200 526 194 M 462 212 C 490 226 510 240 526 250"/><circle class="oli-s" cx="462" cy="212" r="12"/></g>`;
  s += `<g data-k="myeline" class="mye"><rect x="384" y="150" width="12" height="54" rx="5"/><rect x="384" y="216" width="12" height="54" rx="5"/><rect x="526" y="160" width="12" height="54" rx="5"/><rect x="526" y="226" width="12" height="54" rx="5"/></g>`;
  // synapses
  s += `<g data-k="synapse" class="syn"><circle cx="412" cy="357" r="5"/><circle cx="488" cy="370" r="5"/></g>`;
  // astrocyte
  const AP = [[236, 210, 158, 196], [236, 210, 142, 246], [236, 210, 172, 140], [236, 210, 120, 300], [236, 210, 374, 104], [236, 210, 404, 350], [236, 210, 300, 300], [236, 210, 300, 140], [236, 210, 250, 300]];
  s += `<g data-k="astrocyte" class="ast">` + AP.map(([x1, y1, x2, y2]) => `<path class="ast-p" d="M ${x1} ${y1} Q ${(x1 + x2) / 2 + (y2 - y1) * 0.12} ${(y1 + y2) / 2 - (x2 - x1) * 0.12} ${x2} ${y2}"/>`).join('') +
    `<circle class="ast-f" cx="158" cy="196" r="6"/><circle class="ast-f" cx="142" cy="246" r="6"/><circle class="ast-f" cx="172" cy="140" r="6"/><circle class="ast-f" cx="120" cy="300" r="6"/><ellipse class="ast-s" cx="236" cy="210" rx="20" ry="17"/></g>`;
  // microglie + bactéries
  s += `<g data-k="microglie" class="mic"><path class="mic-p" d="M 240 392 l -26 -12 l -8 -12 m 8 12 l -16 2 M 240 392 l 22 -18 l 4 -14 m -4 14 l 14 -2 M 240 392 l -18 20 M 240 392 l 26 14 l 10 -4 M 240 392 l 2 -28"/><ellipse class="mic-s" cx="240" cy="392" rx="12" ry="9"/></g>`;
  s += `<g class="bac" data-k="bacteries"><rect x="262" y="410" width="16" height="7" rx="3.5" transform="rotate(20 270 413)"/><rect x="282" y="402" width="16" height="7" rx="3.5" transform="rotate(-15 290 405)"/><rect x="276" y="422" width="16" height="7" rx="3.5"/></g>`;
  if (print) {
    s += `<text class="given" x="20" y="96">capillaire</text><text class="given" x="20" y="114">sanguin</text>` + lead(70, 120, 128, 196);
    s += lead(196, 40, 236, 192) + box(150, 8, 170, 30, '1', 'Astrocyte', corr);
    s += lead(470, 40, 462, 198) + box(410, 8, 180, 30, '2', 'Oligodendrocyte', corr);
    s += `<text class="given" x="574" y="250" text-anchor="end">gaine de</text><text class="given" x="574" y="266" text-anchor="end">myéline</text>` + lead(552, 256, 538, 250);
    s += lead(150, 362, 230, 388) + box(4, 346, 176, 30, '3', 'Cellule de la microglie', corr);
    s += `<text class="given" x="306" y="436">bactéries</text>`;
    s += `<text class="given" x="420" y="330">synapse</text>` + lead(436, 336, 414, 352);
    s += `<text class="given" x="560" y="96" text-anchor="end">neurone</text>`;
  }
  return s + '</svg>';
}

/* ================= 5. Homoncule moteur ================= */
const HOM = [['Orteils', 4, 'pied'], ['Cheville', 3, 'pied'], ['Genou', 3, 'jambe'], ['Hanche', 3, 'jambe'], ['Tronc', 4, 'tronc'], ['Épaule', 3, 'bras'], ['Coude', 3, 'bras'], ['Poignet', 3, 'bras'],
  ['Main', 4, 'main'], ['Auriculaire', 2.5, 'main'], ['Annulaire', 2.5, 'main'], ['Majeur', 2.5, 'main'], ['Index', 3, 'main'], ['Pouce', 5, 'main'], ['Cou', 2.5, 'cou'],
  ['Sourcil', 2.5, 'visage'], ['Paupière et œil', 3, 'visage'], ['Face', 4, 'visage'], ['Lèvres', 7, 'levres'], ['Mâchoire', 3.5, 'machoire'], ['Langue', 5, 'langue'], ['Déglutition', 3.5, 'deglutition']];
function homoncule() {
  // chemin : face interne (verticale), puis convexité (arc de cercle)
  const cx = 400, cy = 372, R = 228, P = [];
  const a0 = Math.acos(80 / R), a1 = Math.PI * 0.975;
  const ytop = cy - R * Math.sin(a0);
  for (let y = 270; y > ytop; y -= 2) P.push([480, y]);
  for (let i = 0; i <= 200; i++) { const a = a0 + (a1 - a0) * i / 200; P.push([cx + R * Math.cos(a), cy - R * Math.sin(a)]); }
  const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const tot = L[L.length - 1], W = HOM.reduce((a, b) => a + b[1], 0);
  const at = d => { let i = 1; while (i < L.length - 1 && L[i] < d) i++; const f = (d - L[i - 1]) / (L[i] - L[i - 1] || 1); return [P[i - 1][0] + (P[i][0] - P[i - 1][0]) * f, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * f]; };
  let s = `<svg class="sch hom" viewBox="0 0 660 470" role="img" aria-label="Coupe du cerveau au niveau de l'aire motrice primaire : chaque partie du corps est commandée par un territoire précis. La main, les doigts, les lèvres et la langue occupent de grands territoires.">`;
  const end = P[P.length - 1];
  s += `<path class="hem" d="M 480 300 L ${P.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L ')} C ${end[0] + 30} ${end[1] + 60} 360 ${cy + 10} 480 300 Z"/>`;
  s += `<path class="midl" d="M 480 80 L 480 330"/><text class="mid" x="490" y="322">ligne médiane</text>`;
  let d = 0;
  HOM.forEach(([nom, w, grp], i) => {
    const d0 = d, d1 = d + w / W * tot; d = d1;
    const seg = []; for (let k = 0; k <= 12; k++) { const p = at(d0 + (d1 - d0) * k / 12); seg.push(p[0].toFixed(1) + ' ' + p[1].toFixed(1)); }
    const m = at((d0 + d1) / 2);
    let nx, ny;
    if (m[0] > 479) { nx = 1; ny = 0; } else { const l = Math.hypot(m[0] - cx, m[1] - cy); nx = (m[0] - cx) / l; ny = (m[1] - cy) / l; }
    const lx = m[0] + nx * 22, ly = m[1] + ny * 22;
    let ang = Math.atan2(ny, nx) * 180 / Math.PI, anchor = 'start';
    if (nx < -0.02) { ang += 180; anchor = 'end'; }
    s += `<g class="hseg" data-g="${grp}"><path class="band b${i % 2}" d="M ${seg.join(' L ')}"/><line class="tick" x1="${(m[0] + nx * 12).toFixed(1)}" y1="${(m[1] + ny * 12).toFixed(1)}" x2="${(m[0] + nx * 19).toFixed(1)}" y2="${(m[1] + ny * 19).toFixed(1)}"/><text transform="translate(${lx.toFixed(1)} ${ly.toFixed(1)}) rotate(${ang.toFixed(1)})" y="4.5" text-anchor="${anchor}">${esc(nom)}</text></g>`;
  });
  return s + '</svg>';
}

/* ================= 6. Plans de coupe en 3D ================= */
const AZ = 0.62, EL = 0.4;
const PM = [[Math.cos(AZ), -Math.sin(AZ), 0], [Math.sin(EL) * Math.sin(AZ), Math.sin(EL) * Math.cos(AZ), -Math.cos(EL)]];
function proj(x, y, z) { return [PM[0][0] * x + PM[0][1] * y + PM[0][2] * z, PM[1][0] * x + PM[1][1] * y + PM[1][2] * z]; }
function plans3D(o) {
  o = o || {}; const px = o.x ?? 0, py = o.y ?? 0, pz = o.z ?? 30, act = o.active, num = !!o.num;
  const S = 0.98, OX = 182, OY = 168;
  const P = (x, y, z) => { const [a, b] = proj(x, y, z); return [(OX + a * S).toFixed(1), (OY + b * S).toFixed(1)]; };
  const poly = pts => pts.map(p => P(...p).join(',')).join(' ');
  // contour de la tête (ellipsoïde projeté)
  const a = 84, b = 102, c = 90, cz = 6; let out = [];
  const M = PM;
  for (let k = 0; k < 72; k++) {
    const t = k / 72 * Math.PI * 2, dx = Math.cos(t), dy = Math.sin(t);
    const v = [M[0][0] * dx + M[1][0] * dy, M[0][1] * dx + M[1][1] * dy, M[0][2] * dx + M[1][2] * dy];
    const n = Math.sqrt(a * a * v[0] * v[0] + b * b * v[1] * v[1] + c * c * v[2] * v[2]);
    out.push(P(a * a * v[0] / n, b * b * v[1] / n, c * c * v[2] / n + cz).join(','));
  }
  let s = `<svg class="sch p3d" viewBox="0 0 360 340" role="img" aria-label="Tête en perspective avec les trois plans de coupe : sagittal, coronal (frontal) et axial (transversal).">`;
  s += `<polygon class="head" points="${out.join(' ')}"/>`;
  const nose = [P(0, 100, 4), P(0, 118, -12), P(0, 98, -24)];
  s += `<polyline class="nose" points="${nose.map(p => p.join(',')).join(' ')}"/>`;
  const RX = 100, RY = 122, H1 = -84, H2 = 104;
  const pl = {
    sa: poly([[px, -RY, H1], [px, RY, H1], [px, RY, H2], [px, -RY, H2]]),
    co: poly([[-RX, py, H1], [RX, py, H1], [RX, py, H2], [-RX, py, H2]]),
    ax: poly([[-RX, -RY, pz], [RX, -RY, pz], [RX, RY, pz], [-RX, RY, pz]])
  };
  for (const k of ['ax', 'co', 'sa']) s += `<polygon class="pl pl-${k}${act === k ? ' on' : ''}${act && act !== k ? ' off' : ''}" data-p="${k}" points="${pl[k]}"/>`;
  const [fx, fy] = P(0, 138, -30);
  s += `<text class="lab" x="${fx}" y="${fy}" text-anchor="middle">avant</text>`;
  if (num) {
    const n1 = P(px, -60, H2), n2 = P(RX, py, 70), n3 = P(-RX, RY * 0.55, pz);
    const tag = (p, dx, dy, n) => `<line x1="${+p[0] + dx}" y1="${+p[1] + dy}" x2="${p[0]}" y2="${p[1]}"/><circle cx="${+p[0] + dx * 1.25}" cy="${+p[1] + dy * 1.25}" r="11"/><text x="${+p[0] + dx * 1.25}" y="${+p[1] + dy * 1.25 + 5}">${n}</text>`;
    s += `<g class="numa">${tag(n1, 26, -18, 1)}${tag(n2, 26, -14, 2)}${tag(n3, -26, 14, 3)}</g>`;
  }
  return s + '</svg>';
}

/* ================= 7. La voie motrice volontaire ================= */
function bez(p0, p1, p2, p3, t) { const u = 1 - t; return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]; }
function hemiPath(side) { // hémisphère en coupe coronale, avec des circonvolutions
  const segs = [[[296, 40], [220, 20], [120, 30], [82, 90]], [[82, 90], [50, 140], [52, 220], [80, 262]], [[80, 262], [104, 298], [150, 312], [196, 300]], [[196, 300], [230, 292], [262, 298], [300, 300]]];
  const pts = [];
  segs.forEach((sg, si) => { for (let i = si ? 1 : 0; i <= 40; i++) pts.push(bez(sg[0], sg[1], sg[2], sg[3], i / 40)); });
  const out = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const fade = Math.min(1, i / 8, (pts.length - 1 - i) / 30), off = 4.5 * Math.sin(i * 0.9) * fade;
    return [p[0] - ty * off, p[1] + tx * off];
  });
  const X = x => side === 'g' ? x : 600 - x;
  return 'M ' + out.map(q => X(q[0]).toFixed(1) + ' ' + q[1].toFixed(1)).join(' L ') + ` L ${X(300)} 128 L ${X(296)} 124 Z`;
}
function voieMotrice(o) {
  o = o || {}; const mode = o.mode || 'page', corr = !!o.corr;
  let s = `<svg class="sch voie v-${mode}" viewBox="-24 0 672 790" role="img" aria-label="Schéma de la voie motrice : cerveau en coupe coronale, tronc cérébral avec le bulbe rachidien, moelle épinière et deux fibres musculaires, l'une du côté gauche du corps, l'autre du côté droit.">`;
  s += `<text class="side" x="40" y="28">Côté gauche du sujet</text><text class="side" x="560" y="28" text-anchor="end">Côté droit du sujet</text>`;
  const id = 'vm' + (++uid);
  s += `<defs><clipPath id="${id}g"><path d="${hemiPath('g')}"/></clipPath><clipPath id="${id}d"><path d="${hemiPath('d')}"/></clipPath></defs>`;
  for (const sd of ['g', 'd']) s += `<path class="hemi" d="${hemiPath(sd)}"/><path class="ctx" clip-path="url(#${id}${sd})" d="${hemiPath(sd)}"/><path class="hemi-o" d="${hemiPath(sd)}"/>`;
  s += `<path class="cc" d="M 214 134 C 250 120 350 120 386 134"/>`;
  s += `<ellipse class="ventr" cx="282" cy="156" rx="9" ry="16"/><ellipse class="ventr" cx="318" cy="156" rx="9" ry="16"/>`;
  s += `<ellipse class="noy" cx="228" cy="196" rx="22" ry="30"/><ellipse class="noy" cx="372" cy="196" rx="22" ry="30"/><ellipse class="noy" cx="280" cy="222" rx="14" ry="20"/><ellipse class="noy" cx="320" cy="222" rx="14" ry="20"/>`;
  s += `<path class="tronc" d="M 252 288 C 254 340 262 380 266 420 C 268 460 270 500 272 556 L 328 556 C 330 500 332 460 334 420 C 338 380 346 340 348 288 Z"/>`;
  s += `<line class="lim" x1="236" y1="556" x2="364" y2="556"/>`;
  s += `<path class="moelle" d="M 272 556 L 272 790 M 328 556 L 328 790"/><path class="gris" d="M 288 600 L 288 790 M 312 600 L 312 790"/>`;
  const fib = (x, y) => { let st = ''; for (let k = -44; k <= 44; k += 11) st += `<line x1="${x - 13}" y1="${y + k}" x2="${x + 13}" y2="${y + k}"/>`; return `<g class="fib"><ellipse cx="${x}" cy="${y}" rx="17" ry="58"/>${st}<line x1="${x}" y1="${y - 56}" x2="${x}" y2="${y + 56}"/></g>`; };
  s += fib(96, 690) + fib(504, 690);
  s += `<text class="lb" x="96" y="770" text-anchor="middle">Fibre musculaire</text><text class="lb" x="504" y="770" text-anchor="middle">Fibre musculaire</text>`;
  s += `<g class="tag"><rect x="14" y="140" width="96" height="26" rx="13"/><text x="62" y="158" text-anchor="middle">CERVEAU</text></g>`;
  s += `<g class="tag"><rect x="14" y="410" width="148" height="26" rx="13"/><text x="88" y="428" text-anchor="middle">TRONC CÉRÉBRAL</text></g>`;
  s += `<text class="lb it" x="232" y="528" text-anchor="end">Bulbe rachidien</text>`;
  s += `<g class="tag"><rect x="404" y="600" width="152" height="26" rx="13"/><text x="480" y="618" text-anchor="middle">MOELLE ÉPINIÈRE</text></g>`;
  // trajets : hémicorps gauche (depuis l'hémisphère droit) et hémicorps droit (depuis l'hémisphère gauche)
  const pathG1 = 'M 436 62 C 418 112 372 170 350 220 C 336 252 324 280 320 300';
  const pathG2 = 'M 320 300 C 318 360 318 440 318 540 C 318 560 302 568 292 578 C 286 584 284 592 284 600 L 284 664';
  const pathG3 = 'M 286 674 C 240 676 180 682 114 688';
  const pathD1 = 'M 164 62 C 182 112 228 170 250 220 C 264 252 276 280 280 300';
  const pathD2 = 'M 280 300 C 282 360 282 440 282 540 C 282 560 298 568 308 578 C 314 584 316 592 316 600 L 316 664';
  const pathD3 = 'M 314 674 C 360 676 420 682 486 688';
  const pyr = (x, y) => `<path class="pyr" d="M ${x} ${y - 12} L ${x + 11} ${y + 7} L ${x - 11} ${y + 7} Z"/>`;
  const mn = (x, y) => `<path class="mn" d="M ${x} ${y - 11} L ${x + 4} ${y - 3} L ${x + 12} ${y - 2} L ${x + 6} ${y + 4} L ${x + 8} ${y + 12} L ${x} ${y + 7} L ${x - 8} ${y + 12} L ${x - 6} ${y + 4} L ${x - 12} ${y - 2} L ${x - 4} ${y - 3} Z"/>`;
  if (mode === 'page') {
    s += `<g class="route rg" data-r="g"><path class="ax a1" pathLength="1" d="${pathG1}"/><path class="ax a2" pathLength="1" d="${pathG2}"/><circle class="synp" cx="284" cy="666" r="5"/><path class="ax a3" pathLength="1" d="${pathG3}"/>${pyr(436, 60)}${mn(286, 676)}</g>`;
    s += `<g class="route rd" data-r="d"><path class="ax a1" pathLength="1" d="${pathD1}"/><path class="ax a2" pathLength="1" d="${pathD2}"/><circle class="synp" cx="316" cy="666" r="5"/><path class="ax a3" pathLength="1" d="${pathD3}"/>${pyr(164, 60)}${mn(314, 676)}</g>`;
    s += `<g class="note n-dec"><path d="M 300 566 L 400 548"/><text x="404" y="540">croisement :</text><text x="404" y="558">décussation</text></g>`;
  } else {
    // fiche : le début de la voie de l'hémicorps gauche est donné
    s += `<g class="given-path"><path class="ax" d="${pathG1}"/>${pyr(436, 60)}${mn(286, 676)}<path class="ax" d="${pathG3}"/></g>`;
    s += `<text class="lb red" x="528" y="110">corps cellulaire</text><text class="lb red" x="528" y="126">d'un neurone</text><text class="lb red" x="528" y="142">pyramidal</text><path class="ansl" d="M 524 112 L 446 64"/>`;
    s += `<text class="lb red" x="180" y="664" text-anchor="middle">motoneurone</text>`;
    if (corr) s += `<g class="corr-path"><path class="ax" d="${pathG2}"/><circle cx="284" cy="666" r="4"/><path class="ax" d="${pathD1} ${pathD2} ${pathD3}"/>${pyr(164, 60)}${mn(314, 676)}<circle cx="316" cy="666" r="4"/><text class="ans" x="404" y="560">décussation</text><path class="ansl" d="M 300 566 L 400 556"/><text class="ans" x="210" y="640" text-anchor="end">synapse</text></g>`;
  }
  return s + '</svg>';
}

g.Schemas = { cerveauLateral, tete, pyramidaux, neuroneFiche, gliales, homoncule, plans3D, voieMotrice, AIRES, HOM };
})(window);
