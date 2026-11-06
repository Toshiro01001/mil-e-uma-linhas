/* Partes comuns do cardápio e da cozinha: guardar pedidos e avisar a outra aba. */
window.PACU = (function () {
  'use strict';
  var K_PEDIDOS = 'vitrine-cardapio:pedidos', K_CARRINHO = 'vitrine-cardapio:carrinho';
  var ETAPAS = [
    { id: 'novo', nome: 'Novo' }, { id: 'preparando', nome: 'Preparando' },
    { id: 'pronto', nome: 'Pronto' }, { id: 'entregue', nome: 'Entregue' }
  ];
  function ler(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function gravar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* segue só na memória */ } }
  function apagar(k) { try { localStorage.removeItem(k); } catch (e) { /* sem armazenamento */ } }
  function reais(v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
  function h(t, p) {
    var e = document.createElement(t), k, v, i;
    for (k in p || {}) {
      v = p[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (i = 2; i < arguments.length; i++) { if (arguments[i] !== null && arguments[i] !== undefined) e.append(arguments[i]); }
    return e;
  }
  function exemplo() {
    var agora = Date.now(), min = 60000;
    return [
      { id: 'ex1', num: 101, mesa: 'Mesa 3', nome: 'Beto', meu: false, etapa: 'preparando', criadoEm: agora - 14 * min, total: 96, itens: [{ nome: 'Pacu assado', qtd: 1, adicionais: ['Farofa de banana'], obs: 'Sem pimenta', subtotal: 84 }, { nome: 'Guaraná ralado', qtd: 1, adicionais: [], obs: '', subtotal: 12 }] },
      { id: 'ex2', num: 102, mesa: 'Mesa 7', nome: '', meu: false, etapa: 'novo', criadoEm: agora - 4 * min, total: 62, itens: [{ nome: 'Bolinho de arroz', qtd: 2, adicionais: [], obs: '', subtotal: 44 }, { nome: 'Suco de caju', qtd: 2, adicionais: [], obs: 'Pouco gelo', subtotal: 18 }] },
      { id: 'ex3', num: 100, mesa: 'Balcão', nome: 'Nair', meu: false, etapa: 'pronto', criadoEm: agora - 22 * min, total: 58, itens: [{ nome: 'Maria Isabel', qtd: 1, adicionais: [], obs: '', subtotal: 58 }] },
      { id: 'ex4', num: 99, mesa: 'Mesa 1', nome: '', meu: false, etapa: 'entregue', criadoEm: agora - 41 * min, total: 26, itens: [{ nome: 'Furrundu com queijo', qtd: 1, adicionais: [], obs: '', subtotal: 26 }] }
    ];
  }
  var pedidos = ler(K_PEDIDOS);
  if (!Array.isArray(pedidos)) { pedidos = exemplo(); gravar(K_PEDIDOS, pedidos); }
  var canal = null, ouvintes = [];
  function chegou(lista) { pedidos = lista; ouvintes.forEach(function (f) { f(lista); }); }
  try {
    canal = new BroadcastChannel('vitrine-cardapio');
    canal.onmessage = function (ev) { if (ev.data && Array.isArray(ev.data.pedidos)) chegou(ev.data.pedidos); };
  } catch (e) { canal = null; }
  function publicar() {
    gravar(K_PEDIDOS, pedidos);
    if (canal) canal.postMessage({ pedidos: pedidos });
  }
  return {
    ETAPAS: ETAPAS, h: h, reais: reais, K_CARRINHO: K_CARRINHO, ler: ler, gravar: gravar, apagar: apagar,
    lista: function () { return pedidos; },
    aoMudar: function (f) { ouvintes.push(f); },
    adicionar: function (p) {
      p.num = pedidos.reduce(function (m, x) { return Math.max(m, x.num); }, 100) + 1;
      pedidos = pedidos.concat([p]); publicar(); return p;
    },
    mudarEtapa: function (id, etapa) {
      pedidos = pedidos.map(function (x) { if (x.id === id) { x.etapa = etapa; } return x; }); publicar();
    },
    restaurar: function () { pedidos = exemplo(); publicar(); chegou(pedidos); }
  };
})();
