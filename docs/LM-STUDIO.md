# LM Studio + VS Code (Cline)

Configuration vérifiée sur Windows pendant cette session.

## Installation locale

- LM Studio : `C:\Program Files\LM Studio`
- Modèles : `C:\Users\azizi\.lmstudio\models`
- API locale : `http://localhost:1234`
- Extension VS Code installée : Cline `saoudrizwan.claude-dev` `4.1.26`

Dans LM Studio, ouvrir **Developer > Local Server**, choisir un modèle puis démarrer le serveur. Garder l’écoute sur `localhost` pour que l’API reste accessible uniquement depuis cette machine. Le port `1234` est celui actuellement détecté.

Vérifier l’API dans PowerShell :

```powershell
Invoke-RestMethod http://localhost:1234/v1/models

$body = @{
  model = "m2hai-unsensored-8b"
  messages = @(@{ role = "user"; content = "Réponds en français : serveur disponible ?" })
  temperature = 0.1
  max_tokens = 80
} | ConvertTo-Json -Depth 5

Invoke-RestMethod http://localhost:1234/v1/chat/completions `
  -Method Post -ContentType "application/json" -Body $body
```

Les deux routes ont répondu `200` pendant la vérification. Le serveur a retourné une completion avec le modèle `m2hai-unsensored-8b`. L’API LM Studio locale ne nécessite pas de clé par défaut; n’ajoutez pas de vraie clé dans les fichiers du projet.

## Cline dans VS Code

L’extension installée est recommandée pour ce dépôt dans `.vscode/extensions.json`.

Configuration générique OpenAI-compatible renseignée dans Cline :

- **API Provider** : `OpenAI Compatible`
- **Base URL** : `http://localhost:1234/v1`
- **API Key** : laissée vide (le serveur local n’en exige pas par défaut)
- **Model ID** : à sélectionner dans Cline avant de démarrer une tâche; la sélection n’a pas pu être confirmée pendant cette session.

Le fournisseur natif `LM Studio` de Cline est aussi disponible, avec `http://localhost:1234` comme adresse racine.

Pour sélectionner le modèle dans la configuration générique :

1. Ouvrir **Cline > Settings > API Configuration**.
2. Choisir **OpenAI Compatible** comme fournisseur.
3. Vérifier **Base URL** : `http://localhost:1234/v1`.
4. Choisir un identifiant exact dans **Model ID** (par exemple `m2hai-unsensored-8b` ou `qwen2.5-coder-7b-instruct-uncensored@q4_k_m`).
5. Laisser **API Key** vide sauf si l’authentification est activée dans LM Studio; ne pas coller de clé cloud.
6. Vérifier la connexion avant de lancer une tâche.

Cline conserve ces paramètres dans son stockage local VS Code, et non dans le dépôt. C’est volontaire : aucun endpoint utilisateur ni secret n’est ajouté au contrôle de version.

## Modèles détectés

Le serveur a énuméré 13 modèles : 11 modèles de langage, 1 modèle vision-langage et 1 modèle d’embeddings.

| Modèle | Type / quantification | Contexte maximal | État observé |
|---|---|---:|---|
| `m2hai-unsensored-8b` | Llama, GGUF | 8 192 | Chargé; completion API vérifiée |
| `llama3.1-heretic-unsensored-i1` | Llama, Q4_K_S | 131 072 | Non chargé |
| `gemma4_unsensored` | Gemma 4, Q4_K_M, tool use | 131 072 | Non chargé |
| `qwen2.5-coder-1.5b-unsensored-dpo` | Qwen 2.5 Coder, Q8_0 | 32 768 | Non chargé |
| `llama3.1-heretic-unsensored` | Llama, Q4_K_S | 131 072 | Non chargé |
| `gemma-4-e4b-abliterated` | Gemma 4, Q4_K_M, tool use | 131 072 | Non chargé |
| `qwen2.5-coder-7b-instruct-uncensored@iq3_xs` | Qwen 2.5 Coder, IQ3_XS | 32 768 | Non chargé |
| `qwen2.5-coder-7b-instruct-uncensored@iq4_xs` | Qwen 2.5 Coder, IQ4_XS | 32 768 | Non chargé |
| `qwen2.5-coder-7b-instruct-uncensored@q4_k_m` | Qwen 2.5 Coder, Q4_K_M | 32 768 | Non chargé |
| `mythos-nano@q4_k_m` | Qwen 2, Q4_K_M, tool use | 131 072 | Non chargé |
| `mythos-nano@q5_k_m` | Qwen 2, Q5_K_M, tool use | 131 072 | Non chargé |
| `google/gemma-4-e4b` | Vision-langage, Q4_K_M, tool use | 131 072 | Non chargé |
| `text-embedding-nomic-embed-text-v1.5` | Embeddings, Q4_K_M | 2 048 | Non chargé |

