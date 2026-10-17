# JBCI — site vitrine

Site statique (HTML / CSS / JS, sans build) de JBCI, développeur freelance à Toulouse.

- `index.html` : accueil (une page) — hero animé, services, réalisations, méthode, qui suis-je, contact
- `mentions-legales.html`
- `css/style.css` : thème sombre, couleurs du logo (`--bleu` #0F6AAB, `--accent` éclairci pour le fond sombre)
- `js/main.js` : animation des flux du hero, apparition au défilement, formulaire
- `assets/` : logo (`logo-clair.png` sur fond sombre, `logo-sombre.png` sur fond clair, `logo-source.png` original), `favicon.svg`, `og.jpg` (aperçu de partage), `john.webp`, captures des projets dans `projets/`

## À compléter avant la mise en ligne

- l'adresse e-mail qui reçoit le formulaire : `ADRESSE_CODEE` dans `js/main.js` (codée, jamais en clair ; la commande pour la générer est en commentaire) ;
- l'adresse postale et l'hébergeur dans `mentions-legales.html` ;
- le nom de domaine (puis l'adresse complète de `og:image` et une balise canonique) ;
- liens vers Le Coin Santé et Main à Main quand leurs sites seront en ligne.
