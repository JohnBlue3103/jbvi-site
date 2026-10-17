// JBCI — animations et formulaire de contact

// Adresse qui reçoit les demandes : jamais écrite en clair (robots). Laisser vide tant qu'elle n'est pas choisie.
// Pour la générer : node -e 'console.log(JSON.stringify([..."adresse@exemple.fr"].map(c=>c.charCodeAt(0)+7).reverse()))'
const ADRESSE_CODEE = [];
const adresse = () => ADRESSE_CODEE.slice().reverse().map((n) => String.fromCharCode(n - 7)).join('');
const calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.getElementById('annee').textContent = new Date().getFullYear();

// ── Matière liquide du hero (WebGL) : un drapé brillant qui ondule, bleu du logo + violet ──
(() => {
  const canvas = document.getElementById('liquide');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false });
  if (!gl) return; // sans WebGL, le dégradé CSS du hero reste en fond

  const VS = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';
  const FS = `
    precision highp float;
    uniform vec2 res; uniform float t; uniform vec2 souris;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float bruit(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
      return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y); }
    float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int k = 0; k < 3; k++){ v += a * bruit(p); p *= 2.02; a *= 0.5; } return v; }
    float champ(vec2 p){
      vec2 q = vec2(fbm(p + vec2(0.0, t*0.05)), fbm(p + vec2(5.2, 1.3) - t*0.04));
      vec2 r = vec2(fbm(p + 2.0*q + vec2(1.7, 9.2) + t*0.03), fbm(p + 2.0*q + vec2(8.3, 2.8)));
      return fbm(p + 2.2*r);
    }
    void main(){
      vec2 uv = (gl_FragCoord.xy - 0.5*res) / min(res.x, res.y);
      uv += (souris - 0.5) * 0.08;
      vec2 p = uv * 0.85;
      float e = 0.012;
      float h = champ(p);
      // normale du « drapé » pour un reflet brillant
      vec2 g = vec2(champ(p + vec2(e, 0.0)) - h, champ(p + vec2(0.0, e)) - h) / e;
      vec3 n = normalize(vec3(-g * 0.9, 1.0));
      vec3 l = normalize(vec3(0.5, 0.6, 0.9));
      float diff = max(dot(n, l), 0.0);
      float spec = pow(max(dot(reflect(-l, n), vec3(0.0, 0.0, 1.0)), 0.0), 18.0);
      vec3 noir = vec3(0.02, 0.02, 0.05);
      vec3 violet = vec3(0.35, 0.20, 0.85);
      vec3 bleu = vec3(0.12, 0.38, 0.92);
      vec3 base = mix(noir, mix(violet, bleu, smoothstep(0.3, 0.8, h)), smoothstep(0.35, 0.95, h) * 0.9);
      vec3 c = base * (0.25 + 0.9 * diff) + spec * vec3(0.85, 0.82, 1.0) * smoothstep(0.4, 0.9, h);
      float vignette = smoothstep(1.25, 0.25, length(uv));
      gl_FragColor = vec4(c * vignette, 1.0);
    }`;
  const shader = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(prog, 'res'), uT = gl.getUniformLocation(prog, 't'), uS = gl.getUniformLocation(prog, 'souris');

  // rendu à résolution réduite : fluide même sur un téléphone, flou naturel du drapé
  const ECHELLE = 0.33;
  function taille() { canvas.width = Math.round(canvas.clientWidth * ECHELLE); canvas.height = Math.round(canvas.clientHeight * ECHELLE); gl.viewport(0, 0, canvas.width, canvas.height); }
  taille(); window.addEventListener('resize', taille);
  let sx = 0.5, sy = 0.5, cx = 0.5, cy = 0.5;
  window.addEventListener('pointermove', (e) => { sx = e.clientX / innerWidth; sy = 1 - e.clientY / innerHeight; });
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
  // pendant le défilement, le drapé se fige : toute la puissance va au défilement
  let defile = false, finDefile;
  window.addEventListener('scroll', () => { defile = true; clearTimeout(finDefile); finDefile = setTimeout(() => { defile = false; }, 160); }, { passive: true });
  const debut = performance.now();
  let derniere = 0;
  function image(maintenant) {
    // 30 images par seconde suffisent pour un drapé lent, et laissent respirer le reste de la page
    if (visible && !defile && maintenant - derniere > 33) {
      derniere = maintenant;
      cx += (sx - cx) * 0.04; cy += (sy - cy) * 0.04;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uT, calme ? 8.0 : (maintenant - debut) / 1000);
      gl.uniform2f(uS, cx, cy);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    if (!calme) requestAnimationFrame(image);
  }
  requestAnimationFrame(image);
})();

// ── En-tête : fond flouté dès qu'on défile ──
(() => {
  const entete = document.querySelector('.entete');
  const maj = () => entete.classList.toggle('defile', window.scrollY > 40);
  maj(); window.addEventListener('scroll', maj, { passive: true });
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

// ── Curseur personnalisé (ordinateur seulement) : petit rond qui suit la souris avec un léger retard,
//    grossit avec un anneau violet sur les liens et boutons, devient un disque « Voir » sur les projets ──
(() => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 967px)').matches) return;
  const c = document.createElement('div');
  c.className = 'curseur-perso'; c.setAttribute('aria-hidden', 'true');
  c.innerHTML = '<span></span>';
  const etiquette = c.querySelector('span');
  document.body.appendChild(c);
  document.documentElement.classList.add('curseur-actif');
  let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
  window.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; c.classList.add('visible'); }, { passive: true });
  document.addEventListener('pointerleave', () => c.classList.remove('visible'));
  document.addEventListener('pointerover', (e) => {
    const cible = e.target;
    const champ = cible.closest('input, textarea, select');
    const projet = cible.closest('[data-curseur]'); // seulement ce qui s'ouvre vraiment
    if (projet) etiquette.textContent = projet.dataset.curseur;
    const lien = cible.closest('a, button, .service, .etapes li');
    c.classList.toggle('texte', !!champ);
    c.classList.toggle('grand', !!projet && !champ);
    c.classList.toggle('focus', !!lien && !projet && !champ);
  });
  let bouge = true;
  window.addEventListener('pointermove', () => { bouge = true; }, { passive: true });
  const suivre = () => {
    if (!bouge) { requestAnimationFrame(suivre); return; }
    // 0.65 : suit la souris presque instantanément, avec juste un soupçon de douceur
    cx += (x - cx) * (calme ? 1 : 0.65); cy += (y - cy) * (calme ? 1 : 0.65);
    c.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    if (Math.abs(x - cx) < 0.3 && Math.abs(y - cy) < 0.3) bouge = false; // arrivé : on arrête de redessiner
    requestAnimationFrame(suivre);
  };
  requestAnimationFrame(suivre);
})();
