# Fille de Pub

Projet indépendant : `teamfilledepub/filledepub_site`, branche `main`.
Site : https://filledepub-site.l-losange.workers.dev/
Hébergement : Cloudflare Worker `filledepub-site`, compte Fille de Pub.

## Pages et fonctions

- Accueil : agence, prestations, engagements, contact et galerie facultative.
- `/recrutement/` : présentation et inscription des animateurs, indépendants, freelances, étudiants et personnes intéressées par des missions ponctuelles.
- `/confidentialite/` : fonctionnement des formulaires et durée de conservation.
- `/admin/` : textes, images, logos, couleurs, typographies, e-mail public, contacts et export CSV.

Le bandeau affiche les phrases avec un effet de frappe. La pause et la préférence système de mouvement réduit affichent le texte complet. Sur téléphone ou écran tactile, les prestations sont mises en évidence en jaune au défilement.

Les versions noir et blanc du logo officiel et les trois logos clients proviennent des fichiers fournis. Le visuel principal reste une illustration ; son lettrage de stand a été corrigé à partir du logo fourni. Aucun résultat chiffré, témoignage ni réalisation réelle n’est inventé.

## Activation de l’administration

L’administration est **fermée tant que son secret n’est pas configuré**. Les formulaires publics et les pages restent utilisables.

Dans Cloudflare : **Workers & Pages → filledepub-site → Settings → Variables and Secrets → Add**.

- Type : **Secret**.
- Nom : `ADMIN_PASSWORD`.
- Valeur : un mot de passe unique d’au moins **16 caractères**, choisi et saisi par la propriétaire.
- Enregistrer et déployer, puis ouvrir `/admin/`.

Ne jamais inscrire ce mot de passe dans le dépôt, une capture ou une conversation. Une modification du secret invalide les sessions précédentes. La session expire après une heure. Pour plusieurs administrateurs avec des comptes nominatifs et une authentification renforcée, une intégration Cloudflare Access peut être ajoutée ultérieurement.

Guide : [docs/administration.md](docs/administration.md).

## Formulaires et données

Les demandes commerciales et candidatures sont réellement enregistrées dans la base privée du Worker. Une confirmation est affichée seulement après une réponse positive du serveur. Une nouvelle tentative utilise le même identifiant pour éviter les doublons.

**Aucun e-mail automatique n’est envoyé.** Les contacts sont à consulter dans l’administration et peuvent être exportés en CSV. Le lien e-mail public reste présent. Aucune donnée fictive de test n’est ajoutée à la production.

Stockage : un Durable Object SQLite `SiteStore`, lié par `SITE_STORE`, propre à Fille de Pub. La migration Wrangler crée automatiquement cet espace au premier déploiement. Il contient les textes publiés, les médias importés, les contacts, les sessions et les limites anti-abus. Aucune base d’un autre projet n’est utilisée.

- Contacts : suppression automatique de la base active après 12 mois, avec alarme quotidienne ; suppression individuelle possible depuis l’administration.
- Protection : validation serveur, consentement obligatoire, champ anti-robot, limites d’envoi, contrôle d’origine, sessions HttpOnly/Secure/SameSite et accès authentifié à tous les exports et modifications.
- Médias : JPEG, PNG et WebP, optimisés dans le navigateur ; maximum 1 Mo stocké par image et 100 Mo pour les imports. Les fichiers SVG fournis avec le code restent utilisables ; un SVG arbitraire ne peut pas être importé.
- Textes : contenu brut, échappé au rendu. Les modifications concurrentes sont détectées avant publication.
- Le CSV neutralise les formules lors de l’ouverture dans un tableur.

## Développement

Node.js 22 ou ultérieur. Dépendances et verrou npm versionnés.

```sh
npm ci
npm run dev
npm test
npm run check:deploy
```

`npm run dev` construit les fichiers puis lance Wrangler localement sur le port 8787 avec une base isolée. Pour tester l’administration localement, créer `.dev.vars` (ignoré par Git) avec un mot de passe de test `ADMIN_PASSWORD`. Ne pas y copier un mot de passe de production.

`npm test` exécute les tests d’intégration dans le runtime Workers local : authentification, origine des requêtes, conservation après redémarrage, relances, validation, protection des exports, images et publication.

`npm run check:deploy` construit et réalise un déploiement à blanc, sans publier. `npm run deploy` construit puis publie. Le script `scripts/preview.mjs` produit un aperçu visuel autonome avec formulaire désactivé ; les fonctions de base de données exigent le Worker.

| Réglage Workers Builds | Valeur |
| --- | --- |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | Racine du dépôt |
| Branche | `main` |
| Worker | `filledepub-site` |
| Static Assets | `dist/` |
| Secret à définir | `ADMIN_PASSWORD` |

Le jeton de déploiement doit permettre Workers Scripts et Durable Objects. En cas d’erreur de permission lors de la première migration, compléter les droits du jeton de build sur ce compte uniquement, puis relancer le build.

## Domaine et indexation

`site.config.json` garde le domaine de revue Workers non indexé. Les DNS et la messagerie existante ne sont pas modifiés. Après confirmation du domaine définitif, configurer une origine HTTPS et `indexable: true`. Le build ajoute alors les adresses canoniques et un sitemap des trois pages publiques. Les variables `PUBLIC_SITE_URL` et `PUBLIC_INDEXABLE` peuvent remplacer le fichier. L’administration reste non indexée ; cette directive ne remplace pas son authentification.

## Éléments restant à fournir / contrôler

- Charte couleur officielle (la palette actuelle n’est pas certifiée conforme).
- Identité juridique complète pour les mentions légales.
- Photos réelles des opérations et témoignages autorisés, si souhaités.
- Confirmation du domaine définitif et de son raccordement.
- Validation physique sur iPhone/Safari et téléphone Android.
- Mot de passe d’administration dans Cloudflare, puis vérification de la connexion par la propriétaire.

Suivi du premier PDF : [docs/corrections-2026-09-26.md](docs/corrections-2026-09-26.md).
Suivi du second PDF : [docs/corrections-volume-2.md](docs/corrections-volume-2.md).
