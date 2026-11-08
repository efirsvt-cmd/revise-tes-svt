/* Modèle simplifié d'une tête humaine, pour des coupes simulées.
   Ce n'est pas une vraie IRM : les formes sont calculées (cerveau, sillons, ventricules,
   noyaux, cervelet, tronc cérébral, os, cuir chevelu) pour s'entraîner à lire des coupes.
   Repère (mm) : x vers la droite du sujet, y vers l'avant, z vers le haut.
   Affichage comme dans EduAnat2 : la gauche du sujet est à gauche de l'image. */
(function (global) {
'use strict';

/* ---------- outils ---------- */
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;
const smin = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
const smax = (a, b, k) => -smin(-a, -b, k);
function ell(x, y, z, cx, cy, cz, a, b, c) { // distance signée approchée à un ellipsoïde (positive dedans)
  const dx = x - cx, dy = y - cy, dz = z - cz;
  const r = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const p = Math.sqrt((dx / a) * (dx / a) + (dy / b) * (dy / b) + (dz / c) * (dz / c));
  return p < 1e-6 ? Math.min(a, b, c) : (1 - p) * r / p;
}
function inEll(x, y, z, cx, cy, cz, a, b, c) { const dx = (x - cx) / a, dy = (y - cy) / b, dz = (z - cz) / c; return dx * dx + dy * dy + dz * dz; }

function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

/* bruit simplex 3D (S. Gustavson), avec graine */
function noise3(seed) {
  const p = new Uint8Array(256), perm = new Uint8Array(512), r = rng(seed * 7919 + 13);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = p[i]; p[i] = p[j]; p[j] = t; }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const g = [1,1,0,-1,1,0,1,-1,0,-1,-1,0,1,0,1,-1,0,1,1,0,-1,-1,0,-1,0,1,1,0,-1,1,0,1,-1,0,-1,-1];
  const F3 = 1 / 3, G3 = 1 / 6;
  return function (x, y, z) {
    const s = (x + y + z) * F3, i = Math.floor(x + s), j = Math.floor(y + s), k = Math.floor(z + s);
    const t = (i + j + k) * G3, x0 = x - (i - t), y0 = y - (j - t), z0 = z - (k - t);
    let i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
      else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
      else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
    } else {
      if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
      else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
      else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
    }
    const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2 * G3, y2 = y0 - j2 + 2 * G3, z2 = z0 - k2 + 2 * G3;
    const x3 = x0 - 1 + 3 * G3, y3 = y0 - 1 + 3 * G3, z3 = z0 - 1 + 3 * G3;
    const ii = i & 255, jj = j & 255, kk = k & 255;
    let n = 0, q, gi;
    q = 0.6 - x0 * x0 - y0 * y0 - z0 * z0; if (q > 0) { gi = (perm[ii + perm[jj + perm[kk]]] % 12) * 3; q *= q; n += q * q * (g[gi] * x0 + g[gi + 1] * y0 + g[gi + 2] * z0); }
    q = 0.6 - x1 * x1 - y1 * y1 - z1 * z1; if (q > 0) { gi = (perm[ii + i1 + perm[jj + j1 + perm[kk + k1]]] % 12) * 3; q *= q; n += q * q * (g[gi] * x1 + g[gi + 1] * y1 + g[gi + 2] * z1); }
    q = 0.6 - x2 * x2 - y2 * y2 - z2 * z2; if (q > 0) { gi = (perm[ii + i2 + perm[jj + j2 + perm[kk + k2]]] % 12) * 3; q *= q; n += q * q * (g[gi] * x2 + g[gi + 1] * y2 + g[gi + 2] * z2); }
    q = 0.6 - x3 * x3 - y3 * y3 - z3 * z3; if (q > 0) { gi = (perm[ii + 1 + perm[jj + 1 + perm[kk + 1]]] % 12) * 3; q *= q; n += q * q * (g[gi] * x3 + g[gi + 1] * y3 + g[gi + 2] * z3); }
    return 32 * n;
  };
}

/* ---------- classes de tissus ---------- */
const C = { AIR: 0, SCALP: 1, OS: 2, LCS: 3, SILLON: 4, FISSURE: 5, CORTEX: 6, BLANCHE: 7, CALLEUX: 8,
  VENTRICULE: 9, NOYAUX: 10, TRONC: 11, CERVELET: 12, MOELLE: 13, OEIL: 14, FACE: 15, SINUS: 16 };
