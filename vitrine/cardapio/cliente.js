/* Cardápio do Pacu Gordo: categorias, prato com adicionais e observações, carrinho e envio. */
(function () {
  'use strict';
  var P = window.PACU, h = P.h, reais = P.reais;
  var FARTURA = [{ id: 'farofa', nome: 'Farofa de banana', preco: 9 }, { id: 'pirao', nome: 'Pirão de peixe', preco: 11 }, { id: 'vinag', nome: 'Vinagrete', preco: 6 }];
  var CATEGORIAS = [
    { id: 'petiscos', nome: 'Petiscos', pratos: [
      { id: 'bolinho', nome: 'Bolinho de arroz', preco: 22, desc: 'Porção com seis, feito na hora.', adic: [{ id: 'queijo', nome: 'Queijo por dentro', preco: 7 }] },
      { id: 'mojica', nome: 'Mojica de pintado', preco: 38, desc: 'Caldo de pintado com mandioca, para dividir.', adic: [{ id: 'pimenta', nome: 'Pimenta de cheiro', preco: 3 }] },
      { id: 'ventrecha', nome: 'Ventrecha de pacu', preco: 46, desc: 'Costelinha de pacu frita, com limão.', adic: FARTURA }
    ] },
    { id: 'pratos', nome: 'Pratos', pratos: [
      { id: 'pacu', nome: 'Pacu assado', preco: 75, desc: 'Inteiro, recheado com farofa. Serve duas pessoas.', adic: FARTURA },
      { id: 'pintado', nome: 'Pintado na telha', preco: 79, desc: 'Em lascas, com molho de tomate e banana-da-terra.', adic: FARTURA },
      { id: 'maria', nome: 'Maria Isabel', preco: 58, desc: 'Arroz com carne seca e cheiro-verde.', adic: [{ id: 'ovo', nome: 'Ovo frito', preco: 5 }, { id: 'banana', nome: 'Banana frita', preco: 6 }] }
    ] },
    { id: 'bebidas', nome: 'Bebidas', pratos: [
      { id: 'guarana', nome: 'Guaraná ralado', preco: 12, desc: 'Gelado, com o guaraná ralado na hora.', adic: [] },
      { id: 'caju', nome: 'Suco de caju', preco: 9, desc: 'Copo de 300 ml.', adic: [] },
      { id: 'agua', nome: 'Água de coco', preco: 10, desc: 'Garrafa de 300 ml.', adic: [] }
    ] },
    { id: 'doces', nome: 'Doces', pratos: [
      { id: 'furrundu', nome: 'Furrundu com queijo', preco: 26, desc: 'Doce de mamão verde com rapadura e queijo fresco.', adic: [] },
      { id: 'pudim', nome: 'Pudim de leite', preco: 18, desc: 'A fatia.', adic: [{ id: 'calda', nome: 'Calda de pequi', preco: 4 }] }
    ] }
  ];
  function $(id) { return document.getElementById(id); }
  var carrinho = P.ler(P.K_CARRINHO);
  if (!Array.isArray(carrinho)) carrinho = [];
  var atual = null, qtd = 1;

  function desenharMenu() {
    var nav = $('categorias'), menu = $('menu');
    CATEGORIAS.forEach(function (c) {
      nav.append(h('a', { href: '#cat-' + c.id, text: c.nome }));
      var s = h('section', { id: 'cat-' + c.id, 'aria-labelledby': 't-' + c.id }, h('h2', { id: 't-' + c.id, text: c.nome }));
      c.pratos.forEach(function (p) {
        s.append(h('button', { type: 'button', class: 'prato', 'data-prato': p.id, onclick: function () { abrir(p); } },
          h('span', { class: 'topo-prato' }, h('span', { text: p.nome }), h('span', { class: 'pontos' }), h('span', { text: reais(p.preco) })),
          h('small', { text: p.desc })));
      });
      menu.append(s);
    });
    nav.append(h('a', { href: '#como', text: 'Como isto funciona' }));
    var m = $('mesa');
    m.append(h('option', { value: '', text: 'Escolha a mesa' }));
    for (var i = 1; i <= 12; i++) m.append(h('option', { value: 'Mesa ' + i, text: 'Mesa ' + i }));
    m.append(h('option', { value: 'Balcão', text: 'Balcão' }));
  }
  function totalAtual() {
    var extra = 0;
    document.querySelectorAll('#d-adic-lista input:checked').forEach(function (c) { extra += +c.value; });
    return (atual.preco + extra) * qtd;
  }
  function atualizarDialogo() {
    $('d-qtd').textContent = String(qtd);
    $('d-add').textContent = 'Adicionar ' + reais(totalAtual());
    $('d-menos').disabled = qtd <= 1;
  }
  function abrir(p) {
    atual = p; qtd = 1;
    $('d-nome').textContent = p.nome;
    $('d-desc').textContent = p.desc + ' ' + reais(p.preco) + ' cada.';
    $('d-obs').value = '';
    var l = $('d-adic-lista');
    l.textContent = '';
    $('d-adic').hidden = !p.adic.length;
    p.adic.forEach(function (a) {
      var c = h('input', { type: 'checkbox', value: a.preco, 'data-nome': a.nome, onchange: atualizarDialogo });
      l.append(h('label', { class: 'adic' }, c, h('span', { text: a.nome }), h('span', { text: '+ ' + reais(a.preco) })));
    });
    atualizarDialogo();
    $('prato').showModal();
  }
  function salvarCarrinho() { P.gravar(P.K_CARRINHO, carrinho); }
  function desenharCarrinho() {
    var c = $('carrinho');
    c.textContent = '';
    var total = 0, itens = 0;
    if (!carrinho.length) c.append(h('p', { class: 'vazio', text: 'Vazio por enquanto. Toque em um prato do cardápio para começar.' }));
    carrinho.forEach(function (it, i) {
      total += it.subtotal; itens += it.qtd;
      c.append(h('div', { class: 'item' },
        h('p', { class: 'l1' }, h('span', { text: it.qtd + 'x ' + it.nome }), h('span', { text: reais(it.subtotal) })),
        it.adicionais.length ? h('small', { text: 'Com ' + it.adicionais.join(', ') }) : null,
        it.obs ? h('small', { text: 'Obs.: ' + it.obs }) : null,
        h('div', { class: 'acoes' },
          h('button', { type: 'button', text: '-', 'aria-label': 'Tirar um de ' + it.nome, onclick: function () { mudarQtd(i, -1); } }),
          h('button', { type: 'button', text: '+', 'aria-label': 'Mais um de ' + it.nome, onclick: function () { mudarQtd(i, 1); } }),
          h('button', { type: 'button', text: 'Remover', 'aria-label': 'Remover ' + it.nome, onclick: function () { carrinho.splice(i, 1); mudou(); $('t-pedido').focus(); } }))));
    });
    if (carrinho.length) c.append(h('p', { class: 'soma' }, h('span', { text: 'Total' }), h('span', { id: 'total', text: reais(total) })));
    var b = $('barra');
    b.hidden = !carrinho.length;
    b.textContent = 'Ver pedido: ' + itens + (itens === 1 ? ' item, ' : ' itens, ') + reais(total);
    document.body.classList.toggle('tem-itens', carrinho.length > 0);
  }
  function mudarQtd(i, d) {
    var it = carrinho[i], un = it.subtotal / it.qtd;
    it.qtd += d;
    if (it.qtd < 1) carrinho.splice(i, 1); else it.subtotal = un * it.qtd;
    mudou();
    $('t-pedido').focus();
  }
  function mudou() { salvarCarrinho(); desenharCarrinho(); }
  function desenharAcompanhar() {
    var a = $('acompanhar');
    a.textContent = '';
    var meus = P.lista().filter(function (x) { return x.meu; }).slice().reverse();
    if (!meus.length) { a.append(h('p', { class: 'vazio', text: 'Depois de enviar, a etapa do pedido aparece aqui sozinha.' })); return; }
    meus.forEach(function (x) {
      var idx = P.ETAPAS.findIndex(function (e) { return e.id === x.etapa; });
      var ol = h('ol', { class: 'etapas' });
      P.ETAPAS.forEach(function (e, i) {
        ol.append(h('li', { class: i === idx ? 'atual' : i < idx ? 'feita' : null, 'aria-current': i === idx ? 'step' : null, text: e.nome }));
      });
      a.append(h('div', { class: 'status', 'data-num': x.num, 'data-etapa': x.etapa }, h('p', { text: 'Pedido ' + x.num + ', ' + x.mesa + ': ' + P.ETAPAS[idx].nome }), ol));
    });
  }
  $('t-pedido').setAttribute('tabindex', '-1');
  $('d-menos').addEventListener('click', function () { if (qtd > 1) { qtd--; atualizarDialogo(); } });
  $('d-mais').addEventListener('click', function () { if (qtd < 20) { qtd++; atualizarDialogo(); } });
  $('d-fechar').addEventListener('click', function () { $('prato').close(); });
  $('prato').addEventListener('click', function (e) { if (e.target === this) this.close(); });
  $('form-prato').addEventListener('submit', function (e) {
    e.preventDefault();
    var nomes = [];
    document.querySelectorAll('#d-adic-lista input:checked').forEach(function (c) { nomes.push(c.getAttribute('data-nome')); });
    carrinho.push({ nome: atual.nome, qtd: qtd, adicionais: nomes, obs: $('d-obs').value.trim(), subtotal: totalAtual() });
    mudou();
    $('prato').close();
    $('aviso').textContent = atual.nome + ' adicionado ao pedido.';
  });
  $('form-pedido').addEventListener('submit', function (e) {
    e.preventDefault();
    var erro = $('erro');
    if (!carrinho.length) { erro.textContent = 'O pedido está vazio. Escolha um prato primeiro.'; return; }
    if (!$('mesa').value) { erro.textContent = 'Escolha a mesa para a cozinha saber onde entregar.'; $('mesa').focus(); return; }
    erro.textContent = '';
    var total = carrinho.reduce(function (s, i) { return s + i.subtotal; }, 0);
    var p = P.adicionar({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), mesa: $('mesa').value, nome: $('nome').value.trim(), meu: true, etapa: 'novo', criadoEm: Date.now(), total: total, itens: carrinho });
    carrinho = [];
    mudou();
    desenharAcompanhar();
    $('aviso').textContent = 'Pedido ' + p.num + ' enviado para a cozinha.';
    $('t-pedido').focus();
  });
  $('restaurar').addEventListener('click', function () {
    P.apagar(P.K_CARRINHO);
    carrinho = [];
    $('erro').textContent = '';
    $('mesa').value = ''; $('nome').value = '';
    P.restaurar();
    desenharCarrinho();
    $('aviso').textContent = 'Dados de exemplo restaurados.';
  });
  P.aoMudar(desenharAcompanhar);
  desenharMenu();
  desenharCarrinho();
  desenharAcompanhar();
})();
