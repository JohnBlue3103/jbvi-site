// JBCI — animations et formulaire de contact

// Adresse qui reçoit les demandes : jamais écrite en clair (robots). Laisser vide tant qu'elle n'est pas choisie.
// Pour la générer : node -e 'console.log(JSON.stringify([..."adresse@exemple.fr"].map(c=>c.charCodeAt(0)+7).reverse()))'
const ADRESSE_CODEE = [];
const adresse = () => ADRESSE_CODEE.slice().reverse().map((n) => String.fromCharCode(n - 7)).join('');
const calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.getElementById('annee').textContent = new Date().getFullYear();

// ── Flux de données du hero : des services reliés, des paquets qui circulent ──
(() => {
  const canvas = document.getElementById('flux');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const NOMS = ['api', 'reco-client', 'batch', 'mobile', 'web', 'oracle', 'paiement', 'mail', 'carte', 'auth', 'stats', 'back-office'];
  let largeur, hauteur, noeuds = [], liens = [], paquets = [], ratio;

  function preparer() {
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    largeur = canvas.clientWidth; hauteur = canvas.clientHeight;
    canvas.width = largeur * ratio; canvas.height = hauteur * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const n = largeur < 700 ? 7 : 12;
    noeuds = Array.from({ length: n }, (_, i) => ({
      // sur grand écran, les services restent à droite pour ne pas passer derrière le titre
      x: largeur * (largeur > 1000 ? 0.5 + 0.46 * Math.random() : 0.08 + 0.84 * Math.random()), y: hauteur * (0.12 + 0.76 * Math.random()),
      vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12, nom: NOMS[i % NOMS.length],
    }));
    liens = [];
    noeuds.forEach((a, i) => {
      const proches = noeuds.map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) })).filter((o) => o.j !== i)
        .sort((p, q) => p.d - q.d).slice(0, 2);
      proches.forEach(({ j }) => { if (!liens.some(([p, q]) => (p === i && q === j) || (p === j && q === i))) liens.push([i, j]); });
    });
    paquets = [];
  }

  function image() {
    ctx.clearRect(0, 0, largeur, hauteur);
    for (const n of noeuds) {
      if (!calme) { n.x += n.vx; n.y += n.vy; }
      if (n.x < 30 || n.x > largeur - 30) n.vx *= -1;
      if (n.y < 30 || n.y > hauteur - 30) n.vy *= -1;
    }
    ctx.lineWidth = 1;
    for (const [i, j] of liens) {
      const a = noeuds[i], b = noeuds[j];
      ctx.strokeStyle = 'rgba(236,234,228,0.07)';
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    if (!calme && Math.random() < 0.08 && liens.length) {
      const [i, j] = liens[Math.floor(Math.random() * liens.length)];
      paquets.push({ de: Math.random() < 0.5 ? i : j, vers: 0, t: 0, v: 0.004 + Math.random() * 0.006, menthe: Math.random() < 0.35 });
      const p = paquets[paquets.length - 1]; p.vers = p.de === i ? j : i;
    }
    paquets = paquets.filter((p) => p.t < 1);
    for (const p of paquets) {
      p.t += p.v;
      const a = noeuds[p.de], b = noeuds[p.vers];
      const x = a.x + (b.x - a.x) * p.t, y = a.y + (b.y - a.y) * p.t;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 14);
      g.addColorStop(0, p.menthe ? 'rgba(124,244,200,0.9)' : 'rgba(77,163,232,0.9)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill();
    }
    ctx.font = '11px "JetBrains Mono", monospace';
    for (const n of noeuds) {
      ctx.fillStyle = 'rgba(18,20,27,0.9)'; ctx.strokeStyle = 'rgba(77,163,232,0.35)';
      ctx.beginPath(); ctx.arc(n.x, n.y, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(154,156,168,0.55)'; ctx.fillText(n.nom, n.x + 9, n.y + 4);
    }
    if (!calme) requestAnimationFrame(image);
  }

  preparer(); image();
  let attente;
  window.addEventListener('resize', () => { clearTimeout(attente); attente = setTimeout(() => { preparer(); if (calme) image(); }, 200); });
})();

// ── Lueur qui suit la souris sur les services ──
document.querySelectorAll('.service').forEach((el) => {
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - r.left}px`);
    el.style.setProperty('--y', `${e.clientY - r.top}px`);
  });
});

// ── Apparition au défilement ──
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entrees) => {
    entrees.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('vu'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  document.querySelectorAll('.apparait').forEach((el) => io.observe(el));
} else {
  document.querySelectorAll('.apparait').forEach((el) => el.classList.add('vu'));
}

// ── Formulaire : ouvre la messagerie avec le message rédigé ──
const chargeLe = Date.now();
const form = document.getElementById('form-contact');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const note = document.getElementById('note-form');
  if (form.site_web.value || Date.now() - chargeLe < 3000) return; // robot
  if (!form.email.value.trim() || !form.email.checkValidity()) { form.email.focus(); form.email.reportValidity(); return; }
  if (!form.message.value.trim()) { form.message.focus(); form.message.reportValidity(); return; }
  if (!ADRESSE_CODEE.length) { note.textContent = 'Le formulaire n’est pas encore relié à une adresse e-mail.'; return; }
  const sujet = `[JBCI] ${form.type.value}${form.nom.value ? ' — ' + form.nom.value : ''}`;
  const corps = `${form.message.value}\n\n— ${form.nom.value || ''}\n${form.email.value}`;
  location.href = `mailto:${adresse()}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
  note.textContent = 'Votre messagerie s’ouvre avec votre message.';
});
