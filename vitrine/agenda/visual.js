/*
 * Parte visual da Clínica Ipê de Agosto (a agenda em si está em app.js e não depende deste arquivo).
 *  - Títulos que saem do desfoque, letra por letra: animação "Blur In" do GetLayers, refeita sem biblioteca
 *    com a mesma mola (tensão 200, atrito 24, 25 ms entre letras, desfoque de 8 px).
 *  - Flor de ipê em ouro, em 3D, no palco da abertura: o pacote flor3d.js só é baixado se o aparelho
 *    tiver WebGL e quando o palco estiver perto da tela. Sem isso, fica a flor desenhada em SVG.
 */
const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;

function prepararTitulo(h) {
  if (h.dataset.pronto || h.children.length) return null;
  h.dataset.pronto = '1';
  const texto = h.textContent.trim(); h.setAttribute('aria-label', texto);
  const letras = [];
  const palavras = texto.split(/\s+/).map((palavra) => {
    const p = document.createElement('span'); p.className = 'palavra'; p.setAttribute('aria-hidden', 'true');
    for (const c of palavra) { const l = document.createElement('span'); l.className = 'letra'; l.textContent = c; l.style.opacity = '0'; l.style.filter = 'blur(8px)'; p.append(l); letras.push(l); }
    return p;
  });
  h.replaceChildren(...palavras.flatMap((p, i) => (i ? [' ', p] : [p])));
  letras[0].classList.add('capitular');
  return letras;
}
function soltar(letras) {
  letras.forEach((l, i) => {
    let x = 0, v = 0, antes = 0;
    const passo = (t) => {
      if (!antes) antes = t;
      let dt = Math.min(0.032, (t - antes) / 1000); antes = t;
      for (; dt > 0; dt -= 0.004) { const h = Math.min(0.004, dt); v += (200 * (1 - x) - 24 * v) * h; x += v * h; }
      const k = Math.min(1, Math.max(0, x));
      l.style.opacity = String(k); l.style.filter = `blur(${((1 - k) * 8).toFixed(2)}px)`;
      if (Math.abs(1 - x) > 0.002 || Math.abs(v) > 0.02) requestAnimationFrame(passo); else { l.style.opacity = ''; l.style.filter = ''; }
    };
    setTimeout(() => requestAnimationFrame(passo), i * 25);
  });
}
if (!calmo && 'IntersectionObserver' in window) {
  const fila = new Map();
  const ver = new IntersectionObserver((itens) => {
    for (const item of itens) if (item.isIntersecting) { ver.unobserve(item.target); soltar(fila.get(item.target)); fila.delete(item.target); }
  }, { threshold: 0.2 });
  document.querySelectorAll('main h1, main h2').forEach((h) => { const letras = prepararTitulo(h); if (letras) { fila.set(h, letras); ver.observe(h); } });
}

const palco = document.getElementById('palco');
if (palco && 'IntersectionObserver' in window) {
  const perto = new IntersectionObserver(async ([e]) => {
    if (!e.isIntersecting) return;
    perto.disconnect();
    try {
      const m = await import('./flor3d.js');
      if (!m.temWebGL()) return;
      m.montarFlor(palco); palco.classList.add('palco--vivo');
    } catch { /* sem 3D, a flor desenhada continua no lugar */ }
  }, { rootMargin: '300px' });
  perto.observe(palco);
}