const NOMS = [
  ['Hors de la tête', "C'est l'air autour de la tête."],
  ['Cuir chevelu', "La peau du crâne et sa graisse, à l'extérieur de la boîte crânienne."],
  ['Boîte crânienne', "L'os du crâne, qui protège l'encéphale."],
  ['Liquide cérébrospinal', "Le liquide qui entoure le cerveau, sous les méninges, et l'amortit."],
  ['Un sillon du cortex', "Un repli de la surface du cerveau : le cortex se replie de part et d'autre du sillon."],
  ['Sillon entre les deux hémisphères', "La scissure qui sépare l'hémisphère gauche de l'hémisphère droit."],
  ['Cortex (substance grise)', "La couche de substance grise, à la périphérie du cerveau. Elle contient les corps cellulaires des neurones."],
  ['Substance blanche', "Sous le cortex. Elle est formée des fibres nerveuses (axones entourés de myéline) qui relient les régions du cerveau."],
  ['Corps calleux', "Un épais faisceau de substance blanche qui relie les deux hémisphères."],
  ['Ventricule', "Une cavité remplie de liquide cérébrospinal, au centre du cerveau."],
  ['Centres nerveux profonds', "Des amas de substance grise situés au cœur de la substance blanche (noyaux gris centraux, thalamus)."],
  ['Tronc cérébral', "Il relie le cerveau à la moelle épinière. Toutes les fibres de la voie motrice y passent."],
  ['Cervelet', "Sous l'arrière du cerveau. Il intervient dans la coordination des mouvements et l'équilibre."],
  ['Moelle épinière', "Elle prolonge le tronc cérébral dans la colonne vertébrale."],
  ['Œil et orbite', "Le globe oculaire, entouré de graisse dans l'orbite."],
  ['Tissus de la face et du cou', "Muscles, graisse et autres tissus situés sous le crâne."],
  ['Sinus (air)', "Des cavités remplies d'air dans les os de la face."]
];

/* ---------- sujets ---------- */
const SUJETS = {
  A: { seed: 11, scale: [1, 1, 1], cs: 0, act: { rh: [-39, 4, 57], lh: [38, 4.5, 56], tg: [[-57, 5, 24], [58, 5, 23]] }, noise: 101 },
  B: { seed: 29, scale: [0.965, 1.035, 0.975], cs: 2.6, act: { rh: [-36, 5, 60], lh: [37, 3.5, 58.5], tg: [[-55, 4, 26], [56, 6, 24]] }, noise: 202 }
};

