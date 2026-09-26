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

Prérequis : Node.js 20 ou version ultérieure. Aucun paquet à installer.

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

## Cloudflare Pages : configuration prévue

Dans le compte dédié à Fille de Pub, ouvrir Workers & Pages depuis Compute, créer un projet Pages et choisir l’import depuis GitHub. L’application Cloudflare doit elle aussi être autorisée par le propriétaire sur `filledepub_site`.

| Paramètre | Valeur |
| --- | --- |
| Dépôt | teamfilledepub/filledepub_site |
| Nom du projet souhaité | filledepub (à vérifier disponible) |
| Branche de production | main |
| Framework preset | None |
| Build command | npm run build |
| Build output directory | dist |
| Root directory | Racine du dépôt / laisser vide |
| Variables ou secrets | Aucun pour cette version |

Après import du code, vérifier le premier déploiement et l’adresse Pages réellement fournie par Cloudflare. Ne pas déduire cette adresse du nom souhaité. Créer ensuite une branche de travail pour les prochaines modifications et utiliser les prévisualisations avant fusion dans main.

Documentation : https://developers.cloudflare.com/pages/framework-guides/deploy-anything/

Le compte Cloudflare n’a pas été modifié depuis cette session : la vérification anti-bot du tableau de bord empêche l’accès du navigateur de travail. La connexion Cloudflare ↔ GitHub et le raccordement du domaine restent donc à effectuer.

Avant toute bascule DNS, relever et conserver les enregistrements existants, notamment ceux de la messagerie (MX, SPF, DKIM, DMARC). Le modèle affiche une adresse e-mail active sur le domaine ; une bascule DNS ne doit pas supprimer sa configuration. Aucun changement DNS effectué.

## Vérifications effectuées

- Vérification syntaxique JavaScript et génération de `dist/`.
- Analyse HTML et CSS ; contrôle des ancres et des ressources locales.
- Vérification de la présence des préférences de mouvement réduit et des attributs du menu.
- Contrôle visuel de l’image générée.

Le serveur de prévisualisation a démarré, mais le navigateur de cette session n’a pas été autorisé à joindre la prévisualisation. Le contrôle visuel du site complet et les essais interactifs sur ordinateur et mobile restent à effectuer sur l’aperçu HTML ou le premier déploiement Cloudflare. Ne pas les considérer comme validés.
