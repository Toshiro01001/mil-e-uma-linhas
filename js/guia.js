/* Aba que explica cada linguagem. É só informação: quem escolhe a linguagem de cada projeto é a Mil e Uma Linhas!. */
window.MUL_GUIA = (function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var el = function (t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x !== undefined) e.textContent = x; return e; };
  var O = window.MUL_ORC, area = 'todas', pronto = false;
  function linha(rotulo, texto) { var p = el('p', 'lang-q'); p.appendChild(el('b', null, rotulo + ' ')); p.appendChild(document.createTextNode(texto)); return p; }
  function render() {
    var box = $('#gl-areas'), lista = $('#gl-lista');
    Array.prototype.forEach.call(box.children, function (b) { b.setAttribute('aria-pressed', b.dataset.area === area ? 'true' : 'false'); });
    lista.textContent = '';
    O.LINGUAGENS.filter(function (l) { return area === 'todas' || l.areas.indexOf(area) >= 0; }).forEach(function (l) {
      var c = el('article', 'lang');
      c.appendChild(el('h3', null, l.nome));
      c.appendChild(el('p', null, l.faz));
      c.appendChild(linha('Quando usar:', l.quando));
      c.appendChild(linha('Exemplo:', l.exemplo));
      c.appendChild(el('p', 'lang-tags', l.areas.map(function (a) { return O.AREAS[a]; }).join(', ') + (l.consulta ? '. Usada quando o projeto pede.' : '.')));
      lista.appendChild(c);
    });
    $('#gl-conta').textContent = 'Você não precisa escolher: eu escolho a linguagem certa para cada projeto e explico o porquê na conversa.';
  }
  function iniciar() {
    if (pronto) return;
    pronto = true;
    var box = $('#gl-areas');
    [['todas', 'Todas']].concat(Object.keys(O.AREAS).map(function (k) { return [k, O.AREAS[k]]; })).forEach(function (a) {
      var b = el('button', 'pilula', a[1]); b.type = 'button'; b.dataset.area = a[0];
      b.addEventListener('click', function () { area = a[0]; render(); });
      box.appendChild(b);
    });
  }
  return { abrir: function (sub) { iniciar(); if (sub && O.AREAS[sub]) area = sub; render(); } };
})();
