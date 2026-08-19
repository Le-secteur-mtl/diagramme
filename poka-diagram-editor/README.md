# Éditeur de diagrammes

Mini application web générique pour créer et modifier des diagrammes. Aucune donnée métier n'est codée dans l'application : tous les textes, couleurs, connexions et fichiers sont créés par l'utilisateur.

## Fonctionnalités V0.1

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
- export du projet en JSON
- import d'un projet JSON
- aucune base de données, aucun compte, aucune API

## Développement local

Prérequis : une version moderne de Node.js compatible avec la version actuelle de Vite.

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Le résultat de production est créé dans `dist/`.

## Déploiement GitHub -> Vercel

1. Créer un dépôt GitHub vide.
2. Ajouter le contenu de ce dossier au dépôt.
3. Dans Vercel, importer le dépôt GitHub.
4. Vercel détecte Vite automatiquement.
5. Déployer.

Aucune variable d'environnement n'est requise.

## Données

La sauvegarde automatique reste dans le navigateur de l'utilisateur. Les fichiers joints sont enregistrés avec le diagramme dans IndexedDB.

Pour déplacer un diagramme vers un autre ordinateur ou navigateur, utiliser **Exporter**, puis **Importer**.

## Format du projet

Le fichier JSON contient uniquement les données créées par l'utilisateur : nom du diagramme, blocs, positions, connexions, couleurs et éventuelles pièces jointes encodées dans le fichier.