function createHead(key) {
  const S = SUJETS[key] || SUJETS.A;
  const N1 = noise3(S.seed), N2 = noise3(S.seed + 101), N3 = noise3(S.seed + 57), N4 = noise3(S.seed + 3);
  const W1 = noise3(S.seed + 211), W2 = noise3(S.seed + 223), W3 = noise3(S.seed + 227);
  const cx = 0, cy = -4, cz = 10, Rx = 67 * S.scale[0], Ry = 84 * S.scale[1], Rz = 62 * S.scale[2];
  const F = 4.6;

  function zSyl(y, ax) { return -4 + 0.30 * (30 - y) + (ax == null ? 0 : 0.14 * (ax - 46)); }                     // sillon latéral (scissure de Sylvius)
  function ycs(ax, z) {                                                  // sillon central (scissure de Rolando)
    return -12 + S.cs + 0.20 * (64 - z) - 4.6 * Math.exp(-(((z - 56) / 7) ** 2)) * Math.exp(-(((ax - 36) / 7.5) ** 2)) + 1.4 * Math.sin(ax * 0.3 + z * 0.12) + 0.8 * Math.sin(z * 0.37 + ax * 0.2);
  }
  function floorZ(x, y) {
    const ax = Math.abs(x);
    const wT = sm(-46, -32, y) * (1 - sm(26, 38, y)) * sm(18, 32, ax);
    let f = -9;
    f = mix(f, -14, sm(26, 40, y));
    f = mix(f, -6 - 8 * sm(5, 45, ax), 1 - sm(-48, -36, y));
    return mix(f, -36, wT);
  }
  function cc(y) { // corps calleux : milieu et épaisseur
    const u = (y + 3) / 33;
    const mid = 6 + 16 * Math.sqrt(Math.max(0, 1 - u * u));
    const th = 4 + 3.2 * Math.exp(-(((y - 27) / 5) ** 2)) + 4.5 * Math.exp(-(((y + 33) / 5) ** 2));
    return [mid - th / 2, mid + th / 2];
  }
  function lobe(x, y, z) {
    const ax = Math.abs(x);
    if (y < -62 + 0.18 * (z - 10)) return 'occipital';
    if (z < zSyl(y, ax) - 1 && y < 36) return 'temporal';
    if (y > ycs(ax, z)) return 'frontal';
    return 'parietal';
  }

  /* activations (IRM fonctionnelle) : position sur le gyrus précentral */
  function place(p) { const ax = Math.abs(p[0]); return [p[0], ycs(ax, p[2]) + p[1], p[2]]; }
  const ACT = { rh: [[...place(S.act.rh), 1, 6.2]], lh: [[...place(S.act.lh), 0.97, 6.2]],
    tg: [[...place(S.act.tg[0]), 0.97, 6.4], [...place(S.act.tg[1]), 0.9, 6.4]] };
  // petites taches de « bruit » : visibles seulement si on baisse beaucoup le seuil
  const R = rng(S.noise);
  for (const k of ['rh', 'lh', 'tg']) {
    for (let i = 0; i < 26; i++) {
      const x = (R() * 2 - 1) * 55, y = (R() * 2 - 1) * 70 - 6, z = R() * 70 - 15;
      ACT[k].push([x, y, z, 0.2 + R() * 0.26, 2.2 + R() * 1.6]);
    }
  }

  const out = { t: 0, c: 0, gm: 0, br: 0 };

  function sample(x, y, z) {
    const o = out; o.gm = 0; o.br = 0;
    const ax = Math.abs(x);
    /* tête */
    const dH = ell(x, y, z, 0, -4, 10, Rx + 16, Ry + 16, Rz + 16);
    const dNeck = Math.min((1 - Math.hypot(x / 56, (y + 14) / 54)) * 55, -z - 4);
    const dFace = ell(x, y, z, 0, 30, -48, 62, 62, 48);
    const dHead = smax(smax(dH, dNeck, 6), dFace, 8);
    if (dHead < 0) { o.t = 5; o.c = C.AIR; return o; }

    /* cerveau (télencéphale) */
    const dEll = ell(x, y, z, cx, cy, cz, Rx, Ry, Rz);
    const dFl = z - floorZ(x, y);
    const dCer = smin(dEll, dFl, 5);
    const basal = sm(16, 24, ax) + sm(-30, -38, y) + sm(24, 32, y);
    const dCort = basal >= 1 ? dCer : smin(dEll, dFl + 22 * (1 - Math.min(1, basal)), 5);
    const [ccLo, ccHi] = (y > -40 && y < 34) ? cc(y) : [0, 0];
    const underCC = y > -37 && y < 31 && z < ccHi + 0.3;
    const dMed = underCC ? 1e9 : ax - 0.9;

    if (dCer > 0) {
      if (dMed <= 0) { o.t = 30; o.c = C.FISSURE; o.br = 1; return o; }
      const dB = Math.min(dCort, dMed);
      let dT = dB;
      if (dB < 28) {
        // sillons : bruit dans la direction depuis le centre (sillons orientés vers la profondeur)
        const qx = x, qy = y + 6, qz = z - 4, ql = Math.hypot(qx, qy, qz) || 1;
        const hx = x < 0 ? 0 : 17.3, wf = 0.045;
        const ux = qx / ql * F + 0.55 * W1(x * wf, y * wf, z * wf) + hx;
        const uy = qy / ql * F + 0.55 * W2(x * wf, y * wf, z * wf);
        const uz = qz / ql * F + 0.55 * W3(x * wf, y * wf, z * wf);
        const n = N1(ux, uy, uz) + 0.14 * N2(ux * 2.1, uy * 2.1, uz * 2.1);
        let dS = Math.abs(n) * ql / (F * 2.1);
        let depth = Math.max(6, 13 + 8 * N3(ux * 0.5, uy * 0.5, uz * 0.5));
        const zs = zSyl(y, ax), above = z > zs + 3;
        const yc = ycs(ax, z), dyc = y - yc;
        const lat = sm(4, 12, ax);
        if (above) dS += Math.max(0, 22 - Math.abs(dyc)) * 1.15 * lat;
        if (above && lat > 0 && Math.abs(dyc) < 26) {
          const w1 = 3.2 * N3(ax * 0.07, z * 0.07, 5.1), w2 = 3.4 * N3(ax * 0.07 + 9, z * 0.07, 2.3);
          const dC = Math.abs(dyc) * 0.9 + (1 - lat) * 30;
          const dPre = Math.abs(dyc - 14 - w1) * 0.9 + (1 - lat) * 30, dPost = Math.abs(dyc + 13 + w2) * 0.9 + (1 - lat) * 30;
          const kPre = 13 * sm(-0.35, 0.15, N2(ax * 0.05, z * 0.05, 3.7)), kPost = 12 * sm(-0.35, 0.15, N2(ax * 0.05 + 7, z * 0.05, 1.1));
          if (dC < dS) { dS = dC; depth = 20; }
          if (dPre < dS && kPre > 2) { dS = dPre; depth = kPre; }
          if (dPost < dS && kPost > 2) { dS = dPost; depth = kPost; }
        }
        const sd = (dB < depth ? dS : Math.hypot(dS, dB - depth)) - 0.75;
        // sillon latéral et insula
        let dSy = 1e9;
        if (y > -46 && y < 40 && ax > 28) {
          const zz = Math.abs(z - zs) * 0.95;
          const ends = Math.max(0, y - 34) * 1.6 + Math.max(0, -42 - y) * 1.6;
          const d1 = (ax > 37 ? zz : Math.hypot(37 - ax, zz)) + ends;
          let d2 = 1e9;
          if (y > -30 && y < 32) { const hz = 8 * Math.sqrt(Math.max(0, 1 - ((y - 1) / 27) ** 2)); d2 = zz < hz ? Math.abs(ax - 37.5) : Math.hypot(ax - 37.5, zz - hz); }
          dSy = Math.min(d1, d2) - 0.9;
        }
        dT = Math.min(dB, sd, dSy);
        if (dT < 0) { o.t = 32; o.c = C.SILLON; o.br = 1; return o; }
      }
      const cT = 3.0;
      let t = mix(34, 112, sm(-0.35, 0.45, dT));
      t = mix(t, 176, sm(cT - 0.5, cT + 0.5, dT));
      o.gm = 1 - sm(cT - 0.5, cT + 0.5, dT);
      o.c = dT < cT ? C.CORTEX : C.BLANCHE;
      o.br = 1;
      if (dT > cT) {
        /* structures profondes */
        // corps calleux
        if (y > -40 && y < 34 && ax < 30 && z > ccLo - 0.6 && z < ccHi + 0.6) {
          const f = sm(ccLo - 0.6, ccLo + 0.4, z) * (1 - sm(ccHi - 0.4, ccHi + 0.6, z)) * (1 - sm(12, 26, ax));
          t = mix(t, 190, f); if (f > 0.5 && ax < 17) o.c = C.CALLEUX;
        }
        // ventricules latéraux
        const env = sm(-36, -27, y) * (1 - sm(22, 30, y));
        if (env > 0.02) {
          const front = sm(4, 14, y);
          const a = (4.4 + 1.2 * front) * (0.55 + 0.45 * env), b = (2.6 + 4.2 * front) * (0.5 + 0.5 * env);
          const xc = 1.6 + a, zc = ccLo - b + 0.6;
          const v = ((ax - xc) / a) ** 2 + ((z - zc) / b) ** 2;
          if (v < 1.25) {
            const f = 1 - sm(0.8, 1.15, v);
            t = mix(t, 30, f); if (f > 0.5) { o.c = C.VENTRICULE; o.gm = 0; }
          } else {
            // noyau caudé, contre la paroi latérale du ventricule
            const cdx = xc + a + 2.6 * (0.5 + front), cdz = zc - 0.5 * b;
            const vc = ((ax - cdx) / (2.2 + 3.6 * front)) ** 2 + ((z - cdz) / (3 + 4 * front)) ** 2;
            if (vc < 1.2 && y > -22) { const f = 1 - sm(0.8, 1.2, vc); t = mix(t, 124, f); if (f > 0.5) o.c = C.NOYAUX; }
          }
          // septum lucidum
          if (ax < 1.6 && z < ccLo && z > zc - b && y > -20 && y < 28) { t = mix(t, 150, 0.8); o.c = C.BLANCHE; }
        }
        // troisième ventricule
        if (ax < 1.7 && y > -24 && y < 6 && z > -12 && z < ccLo - 9) { t = 30; o.c = C.VENTRICULE; o.gm = 0; }
        // noyaux gris centraux et thalamus
        let q = inEll(x, y, z, x < 0 ? -24 : 24, 5, 1, 5.5, 16, 9);           // putamen
        if (q < 1.15) { const f = 1 - sm(0.85, 1.15, q); t = mix(t, 122, f); if (f > 0.5) o.c = C.NOYAUX; }
        q = inEll(x, y, z, x < 0 ? -18.5 : 18.5, 1, -1, 3.6, 9, 6);           // pallidum
        if (q < 1.1) { const f = 1 - sm(0.8, 1.1, q); t = mix(t, 146, f); if (f > 0.5) o.c = C.NOYAUX; }
        q = inEll(x, y, z, x < 0 ? -9.5 : 9.5, -17, -1, 8.5, 15, 9);          // thalamus
        if (q < 1.15 && ax > 1.8) { const f = 1 - sm(0.85, 1.15, q); t = mix(t, 136, f); if (f > 0.5) o.c = C.NOYAUX; }
        q = inEll(x, y, z, x < 0 ? -23 : 23, 10, -17, 6.5, 6.5, 6.5);          // amygdale
        if (q < 1.15) { const f = 1 - sm(0.85, 1.15, q); t = mix(t, 118, f); if (f > 0.5) o.c = C.NOYAUX; }
        q = inEll(x, y, z, x < 0 ? -28.5 : 28.5, -12, -16, 5, 17, 4.6);        // hippocampe
        if (q < 1.15) { const f = 1 - sm(0.85, 1.15, q); t = mix(t, 114, f); if (f > 0.5) { o.c = C.CORTEX; o.gm = 1; } }
        q = inEll(x, y, z, x < 0 ? -31 : 31, -6, -11.5, 3.3, 18, 2);           // corne temporale
        if (q < 1.1) { const f = 1 - sm(0.8, 1.1, q); t = mix(t, 32, f); if (f > 0.5) { o.c = C.VENTRICULE; o.gm = 0; } }
      }
      o.t = t; return o;
    }

    /* cervelet */
    const qc = inEll(x, y, z, 0, -57, -32, 50 * S.scale[0], 30 * S.scale[1], 22.5);
    if (qc < 1) {
      const rc = Math.sqrt(qc);
      const ang = Math.atan2(z + 32, -(y + 57));
      const fol = Math.sin(ang * 21 + 3 * rc + 2.2 * N4(x * 0.045, y * 0.045, z * 0.045) + 0.8 * W1(x * 0.12, y * 0.12, z * 0.12));
      const notch = ax < 4 && y < -72 ? 1 : 0;
      if ((rc > 0.4 && fol > 0.8) || rc > 0.965 || notch) { o.t = 34; o.c = C.CERVELET; o.br = 1; return o; }
      const white = rc < 0.42 || (rc < 0.86 && fol < -0.86);
      o.t = white ? 158 : 106; o.c = C.CERVELET; o.gm = white ? 0 : 1; o.br = 1; return o;
    }

    /* tronc cérébral et moelle */
    if (z < -2 && z > -120) {
      const pons = Math.exp(-(((z + 36) / 9) ** 2));
      let rr = 11 + 5 * pons;
      if (z < -48) rr = mix(rr, 8.5, sm(-48, -58, z));
      if (z < -62) rr = mix(rr, 6.5, sm(-62, -70, z));
      const yc0 = -14 - 0.2 * (-z - 6) + 3.5 * pons;
      const dSt = rr - Math.hypot(x, (y - yc0) * 1.08);
      if (dSt > 0) {
        o.br = 1; o.c = z < -64 ? C.MOELLE : C.TRONC;
        o.t = z > -24 && Math.hypot(x, y - yc0 + 5) < 1.4 ? 30 : 146 + 10 * N4(x * 0.2, y * 0.2, z * 0.2);
        return o;
      }
      if (dSt > -3.5 && z < -12) { o.t = 30; o.c = C.LCS; return o; }
    }

    /* boîte crânienne : cavité, os, puis tissus */
    const dCav = smin(dEll + 2.6, dFl + 3.5, 4);
    const dPF = ell(x, y, z, 0, -55, -31, 54 * S.scale[0], 34 * S.scale[1], 27);
    const dIC = Math.max(dCav, dPF);
    if (dIC > 0 && dHead > 6) { o.t = 30; o.c = C.LCS; return o; }
    if (dIC > -7.5 && dHead > 5.5 && z > -70) {
      const s = -dIC;
      o.t = (s < 1.8 || s > 5.6) ? 24 : 112 + 22 * N4(x * 0.3, y * 0.3, z * 0.3);
      o.c = C.OS; return o;
    }
    if (dHead < 5.5) { o.t = mix(80, 204, sm(0.4, 1.8, dHead)) + 8 * N4(x * .2, y * .2, z * .2); o.c = C.SCALP; return o; }

    /* face, cou */
    for (const sx of [-31, 31]) {
      const qe = inEll(x, y, z, sx, 64, -24, 12, 12, 12);
      if (qe < 1) { o.t = qe > 0.86 ? 70 : 42; o.c = C.OEIL; return o; }
      const qo = inEll(x, y, z, sx * 0.94, 54, -24, 17, 24, 15);
      if (qo < 1) { o.t = 200; o.c = C.OEIL; return o; }
      const qm = inEll(x, y, z, sx * 0.8, 46, -54, 14, 16, 13);
      if (qm < 1) { o.t = 8; o.c = C.SINUS; return o; }
    }
    if (inEll(x, y, z, 0, 52, -30, 10, 13, 12) < 1 || inEll(x, y, z, 0, 25, -38, 13, 11, 8) < 1 ||
        (ax > 1.3 && inEll(x, y, z, 0, 66, -60, 9, 24, 15) < 1) || inEll(x, y, z, 0, 4, -92, 10, 9, 20) < 1) {
      o.t = 8; o.c = C.SINUS; return o;
    }
    const dCan = 9 - Math.hypot(x, y + 26 + 0.15 * z);
    if (z < -60) {
      if (dCan > 0) { o.t = 30; o.c = C.LCS; return o; }
      if (dCan > -9) { o.t = dCan > -1.5 || dCan < -7.5 ? 26 : 150; o.c = C.OS; return o; }
    }
    o.t = 88 + 26 * N4(x * 0.07, y * 0.07, z * 0.07) + 14 * N3(x * 0.2, y * 0.2, z * 0.2);
    o.c = C.FACE; return o;
  }

  function activation(task, x, y, z) {
    const L = ACT[task]; if (!L) return 0;
    let v = 0;
    for (let i = 0; i < L.length; i++) {
      const p = L[i], dx = x - p[0], dy = y - p[1], dz = z - p[2], s = p[4];
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < 9 * s * s) v += p[3] * Math.exp(-d2 / (2 * s * s));
    }
    return Math.min(1, v);
  }

  return { key, sample, activation, lobe, ycs, zSyl, ACT };
}

