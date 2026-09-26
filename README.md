# Fille de Pub

Site vitrine indépendant d’une agence d’animations commerciales en Guadeloupe.

- Dépôt : https://github.com/teamfilledepub/filledepub_site
- Site publié : https://filledepub-site.l-losange.workers.dev/
- Hébergement : Cloudflare Workers avec Static Assets, compte Fille de Pub.
- Branche de production : `main`. Les mises à jour déclenchent Workers Builds.

## Fonctionnalités

Accueil, présentation de l’agence, prestations dépliables, engagements et contact. Navigation mobile, animations désactivables et respect du mouvement réduit. Sur petit écran ou appareil tactile, le titre de prestation le plus proche du centre de l’écran devient jaune au défilement.

Le logo et « Retour en haut » ciblent le début du document. Le bandeau utilise deux groupes identiques, assez larges pour couvrir le viewport, avec une boucle sans décalage.

L’image d’accueil est servie en WebP avec trois tailles : 640, 960 et 1536 pixels. Le PNG original est conservé dans le dépôt mais exclu du site compilé. L’aperçu de partage est disponible en PNG 1200 × 630, avec son SVG source.

Les logos Fille de Pub noir et blanc et les trois logos clients sont ceux fournis le 26 septembre 2026. Leur conversion WebP est sans perte et vérifiée pixel par pixel. Les logos Fille de Pub sont cadrés dans un SVG qui exclut uniquement leurs marges transparentes ; le dessin et les couleurs des fichiers ne sont pas modifiés. Le logo fourni apparaît dans l’en-tête, le pied de page, le favicon et l’aperçu de partage.

Les corrections du PDF « Corrections site FDP(1).pdf » sont suivies dans `docs/corrections-2026-09-26.md`. La validation des codes de la charte graphique reste ouverte : les fichiers reçus comportent des logos noir et blanc, sans palette officielle. La palette existante reste provisoirement en place.

## Demande de devis

Le formulaire prépare un e-mail adressé à `allo@filledepub.com`. Les champs sont validés, le visiteur relit son message, puis ouvre sa messagerie pour l’envoyer. Une copie du texte est proposée en complément.

Le site ne transmet pas automatiquement de demande, n’enregistre pas les champs et ne prétend pas qu’un message a été envoyé. Aucun compte de service d’envoi d’e-mails n’est connecté. Un envoi direct nécessitera une configuration de messagerie vérifiée, une protection contre les abus et les informations de confidentialité correspondantes. Le lien e-mail reste utilisable sans JavaScript.

## Contenu et informations à fournir

Les prestations, l’expérience de plus de dix ans, les références SOS PC MOBILE / Croque & Moi / EKHAYA HOME DECO, la Guadeloupe et l’adresse e-mail proviennent des captures fournies. L’expérience annoncée ne désigne pas l’âge de l’entreprise.

L’image principale reste une illustration, décrite ainsi dans son texte alternatif. La légende visible a été supprimée conformément à la correction 3 du PDF. Elle n’est pas présentée comme une réalisation client. Aucun témoignage, résultat chiffré ou réalisation réelle n’est inventé. Pour compléter la version officielle, il manque :

- l’identité légale de l’éditeur : raison sociale ou identité de l’entrepreneure, forme juridique, SIREN/SIRET, adresse du siège, capital si applicable, coordonnées et responsable de publication ;
- les photos des opérations et éventuels témoignages validés ;
- les références de couleurs de la charte graphique ;
- la confirmation du raccordement du domaine définitif.

Aucune page de mentions légales incomplète n’est présentée comme définitive. Les DNS et la messagerie existante n’ont pas été modifiés.

## Prévisualisation et lancement

`site.config.json` définit l’adresse publique et l’indexation. La configuration actuelle garde la version Workers non indexée. `robots.txt` autorise le crawl pour permettre la lecture des directives `noindex` présentes dans le HTML et les en-têtes. Cette non-indexation n’est pas un contrôle d’accès.

Après raccordement et vérification du domaine définitif et finalisation du contenu, configurer :

```json
{
  "url": "https://filledepub.com",
  "indexable": true
}
```

Le build met alors à jour les métadonnées de partage, ajoute l’adresse canonique et le sitemap et supprime les directives de non-indexation. Les variables `PUBLIC_SITE_URL` et `PUBLIC_INDEXABLE` peuvent remplacer le fichier de configuration. Une origine HTTPS est requise et le build refuse l’indexation de l’adresse `workers.dev`.

## Développement et déploiement

Node.js 22 ou version ultérieure. Wrangler 4.141.0 est verrouillé dans le fichier de dépendances.

```sh
npm ci
npm run dev
npm run build
npm run check:deploy
```

Le serveur local sert `site/` et le build prépare `dist/`. `check:deploy` réalise un déploiement à blanc, sans publier.

Paramètres Cloudflare Workers Builds :

| Paramètre | Valeur |
| --- | --- |
| Worker | `filledepub-site` |
| Dépôt | `teamfilledepub/filledepub_site` |
| Branche | `main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | Racine du dépôt |
| Static Assets | `dist/` |
| Secrets applicatifs | Aucun actuellement |

Avant tout changement des serveurs DNS, conserver et vérifier les enregistrements existants, notamment ceux des e-mails : MX, SPF, DKIM et DMARC.

## Vérifications

Syntaxe JavaScript, compilation, déploiement à blanc, ancres, fichiers référencés, groupes du bandeau, variantes SEO de revue et de production. Contrôles de logique : défilement dans les deux sens, redimensionnement, accordéons, validation du formulaire, encodage des caractères, date, copie et invalidation d’une demande modifiée.

Les tests de logique en DOM simulé ne remplacent pas une validation physique sur iPhone/Safari.
