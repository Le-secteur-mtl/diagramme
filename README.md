# Éditeur de diagrammes — V0.1.3

Mini application web générique pour créer et modifier des diagrammes. Aucune donnée métier n'est codée dans l'application : tous les textes, couleurs, connexions et fichiers sont créés par l'utilisateur.

## Fonctionnalités

- canevas vide au démarrage
- double-clic sur le canevas pour créer un bloc
- déplacement libre des blocs
- connexions par flèches
- texte libre et couleurs
- pièce jointe cachée sur le diagramme (image ou PDF)
- aperçu de la pièce jointe dans le panneau de propriétés
- clic droit sur un bloc pour ajouter un bloc après celui-ci
- duplication et suppression
- zoom, déplacement du canevas et mini-carte
- sauvegarde automatique locale dans IndexedDB
- export/import du projet en JSON
- aucune base de données, aucun compte, aucune API

## Déploiement GitHub -> Vercel

**Important : `package.json`, `index.html`, `vercel.json` et le dossier `src` doivent être directement à la racine du dépôt GitHub.**

La V0.1.3 est fournie dans une archive aplatie : quand vous ouvrez le ZIP, ces fichiers sont immédiatement visibles, sans dossier parent supplémentaire.

1. Créer un dépôt GitHub vide.
2. Téléverser tout le contenu du ZIP à la racine du dépôt.
3. Dans Vercel, choisir **Add New > Project** puis importer ce dépôt.
4. Laisser **Root Directory** vide / `.`.
5. Framework : **Vite**.
6. Build Command : `npm run build`.
7. Output Directory : `dist`.
8. Déployer.

Aucune variable d'environnement n'est requise.

## Si Vercel affiche `404 NOT_FOUND`

Vérifier en priorité la racine du dépôt. Si GitHub montre un dossier `poka-diagram-editor/` et que `package.json` se trouve à l'intérieur, Vercel regarde le mauvais dossier. Soit déplacer les fichiers à la racine, soit définir **Root Directory** sur `poka-diagram-editor` dans Vercel.

## Développement local

```bash
npm install
npm run dev
```

## Build local

```bash
npm run build
```

Le résultat de production est créé dans `dist/`.

## Données

La sauvegarde automatique reste dans le navigateur de l'utilisateur. Pour transférer un diagramme vers un autre ordinateur ou navigateur, utiliser **Exporter**, puis **Importer**.


## V0.1.3

- Correction du bouton **Nouveau**.
- Remplacement du dialogue navigateur `window.confirm()` par une confirmation intégrée à l’application, plus fiable dans les aperçus et déploiements Vercel.
- Retour visuel immédiat après la création d’un nouveau diagramme.


## V0.1.3

- Ajout d'un bouton visible « + Ajouter un bloc » dans la barre du haut.
- Le bouton crée immédiatement un bloc au centre du canevas.
- Le double-clic sur le canevas reste disponible comme raccourci.
