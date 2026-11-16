#!/usr/bin/env python3
"""Verrou par niveau pour revise svt.

Chaque page d'un niveau (cinquieme, premiere, terminale) est chiffrée avec le code
d'accès du niveau (AES-GCM, clé dérivée du code par PBKDF2-SHA256). Le code n'est
écrit nulle part : ni dans ce script, ni dans les pages. Sans le code, une page
verrouillée ne contient qu'un écran de saisie et un bloc chiffré illisible.

  python3 _outils/verrou.py fermer  NIVEAU CODE   chiffre toutes les pages du niveau (en place)
  python3 _outils/verrou.py ouvrir  NIVEAU CODE DOSSIER   déchiffre les pages du niveau dans DOSSIER
  python3 _outils/verrou.py verifier NIVEAU CODE  vérifie que le code ouvre toutes les pages

À lancer depuis la racine du dépôt. Les pages en clair ne doivent jamais être
enregistrées dans le dépôt (il est public) : on les modifie dans un dossier à part,
puis on les remet à leur place et on relance « fermer ».
"""
import base64, hashlib, json, os, secrets, sys, unicodedata
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

NIVEAUX = {'cinquieme': 'Cinquième', 'premiere': 'Première', 'terminale': 'Terminale', 'prof': 'Espace professeur'}
PHRASES = {'cinquieme': 'aux élèves de cinquième', 'premiere': 'aux élèves de première', 'terminale': 'aux élèves de terminale', 'prof': 'au professeur'}
ITER = 300000
MARQUE = '<meta name="revise-svt-verrou" content="1">'

def norm(code):
    s = unicodedata.normalize('NFD', code)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return ''.join(c for c in s if c.isalnum()).upper()

def sel(niveau):
    return hashlib.sha256(('revise-svt/' + niveau).encode()).digest()[:16]

def cle(niveau, code):
    return hashlib.pbkdf2_hmac('sha256', norm(code).encode(), sel(niveau), ITER, 32)

def b64(b):
    return base64.b64encode(b).decode()

def pages(niveau):
    out = []
    for racine, _, fichiers in os.walk(niveau):
        for f in fichiers:
            if f.endswith('.html'):
                out.append(os.path.join(racine, f))
    return sorted(out)

def chiffre(html, niveau, k):
    iv = secrets.token_bytes(12)
    c = AESGCM(k).encrypt(iv, html.encode('utf-8'), None)
    return {'s': b64(sel(niveau)), 'i': b64(iv), 'n': ITER, 'c': b64(c)}

def dechiffre(page, k):
    i = page.index('var P=') + 6
    j = page.index(';\n', i)
    P = json.loads(page[i:j])
    return AESGCM(k).decrypt(base64.b64decode(P['i']), base64.b64decode(P['c']), None).decode('utf-8')

