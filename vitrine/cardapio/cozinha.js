/* Tela da cozinha: quatro colunas, atualizadas pelo BroadcastChannel quando chega pedido. */
(function () {
  'use strict';
  var P = window.PACU, h = P.h, ET = P.ETAPAS, conhecidos = {}, primeira = true;
  var ACAO = { novo: 'Começar preparo', preparando: 'Marcar pronto', pronto: 'Marcar entregue' };
  function $(id) { return document.getElementById(id); }
  function minutos(t) { return Math.max(0, Math.floor((Date.now() - t) / 60000)); }
  function comanda(x) {
    var i = ET.findIndex(function (e) { return e.id === x.etapa; });
    var novo = !primeira && !conhecidos[x.id];
    var c = h('article', { class: 'comanda' + (novo ? ' nova' : ''), 'data-id': x.id, 'data-num': x.num, 'aria-label': 'Pedido ' + x.num },
      h('div', { class: 'cab' }, h('b', { text: 'Nº ' + x.num }), h('span', { text: x.mesa + (x.nome ? ', ' + x.nome : '') })),
      h('small', { class: minutos(x.criadoEm) > 20 && i < 3 ? 'atraso tempo' : 'tempo', 'data-t': x.criadoEm, text: 'Há ' + minutos(x.criadoEm) + ' min' }));
    var ul = h('ul');
    x.itens.forEach(function (it) {
      ul.append(h('li', {}, h('strong', { text: it.qtd + 'x ' + it.nome }),
        it.adicionais.length ? h('small', { text: 'Com ' + it.adicionais.join(', ') }) : null,
        it.obs ? h('small', { class: 'obs', text: 'Obs.: ' + it.obs }) : null));
    });
    c.append(ul);
    var a = h('div', { class: 'acoes' });
    if (i > 0) a.append(h('button', { type: 'button', 'data-k': 'volta-' + x.id, text: 'Voltar', 'aria-label': 'Voltar pedido ' + x.num + ' para ' + ET[i - 1].nome, onclick: function () { mover(x.id, ET[i - 1].id); } }));
    if (i < 3) a.append(h('button', { type: 'button', class: 'segue', 'data-k': 'segue-' + x.id, text: ACAO[x.etapa], 'aria-label': ACAO[x.etapa] + ', pedido ' + x.num, onclick: function () { mover(x.id, ET[i + 1].id); } }));
    c.append(a);
    return c;
  }
  function mover(id, et) {
    P.mudarEtapa(id, et);
    desenhar();
    var n = document.querySelector('[data-k$="-' + CSS.escape(id) + '"].segue') || document.querySelector('[data-k$="-' + CSS.escape(id) + '"]');
    if (n) n.focus();
  }
  function desenhar() {
    var t = $('trilhos'), lista = P.lista();
    t.textContent = '';
    ET.forEach(function (e) {
      var doEt = lista.filter(function (x) { return x.etapa === e.id; }).sort(function (a, b) { return a.criadoEm - b.criadoEm; });
      if (e.id === 'entregue') doEt.reverse();
      var s = h('section', { class: 'trilho', 'data-etapa': e.id, 'aria-labelledby': 'tr-' + e.id },
        h('h2', { id: 'tr-' + e.id }, h('span', { text: e.nome }), h('span', { class: 'cont', text: String(doEt.length) })));
      if (!doEt.length) s.append(h('p', { class: 'nada', text: 'Nenhuma comanda aqui.' }));
      doEt.forEach(function (x) { s.append(comanda(x)); });
      t.append(s);
    });
    lista.forEach(function (x) { conhecidos[x.id] = true; });
    primeira = false;
    var abertos = lista.filter(function (x) { return x.etapa !== 'entregue'; }).length;
    $('coz-resumo').textContent = abertos + (abertos === 1 ? ' pedido em aberto' : ' pedidos em aberto');
  }
  setInterval(function () {
    document.querySelectorAll('.tempo').forEach(function (e) { e.textContent = 'Há ' + minutos(+e.getAttribute('data-t')) + ' min'; });
  }, 30000);
  P.aoMudar(desenhar);
  $('restaurar').addEventListener('click', function () { P.apagar(P.K_CARRINHO); P.restaurar(); });
  desenhar();
})();