### Classement pratique (à confirmer par vos propres tâches)

- **Code, React et Node.js** : commencer par `qwen2.5-coder-7b-instruct-uncensored@q4_k_m`; les variantes IQ3_XS/IQ4_XS peuvent être plus légères, avec un compromis de qualité. `qwen2.5-coder-1.5b-unsensored-dpo` convient aux tâches courtes/rapides.
- **Storytelling** : essayer d’abord `gemma4_unsensored` (contexte long, tool use déclaré) ou `m2hai-unsensored-8b` déjà chargé. Aucun benchmark comparatif n’a été exécuté; les recommandations ne sont pas un classement mesuré.
- **Agent avec outils** : `gemma4_unsensored` et les variantes `mythos-nano` exposent la capacité `tool_use` dans les métadonnées LM Studio. La compatibilité réelle doit être vérifiée dans Cline avant de confier des modifications.
- Les noms contenant `unsensored`, `uncensored` ou `abliterated` désignent des variantes ajustées par des tiers. Ils ne sont pas des recommandations de qualité ni de sécurité; privilégier des modèles officiels/instruct lorsque disponibles.

## Test agent et état

- L’appel `/v1/chat/completions` a fonctionné avec le modèle chargé et une réponse a été retournée.
- Cline est installé; le fournisseur générique et l’URL locale sont configurés. La sélection du Model ID et la vérification de connexion depuis Cline restent à confirmer.
- Une analyse directe d’un vrai fichier du dépôt a été acceptée par l’API, mais le modèle a inventé un scénario (durée « longue », 100 résultats) absent du code. Ce modèle est donc connecté, mais ce test ne valide pas sa fiabilité pour les correctifs. Un fichier plus volumineux a dépassé son contexte chargé de 8 192 tokens; réduire le contexte fourni ou charger un modèle avec davantage de contexte.
- L’appel direct à l’API ne vérifie pas l’accès de Cline au workspace. Le test d’agent Cline n’a pas été effectué. Après avoir sélectionné un modèle, ouvrir une tâche dans ce dépôt et demander « Lis le projet StoryChat Studio, identifie un bug concret avec une référence fichier/ligne, explique-le et propose un diff minimal. Ne modifie aucun fichier. » Vérifier la référence dans le fichier avant d’accepter une proposition.

## Dépannage

- **`/v1/models` ne répond pas** : vérifier que le serveur local LM Studio est démarré et que le port affiché est `1234`.
- **Modèle introuvable** : copier l’identifiant exact depuis `/v1/models`; les identifiants avec `@q4_k_m` et les préfixes comme `google/` sont significatifs.
- **Réponse lente ou erreur mémoire** : charger un seul modèle, réduire son contexte dans LM Studio et essayer la variante Q4_K_M ou le modèle coder 1.5B.
- **Cline n’accède pas aux outils** : vérifier le fournisseur et le modèle actif dans Cline; essayer un modèle marqué `tool_use` dans `/api/v0/models`. Les appels directs à l’API ne testent pas la capacité d’agent/outils.
- **Autre port** : remplacer `1234` par le port visible dans LM Studio, à la fois dans Cline et dans les commandes de test.
- **Aucune clé API** : c’est normal pour le serveur local par défaut. Ne pas exposer le serveur sur le réseau local sans authentification et contrôle d’accès.
