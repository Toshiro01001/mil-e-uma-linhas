/* Mil e Uma Linhas!  Três camadas de movimento, todas sem biblioteca:
   1. Luz do início: um brilho na cor de destaque que respira atrás do logo em ASCII (WebGL).
   2. Mural de projetos: as telas dos projetos em uma parede curva que passa devagar (canvas 2D).
   3. Títulos: as palavras sobem de trás de uma máscara quando a aba abre.
   Cada camada só trabalha enquanto está na tela e com a página visível.
   Para quem pede menos movimento: a luz e o mural viram um quadro parado e os títulos não se mexem. */
(function () {
  'use strict';
  var raiz = document.documentElement;
  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var economia = !!(navigator.connection && navigator.connection.saveData);
  if (!('IntersectionObserver' in window)) return;

  /* liga e desliga um laço de desenho conforme o elemento aparece na tela */
  function vigiar(el, aoLigar, aoDesligar) {
    var naTela = false, ligado = false;
    function conferir() {
      var deve = naTela && !document.hidden;
      if (deve === ligado) return;
      ligado = deve;
      if (deve) aoLigar(); else aoDesligar();
    }
    new IntersectionObserver(function (es) { naTela = es[es.length - 1].isIntersecting; conferir(); }, { rootMargin: '80px' }).observe(el);
    document.addEventListener('visibilitychange', conferir);
  }

  /* ---------- 1. luz do início ---------- */
  (function () {
    var hero = document.querySelector('#inicio .hero'), campo = document.getElementById('campo');
    if (!hero || !campo) return;
    var cv = document.createElement('canvas');
    cv.className = 'luz'; cv.setAttribute('aria-hidden', 'true');
    hero.insertBefore(cv, campo);
    var gl = null;
    try { gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' }); } catch (e) {}
    if (!gl) { hero.classList.add('luz-fixa'); cv.remove(); return; }   /* sem WebGL: um degradê parado no CSS */

    var VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
    var FS = [
      'precision mediump float;',
      'uniform vec2 r;uniform float t;uniform vec3 c;uniform vec2 p;uniform float k;',
      /* ruído simplex 2D (Ian McEwan, Ashima Arts, licença MIT) */
      'vec3 pm(vec3 x){return mod(((x*34.)+1.)*x,289.);}',
      'float sn(vec2 v){const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);',
      'vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);',
      'vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod(i,289.);',
      'vec3 q=pm(pm(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));',
      'vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);m=m*m;m=m*m;',
      'vec3 x=2.*fract(q*C.www)-1.;vec3 h=abs(x)-.5;vec3 ox=floor(x+.5);vec3 a0=x-ox;',
      'm*=1.79284291400159-.85373472095314*(a0*a0+h*h);',
      'vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.*dot(m,g);}',
      'float h12(vec2 q){vec3 p3=fract(vec3(q.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}',
      'void main(){',
      'vec2 uv=gl_FragCoord.xy/r;float as=r.x/r.y;',
      'vec2 o=vec2(sin(t),1.-cos(t));',                               /* volta ao começo sem emenda */
      'vec2 q=vec2(uv.x*as,uv.y)*1.3;',
      'vec2 w=vec2(sn(q+o*.3),sn(q+vec2(5.2,1.3)-o*.3))*.13;',       /* a luz se deforma devagar */
      'vec2 e=vec2(max(as,1.),max(1./as,1.));',                      /* mede pelo lado menor: no celular a luz não toma a tela toda */
      'vec2 d=(uv+w-p)*e;',
      'float g=pow(1.-smoothstep(0.,.78,length(d)),1.7);',            /* brilho principal, atrás do logo */
      'vec2 d2=(uv-w-vec2(1.-p.x,.12))*e;',
      'float g2=pow(1.-smoothstep(0.,.9,length(d2)),2.2);',           /* reflexo frio, mais fraco */
      'float f=dot(uv+w-.5,vec2(-.766,-.643))+.5;',                   /* faixa diagonal a 220 graus */
      'float i1=g*(.2+.07*f)*k;float i2=g2*.07*k;',
      'vec3 frio=mix(c,vec3(.45,.62,.95),.7);',
      'vec3 col=c*i1+frio*i2;float al=clamp(i1+i2,0.,1.);',
      'float n=(h12(gl_FragCoord.xy)+h12(gl_FragCoord.xy+41.7)-1.)/255.;',  /* tira as faixas do degradê */
      'gl_FragColor=vec4(col+n,al);}'
    ].join('\n');
    function sh(tipo, src) { var s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; }
    var v = sh(gl.VERTEX_SHADER, VS), f = sh(gl.FRAGMENT_SHADER, FS), prog = gl.createProgram();
    if (!v || !f) { hero.classList.add('luz-fixa'); cv.remove(); return; }
    gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { hero.classList.add('luz-fixa'); cv.remove(); return; }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var la = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(la); gl.vertexAttribPointer(la, 2, gl.FLOAT, false, 0, 0);
    var uR = gl.getUniformLocation(prog, 'r'), uT = gl.getUniformLocation(prog, 't'), uC = gl.getUniformLocation(prog, 'c'), uP = gl.getUniformLocation(prog, 'p'), uK = gl.getUniformLocation(prog, 'k');
    gl.clearColor(0, 0, 0, 0);

    var cor = [184, 243, 74], alvo = { x: .68, y: .6 }, pos = { x: .68, y: .6 }, forca = 1, t = 0, raf = 0, ultimo = 0, acc = 0, perdido = false;
    function lerCor() {
      var c = getComputedStyle(raiz).getPropertyValue('--verde-rgb').trim().split(',').map(Number);
      if (c.length === 3 && !c.some(isNaN)) cor = c;
    }
    function centro() { var e = hero.clientWidth < 901; alvo.x = e ? .78 : .68; alvo.y = e ? .86 : .6; forca = e ? .7 : 1; }   /* no celular: mais fraca e no canto de cima, longe do texto */
    function medir() {
      /* a luz é um degradê suave: metade da resolução basta e poupa bateria */
      var w = Math.max(2, Math.round(cv.clientWidth * .5)), h = Math.max(2, Math.round(cv.clientHeight * .5));
      var m = Math.max(w, h); if (m > 800) { w = Math.round(w * 800 / m); h = Math.round(h * 800 / m); }
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
    }
    function pintar() {
      if (perdido) return;
      medir();
      gl.uniform2f(uR, cv.width, cv.height); gl.uniform1f(uT, t);
      gl.uniform3f(uC, cor[0] / 255, cor[1] / 255, cor[2] / 255); gl.uniform2f(uP, pos.x, pos.y); gl.uniform1f(uK, forca);
      gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function quadro(ts) {
      raf = requestAnimationFrame(quadro);
      var dt = ultimo ? Math.min(.1, (ts - ultimo) / 1000) : 0; ultimo = ts; acc += dt;
      if (acc < 1 / 30) return;                                       /* 30 quadros por segundo */
      t = (t + acc * .26) % 6.2831853; acc = 0;                        /* uma volta completa a cada 24 s */
      pos.x += (alvo.x - pos.x) * .04; pos.y += (alvo.y - pos.y) * .04;
      pintar();
    }
    function ligar() { if (calmo || economia) { pintar(); return; } if (!raf) { ultimo = 0; raf = requestAnimationFrame(quadro); } }
    function desligar() { if (raf) cancelAnimationFrame(raf); raf = 0; }
    cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); perdido = true; desligar(); cv.style.display = 'none'; hero.classList.add('luz-fixa'); });
    window.addEventListener('mul:acento', function () { lerCor(); if (!raf) pintar(); });
    window.addEventListener('resize', function () { centro(); if (!raf) pintar(); });
    /* no computador a luz se inclina de leve para onde o mouse está */
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !calmo) {
      hero.addEventListener('pointermove', function (e) {
        var b = hero.getBoundingClientRect(); centro();
        alvo.x += ((e.clientX - b.left) / b.width - alvo.x) * .25;
        alvo.y += (1 - (e.clientY - b.top) / b.height - alvo.y) * .25;
      });
      hero.addEventListener('pointerleave', centro);
    }
    lerCor(); centro(); pos.x = alvo.x; pos.y = alvo.y; t = 1.1;
    vigiar(hero, ligar, desligar);
  })();

  /* ---------- 2. mural de projetos ---------- */
  (function () {
    var aba = document.getElementById('projetos'), cab = aba && aba.querySelector('.aba-cab');
    if (!cab) return;
    var fontes = [], visto = {};
    Array.prototype.forEach.call(aba.querySelectorAll('.proj-img img'), function (im) {
      var s = im.getAttribute('src');
      if (s && !visto[s] && fontes.length < 14) { visto[s] = 1; fontes.push(s); }
    });
    if (fontes.length < 4) return;
    var caixa = document.createElement('div'); caixa.className = 'mural-proj'; caixa.setAttribute('aria-hidden', 'true');
    var cv = document.createElement('canvas'); caixa.appendChild(cv);
    cab.parentNode.insertBefore(caixa, cab.nextSibling);
    var ctx = cv.getContext('2d'), imgs = [], carregou = false, raf = 0, ultimo = 0, giro = .4, acc = 0;

    function carregar() {                                              /* só baixa as telas quando a aba é aberta */
      if (carregou) return; carregou = true;
      fontes.forEach(function (s, i) {
        var im = new Image(); im.decoding = 'async';
        im.onload = function () { imgs[i] = im; if (!raf) pintar(); };
        im.src = s;
      });
    }
    function medir() {
      var d = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(2, Math.round(caixa.clientWidth * d)), h = Math.max(2, Math.round(caixa.clientHeight * d));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    }
    function pintar() {
      medir();
      var W = cv.width, H = cv.height, n = fontes.length;
      ctx.clearRect(0, 0, W, H);
      var filas = 2;                                                   /* duas fileiras: as telas ficam grandes o bastante para ler */
      var folga = H * .035, ah = (H * 1.02 - folga * (filas - 1)) / filas, aw = ah * 1.6;
      var base = Math.max(W, H * 3.2), R = base * .5, D = base * .62; /* parede côncava: as bordas vêm para perto */
      var passo = (aw + folga) / R, cx = W / 2, cy = H / 2, FATIAS = 28;
      function xDe(a) { return cx + R * Math.sin(a) * (D / (D - R * (1 - Math.cos(a)))); }
      for (var f = 0; f < filas; f++) {
        var desloc = giro + f * passo * .5;                            /* cada fileira meio cartão adiante da outra */
        var k0 = Math.floor((desloc - 1.15) / passo), k1 = Math.ceil((desloc + 1.15) / passo);
        var py = (f - (filas - 1) / 2) * (ah + folga);
        for (var k = k0; k <= k1; k++) {
          var a0 = k * passo - desloc, a1 = a0 + aw / R;
          if (a1 < -1.2 || a0 > 1.2) continue;
          if (xDe(a1) < -4 || xDe(a0) > W + 4) continue;
          var im = imgs[(((k * filas + f) % n) + n) % n];
          var da = (a1 - a0) / FATIAS;
          for (var s = 0; s < FATIAS; s++) {
            var b0 = a0 + s * da, b1 = b0 + da, bm = (b0 + b1) / 2;
            var esc = D / (D - R * (1 - Math.cos(bm)));
            var x0 = xDe(b0), x1 = xDe(b1), hh = ah * esc, y = cy + py * esc - hh / 2;
            if (im) ctx.drawImage(im, im.naturalWidth * s / FATIAS, 0, im.naturalWidth / FATIAS, im.naturalHeight, x0, y, x1 - x0 + .7, hh);
            else { ctx.fillStyle = 'rgba(127,138,150,.14)'; ctx.fillRect(x0, y, x1 - x0 + .7, hh); }
          }
        }
      }
    }
    function quadro(ts) {
      raf = requestAnimationFrame(quadro);
      var dt = ultimo ? Math.min(.1, (ts - ultimo) / 1000) : 0; ultimo = ts; acc += dt;
      if (acc < 1 / 30) return;
      giro += acc * .022; acc = 0;                                     /* devagar: uma tela leva uns 12 s para cruzar */
      pintar();
    }
    function ligar() { carregar(); if (calmo || economia) { pintar(); return; } if (!raf) { ultimo = 0; raf = requestAnimationFrame(quadro); } }
    function desligar() { if (raf) cancelAnimationFrame(raf); raf = 0; }
    window.addEventListener('resize', function () { if (!raf && carregou) pintar(); });
    vigiar(caixa, ligar, desligar);
  })();

  /* ---------- 3. títulos ---------- */
  (function () {
    if (calmo || !Element.prototype.animate) return;
    /* mola (tensão 220, atrito 24) calculada uma vez e entregue ao navegador como quadros prontos */
    var quadros = [], x = 0, vel = 0, passo = 1 / 120, tempo = 0;
    while (tempo < 2 && (Math.abs(1 - x) > .0008 || Math.abs(vel) > .004)) {
      for (var i = 0; i < 2; i++) { vel += (220 * (1 - x) - 24 * vel) * passo; x += vel * passo; tempo += passo; }
      quadros.push({ transform: 'translateY(' + ((1 - x) * 110).toFixed(2) + '%)' });
    }
    quadros.unshift({ transform: 'translateY(110%)' });
    quadros.push({ transform: 'translateY(0%)' });
    var duracao = Math.round(tempo * 1000);

    var titulos = document.querySelectorAll('.slogan, .aba-cab h2');
    var olho = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        olho.unobserve(e.target);                                      /* cada título entra uma vez por visita */
        var ps = e.target.querySelectorAll('.pv-i');
        Array.prototype.forEach.call(ps, function (p, i) { p.animate(quadros, { duration: duracao, delay: i * 45, fill: 'backwards', easing: 'linear' }); });
        e.target.classList.add('pv-ok');
      });
    });
    Array.prototype.forEach.call(titulos, function (h) {
      var partes = h.querySelectorAll(':scope > span'), ok = partes.length > 0;
      Array.prototype.forEach.call(partes, function (s) { if (s.children.length) ok = false; });
      if (!ok) return;
      Array.prototype.forEach.call(partes, function (s) {
        var palavras = s.textContent.trim().split(/\s+/);
        s.textContent = '';
        palavras.forEach(function (p, i) {
          var fora = document.createElement('span'), dentro = document.createElement('span');
          fora.className = 'pv'; dentro.className = 'pv-i'; dentro.textContent = p;
          fora.appendChild(dentro); s.appendChild(fora);
          if (i < palavras.length - 1) s.appendChild(document.createTextNode(' '));
        });
      });
      h.classList.add('pv-on');
      olho.observe(h);
    });
  })();
})();
