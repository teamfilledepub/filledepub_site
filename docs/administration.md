# Utiliser l’administration Fille de Pub

## Première connexion

Ouvrir `/admin/`. Si l’écran indique « Administration à activer », définir dans les paramètres Cloudflare du Worker le secret `ADMIN_PASSWORD` (16 caractères minimum), enregistrer et déployer. La propriétaire choisit ce mot de passe ; il ne doit pas être communiqué dans le chat ni ajouté au code.

## Textes

1. Choisir **Textes** et la rubrique voulue.
2. Modifier les champs. Les titres mis en valeur sont divisés en segments pour conserver leur mise en forme.
3. Cliquer sur **Publier les modifications**.
4. Ouvrir ou recharger le site public pour vérifier le résultat.

Les libellés techniques des formulaires et la notice de confidentialité restent dans le code afin de garder leur cohérence avec la validation et la conservation des données.

## Images et logos

1. Importer un fichier JPEG, PNG ou WebP (20 Mo maximum avant optimisation).
2. Le choisir dans la liste de l’emplacement concerné : photo de l’accueil, photo du recrutement, logo sur fond clair ou logo sur fond sombre. Les deux photos de page sont indépendantes.
3. Vérifier la description ; elle sert aussi aux visiteurs utilisant un lecteur d’écran.
4. Publier.

Pour un nouveau logo client, importer le fichier puis cliquer sur **Ajouter un logo client**. Pour des photos supplémentaires, utiliser **Galerie du site**. Une galerie vide n’apparaît pas sur l’accueil. Retirer une image d’un emplacement ne supprime pas le fichier de la médiathèque.

Les imports sont optimisés en WebP, jusqu’à 1 800 pixels sur le plus grand côté et 1 Mo par fichier stocké. Les proportions et la transparence sont conservées. Les illustrations existantes ne doivent pas être présentées comme des opérations client réelles.

## Apparence

Modifier les six couleurs, les deux typographies et l’adresse e-mail publique. Publier puis vérifier les contrastes, les titres et la navigation. Une adresse e-mail modifiée met aussi à jour les liens de contact des pages publiques.

## Contacts

- Filtrer les demandes commerciales ou les candidatures.
- Ouvrir une fiche pour lire ses informations.
- Indiquer **Nouveau**, **Contacté** ou **Archivé** pour suivre son traitement.
- Exporter le filtre courant en CSV (compatible Excel, séparateur point-virgule).
- Supprimer une fiche uniquement lorsque cela est voulu ; une confirmation est demandée.

Les formulaires ne déclenchent pas de notification e-mail automatique. Consulter cet écran régulièrement. Les données sont retirées automatiquement de la base active après 12 mois ; l’archivage ne prolonge pas ce délai. Les exports téléchargés doivent être conservés et supprimés par la personne qui les a exportés.

## En cas de problème

- Session expirée : se reconnecter.
- Modification dans une autre fenêtre : sauvegarder ses textes si nécessaire, recharger, puis refaire les modifications sur la version courante.
- Image trop lourde : réduire ses dimensions ou son poids et réimporter.
- Mot de passe oublié : le remplacer dans les secrets du Worker Cloudflare et redéployer. Les anciennes sessions sont invalidées.
- Domaine ou site inaccessible : vérifier le déploiement Cloudflare et le domaine ; ne pas modifier les enregistrements de messagerie au hasard.
