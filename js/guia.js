/* Aba que explica cada linguagem. Marcar aqui marca também no orçamento. */
window.MUL_GUIA = (function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var el = function (t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x !== undefined) e.textContent = x; return e; };
  var O = window.MUL_ORC, area = 'todas', pronto = false;
  function linha(rotulo, texto) { var p = el('p', 'lang-q'); p.appendChild(el('b', null, rotulo + ' ')); p.appendChild(document.createTextNode(texto)); return p; }
  function render() {
    var box = $('#gl-areas'), lista = $('#gl-lista'), ch = O.escolhidas();
    Array.prototype.forEach.call(box.children, function (b) { b.setAttribute('aria-pressed', b.dataset.area === area ? 'true' : 'false'); });
    lista.textContent = '';
    O.LINGUAGENS.filter(function (l) { return area === 'todas' || l.areas.indexOf(area) >= 0; }).forEach(function (l) {
      var c = el('article', 'lang'), on = ch.indexOf(l.id) >= 0;
      c.appendChild(el('h3', null, l.nome));
      c.appendChild(el('p', null, l.faz));
      c.appendChild(linha('Quando usar:', l.quando));
      c.appendChild(linha('Exemplo:', l.exemplo));
      c.appendChild(el('p', 'lang-tags', l.areas.map(function (a) { return O.AREAS[a]; }).join(', ') + (l.fator > 1 ? '. Acrescenta ' + Math.round((l.fator - 1) * 100) + '% ao projeto.' : '.')));
      var b = el('button', 'botao', on ? 'Marcada no orçamento' : 'Marcar no orçamento'); b.type = 'button';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.addEventListener('click', function () { O.alternar(l.id); });
      c.appendChild(b);
      lista.appendChild(c);
    });
    var n = ch.length;
    $('#gl-conta').textContent = !n ? 'Nenhuma marcada ainda.' : n + (n === 1 ? ' marcada' : ' marcadas') + ': ' + O.LINGUAGENS.filter(function (l) { return ch.indexOf(l.id) >= 0; }).map(function (l) { return l.nome; }).join(', ') + (n > O.INCLUSAS ? '. As ' + (n - O.INCLUSAS) + ' além das 2 incluídas somam ' + Math.round((n - O.INCLUSAS) * O.POR_EXTRA * 100) + '%.' : '.');
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
    O.aoMudar(render);
  }
  return { abrir: function (sub) { iniciar(); if (sub && O.AREAS[sub]) area = sub; render(); } };
})();
