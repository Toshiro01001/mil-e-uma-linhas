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
  /* Linguagens. fator = quanto a linguagem encarece o trabalho; vale só o maior fator escolhido. */
  var INCLUSAS = 2, POR_EXTRA = 0.15;
  var LINGUAGENS = [
    { id: 'javascript', nome: 'JavaScript', fator: 1, areas: ['site', 'sistema', 'automacao', 'app'],
      faz: 'É a linguagem dos navegadores: faz botões, formulários e telas reagirem. Com Node.js, também roda no servidor.',
      quando: 'Quase todo site ou sistema web usa em alguma parte.', exemplo: 'Carrinho de compras e painel que atualiza sem recarregar a página.' },
    { id: 'typescript', nome: 'TypeScript', fator: 1, areas: ['site', 'sistema', 'app'],
      faz: 'É JavaScript com tipos: o computador avisa muitos erros antes de o programa chegar ao cliente.',
      quando: 'Sistemas web que vão crescer e receber manutenção por anos.', exemplo: 'Portal do cliente com várias telas e regras.' },
    { id: 'python', nome: 'Python', fator: 1, areas: ['sistema', 'automacao', 'dados', 'site'],
      faz: 'Escrita simples e muitas bibliotecas prontas para dados, automação e inteligência artificial.',
      quando: 'Automatizar tarefas repetitivas, integrar sistemas e analisar dados.', exemplo: 'Robô que lê planilhas e gera relatórios sozinho.' },
    { id: 'php', nome: 'PHP', fator: 1, areas: ['site', 'sistema'],
      faz: 'Roda no servidor e gera páginas. É a base do WordPress e funciona em hospedagens comuns e baratas.',
      quando: 'Sites e sistemas web em que o custo de hospedagem pesa.', exemplo: 'Site com área administrativa para editar produtos.' },
    { id: 'sql', nome: 'SQL', fator: 1, areas: ['sistema', 'dados'],
      faz: 'É a linguagem dos bancos de dados: guarda, busca, cruza e soma informações com segurança.',
      quando: 'Sempre que o projeto precisa guardar clientes, pedidos ou estoque. Trabalha junto de outra linguagem.', exemplo: 'Relatório de vendas por mês em segundos.' },
    { id: 'java', nome: 'Java', fator: 1.1, areas: ['sistema', 'app', 'desempenho'],
      faz: 'Muito usada em empresas grandes e bancos. Estável e feita para sistemas que duram muitos anos.',
      quando: 'Sistemas corporativos grandes ou uma base que já está em Java.', exemplo: 'Sistema interno com muitos usuários e regras.' },
    { id: 'csharp', nome: 'C#', fator: 1.1, areas: ['sistema', 'site', 'desempenho'],
      faz: 'Linguagem da plataforma .NET, da Microsoft. Forte em sistemas empresariais, APIs e programas para Windows.',
      quando: 'Empresas que já usam produtos Microsoft ou precisam de programa para Windows.', exemplo: 'Sistema de gestão instalado nos computadores da loja.' },
    { id: 'go', nome: 'Go', fator: 1.1, areas: ['sistema', 'automacao', 'desempenho'],
      faz: 'Criada para serviços de internet rápidos e simples de manter, que aguentam muitos acessos ao mesmo tempo.',
      quando: 'APIs e serviços que recebem muito tráfego.', exemplo: 'Serviço que recebe milhares de pedidos por minuto.' },
    { id: 'ruby', nome: 'Ruby', fator: 1.1, areas: ['site', 'sistema'],
      faz: 'Com o Ruby on Rails, permite levantar uma plataforma web completa com pouco código.',
      quando: 'Testar uma ideia de produto rápido ou manter um sistema que já usa Rails.', exemplo: 'Primeira versão de uma plataforma por assinatura.' },
    { id: 'dart', nome: 'Dart (Flutter)', fator: 1.1, areas: ['app'],
      faz: 'Com o Flutter, um único código gera aplicativo para Android e iPhone.',
      quando: 'Aplicativo nas duas lojas gastando menos do que fazer dois separados.', exemplo: 'App de pedidos para clientes de uma rede de lojas.' },
    { id: 'kotlin', nome: 'Kotlin', fator: 1.1, areas: ['app'],
      faz: 'Linguagem recomendada pelo Google para aplicativos nativos de Android.',
      quando: 'App só para Android que precisa aproveitar bem o aparelho.', exemplo: 'App para a equipe de entregas, com câmera e GPS.' },
    { id: 'swift', nome: 'Swift', fator: 1.1, areas: ['app'],
      faz: 'Linguagem da Apple para aplicativos nativos de iPhone e iPad.',
      quando: 'App só para iPhone que precisa aproveitar bem o aparelho.', exemplo: 'App de atendimento para clientes de iPhone.' },
    { id: 'r', nome: 'R', fator: 1.1, areas: ['dados'],
      faz: 'Feita para estatística: gera análises e gráficos a partir de muitos dados.',
      quando: 'Pesquisas, indicadores e estudos estatísticos.', exemplo: 'Painel que compara o desempenho das filiais.' },
    { id: 'c', nome: 'C', fator: 1.2, areas: ['desempenho'],
      faz: 'Controle direto da memória e do hardware. Está em equipamentos e sistemas embarcados.',
      quando: 'Programas para equipamentos ou partes em que cada milissegundo conta.', exemplo: 'Programa de um sensor ligado a uma máquina.' },
    { id: 'cpp', nome: 'C++', fator: 1.2, areas: ['desempenho', 'sistema'],
      faz: 'Alto desempenho em programas maiores, como jogos, simulações e processamento pesado.',
      quando: 'Programas grandes que exigem muito do computador.', exemplo: 'Ferramenta que processa imagens ou cálculos pesados.' },
    { id: 'rust', nome: 'Rust', fator: 1.2, areas: ['desempenho', 'sistema'],
      faz: 'Desempenho parecido com o de C++, com verificações que evitam muitos erros de memória.',
      quando: 'Serviços críticos em que falha e segurança custam caro.', exemplo: 'Serviço que processa pagamentos ou muitos dados.' }
  ];
  var AREAS = { site: 'Sites', sistema: 'Sistemas', app: 'Aplicativos', automacao: 'Automação', dados: 'Dados e relatórios', desempenho: 'Alto desempenho' };
  /* Quais áreas cada tipo de pedido oferece. Lista vazia = o pedido não envolve escolher linguagem. */
  var AREAS_DO_PEDIDO = { site: ['site'], sistema: ['sistema', 'dados', 'app', 'desempenho'], vendas: ['automacao', 'site'], trafego: [], freelance: ['site', 'sistema', 'app', 'automacao', 'dados', 'desempenho'], medida: ['site', 'sistema', 'app', 'automacao', 'dados', 'desempenho'] };

  var $ = function (s) { return document.querySelector(s); };
  var el = function (t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x !== undefined) e.textContent = x; return e; };
  var reais = function (v) { return Math.round(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); };
  var faixaTxt = function (f) { return reais(f[0]) + ' a ' + reais(f[1]); };
  var redondo = function (v) { return Math.round(v / 10) * 10; };

  var tipo = 'site', plano = 0, marcados = {}, carrinho = [], pronto = false, ouvintes = [], escolhidas = [];
  var ling = function (id) { return LINGUAGENS.filter(function (l) { return l.id === id; })[0]; };
  function multiplicador(ids) {
    var maior = ids.reduce(function (m, id) { return Math.max(m, ling(id).fator); }, 1);
    return maior * (1 + POR_EXTRA * Math.max(0, ids.length - INCLUSAS));
  }
  function validasPara(t, ids) {
    var a = AREAS_DO_PEDIDO[t];
    return ids.filter(function (id) { return ling(id).areas.some(function (x) { return a.indexOf(x) >= 0; }); });
  }

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
    var horas = +$('#orc-horas').value, prazo = +$('#orc-prazo').value, ids = validasPara(tipo, escolhidas);
    return { tipo: tipo, plano: plano, marc: Object.assign({}, marcados), horas: horas, ids: ids, prazo: prazo, valor: calcular(tipo, plano, marcados, horas, multiplicador(ids), prazo) };
  }
  function descrever(it) {
    var P = PEDIDOS[it.tipo], d = P.nome + ', plano ' + P.planos[it.plano].nome;
    if (P.horas) d += ', ' + it.horas + ' horas';
    var ex = (P.extras || []).filter(function (x, i) { return it.marc[i]; }).map(function (x) { return x.nome; });
    if (ex.length) d += ', com ' + ex.join(', ').toLowerCase();
    if (it.ids.length) d += ', em ' + it.ids.map(function (id) { return ling(id).nome; }).join(', ');
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
    var extra = Math.max(0, it.ids.length - INCLUSAS), maior = it.ids.reduce(function (m, id) { return Math.max(m, ling(id).fator); }, 1);
    if (extra) n.unshift(extra + (extra === 1 ? ' linguagem' : ' linguagens') + ' além das 2 incluídas: +' + Math.round(extra * POR_EXTRA * 100) + '% no valor.');
    if (maior > 1) n.unshift('A linguagem mais exigente escolhida acrescenta ' + Math.round((maior - 1) * 100) + '%.');
    $('#orc-nota').textContent = n.join(' ');
  }
  function renderLinguagens() {
    var areas = AREAS_DO_PEDIDO[tipo], caixa = $('#orc-ling-caixa'), box = $('#orc-langs');
    caixa.hidden = !areas.length;
    box.textContent = '';
    LINGUAGENS.filter(function (l) { return l.areas.some(function (x) { return areas.indexOf(x) >= 0; }); }).forEach(function (l) {
      var on = escolhidas.indexOf(l.id) >= 0, b = el('button', 'pilula', l.nome + (l.fator > 1 ? ' +' + Math.round((l.fator - 1) * 100) + '%' : ''));
      b.type = 'button'; b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.addEventListener('click', function () { alternar(l.id); });
      box.appendChild(b);
    });
    var n = validasPara(tipo, escolhidas).length;
    $('#orc-ling-conta').textContent = !n ? 'Nenhuma marcada: a escolha fica com a gente, sem acréscimo.' : n + (n === 1 ? ' escolhida' : ' escolhidas') + '. Até 2 estão incluídas; cada uma a mais soma ' + Math.round(POR_EXTRA * 100) + '%.';
  }
  function alternar(id) {
    var i = escolhidas.indexOf(id);
    if (i >= 0) escolhidas.splice(i, 1); else escolhidas.push(id);
    if (pronto) { renderLinguagens(); atualizar(); }
    ouvintes.forEach(function (f) { f(); });
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
    renderTipos(); renderPlanos(); renderExtras(); renderLinguagens(); atualizar();
  }
  function iniciar() {
    if (pronto) return;
    pronto = true;
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
    PEDIDOS: PEDIDOS, faixaTxt: faixaTxt, reais: reais, EMAIL: EMAIL, LINGUAGENS: LINGUAGENS, AREAS: AREAS, INCLUSAS: INCLUSAS, POR_EXTRA: POR_EXTRA,
    alternar: alternar, escolhidas: function () { return escolhidas.slice(); },
    rota: function (sub) { iniciar(); if (sub && PEDIDOS[sub] && sub !== tipo) escolher(sub, 0); },
    adicionar: function (k) { // usado pela vitrine da aparência Loja
      iniciar();
      var v = calcular(k, 0, {}, 20, 1, 1);
      carrinho.push({ tipo: k, plano: 0, marc: {}, horas: 20, ids: [], prazo: 1, valor: v });
      renderCarrinho();
    },
    resumoCarrinho: function () { return { n: carrinho.length, txt: carrinho.length ? valorTxt(totais()) : '' }; },
    aoMudar: function (f) { ouvintes.push(f); }
  };
})();
