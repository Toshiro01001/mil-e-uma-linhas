/*
 * Parte visual do Ponteiro Alto. O sistema (ciclo, recomendação, regras, conta) está em app.js e não depende deste arquivo.
 *  1. Vidraça canelada atrás do relógio: efeito "Refract", padrão Fluted, do GetLayers. O que passa atrás do vidro
 *     não é vídeo: são luzes pintadas por código, que se movem devagar. O vidro acompanha o ponteiro do mouse.
 *  2. Relógio: aro canelado, metal em degradê, cristal com reflexo que segue o ponteiro e uma leve inclinação.
 *  3. Títulos que saem do desfoque, linha por linha: animação "Unblur Lines" do GetLayers, refeita sem biblioteca
 *     com a mesma mola (tensão 190, atrito 26, 90 ms entre linhas, desfoque de 10 px).
 *  4. Luz que acompanha o ponteiro nos cartões de modelo.
 */
const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
const NS = 'http://www.w3.org/2000/svg';
const palco = document.querySelector('.mostrador'), dial = document.getElementById('dial');
const alvo = { x: 0, y: 0 };   // ponteiro sobre o palco, de -1 a 1
if (palco) {
  palco.addEventListener('pointermove', (e) => { const r = palco.getBoundingClientRect(); alvo.x = ((e.clientX - r.left) / r.width) * 2 - 1; alvo.y = ((e.clientY - r.top) / r.height) * 2 - 1; });
  palco.addEventListener('pointerleave', () => { alvo.x = 0; alvo.y = 0; });
}

/* ---------- 1. vidraça canelada ---------- */
const VERT = 'attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.0,1.0);}';
const FRAG = `precision highp float;
uniform sampler2D uImage;uniform vec2 uResolution;uniform float uScale;uniform float uRelief;uniform float uThickness;uniform float uAngle;uniform float uDispersion;uniform float uSpecular;uniform vec2 uParallax;
const float IOR = 1.50;
float height(vec2 cell){float t=fract(cell.x)*2.0-1.0;return sqrt(max(0.0,1.0-t*t));}
vec2 mirrorUV(vec2 uv){return 1.0-abs(mod(uv,2.0)-1.0);}
vec3 sampleAt(vec3 normal,vec2 frag,float ior){
  vec3 incident=normalize(vec3(uParallax,-1.0));vec3 bent=refract(incident,normal,1.0/ior);
  if(dot(bent,bent)==0.0)bent=incident;
  vec2 offset=bent.xy/max(abs(bent.z),1e-4)*uThickness;
  return texture2D(uImage,mirrorUV((frag+offset)/uResolution)).rgb;}
void main(){
  vec2 frag=gl_FragCoord.xy;vec2 centre=uResolution*0.5;float cellPx=max(uScale,2.0);
  float a=radians(uAngle);mat2 turn=mat2(cos(a),-sin(a),sin(a),cos(a));mat2 back=mat2(cos(a),sin(a),-sin(a),cos(a));
  vec2 surf=uParallax*(uResolution.y*0.05);vec2 cell=(turn*(frag-centre-surf))/cellPx;
  float e=1.0/cellPx;
  float hx=(height(cell+vec2(e,0.0))-height(cell-vec2(e,0.0)))/(2.0*e);
  float hy=(height(cell+vec2(0.0,e))-height(cell-vec2(0.0,e)))/(2.0*e);
  vec3 n=normalize(vec3(-hx*uRelief,-hy*uRelief,1.0));vec3 normal=normalize(vec3(back*n.xy,n.z));
  vec3 colour;
  if(uDispersion>0.0){float d=uDispersion*0.06;colour.r=sampleAt(normal,frag,IOR-d).r;colour.g=sampleAt(normal,frag,IOR).g;colour.b=sampleAt(normal,frag,IOR+d).b;}
  else{colour=sampleAt(normal,frag,IOR);}
  if(uSpecular>0.0){float fresnel=pow(max(0.0,1.0-normal.z),5.0);colour+=fresnel*uSpecular;}
  gl_FragColor=vec4(colour,1.0);}`;