/* ---------- rendu des coupes ---------- */
const FOV = 220, ZC0 = -6;
function planeToXYZ(plane, pos, u, v, fov, zc) { // u,v en [0,1] depuis le coin haut gauche de l'image
  fov = fov || FOV; const ZC = zc == null ? ZC0 : zc;
  const a = (u - 0.5) * fov, b = (0.5 - v) * fov;
  if (plane === 'ax') return [a, b, pos];            // haut = avant
  if (plane === 'co') return [a, pos, b + ZC];       // haut = haut
  return [pos, -a, b + ZC];                           // sagittale : gauche = avant
}
function xyzToPlane(plane, x, y, z, fov, zc) {
  fov = fov || FOV; const ZC = zc == null ? ZC0 : zc;
  if (plane === 'ax') return [x / fov + 0.5, 0.5 - y / fov];
  if (plane === 'co') return [x / fov + 0.5, 0.5 - (z - ZC) / fov];
  return [-y / fov + 0.5, 0.5 - (z - ZC) / fov];
}

const JET = (() => { // échelle de couleur type EduAnat2 (bleu → vert → jaune → rouge)
  const st = [[0, [30, 60, 255]], [0.3, [20, 200, 230]], [0.5, [40, 220, 70]], [0.72, [255, 230, 30]], [1, [255, 40, 20]]];
  const lut = new Uint8Array(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255; let k = 0; while (k < st.length - 2 && t > st[k + 1][0]) k++;
    const [t0, c0] = st[k], [t1, c1] = st[k + 1], f = (t - t0) / (t1 - t0);
    for (let j = 0; j < 3; j++) lut[i * 3 + j] = Math.round(c0[j] + (c1[j] - c0[j]) * f);
  }
  return lut;
})();
const LOBE_COL = { frontal: [70, 130, 230], parietal: [235, 200, 40], temporal: [70, 185, 90], occipital: [230, 90, 140] };

