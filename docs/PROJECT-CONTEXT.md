# StoryChat Studio — contexte projet

## Résumé

StoryChat Studio est une application React/Vite pour écrire et éditer des histoires sous forme de conversations fictives, les prévisualiser dans une interface de téléphone et exporter des vidéos verticales. Le backend Node.js/Express fournit l’API, la génération d’histoires, la persistance et les tâches de rendu Remotion.

## Architecture

```text
frontend/src/                 Application React, éditeurs, aperçu, client API et CSS
frontend/remotion/             Composition et point d’entrée Remotion
backend/src/server.js          Routes HTTP Express et démarrage du service
backend/src/store.js           Adaptateur de persistance et validation
backend/src/db.js              Connexion MySQL et migrations au démarrage
backend/src/services/          Génération narrative et fournisseurs de voix
backend/src/exportJobs.js      Bundling Remotion, rendu MP4 et suivi des tâches
database/schema.sql            Schéma relationnel MySQL
backend/.data/store-memory.json Stockage JSON local si MySQL n’est pas configuré
uploads/                       Médias téléversés (runtime, non versionnés)
exports/                       Vidéos rendues (runtime, non versionnées)
```

Le frontend utilise React 18, Vite, Axios, Framer Motion, Lucide, Font Awesome, Simple Icons, `html-to-image` et Remotion. Le backend utilise Express, `mysql2`, Multer et les paquets Remotion bundler/renderer.

## Frontend et thèmes

- `frontend/src/App.jsx` orchestre les projets, conversations, participants, messages, lecture, sauvegarde automatique, captures PNG et export MP4.
- `PhonePreview.jsx` sélectionne le thème de rendu. Messenger, WhatsApp, Instagram DM, SMS et Telegram conservent leurs composants/style existants.
- `GoogleSearchEditor.jsx` édite les recherches groupées, le site, l’URL, le titre, l’extrait et une image facultative (URL ou upload).
- `GoogleSearchPreview.jsx` rend l’interface Google Search Android. Les logos de marques sont des icônes SVG embarquées; les sites inconnus utilisent une icône globe plutôt qu’une lettre. Les résultats peuvent avoir une miniature.
- `frontend/src/styles.css` contient les styles partagés de l’aperçu et de Remotion, dont les variantes Google clair/sombre et la typographie responsive en unités proportionnelles au téléphone.
- La capture téléphone PNG vise 1080 × 1920. La capture des résultats utilise la zone de résultats du même aperçu React.

## Backend, génération IA et langues

`backend/src/server.js` expose l’API sous `/api` : projets, conversations, messages, personnages, uploads, génération et exports.

`backend/src/services/storyGenerator.js` propose les fournisseurs `demo`, `openai`, `ollama` et `local`. Les clés et URL externes se configurent côté backend dans son environnement local, jamais dans le frontend. Les langues applicatives sont `fr`, `en`, `it`, `pt-BR`, `ar-TN`, `ar-DZ`, `ar-MA` et `ar-EG`.

Le scénario Google Search regroupe les résultats sous plusieurs requêtes successives. La démo locale Google est disponible en français et en anglais; elle refuse les autres langues plutôt que de retourner une histoire en anglais sous une langue incorrecte. Les fournisseurs IA configurés peuvent recevoir les autres langues prises en charge. La génération n’effectue pas de véritable recherche Web et les URLs produites sont du contenu de scénario à vérifier.

## Google Search Stories

Chaque résultat reste un message de la conversation avec ses métadonnées `metadata.googleResult` : `query`, `siteName`, `url`, `snippet` et `image` facultatif. Le titre reste dans `content`; une image chargée est conservée sous `image` dans les métadonnées. Le stockage MySQL garde les métadonnées dans la colonne JSON des messages; le stockage JSON local conserve le même objet.

Les résultats sont groupés par requête dans l’éditeur. L’aperçu montre le groupe correspondant à la recherche courante et actualise la requête au fil de la lecture vidéo. L’apparence claire/sombre est un réglage local de l’éditeur, transmis explicitement à Remotion lors de l’export.

## Remotion et exports

`frontend/remotion/index.jsx` importe la feuille CSS partagée et enregistre la composition. `storyChatVideo.jsx` construit le calendrier des messages et réutilise `PhonePreview`; Google Search passe ainsi par `GoogleSearchPreview` comme l’aperçu React.

`backend/src/exportJobs.js` regroupe le rendu en tâche, bundle Remotion, puis exporte en MP4 H.264, audio AAC, pixel format `yuv420p`, 1080 × 1920, 30 fps. Les modes d’export et l’apparence Google sont transmis dans les props de composition. Les chemins `/uploads/...` des images sont résolus avec l’URL publique de l’API. Le succès du rendu dépend de Chromium et de FFmpeg disponibles au runtime; vérifier le statut de tâche (`/api/exports/:id`) et son erreur avant de considérer un export terminé.

`html-to-image` génère les PNG dans le navigateur. Les images d’URL externes doivent être accessibles depuis le navigateur et autoriser leur intégration CORS pour garantir une capture PNG; l’upload dans StoryChat évite cette dépendance et est préférable pour des exports reproductibles.

## Sauvegarde et données

- L’interface enregistre le titre, le thème, la langue, les participants et les messages via `PUT /api/conversations/:id`, avec une sauvegarde automatique temporisée et une action manuelle.
- MySQL est utilisé si `DB_HOST` et `DB_NAME` sont configurés. `db.js` applique les ajouts de colonnes nécessaires au démarrage.
- Sinon, `store.js` écrit l’état dans `backend/.data/store-memory.json` avec une file d’écriture et remplacement atomique.
- Les fichiers uploadés et exports résident dans `uploads/` et `exports/`; ils ne sont pas inclus dans le JSON de conversation. Les conversations stockent leurs URL de fichiers.
- Les préférences de thème de l’application et l’apparence Google sont stockées dans `localStorage`; l’apparence Google n’est pas une propriété de chaque conversation.

## Commandes de développement et vérification

À la racine :

```powershell
npm install
npm run dev
npm run build
```

L’API écoute par défaut sur `http://localhost:4000`, le frontend Vite sur `http://localhost:5173`. Tests ciblés du générateur Google :

```powershell
node --test backend/test/google-search.test.js
```

Pour un agent Cline local, voir [LM-STUDIO.md](./LM-STUDIO.md). Vérifier toute proposition de code générée en la comparant aux sources, puis exécuter les tests et builds concernés.
