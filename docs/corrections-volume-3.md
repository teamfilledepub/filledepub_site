# Corrections — volume 3

Source : `Corrections site FDP volume 3.pdf`, une page fournie le 1er octobre 2026.
Base du travail : `b1dd3d7fa4b8661d0e60bbbe9d4d7fbc39145815`.
Le PDF contient huit demandes numérotées 37, 39 à 45 ; aucune correction 38 n’y figure.

| N° | Traitement |
| --- | --- |
| 37 | Titre du recrutement : « DE LA PERSONNALITÉ. DE L’ÉNERGIE. VOUS, SUR LE TERRAIN. » |
| 39 | Introduction : « Vous aimez le contact, les rencontres et les expériences qui marquent ? Venez faire équipe avec Fille de Pub. » |
| 40 | Nouvelle illustration d’un animateur commercial accueillant des visiteurs sur un stand ; trois tailles WebP. |
| 41 | Suppression de « DES MISSIONS, DES RENCONTRES » et de son champ devenu inutile dans l’administration. |
| 42 | Bloc candidature : « FAISONS CONNAISSANCE », puis « ET SI C’ÉTAIT VOUS, SUR LE TERRAIN ? ». |
| 43 | Option « Indépendant » dans la liste des profils. Correction du HTML mal formé de l’ancienne liste. Le serveur accepte ce choix ; une ancienne page encore ouverte avec « Freelance » reste compatible et enregistre « Indépendant ». |
| 44 | Effacement du lettrage déformé, puis insertion du fichier officiel dans une composition SVG autonome. Les pixels du logo, son viewBox et son rapport largeur/hauteur sont conservés ; aucune lettre n’est générée ou étirée. |
| 45 | Contraintes de largeur et désactivation de l’habillage natif du champ date ; hauteur du texte interne WebKit stabilisée. Le calendrier natif reste disponible. |

## Administration et compatibilité

Les photos de l’accueil et du recrutement ont deux emplacements distincts. Les paramètres enregistrés avant cette mise à jour reçoivent le nouvel emplacement sans perdre les autres textes, couleurs, médias ou coordonnées. Seules les anciennes variantes de l’illustration fournie sont remplacées automatiquement par le visuel au logo corrigé ; une photo personnalisée importée reste conservée.

Les nouvelles formulations demandées utilisent de nouvelles clés de contenu pour éviter qu’une ancienne sauvegarde complète du site ne rétablisse les textes corrigés. Les textes qui ne sont pas concernés gardent leurs clés.

## Vérifications

- Build du site et simulation du déploiement Workers : réussis.
- Tests : 12 réussis, dont validation et persistance des contacts, confidentialité, authentification, export CSV et compatibilité de la configuration précédente.
- Syntaxe JavaScript et cohérence des champs de contenu : vérifiées.
- Composition du logo : contrôlée visuellement et par identité de la ressource intégrée avec le logo fourni.
- Contrôle du site publié : illustrations chargées, textes conformes, choix « Indépendant » sélectionnable. Le champ date et sa colonne mesurent chacun 294,95 pixels dans le navigateur de contrôle.
- Le cartouche de l’accueil est placé plus bas pour dégager le logo ; le grand titre du recrutement utilise une taille adaptée au nouveau libellé sur ordinateur.
- Un contrôle physique sur iPhone/Safari reste nécessaire pour confirmer le champ date sur l’appareil concerné. Aucune candidature fictive n’est envoyée en production.

Références techniques consultées : [MDN, mise en forme avancée des formulaires](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Advanced_form_styling) et [WebKit, champ date vide et hauteur interne](https://bugs.webkit.org/show_bug.cgi?id=198959).

## Visuels livrés

- `site/assets/recrutement-640.webp`
- `site/assets/recrutement-960.webp`
- `site/assets/recrutement-1536.webp`
- `site/assets/activation-logo.svg`

Mode : outil intégré de génération d’images pour la nouvelle illustration et l’effacement localisé du mauvais lettrage ; composition SVG dans le code pour insérer le logo officiel existant à échelle uniforme. Les scènes restent des illustrations, pas des photographies de missions client documentées.

Prompt de création du recrutement :

> Use case: photorealistic-natural. Asset type: hero illustration for the recruitment page of Fille de Pub, a commercial animation agency in Guadeloupe. Create a realistic, polished but candid photograph of one adult male commercial event host, a friendly French Caribbean man around 30, wearing a clean short-sleeved white shirt and a simple dark lanyard, actively engaging two adult visitors at a promotional stand in a bright open-air shopping centre in Guadeloupe. The male host is clearly the principal subject, behind a pale cyan counter, smiling and demonstrating a small hands-on product discovery activity; natural gestures, anatomically correct hands, authentic warm interaction. Medium-wide landscape composition 1536x1024. Keep the host, his hands and the central part of the stand inside the middle 65 percent so the image can be cropped vertically on mobile. Tropical plants, airy mall walkway, soft natural daylight, clean contemporary atmosphere. Subtle touches of the website's yellow and pink palette in stand props, no spinning prize wheel. Photographic illustration, not a specific real client event. No written text, no lettering, no logos, no watermarks, no badges with readable words.

Prompt d’édition du comptoir :

> Use case: precise-object-edit. Edit target: the attached existing Fille de Pub hero image. Remove ONLY all the black FILLE DE PUB lettering from the front face of the yellow counter, restoring the plain yellow panel with the same natural light, shading and texture. The exact supplied brand logo will be overlaid separately in the website code, so do not draw or replace any lettering. Preserve absolutely everything outside those printed letters: identical people, faces, hair, bodies, hand positions, clothing, lanyard, prize wheel, visitors, props on the counter, mall background, counter dimensions and perspective, lighting, camera position and crop. Output same 1536x1024 landscape composition, opaque background. No words, logos or new elements anywhere. This is a strictly localized removal of the existing incorrect logo, not a scene redesign.

