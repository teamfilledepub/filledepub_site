# Fille de Pub — version 0.1

Site vitrine indépendant pour une agence d’animations commerciales en Guadeloupe. Référence : captures du Google Sites fournies le 26 septembre 2026. Dépôt cible exclusif : https://github.com/teamfilledepub/filledepub_site.

## Ce que contient cette version

- Une page responsive : accueil, agence, prestations, engagements, références et contact.
- Jaune et noir du modèle, accents rose et bleu, typographie expressive.
- Apparitions au défilement, bandeau animé, interactions au survol, prestations dépliables et menu mobile.
- Bouton de pause des animations et respect des préférences de mouvement réduit du système.
- Contact direct : `allo@filledepub.com`. Aucun formulaire ni envoi automatique de données.
- Site statique sans dépendance JavaScript externe, sans base de données, sans traceur.

## Sources et limites

Les prestations, les références SOS PC MOBILE / Croque & Moi / EKHAYA HOME DECO, l’implantation en Guadeloupe et l’adresse de contact proviennent des captures. Les références sont présentées sous forme de noms, en attendant les fichiers des logos originaux. Les dix ans mentionnés concernent l’expérience décrite dans le modèle, pas l’âge supposé de l’entreprise. Aucun chiffre commercial, résultat chiffré ou témoignage ajouté.

L’image principale est une illustration générée à partir de la direction du modèle, explicitement présentée comme telle sur la page. Elle ne constitue pas une preuve de campagne réalisée. Le fichier original généré est conservé sans modification dans `site/assets/activation.png`.

Les mentions légales définitives ne sont pas inventées : les informations de l’éditeur restent à fournir. Le domaine `filledepub.com` apparaît dans les captures ; son usage définitif et le gestionnaire actuel restent à confirmer.

Cette version de revue demande la non-indexation via la balise robots, `robots.txt` et `_headers`. Ce n’est pas un contrôle d’accès. Lors du lancement définitif, ajuster ces trois réglages, ajouter l’URL canonique et le sitemap après validation du domaine et du contenu.

## Utilisation locale

Prérequis : Node.js 22 ou version ultérieure. Le site et sa compilation ne nécessitent aucun paquet externe. Pour installer Wrangler, l’outil de déploiement, exécuter `npm ci` ; sa version et ses dépendances sont verrouillées dans `package-lock.json`.

```sh
npm run dev
```

Pour générer les fichiers publiables :

```sh
npm run build
```

Ils sont copiés dans `dist/`. Pour un aperçu autonome à ouvrir par double-clic :

```sh
node scripts/preview.mjs Fille_de_Pub_Apercu.html
```

## GitHub

Dépôt dédié : `teamfilledepub/filledepub_site`, dans l’organisation de la cliente. Les autres projets restent indépendants. L’utilisateur `Yanaem` dispose des droits d’administration du dépôt.

Toute application utilisée pour modifier ou déployer ce code doit être autorisée séparément sur ce dépôt par l’organisation.

## Cloudflare Workers : déploiement depuis GitHub

Hébergement choisi : **Cloudflare Workers avec Static Assets**. Le fichier `wrangler.jsonc` publie le contenu de `dist/` et cible exclusivement le compte Cloudflare Fille de Pub visible dans les captures. Le site ne nécessite pas de script serveur pour sa version actuelle ; des fonctions serveur pourront être ajoutées ensuite.

Depuis le compte Cloudflare Fille de Pub, ouvrir **Workers & Pages → Create application → Import a repository → Get started**. Connecter GitHub et autoriser l’application Cloudflare sur `teamfilledepub/filledepub_site`.

| Paramètre | Valeur |
| --- | --- |
| Nom du Worker | `filledepub-site` (doit correspondre à `wrangler.jsonc`) |
| Dépôt | `teamfilledepub/filledepub_site` |
| Branche de production | `main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | Racine du dépôt, laisser la valeur par défaut |
| Répertoire des fichiers publiés | `dist/`, déjà configuré dans `wrangler.jsonc` |
| Variables applicatives ou secrets | Aucun pour cette version |

Cloudflare Workers Builds installe les dépendances et gère l’authentification du déploiement depuis son interface. Aucun jeton Cloudflare ne doit être ajouté au dépôt. Valider avec **Save and Deploy**, puis consulter l’URL `workers.dev` réellement fournie par Cloudflare.

Pour contrôler localement la préparation du déploiement sans publier :

```sh
npm ci
npm run check:deploy
```

Après le premier déploiement, vérifier l’affichage et les interactions sur ordinateur et mobile. Les prochaines évolutions pourront passer par des branches de travail et les prévisualisations Workers avant fusion dans `main`.

Documentation :
- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/workers/ci-cd/builds/
- https://developers.cloudflare.com/workers/ci-cd/builds/configuration/

Le déploiement Cloudflare n’a pas été effectué depuis cette session : la vérification anti-bot du tableau de bord empêche l’accès du navigateur de travail. La connexion Cloudflare ↔ GitHub et le raccordement du domaine restent donc à effectuer depuis le compte de la cliente.

Avant toute bascule DNS, relever et conserver les enregistrements existants, notamment ceux de la messagerie (MX, SPF, DKIM, DMARC). Aucun changement DNS effectué.

## Vérifications effectuées

- Vérification syntaxique JavaScript et génération de `dist/`.
- Validation de la configuration Workers avec Wrangler 4.141.0 (`wrangler deploy --dry-run`), sans publication.
- Analyse HTML et CSS ; contrôle des ancres et des ressources locales.
- Vérification de la présence des préférences de mouvement réduit et des attributs du menu.
- Contrôle visuel de l’image générée.

Le serveur de prévisualisation a démarré, mais le navigateur de cette session n’a pas été autorisé à joindre la prévisualisation. Le contrôle visuel du site complet et les essais interactifs sur ordinateur et mobile restent à effectuer sur l’aperçu HTML ou le premier déploiement Cloudflare. Ne pas les considérer comme validés.
