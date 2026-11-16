# revise svt : consignes pour Claude

- Les pages des niveaux (`cinquieme/`, `premiere/`, `terminale/`) sont chiffrées avec le code d'accès de leur niveau par `_outils/verrou.py` (AES-GCM, clé dérivée du code par PBKDF2). L'accueil (`index.html`) et `assets/` restent en clair.
- Les codes ne sont écrits nulle part, ni dans le dépôt ni dans ce fichier : demander au professeur le code du niveau avant toute modification.
- Le dépôt est public : ne jamais committer une page de niveau en clair.
- Modifier ou ajouter une page :
  1. `python3 _outils/verrou.py ouvrir NIVEAU CODE /chemin/hors/du/depot` (déchiffre les pages du niveau) ;
  2. modifier les pages en clair dans ce dossier, puis les recopier à leur place dans le dépôt (une nouvelle page s'écrit directement en clair à sa place) ;
  3. `python3 _outils/verrou.py fermer NIVEAU CODE` (chiffre les pages en clair, vérifie que les autres s'ouvrent avec ce code) ;
  4. `python3 _outils/verrou.py verifier NIVEAU CODE`, puis vérifier qu'aucun texte en clair ne reste avant de committer.
- Montrer un aperçu au professeur et attendre sa validation avant toute publication sur le site.
