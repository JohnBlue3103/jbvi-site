# JBCI — site vitrine

Site statique (HTML / CSS / JS, sans build) de JBCI, développeur freelance à Toulouse.

- `index.html` : accueil (une page) — hero animé, services, réalisations, méthode, qui suis-je, contact
- `mentions-legales.html`
- `css/style.css` : style « studio » inspiré de metalab.com : noir profond, titres Instrument Serif, interface Inter, pastilles
- `js/main.js` : matière liquide du hero (WebGL, bleu du logo + violet), heure de Toulouse, apparition au défilement, formulaire
- `assets/` : logo (`logo-blanc.png` pour le fond noir, `logo-source.png` original), `favicon.svg`, `og.jpg` (aperçu de partage), `john.webp`, captures des projets dans `projets/`

## Référencement

`node outils/seo.js` écrit le titre, la description, l’adresse canonique, les aperçus de partage, les données structurées (entreprise, personne, services, réalisations, FAQ), `sitemap.xml` et `robots.txt`. Le domaine est la constante `DOMAINE` en tête du script (https://www.jbci-informatique.fr) : la changer puis relancer le script.

## À compléter avant la mise en ligne

- l'adresse e-mail qui reçoit le formulaire : `ADRESSE_CODEE` dans `js/main.js` (codée, jamais en clair ; la commande pour la générer est en commentaire) ;
- l'adresse postale et l'hébergeur dans `mentions-legales.html` ;
- le nom de domaine (puis l'adresse complète de `og:image` et une balise canonique) ;
- liens vers Le Coin Santé et Main à Main quand leurs sites seront en ligne.