function vidraca() {
  if (!palco) return;
  const tela = document.createElement('canvas'); tela.className = 'vidraca'; tela.setAttribute('aria-hidden', 'true');
  const op = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: true };
  const gl = tela.getContext('webgl2', op) || tela.getContext('webgl', op);
  if (!gl) return;
  const sh = (tipo, src) => { const s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos'); gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  const U = (n) => gl.getUniformLocation(prog, n);
  palco.prepend(tela);
  const cena = document.createElement('canvas'), c = cena.getContext('2d');
  function medir() {
    const r = palco.getBoundingClientRect(), longo = 1200, w = r.width >= r.height ? longo : Math.round(longo * r.width / r.height), h = r.width >= r.height ? Math.round(longo * r.height / r.width) : longo;
    if (tela.width === w && tela.height === h) return; tela.width = w; tela.height = h; cena.width = w / 2; cena.height = h / 2; gl.viewport(0, 0, w, h);
  }
  /* o que fica atrás do vidro: breu esverdeado com três luzes lentas, ouro, esmeralda e marfim */
  function pintar(t) {
    const w = cena.width, h = cena.height, g0 = c.createLinearGradient(0, 0, w, h); g0.addColorStop(0, '#0d2a21'); g0.addColorStop(1, '#030605');
    c.globalCompositeOperation = 'source-over'; c.fillStyle = g0; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'lighter';
    const luz = (x, y, raio, cor) => { const g = c.createRadialGradient(x, y, 0, x, y, raio); g.addColorStop(0, cor); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); };
    luz(w * (0.3 + 0.22 * Math.sin(t * 0.21)), h * (0.3 + 0.12 * Math.cos(t * 0.17)), w * 0.5, 'rgba(201,166,92,0.55)');
    luz(w * (0.72 + 0.18 * Math.cos(t * 0.16)), h * (0.7 + 0.14 * Math.sin(t * 0.23)), w * 0.6, 'rgba(18,120,88,0.6)');
    luz(w * (0.5 + 0.3 * Math.sin(t * 0.11 + 2)), h * (0.5 + 0.3 * Math.cos(t * 0.13 + 1)), w * 0.22, 'rgba(243,241,234,0.22)');
  }
  const tilt = { x: 0, y: 0 };
  function desenhar(t) {
    medir(); pintar(t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cena);
    const un = Math.max(tela.width, tela.height) / 1200;
    gl.uniform2f(U('uResolution'), tela.width, tela.height); gl.uniform1f(U('uScale'), 34 * un); gl.uniform1f(U('uThickness'), 84 * un);
    gl.uniform1f(U('uRelief'), 1.2); gl.uniform1f(U('uAngle'), 0); gl.uniform1f(U('uDispersion'), 0.14); gl.uniform1f(U('uSpecular'), 0.32);
    gl.uniform2f(U('uParallax'), tilt.x, tilt.y); gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  if (calmo) { desenhar(8); return; }
  let raf = 0, visivel = false, n = 0;
  const leve = matchMedia('(pointer: coarse)').matches;   // no celular, a cena de trás se atualiza quadro sim, quadro não
  function quadro(ms) {
    raf = requestAnimationFrame(quadro);
    const ax = alvo.x * 0.12, ay = -alvo.y * 0.12, dx = ax - tilt.x, dy = ay - tilt.y;
    if (dx * dx + dy * dy < 0.0004) { tilt.x = ax; tilt.y = ay; } else { tilt.x += dx * 0.16; tilt.y += dy * 0.16; }
    if (leve && (n++ & 1)) return;
    desenhar(ms / 1000);
  }
  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; cancelAnimationFrame(raf); if (visivel) raf = requestAnimationFrame(quadro); }).observe(palco);
}

