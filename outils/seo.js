// Référencement du site JBCI : balises du <head>, données structurées (JSON-LD), sitemap.xml, robots.txt.
// Le bloc généré se trouve entre <!-- SEO:debut --> et <!-- SEO:fin -->.
//
//   node outils/seo.js                       régénère tout avec le domaine ci-dessous
//
// Nom de domaine du site (commandé le 17/10/2026). En cas de changement : modifier ici puis relancer le script.
const DOMAINE = 'https://www.jbci-informatique.fr';

const fs = require('fs');
const path = require('path');
const RACINE = path.join(__dirname, '..');
const AUJOURDHUI = new Date().toISOString().slice(0, 10);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const TITRE = 'JBCI – Développeur full-stack & Scrum Master à Toulouse';
const DESCRIPTION = 'Développeur freelance à Toulouse : digitalisation de vos process, applications web et mobiles, micro-services, données. Accéléré par l’IA, code relu.';
const IMAGE = `${DOMAINE}/assets/og.jpg`;

const COMPETENCES = ['Java', 'Spring Boot', 'Spring Batch', 'Scala', 'SQL', 'Oracle', 'Angular', 'JavaScript', 'React Native',
  'Micro-services', 'DevOps', 'Docker', 'Intelligence artificielle', 'Développement assisté par l’IA', 'Scrum', 'Méthodes agiles',
  'Applications mobiles iOS et Android', 'Sites internet', 'Référencement naturel', 'Digitalisation des processus', 'Automatisation', 'Outils métier sur mesure'];

// Questions / réponses de la FAQ visible (section #faq) → FAQPage
function faqDe(html) {
  const qr = [];
  for (const m of html.matchAll(/<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)) {
    const t = (s) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    qr.push({ '@type': 'Question', name: t(m[1]), acceptedAnswer: { '@type': 'Answer', text: t(m[2]) } });
  }
  return qr;
}

function jsonld(html) {
  const personne = {
    '@type': 'Person', '@id': `${DOMAINE}/#john`, name: 'John Bernard', jobTitle: 'Développeur full-stack et Scrum Master',
    image: `${DOMAINE}/assets/john.webp`, worksFor: { '@id': `${DOMAINE}/#jbci` }, knowsAbout: COMPETENCES,
    address: { '@type': 'PostalAddress', addressLocality: 'Toulouse', addressRegion: 'Occitanie', addressCountry: 'FR' },
  };
  const entreprise = {
    '@type': 'ProfessionalService', '@id': `${DOMAINE}/#jbci`, name: 'JBCI', url: `${DOMAINE}/`, logo: `${DOMAINE}/assets/logo-blanc.png`,
    image: IMAGE, description: DESCRIPTION, founder: { '@id': `${DOMAINE}/#john` },
    address: { '@type': 'PostalAddress', addressLocality: 'Toulouse', addressRegion: 'Occitanie', addressCountry: 'FR' },
    areaServed: [{ '@type': 'City', name: 'Toulouse' }, { '@type': 'AdministrativeArea', name: 'Occitanie' }, { '@type': 'Country', name: 'France' }],
    knowsAbout: COMPETENCES,
    hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Services', itemListElement: [
      'Développement accéléré par l’IA', 'Digitalisation des process', 'Données et intégration', 'Back-end, API et micro-services', 'Applications mobiles', 'Sites internet et référencement', 'Pilotage agile et Scrum',
    ].map((n) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: n, areaServed: 'France' } })) },
  };
  const site = { '@type': 'WebSite', '@id': `${DOMAINE}/#site`, url: `${DOMAINE}/`, name: 'JBCI', inLanguage: 'fr-FR', publisher: { '@id': `${DOMAINE}/#jbci` } };
  const page = { '@type': 'WebPage', '@id': `${DOMAINE}/#page`, url: `${DOMAINE}/`, name: TITRE, description: DESCRIPTION, inLanguage: 'fr-FR',
    isPartOf: { '@id': `${DOMAINE}/#site` }, about: { '@id': `${DOMAINE}/#jbci` }, primaryImageOfPage: IMAGE };
  const realisations = { '@type': 'ItemList', name: 'Réalisations', itemListElement: [
    { name: 'Reconnaissance client sur 65 millions de clients (Capgemini pour EDF)' },
    { name: 'Explogo, application mobile du patrimoine', url: 'https://explogo.fr' },
    { name: 'Digitalisation des process d’une association', url: 'https://stages.rcfc.fr' },
    { name: 'Maestro, maintenance guidée par l’IA (innovation)' },
    { name: 'Le Coin Santé, site de maison de santé' }, { name: 'Main à Main, site d’interprète en langue des signes' },
  ].map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'CreativeWork', ...p, creator: { '@id': `${DOMAINE}/#john` } } })) };
  const graphe = [entreprise, personne, site, page, realisations];
  const faq = faqDe(html);
  if (faq.length) graphe.push({ '@type': 'FAQPage', '@id': `${DOMAINE}/#faq`, mainEntity: faq });
  return { '@context': 'https://schema.org', '@graph': graphe };
}