function anatColor(t, c) { // couleurs d'une coupe anatomique de cerveau
  if (c === C.AIR) return [24, 18, 18];
  if (c === C.OS) return t < 60 ? [214, 196, 160] : [228, 206, 168];
  if (c === C.SCALP) return [196, 140, 118];
  if (c === C.FACE || c === C.OEIL || c === C.SINUS) return [150, 96, 86];
  if (c === C.LCS || c === C.SILLON || c === C.FISSURE || c === C.VENTRICULE) return [74, 34, 32];
  // tissu nerveux : du gris (rose-brun) au blanc (crème)
  const g = sm(110, 178, t), d = sm(30, 105, t);
  const grey = [176, 116, 108], white = [244, 228, 206], dark = [74, 34, 32];
  const r = [0, 1, 2].map(i => mix(mix(dark[i], grey[i], d), white[i], g));
  return r;
}

function renderSlice(model, plane, pos, W, H, opt) {
  opt = opt || {};
  const img = new ImageData(W, H), d = img.data;
  const task = opt.task, thr = opt.thr == null ? 0.5 : opt.thr, mode = opt.mode || 'irm';
  const R = rng(97 + Math.round(pos * 10) + (plane === 'ax' ? 1 : plane === 'co' ? 2 : 3) * 1000);
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const [x, y, z] = planeToXYZ(plane, pos, (i + 0.5) / W, (j + 0.5) / H, opt.fov, opt.zc);
      const s = model.sample(x, y, z);
      const k = (j * W + i) * 4;
      let r, g, b;
      if (mode === 'anat') { [r, g, b] = anatColor(s.t, s.c); }
      else if (mode === 'print') {
        let v = s.c === C.AIR ? 255 : 255 - (255 - Math.min(255, 70 + s.t * 1.05)) * 0.55;
        if (s.c === C.LCS || s.c === C.SILLON || s.c === C.FISSURE || s.c === C.VENTRICULE) v = 150;
        r = g = b = v;
      } else {
        const v = Math.max(0, Math.min(255, s.t + (R() - 0.5) * 10));
        r = g = b = v;
        if (opt.lobes && s.c === C.CORTEX) {
          const lc = LOBE_COL[model.lobe(x, y, z)];
          r = mix(r, lc[0], 0.55); g = mix(g, lc[1], 0.55); b = mix(b, lc[2], 0.55);
        }
        if (task && s.br && s.gm > 0.3) {
          const a = model.activation(task, x, y, z);
          if (a > thr) {
            const w = Math.min(255, Math.round((a - thr) / Math.max(0.05, 1 - thr) * 255)) * 3;
            r = JET[w]; g = JET[w + 1]; b = JET[w + 2];
          }
        }
      }
      d[k] = r; d[k + 1] = g; d[k + 2] = b; d[k + 3] = 255;
    }
  }
  return img;
}

function classAt(model, plane, pos, u, v, fov, zc) {
  const [x, y, z] = planeToXYZ(plane, pos, u, v, fov, zc);
  const s = model.sample(x, y, z);
  return { c: s.c, nom: NOMS[s.c][0], info: NOMS[s.c][1], x, y, z, lobe: s.c === C.CORTEX ? model.lobe(x, y, z) : null };
}

global.Cerveau = { createHead, renderSlice, classAt, planeToXYZ, xyzToPlane, FOV, ZC: ZC0, C, NOMS, JET, SUJETS };
})(window);
