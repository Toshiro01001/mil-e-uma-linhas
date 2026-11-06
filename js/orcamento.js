/* Montador de orçamento. Para mudar preços, edite só a lista PEDIDOS abaixo.
   Cada faixa é [mínimo, máximo] em reais. Nada é enviado: o resumo só sai se a pessoa abrir o e-mail. */
window.MUL_ORC = (function () {
  'use strict';
  var EMAIL = 'contato@mileumalinhas.com.br';
  var PEDIDOS = {
    site: {
      nome: 'Site', planos: [
        { nome: 'Essencial', desc: 'Uma página com seus serviços e botão de contato. Pronta em 7 dias depois de receber textos e fotos.', faixa: [600, 1200] },
        { nome: 'Profissional', desc: 'Até 5 páginas, formulário e aparência própria da sua marca.', faixa: [1500, 3000] },
        { nome: 'Completo', desc: 'Loja virtual ou área do cliente simples.', faixa: [3500, 8000] }
      ],
      extras: [
        { nome: 'Página a mais', faixa: [150, 300] }, { nome: 'Agendamento online', faixa: [400, 900] },
        { nome: 'Escrita dos textos', faixa: [200, 500] }, { nome: 'Otimização para o Google', faixa: [150, 400] }
      ]
    },
    sistema: {
      nome: 'Sistema', planos: [
        { nome: 'Pequeno', desc: 'Um cadastro principal, como pedidos ou clientes, com busca e relatório simples.', faixa: [2500, 5000] },
        { nome: 'Médio', desc: 'Vários cadastros, login e permissões por usuário, relatórios.', faixa: [6000, 15000] },
        { nome: 'Grande', desc: 'Regras complexas, integrações e muitos perfis de acesso.', faixa: [18000, 40000] }
      ],
      extras: [
        { nome: 'Integração com outro sistema', faixa: [1000, 4000] }, { nome: 'Importar planilhas ou banco antigo', faixa: [500, 2000] },
        { nome: 'Relatórios em PDF ou Excel', faixa: [400, 1500] }, { nome: 'Versão instalável no celular', faixa: [1500, 5000] }
      ]
    },
    vendas: {
      nome: 'Vendas automatizadas', planos: [
        { nome: 'Básico', desc: 'Respostas automáticas e coleta de dados do interessado.', faixa: [500, 1200] },
        { nome: 'Funil', desc: 'Página, perguntas de qualificação e aviso para quem vende.', faixa: [1500, 3500] },
        { nome: 'Integrado', desc: 'Liga o funil ao seu cadastro de clientes ou ao pagamento.', faixa: [4000, 9000] }
      ],
      extras: [
        { nome: 'Acompanhamento mensal', faixa: [200, 500], mensal: true }, { nome: 'Página de vendas', faixa: [600, 1500] }
      ]
    },
    trafego: {
      nome: 'Tráfego pago', planos: [
        { nome: 'Início', desc: 'Uma plataforma e verba de anúncios de até R$ 3.000 por mês.', faixa: [500, 1200], mensal: true },
        { nome: 'Crescimento', desc: 'Até duas plataformas e verba de até R$ 10.000 por mês.', faixa: [1200, 2000], mensal: true },
        { nome: 'Completo', desc: 'Várias campanhas, testes contínuos e relatório semanal.', faixa: [2000, 3500], mensal: true }
      ],
      extras: [
        { nome: 'Configuração inicial das contas', faixa: [500, 1000] }, { nome: 'Página de destino', faixa: [600, 1500] }
      ],
      nota: 'A verba de anúncios é paga direto na plataforma e não entra nesta conta. Resultados não são garantidos.'
    },
    freelance: {
      nome: 'Programação freelance', horas: true, planos: [
        { nome: 'Ajustes', desc: 'Correções e manutenção em um código que já existe.', faixa: [60, 90] },
        { nome: 'Novas funções', desc: 'Partes novas em um projeto da sua equipe.', faixa: [80, 120] },
        { nome: 'Especializado', desc: 'Banco de dados, integrações, C ou C++.', faixa: [100, 150] }
      ],
      extras: [],
      nota: 'Valor por hora vezes as horas escolhidas.'
    },
    medida: {
      nome: 'Projeto sob medida', planos: [
        { nome: 'Diagnóstico', desc: 'Conversa e documento com escopo, prazo e custo do projeto.', faixa: [300, 800] },
        { nome: 'Protótipo', desc: 'Uma primeira versão que funciona, para testar a ideia.', faixa: [2000, 6000] },
        { nome: 'Projeto completo', desc: 'Da ideia à entrega, em etapas combinadas.', faixa: [8000, 30000] }
      ],
      extras: [
        { nome: 'Banco de dados', faixa: [500, 2000] }, { nome: 'Versão para celular', faixa: [1500, 5000] }, { nome: 'Treinamento da equipe', faixa: [300, 800] }
      ]
    }
  };
  var TEC = [
    ['A escolha fica com a gente', 1], ['JavaScript', 1], ['Python', 1], ['PHP', 1], ['SQL (foco em banco de dados)', 1], ['Java', 1.1], ['C', 1.2], ['C++', 1.2]
  ];

  var $ = function (s) { return document.querySelector(s); };
  var el = function (t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x !== undefined) e.textContent = x; return e; };
  var reais = function (v) { return Math.round(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); };
  var faixaTxt = function (f) { return reais(f[0]) + ' a ' + reais(f[1]); };
  var redondo = function (v) { return Math.round(v / 10) * 10; };

  var tipo = 'site', plano = 0, marcados = {}, carrinho = [], pronto = false, ouvintes = [];

  function calcular(t, p, marc, horas, tecM, prazoM) {
    var P = PEDIDOS[t], pl = P.planos[p], un = [0, 0], me = [0, 0];
    var alvo = pl.mensal ? me : un;
    var q = P.horas ? horas : 1;
    alvo[0] += pl.faixa[0] * q; alvo[1] += pl.faixa[1] * q;
    (P.extras || []).forEach(function (x, i) {
      if (!marc[i]) return;
      var a = x.mensal ? me : un;
      a[0] += x.faixa[0]; a[1] += x.faixa[1];
    });
    var m = tecM * prazoM;
    return { unico: [redondo(un[0] * m), redondo(un[1] * m)], mensal: [redondo(me[0] * m), redondo(me[1] * m)] };
  }
  function valorTxt(v) {
    var partes = [];
    if (v.unico[1]) partes.push(faixaTxt(v.unico));
    if (v.mensal[1]) partes.push(faixaTxt(v.mensal) + ' por mês');
    return partes.join(' + ');
  }
  function atual() {
    var horas = +$('#orc-horas').value, tecI = +$('#orc-tec').value, prazo = +$('#orc-prazo').value;
    return { tipo: tipo, plano: plano, marc: Object.assign({}, marcados), horas: horas, tecI: tecI, prazo: prazo, valor: calcular(tipo, plano, marcados, horas, TEC[tecI][1], prazo) };
  }
  function descrever(it) {
    var P = PEDIDOS[it.tipo], d = P.nome + ', plano ' + P.planos[it.plano].nome;
    if (P.horas) d += ', ' + it.horas + ' horas';
    var ex = (P.extras || []).filter(function (x, i) { return it.marc[i]; }).map(function (x) { return x.nome; });
    if (ex.length) d += ', com ' + ex.join(', ').toLowerCase();
    if (it.tecI) d += ', em ' + TEC[it.tecI][0];
    if (it.prazo > 1) d += ', urgente';
    return d;
  }
  function totais() {
    return carrinho.reduce(function (s, it) {
      s.unico[0] += it.valor.unico[0]; s.unico[1] += it.valor.unico[1];
      s.mensal[0] += it.valor.mensal[0]; s.mensal[1] += it.valor.mensal[1];
      return s;
    }, { unico: [0, 0], mensal: [0, 0] });
  }
  function texto() {
    var l = ['Olá! Montei este pedido no site da Mil e Uma Linhas!:', ''];
    carrinho.forEach(function (it) { l.push('- ' + descrever(it) + ': ' + valorTxt(it.valor)); });
    l.push('', 'Estimativa total: ' + valorTxt(totais()), '', 'Sobre o meu projeto:', '');
    return l.join('\n');
  }

  function renderTipos() {
    var box = $('#orc-tipos'); box.textContent = '';
    Object.keys(PEDIDOS).forEach(function (k) {
      var b = el('button', 'pilula', PEDIDOS[k].nome); b.type = 'button'; b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', k === tipo ? 'true' : 'false');
      b.addEventListener('click', function () { escolher(k, 0); });
      box.appendChild(b);
    });
  }
  function renderPlanos() {
    var P = PEDIDOS[tipo], box = $('#orc-planos'); box.textContent = '';
    P.planos.forEach(function (pl, i) {
      var b = el('button', 'orc-plano'); b.type = 'button'; b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', i === plano ? 'true' : 'false');
      b.appendChild(el('b', null, pl.nome));
      b.appendChild(el('span', 'orc-preco', faixaTxt(pl.faixa) + (pl.mensal ? ' por mês' : P.horas ? ' por hora' : '')));
      b.appendChild(el('span', 'orc-desc', pl.desc));
      b.addEventListener('click', function () { plano = i; renderPlanos(); atualizar(); });
      box.appendChild(b);
    });
  }
  function renderExtras() {
    var P = PEDIDOS[tipo], box = $('#orc-extras'); box.textContent = '';
    var tit = box.previousElementSibling;
    if (tit) tit.hidden = !(P.extras && P.extras.length);
    (P.extras || []).forEach(function (x, i) {
      var l = el('label', 'radio orc-extra'), c = document.createElement('input');
      c.type = 'checkbox'; c.checked = !!marcados[i];
      c.addEventListener('change', function () { marcados[i] = c.checked; atualizar(); });
      l.appendChild(c);
      l.appendChild(el('span', null, x.nome));
      l.appendChild(el('span', 'orc-preco', '+ ' + faixaTxt(x.faixa) + (x.mensal ? ' por mês' : '')));
      box.appendChild(l);
    });
    $('#orc-horas-caixa').hidden = !P.horas;
  }
  function atualizar() {
    var it = atual(), P = PEDIDOS[tipo];
    $('#orc-valor').textContent = valorTxt(it.valor);
    $('#orc-horas-val').textContent = it.horas + ' horas';
    var n = ['Estimativa. O valor final sai por escrito depois de conversarmos sobre o projeto.'];
    if (P.nota) n.unshift(P.nota);
    if (TEC[it.tecI][1] > 1) n.unshift('Esta linguagem costuma exigir mais horas de desenvolvimento, por isso a faixa sobe.');
    $('#orc-nota').textContent = n.join(' ');
  }
  function renderCarrinho() {
    var ul = $('#orc-carrinho'); ul.textContent = '';
    if (!carrinho.length) ul.appendChild(el('li', 'vazio', 'Nada adicionado ainda. Monte um item e clique em Adicionar ao pedido.'));
    carrinho.forEach(function (it, i) {
      var li = el('li');
      li.appendChild(el('span', null, descrever(it)));
      li.appendChild(el('b', null, valorTxt(it.valor)));
      var x = el('button', 'botao botao-mini', 'Remover'); x.type = 'button';
      x.addEventListener('click', function () { carrinho.splice(i, 1); renderCarrinho(); });
      li.appendChild(x);
      ul.appendChild(li);
    });
    $('#orc-total').textContent = carrinho.length ? 'Total estimado: ' + valorTxt(totais()) : '';
    var a = $('#orc-email'), copia = $('#orc-copiar');
    a.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Pedido de orçamento') + '&body=' + encodeURIComponent(carrinho.length ? texto() : 'Olá! Quero um orçamento para o meu projeto:\n\n');
    copia.disabled = !carrinho.length;
    ouvintes.forEach(function (f) { f(); });
  }
  function escolher(k, p) {
    if (!PEDIDOS[k]) k = 'site';
    tipo = k; plano = p || 0; marcados = {};
    renderTipos(); renderPlanos(); renderExtras(); atualizar();
  }
  function iniciar() {
    if (pronto) return;
    pronto = true;
    var sel = $('#orc-tec');
    TEC.forEach(function (t, i) { var o = el('option', null, t[0]); o.value = i; sel.appendChild(o); });
    sel.addEventListener('change', atualizar);
    $('#orc-prazo').addEventListener('change', atualizar);
    $('#orc-horas').addEventListener('input', atualizar);
    $('#orc-add').addEventListener('click', function () { carrinho.push(atual()); renderCarrinho(); });
    $('#orc-copiar').addEventListener('click', function () {
      var b = $('#orc-copiar');
      if (!navigator.clipboard) { b.textContent = 'Copie pelo e-mail'; return; }
      navigator.clipboard.writeText(texto()).then(function () {
        b.textContent = 'Resumo copiado'; setTimeout(function () { b.textContent = 'Copiar resumo'; }, 1500);
      }).catch(function () { b.textContent = 'O navegador não deixou copiar'; });
    });
    escolher(tipo, 0);
    renderCarrinho();
  }
  return {
    PEDIDOS: PEDIDOS, faixaTxt: faixaTxt, reais: reais, EMAIL: EMAIL,
    rota: function (sub) { iniciar(); if (sub && PEDIDOS[sub] && sub !== tipo) escolher(sub, 0); },
    adicionar: function (k) { // usado pela vitrine da aparência Loja
      iniciar();
      var v = calcular(k, 0, {}, 20, 1, 1);
      carrinho.push({ tipo: k, plano: 0, marc: {}, horas: 20, tecI: 0, prazo: 1, valor: v });
      renderCarrinho();
    },
    resumoCarrinho: function () { return { n: carrinho.length, txt: carrinho.length ? valorTxt(totais()) : '' }; },
    aoMudar: function (f) { ouvintes.push(f); }
  };
})();