GABARIT = r'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
@@MARQUE@@
<meta name="robots" content="noindex">
<title>@@NOM@@ – revise svt</title>
<link rel="icon" href="@@R@@assets/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,500..800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="@@R@@assets/style.css">
<style>
.gate{max-width:520px;margin:clamp(28px,7vw,64px) 0 48px;background:var(--panel);border:1.5px solid var(--ink);border-radius:14px;padding:clamp(18px,4vw,30px);box-shadow:6px 6px 0 var(--grid2)}
.gate h1{margin:0 0 .3em}
.gate p{margin:0 0 1em}
.gate label{display:block;font-weight:700;margin-bottom:6px}
.gate .row{display:flex;gap:10px;flex-wrap:wrap}
.gate input{flex:1 1 12em;min-width:0;font:700 1.1rem var(--font-b,inherit);letter-spacing:.06em;text-transform:uppercase;color:var(--ink);background:var(--paper);border:1.5px solid var(--ink);border-radius:8px;padding:.55em .8em;min-height:46px}
.gate button{font:700 1rem var(--font-b,inherit);color:var(--paper);background:var(--ink);border:1.5px solid var(--ink);border-radius:8px;padding:.55em 1.2em;min-height:46px;cursor:pointer}
.gate button:disabled{opacity:.55;cursor:wait}
.gate .fb{min-height:1.5em;margin:12px 0 0;font-weight:700}
.gate .fb.bad{color:#C8342C}
@media (prefers-color-scheme:dark){.gate .fb.bad{color:#FF8279}}
.gate .note{font-size:.92rem;color:var(--ink2);margin:14px 0 0}
[hidden]{display:none!important}
</style>
</head>
<body>
<header class="top"><div class="wrap">
  <a class="brand" href="@@R@@index.html"><img src="@@R@@assets/logo.png" alt="" width="38" height="38">revise svt</a>
  <nav aria-label="Niveaux"><a href="@@R@@cinquieme/index.html">Cinquième</a><a href="@@R@@premiere/index.html">Première</a><a href="@@R@@terminale/index.html">Terminale</a></nav>
</div></header>
<main id="contenu">
<div class="wrap">
  <p class="crumb" style="margin-top:24px"><a href="@@R@@index.html">Accueil</a> / @@NOM@@</p>
  <section class="gate" aria-labelledby="gt">
    <h1 id="gt">@@NOM@@</h1>
    <p id="gmsg">Ouverture…</p>
    <form id="gform" hidden novalidate>
      <label for="gcode">Code d’accès</label>
      <div class="row"><input id="gcode" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false"><button type="submit">Ouvrir</button></div>
      <p class="fb" id="gfb" aria-live="polite"></p>
      <p class="note">Tu n’as besoin de le saisir qu’une fois sur cet appareil&#8239;: toutes les pages du niveau s’ouvriront ensuite directement.</p>
    </form>
  </section>
</div>
</main>
<noscript><p class="wrap">Cette page a besoin de JavaScript pour s’ouvrir.</p></noscript>
<script>
(function(){
"use strict";
var P=@@P@@;
var K="revise-svt:cle:@@NIVEAU@@";
var $=function(s){return document.getElementById(s);};
function bin(s){var b=atob(s),a=new Uint8Array(b.length);for(var i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a;}
function txt(buf){var a=new Uint8Array(buf),s="";for(var i=0;i<a.length;i++)s+=String.fromCharCode(a[i]);return btoa(s);}
function norm(s){return String(s).normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^A-Za-z0-9]/g,"").toUpperCase();}
function lire(k){return crypto.subtle.decrypt({name:"AES-GCM",iv:bin(P.i)},k,bin(P.c)).then(function(b){return new TextDecoder().decode(b);});}
/* on attend la fin de l'analyse de cette page avant de la remplacer */
var pret=false,attente=null;
document.addEventListener("DOMContentLoaded",function(){pret=true;if(attente)setTimeout(attente,0);});
function montrer(html){
  var go=function(){document.open();document.write(html);document.close();};
  if(pret)setTimeout(go,0);else attente=go;
}
function deriver(code){
  return crypto.subtle.importKey("raw",new TextEncoder().encode(norm(code)),"PBKDF2",false,["deriveKey"])
    .then(function(base){return crypto.subtle.deriveKey({name:"PBKDF2",salt:bin(P.s),iterations:P.n,hash:"SHA-256"},base,{name:"AES-GCM",length:256},true,["decrypt"]);});
}
var form=$("gform"),msg=$("gmsg"),fb=$("gfb"),inp=$("gcode"),btn=form.querySelector("button");
function demander(){
  msg.textContent=@@PHRASE@@;
  form.hidden=false;
  if(window.matchMedia&&matchMedia("(pointer: fine)").matches){try{inp.focus();}catch(e){}}
}
if(!(window.crypto&&crypto.subtle&&window.TextEncoder)){
  msg.textContent="Ton navigateur ne peut pas ouvrir cette page. Vérifie que l’adresse commence par https:// ou essaie un autre navigateur.";
  return;
}
var cle=null;try{cle=localStorage.getItem(K);}catch(e){}
if(cle){
  crypto.subtle.importKey("raw",bin(cle),{name:"AES-GCM"},false,["decrypt"]).then(lire).then(montrer)
    .catch(function(){try{localStorage.removeItem(K);}catch(e){} demander();});
}else demander();
form.addEventListener("submit",function(e){
  e.preventDefault();if(btn.disabled)return;
  if(!norm(inp.value)){fb.className="fb bad";fb.textContent="Écris d’abord le code.";return;}
  btn.disabled=true;btn.textContent="Ouverture…";fb.textContent="";
  deriver(inp.value).then(function(k){
    return lire(k).then(function(html){
      return crypto.subtle.exportKey("raw",k).then(function(raw){try{localStorage.setItem(K,txt(raw));}catch(e){} montrer(html);});
    });
  }).catch(function(){
    btn.disabled=false;btn.textContent="Ouvrir";fb.className="fb bad";
    fb.textContent=@@ERREUR@@;inp.select();
  });
});
})();
</script>
</body>
</html>
'''

def enveloppe(chemin, niveau, P):
    prof = chemin.count('/')            # terminale/index.html -> 1 ; terminale/x/index.html -> 2
    nom = NIVEAUX[niveau]
    phrase = ('Cette page est réservée au professeur. Entre le code professeur.' if niveau == 'prof' else
              'Cette page est réservée ' + PHRASES[niveau] + '. Entre le code d’accès donné par ton professeur.')
    return (GABARIT.replace('@@MARQUE@@', MARQUE).replace('@@R@@', '../' * prof)
            .replace('@@PHRASE@@', json.dumps(phrase, ensure_ascii=False)).replace('@@ERREUR@@', json.dumps('Ce n’est pas le bon code.' if niveau == 'prof' else 'Ce n’est pas le bon code. Vérifie-le auprès de ton professeur.', ensure_ascii=False)).replace('@@NOM@@', nom).replace('@@NIVEAU@@', niveau)
            .replace('@@P@@', json.dumps(P, separators=(',', ':'))))

def fermer(niveau, code):
    k = cle(niveau, code)
    for p in pages(niveau):
        html = open(p, encoding='utf-8').read()
        if MARQUE in html:
            # déjà verrouillée : on vérifie qu'elle s'ouvre avec ce code
            dechiffre(html, k)
            print('déjà verrouillée', p)
            continue
        page = enveloppe(p, niveau, chiffre(html, niveau, k))
        assert dechiffre(page, k) == html
        open(p, 'w', encoding='utf-8').write(page)
        print('verrouillée', p)

def ouvrir(niveau, code, dossier):
    k = cle(niveau, code)
    for p in pages(niveau):
        html = open(p, encoding='utf-8').read()
        if MARQUE not in html:
            print('pas verrouillée', p); continue
        dest = os.path.join(dossier, p)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        open(dest, 'w', encoding='utf-8').write(dechiffre(html, k))
        print('ouverte', p, '->', dest)

def verifier(niveau, code):
    k = cle(niveau, code)
    for p in pages(niveau):
        html = open(p, encoding='utf-8').read()
        assert MARQUE in html, 'pas verrouillée : ' + p
        dechiffre(html, k)
        print('ok', p)

if __name__ == '__main__':
    a = sys.argv[1:]
    if len(a) < 3 or a[1] not in NIVEAUX or a[0] not in ('fermer', 'ouvrir', 'verifier'):
        print(__doc__); sys.exit(1)
    if a[0] == 'fermer': fermer(a[1], a[2])
    elif a[0] == 'verifier': verifier(a[1], a[2])
    else: ouvrir(a[1], a[2], a[3])