/* ---------- 2. relógio ---------- */
function relogio() {
  if (!dial || !dial.querySelector('.d-caixa')) return;
  const s = (nome, at, pai, antes) => { const e = document.createElementNS(NS, nome); for (const k in at) e.setAttribute(k, at[k]); if (antes) pai.insertBefore(e, antes); else pai.append(e); return e; };
  const defs = s('defs', {}, dial, dial.firstChild);
  const grad = (tipo, id, at, paradas) => { const g = s(tipo, { id, ...at }, defs); paradas.forEach(([o, cor, op]) => s('stop', { offset: o, 'stop-color': cor, ...(op === undefined ? {} : { 'stop-opacity': op }) }, g)); };
  grad('linearGradient', 'pa-caixa', { x1: 0, y1: 0, x2: 1, y2: 1 }, [[0, '#f6e7b4'], [0.3, '#c9a65c'], [0.55, '#7a5f25'], [0.8, '#e6cf94'], [1, '#8a6c2c']]);
  grad('radialGradient', 'pa-fundo', { cx: '42%', cy: '36%', r: '75%' }, [[0, '#1b7358'], [0.5, '#0c4a37'], [1, '#04140f']]);
  grad('radialGradient', 'pa-cristal', { cx: '50%', cy: '50%', r: '50%' }, [[0, '#ffffff', 0.34], [0.5, '#ffffff', 0.07], [1, '#ffffff', 0]]);
  grad('linearGradient', 'pa-ponteiro', { x1: 0, y1: 0, x2: 1, y2: 0 }, [[0, '#ffffff'], [0.5, '#d8d6cf'], [1, '#ffffff']]);
  dial.querySelector('.d-caixa').style.fill = 'url(#pa-caixa)';
  const fundo = dial.querySelector('.d-fundo'); fundo.style.fill = 'url(#pa-fundo)';
  const ph = dial.querySelector('.d-ph'); if (ph) ph.style.fill = 'url(#pa-ponteiro)';
  for (let i = 0; i < 120; i++) {   // aro canelado: riscos claros e escuros alternados
    const a = (i * 3 * Math.PI) / 180;
    s('line', { x1: 200 + Math.sin(a) * 183.5, y1: 200 - Math.cos(a) * 183.5, x2: 200 + Math.sin(a) * 194.5, y2: 200 - Math.cos(a) * 194.5, class: i % 2 ? 'd-canelado b' : 'd-canelado' }, dial, fundo);
  }
  fundo.setAttribute('r', '181');
  const cristal = s('ellipse', { cx: 150, cy: 130, rx: 150, ry: 120, class: 'd-cristal' }, dial); cristal.style.fill = 'url(#pa-cristal)';
  if (calmo) return;
  const atual = { x: 0, y: 0 };
  (function quadro() {
    requestAnimationFrame(quadro);
    const dx = alvo.x - atual.x, dy = alvo.y - atual.y; if (Math.abs(dx) + Math.abs(dy) < 0.0005) return;
    atual.x += dx * 0.09; atual.y += dy * 0.09;
    dial.style.transform = `rotateX(${(-atual.y * 7).toFixed(2)}deg) rotateY(${(atual.x * 9).toFixed(2)}deg)`;
    cristal.setAttribute('cx', (150 - atual.x * 70).toFixed(1)); cristal.setAttribute('cy', (130 - atual.y * 60).toFixed(1));
  })();
}

/* ---------- 3. títulos, linha por linha ---------- */
function titulos() {
  if (calmo || !('IntersectionObserver' in window)) return;
  const ver = new IntersectionObserver((itens) => {
    for (const item of itens) {
      if (!item.isIntersecting) continue; ver.unobserve(item.target);
      const h = item.target, linhas = new Map();
      h.querySelectorAll('.pal').forEach((p) => { const y = p.offsetTop; if (!linhas.has(y)) linhas.set(y, []); linhas.get(y).push(p); });
      [...linhas.values()].forEach((pals, i) => {
        let x = 0, v = 0, antes = 0;
        const passo = (t) => {
          if (!antes) antes = t; let dt = Math.min(0.032, (t - antes) / 1000); antes = t;
          for (; dt > 0; dt -= 0.004) { const k = Math.min(0.004, dt); v += (190 * (1 - x) - 26 * v) * k; x += v * k; }
          const k = Math.min(1, Math.max(0, x)), fim = Math.abs(1 - x) < 0.002 && Math.abs(v) < 0.02;
          pals.forEach((p) => { p.style.opacity = fim ? '' : String(k); p.style.filter = fim ? '' : `blur(${((1 - k) * 10).toFixed(2)}px)`; });
          if (!fim) requestAnimationFrame(passo);
        };
        setTimeout(() => requestAnimationFrame(passo), i * 90);
      });
    }
  }, { threshold: 0.15 });
  document.querySelectorAll('main h1, main h2').forEach((h) => {
    if (h.children.length) return;   // títulos com partes vivas (como o nome do cliente) ficam como estão
    const texto = h.textContent.trim(); h.setAttribute('aria-label', texto);
    h.replaceChildren(...texto.split(/\s+/).flatMap((p, i) => { const e = document.createElement('span'); e.className = 'pal'; e.setAttribute('aria-hidden', 'true'); e.textContent = p; e.style.cssText = 'display:inline-block;opacity:0;filter:blur(10px)'; return i ? [' ', e] : [e]; }));
    ver.observe(h);
  });
}

/* ---------- 4. luz nos cartões de modelo ---------- */
document.getElementById('recomendados')?.addEventListener('pointermove', (e) => {
  const li = e.target.closest('li'); if (!li) return; const r = li.getBoundingClientRect();
  li.style.setProperty('--lx', `${e.clientX - r.left}px`); li.style.setProperty('--ly', `${e.clientY - r.top}px`);
});

vidraca(); relogio(); titulos();