function bloc(html) {
  return [
    `<title>${esc(TITRE)}</title>`,
    `<meta name="description" content="${esc(DESCRIPTION)}">`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">`,
    `<link rel="canonical" href="${DOMAINE}/">`,
    `<meta name="author" content="John Bernard">`,
    `<meta name="geo.region" content="FR-31"><meta name="geo.placename" content="Toulouse">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="JBCI">`,
    `<meta property="og:locale" content="fr_FR">`,
    `<meta property="og:url" content="${DOMAINE}/">`,
    `<meta property="og:title" content="JBCI – L’expertise d’un développeur, la vitesse de l’IA">`,
    `<meta property="og:description" content="${esc(DESCRIPTION)}">`,
    `<meta property="og:image" content="${IMAGE}">`,
    `<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="JBCI, développeur full-stack et Scrum Master à Toulouse">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="JBCI – L’expertise d’un développeur, la vitesse de l’IA">`,
    `<meta name="twitter:description" content="${esc(DESCRIPTION)}">`,
    `<meta name="twitter:image" content="${IMAGE}">`,
    `<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">`,
    `<script type="application/ld+json">${JSON.stringify(jsonld(html))}</script>`,
  ];
}

// index.html : remplace les anciennes balises par le bloc
const fichier = path.join(RACINE, 'index.html');
let html = fs.readFileSync(fichier, 'utf8');
const eol = html.includes('\r\n') ? '\r\n' : '\n';
html = html
  .replace(/[ \t]*<!-- SEO:debut -->[\s\S]*?<!-- SEO:fin -->\r?\n/, '')
  .replace(/[ \t]*<title>[\s\S]*?<\/title>\r?\n/, '')
  .replace(/[ \t]*<meta (name|property)="(description|robots|author|og:[a-z:]+|twitter:[a-z]+|geo\.[a-z]+)"[^>]*>\r?\n/g, '')
  .replace(/[ \t]*<link rel="(canonical|apple-touch-icon)"[^>]*>\r?\n/g, '')
  .replace(/[ \t]*<script type="application\/ld\+json">[\s\S]*?<\/script>\r?\n/g, '');
const vp = html.match(/[ \t]*<meta name="viewport"[^>]*>\r?\n/);
html = html.replace(vp[0], vp[0] + ['<!-- SEO:debut -->', ...bloc(html), '<!-- SEO:fin -->'].map((l) => '  ' + l).join(eol) + eol);
fs.writeFileSync(fichier, html);

fs.writeFileSync(path.join(RACINE, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url><loc>${DOMAINE}/</loc><lastmod>${AUJOURDHUI}</lastmod><priority>1.0</priority><image:image><image:loc>${IMAGE}</image:loc></image:image></url>
</urlset>
`);
fs.writeFileSync(path.join(RACINE, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${DOMAINE}/sitemap.xml\n`);
console.log(`SEO écrit (${DOMAINE}) : titre ${TITRE.length} car., description ${DESCRIPTION.length} car., FAQ ${faqDe(html).length} questions.`);
