/* Mil e Uma Linhas!  Assinatura RTJ viva.
   Dentro das letras do RTJ correm fibras vermelhas, desenhadas por um shader pequeno em WebGL.
   Passar o mouse ou o dedo por perto "penteia" as fibras.
   Só desenha enquanto a assinatura está na tela e a aba está aberta.
   Sem WebGL, ou com "menos movimento" ligado, fica a imagem parada (img/marca/rtj.svg). */
(function () {
  'use strict';
  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)');
  var VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  var FRAG = [
    'precision mediump float;',
    'uniform vec2 r;uniform float t;uniform vec4 p;',
    'float h(vec2 v){return fract(sin(dot(v,vec2(127.1,311.7)))*43758.5453);}',
    'float n(vec2 v){vec2 i=floor(v),f=fract(v);f=f*f*(3.-2.*f);',
    ' return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}',
    'float fb(vec2 v){return .55*n(v)+.3*n(v*2.03+7.)+.15*n(v*4.1+19.);}',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/r;float asp=r.x/r.y;',
    ' vec2 q=vec2(uv.x*asp,uv.y);',
    ' vec2 d=q-vec2(p.x*asp,p.y);',
    ' float inf=exp(-dot(d,d)*7.)*p.w;',
    /* o pente: perto do ponteiro as fibras deitam para o lado do movimento e abrem */
    ' q.x+=inf*(p.z*.55+d.x*.9);',
    ' float x=q.x+.16*sin(q.y*2.6+t*.55+q.x*1.7)+.22*fb(vec2(q.x*1.3,q.y*1.1-t*.22));',
    ' float f=fb(vec2(x*15.,q.y*.5-t*.16+inf*.6));',
    ' float g=fb(vec2(x*38.,q.y*.8-t*.3));',
    ' f=f*.72+g*.28;',
    ' vec3 escuro=vec3(.29,.05,.07),verm=vec3(.91,.2,.17),claro=vec3(1.,.97,.95);',
    ' vec3 c=mix(escuro,verm,smoothstep(.3,.5,f));',
    ' c=mix(c,claro,smoothstep(.56,.62,f));',
    ' c*=.88+.12*sin(x*90.);',
    ' gl_FragColor=vec4(c,1.);}'
  ].join('\n');

  var vivos = [], rodando = 0;

  function montar(el) {
    if (el.rtjFeito) return;
    el.rtjFeito = true;
    if (calmo.matches) return;
    var cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    var gl = null;
    try { gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' }); } catch (e) {}
    if (!gl) return;
    function sh(tipo, src) { var s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; }
    var v = sh(gl.VERTEX_SHADER, VERT), f = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!v || !f) return;
    var pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var a = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    var o = { el: el, cv: cv, gl: gl, uR: gl.getUniformLocation(pr, 'r'), uT: gl.getUniformLocation(pr, 't'), uP: gl.getUniformLocation(pr, 'p'),
      visto: false, px: .5, py: .5, dir: 0, forca: 0, ux: null };
    cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); el.classList.remove('rtj-on'); o.morto = true; });
    el.appendChild(cv);
    el.classList.add('rtj-on');
    vivos.push(o);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { o.visto = es[0].isIntersecting; ligar(); }, { rootMargin: '80px' }).observe(el);
    } else { o.visto = true; }
    ligar();
  }

  function medir(o) {
    var b = o.el.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(2, Math.round(b.width * dpr)), h = Math.max(2, Math.round(b.height * dpr));
    if (o.cv.width !== w || o.cv.height !== h) { o.cv.width = w; o.cv.height = h; o.gl.viewport(0, 0, w, h); }
    return b;
  }

  function quadro(agora) {
    rodando = 0;
    var algum = false;
    for (var i = 0; i < vivos.length; i++) {
      var o = vivos[i];
      if (o.morto || !o.visto || !o.el.isConnected) continue;
      algum = true;
      medir(o);
      o.forca *= 0.955; o.dir *= 0.93;
      o.gl.uniform2f(o.uR, o.cv.width, o.cv.height);
      o.gl.uniform1f(o.uT, agora / 1000);
      o.gl.uniform4f(o.uP, o.px, o.py, o.dir, o.forca);
      o.gl.drawArrays(o.gl.TRIANGLES, 0, 3);
    }
    if (algum && !document.hidden) rodando = requestAnimationFrame(quadro);
  }
  function ligar() { if (!rodando && !document.hidden) rodando = requestAnimationFrame(quadro); }

  function ponteiro(e) {
    for (var i = 0; i < vivos.length; i++) {
      var o = vivos[i];
      if (o.morto || !o.visto) continue;
      var b = o.el.getBoundingClientRect(), folga = 70;
      if (e.clientX < b.left - folga || e.clientX > b.right + folga || e.clientY < b.top - folga || e.clientY > b.bottom + folga) { o.ux = null; continue; }
      var x = (e.clientX - b.left) / b.width, y = 1 - (e.clientY - b.top) / b.height;
      if (o.ux !== null) o.dir = Math.max(-1, Math.min(1, o.dir + (e.clientX - o.ux) / 40));
      o.ux = e.clientX; o.px = x; o.py = y; o.forca = 1;
    }
  }
  window.addEventListener('pointermove', ponteiro, { passive: true });
  window.addEventListener('pointerdown', ponteiro, { passive: true });
  document.addEventListener('visibilitychange', ligar);

  function varrer(raiz) {
    if (!raiz.querySelectorAll) return;
    if (raiz.classList && raiz.classList.contains('rtj-vivo')) montar(raiz);
    var l = raiz.querySelectorAll('.rtj-vivo');
    for (var i = 0; i < l.length; i++) montar(l[i]);
  }
  varrer(document);
  if ('MutationObserver' in window) {
    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) for (var j = 0; j < ms[i].addedNodes.length; j++) varrer(ms[i].addedNodes[j]);
    }).observe(document.body, { childList: true, subtree: true });
  }
})();
