# Corrections — volume 2

Source : `Correction site fille de pub volume 2.pdf`, deux pages fournies par la cliente.
Travail du 1er octobre 2026, depuis le commit `8bf1010fb73562eda34006f53c0136668e8b0f35`.

| N° | Demande | Traitement |
| --- | --- | --- |
| 24 | Effet de texte tapé au clavier | Les six phrases s’écrivent successivement ; pause et mouvement réduit affichent le texte complet. |
| 25 | Style de « Ils nous font confiance » | Même taille, graisse et soulignement que le lien « Voici comment on s’y prend ». |
| 26 | Supprimer « Une agence née du terrain. » | Retiré sur toutes les tailles d’écran. |
| 27 | Titre prestations raccourci | « VOUS AVEZ UN PRODUIT. ON CRÉE L’EXPÉRIENCE. » |
| 28 | Introduction sous le titre sur ordinateur | La description est placée sous le titre à toutes les largeurs. |
| 29 | « Mesurable. » | Remplace la totalité du titre de la quatrième carte. |
| 30 | Nom et prénom | Libellé « Votre nom et prénom * ». |
| 31 | Enlever 01, 02, 03, 04 | Retirés des quatre cartes, comme l’indique la capture du PDF. Les repères de sections et de prestations sont conservés. |
| 32 | Agence avant prestations | Ordre du menu changé ; lien recrutement ajouté ensuite. |
| 33 | Surlignage de « DU SÉRIEUX » seul | Le reste de la ligne n’est plus surligné. |
| 34 | Recrutement et base de profils | Page dédiée, formulaire, stockage persistant privé, consentement, confirmation et consultation dans l’administration. |
| 35 | Logo sur le stand illustré | Image corrigée avec le logo fourni, déclinée en WebP 640/960/1536. |
| 36 | Préparer le back-office | Gestion des textes marketing, médias, logos, couleurs, polices, e-mail public, demandes/candidatures et export CSV. Activation finale par secret Cloudflare. |

## Mise en service

Le secret `ADMIN_PASSWORD` doit être défini par la propriétaire dans Cloudflare. Le site et les formulaires publics ne dépendent pas de cette activation. L’administration refuse l’accès aux données et aux modifications tant que le secret est absent.

Les données restent dans le seul projet Fille de Pub. Aucun envoi de mail automatique n’est branché. Les demandes apparaissent dans l’administration. La conservation opérationnelle est limitée à 12 mois et décrite sur la page de confidentialité.

## Visuel

Le module de génération d’image intégré a modifié la scène existante à partir de la version 1536 pixels et du logo noir fourni. Consigne : remplacer uniquement le lettrage du comptoir par le logotype officiel incliné, conserver la scène, les personnes, les objets, les couleurs et le cadrage. Les fichiers livrés au site sont `site/assets/activation-{640,960,1536}.webp`. L’ancien PNG historique n’est pas utilisé par le build.

Mode : édition localisée de l’image existante, avec le logo officiel comme deuxième référence.

Prompt utilisé :

> Use case: compositing. Edit target: image 1, existing Fille de Pub website hero photograph. Supporting insert: image 2, the exact official black FILLE DE PUB logotype on transparency (large transparent margins around a single line of condensed uppercase characters with a rising/slanted baseline). Change ONLY the printed black lettering on the front face of the yellow counter: remove the existing generic FILLE DE PUB text and replace it with the exact official logotype from image 2, black on yellow, proportionally fitted into the same front-panel area. Preserve its distinctive rising baseline/slant and exact letter shapes. Match the existing counter plane/perspective naturally. Preserve absolutely everything else: same people, faces, body poses, hand positions, smiles, clothing, prize wheel, storefront background, lighting, camera, crop, image size/aspect ratio 1536x1024, yellow desk, objects. No redesign of the scene, no other words, no watermark. This is a localized brand-logo correction.

## Hors de ce PDF

La charte couleur officielle, l’identité complète pour les mentions légales, le domaine définitif et le contrôle physique sur téléphone restent à confirmer. Ces éléments ne sont pas présentés comme achevés.
