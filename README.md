# QG de l'Équipage — Dashboard staff de Doga

Outil interne de pilotage du staff : **Concepts**, **Tâches**, **Planning** et gestion de l'**Équipage**.
App web React (Vite), déployable sur GitHub Pages.

L'app fonctionne en **deux modes de stockage**, sans changer une ligne de code :

- **Local** (par défaut) : chaque navigateur garde ses propres données. Rien n'est partagé. Parfait pour tester.
- **Partagé** (Supabase) : tout le staff voit et modifie les **mêmes** données, synchronisées en **temps réel**.

---

## 1. Tester en local sur ton PC

Prérequis : [Node.js](https://nodejs.org) version 18 ou plus.

```bash
npm install
npm run dev
```

Ouvre l'adresse affichée (en général `http://localhost:5173`).

---

## 2. Mettre en ligne sur GitHub Pages

1. Crée un dépôt sur GitHub (ex : `doga-staff-hub`) et pousse ces fichiers dedans :
   ```bash
   git init
   git add .
   git commit -m "QG de l'Equipage"
   git branch -M main
   git remote add origin https://github.com/TON-PSEUDO/doga-staff-hub.git
   git push -u origin main
   ```
2. Sur GitHub : **Settings > Pages > Build and deployment > Source = GitHub Actions**.
3. C'est tout. À chaque `git push` sur `main`, le site se reconstruit et se déploie tout seul
   (workflow `.github/workflows/deploy.yml`).
4. L'URL apparaît dans l'onglet **Actions** ou dans **Settings > Pages**, du type :
   `https://TON-PSEUDO.github.io/doga-staff-hub/`

> En l'état, le site marche déjà — en **stockage local**. Passe à l'étape 3 pour le partage entre staff.

---

## 3. Activer le stockage partagé (Supabase, gratuit)

Pour que toute l'équipe partage les mêmes concepts/tâches/planning :

1. Crée un compte sur [supabase.com](https://supabase.com) puis un **nouveau projet** (note le mot de passe).
2. Dans le menu **SQL Editor > New query**, colle le contenu de **`supabase_schema.sql`** puis **Run**.
3. Va dans **Project Settings > API** et récupère :
   - **Project URL** (ex : `https://abcdefgh.supabase.co`)
   - **anon public** key (longue chaîne)
4. Ouvre **`src/config.js`** et colle-les :
   ```js
   export const SUPABASE_URL = "https://abcdefgh.supabase.co";
   export const SUPABASE_ANON_KEY = "eyJhbGciOi...";
   ```
5. `git commit` + `git push`. Le site se redéploie et bascule automatiquement en mode partagé
   (le petit badge en haut passe de "Stockage local" à "Stockage partagé · synchro temps réel").

---

## Utilisation

- **Équipage** : ajoute les membres du staff (pseudo + rôle). Ils deviennent assignables partout.
- **Concepts** : kanban Idée brute → Validé → En prod → Publié. Glisse-dépose les cartes.
  Bouton "Transformer en tâche" pour basculer un concept validé vers le module Tâches.
- **Tâches** : kanban À faire → En cours → Terminé. Assignation multi-membres, priorité, échéance
  (alerte rouge si dépassée).
- **Planning** : calendrier mensuel. Clique un jour pour ajouter un live, une sortie, une deadline…

---

## Aller plus loin (optionnel)

- **Restreindre l'accès** : aujourd'hui, qui a l'URL peut écrire. Pour limiter au staff, on peut
  ajouter une connexion (login par mot de passe, ou OAuth via le compte Discord de l'équipage) et
  durcir les politiques RLS Supabase. Demande-moi si tu veux cette version.
- **Données par item** : l'état est stocké en un seul document JSON (simple et robuste pour une
  petite équipe ; en cas d'édition simultanée, c'est le dernier qui enregistre qui l'emporte).
  Si l'équipe grossit, on peut éclater en une table par concept/tâche/événement.

---

## Structure

```
doga-staff-hub/
├─ index.html
├─ package.json
├─ vite.config.js
├─ supabase_schema.sql          # à exécuter dans Supabase (mode partagé)
├─ .github/workflows/deploy.yml # déploiement auto GitHub Pages
└─ src/
   ├─ main.jsx
   ├─ App.jsx                    # toute l'interface
   ├─ storage.js                 # couche Supabase OU localStorage
   └─ config.js                  # <-- tes clés Supabase ici
```
