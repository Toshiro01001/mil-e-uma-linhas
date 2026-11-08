/* Montador de orçamento e carrinho. Para mudar preços ou prazos, edite só a lista PEDIDOS abaixo e depois gere o
   catálogo do servidor (tests/gerar-catalogo.cjs no sistema de cobranças): o servidor refaz a conta com a mesma tabela.
   faixa = [mínimo, máximo] em reais. dias = [mínimo, máximo] em dias úteis (segunda a sexta).
   O carrinho fica só neste aparelho (localStorage) até o cliente enviar o pedido em js/pedido.js. */
window.MUL_ORC = (function () {
  'use strict';
  var EMAIL = 'contato@mileumalinhas.com.br';
  var PEDIDOS = {
    site: {
      nome: 'Site', planos: [
        { nome: 'Essencial', desc: 'Uma página com seus serviços e botão de contato. Pronta em até 10 dias úteis depois de receber textos e fotos.', itens: ['Funciona no celular e no computador', 'Estrutura pronta para o Google: títulos, descrição e imagens leves', 'Conexão segura (https) e botão de contato', 'Você testa uma versão antes de ir ao ar e pede ajustes (até 2 rodadas)'], dias: [5, 10], faixa: [600, 1200] },
        { nome: 'Profissional', desc: 'Até 5 páginas, formulário e aparência própria da sua marca.', itens: ['Inclui tudo do plano Essencial', 'Páginas como Início, Serviços, Sobre, Galeria e Contato', 'Formulário: o cliente preenche e a mensagem chega para você', 'Desenho próprio, aprovado por você antes da programação'], dias: [15, 21], faixa: [1500, 3000] },
        { nome: 'Completo', desc: 'Loja virtual ou área do cliente simples.', itens: ['Inclui tudo do plano Profissional', 'Loja: vitrine de produtos, carrinho e pedido que chega para você', 'Área do cliente: login simples para ver pedidos ou documentos', 'Quantidade de produtos e forma de pagamento combinadas por escrito'], dias: [32, 54], faixa: [5000, 12000] }
      ],
      extras: [
        { nome: 'Página a mais', dias: [1, 1], faixa: [150, 300] }, { nome: 'Agendamento online', dias: [2, 4], faixa: [400, 900] },
        { nome: 'Escrita dos textos', dias: [1, 3], faixa: [200, 500] }, { nome: 'Otimização para o Google', dias: [1, 1], faixa: [150, 400] },
        { nome: 'Manutenção e segurança', dias: [0, 0], faixa: [150, 400], mensal: true }
      ]
    },
    sistema: {
      nome: 'Sistema', planos: [
        { nome: 'Pequeno', desc: 'Para quem precisa organizar um assunto só, como clientes ou pedidos.', itens: ['Acesso: até 3 pessoas', 'Guarda: 1 cadastro principal, até 5.000 registros', 'Relatórios: 1 relatório simples, com filtro por período', 'Busca e filtros no cadastro'], dias: [21, 32], faixa: [2500, 5000] },
        { nome: 'Médio', desc: 'Para uma equipe que trabalha junta, com cada pessoa vendo só o que pode.', itens: ['Acesso: de 4 a 15 pessoas, com login e permissões por usuário', 'Guarda: até 5 cadastros ligados entre si, até 50.000 registros', 'Relatórios: até 5 relatórios, com filtros e totais', 'Histórico de quem alterou cada informação'], dias: [43, 64], faixa: [6000, 15000] },
        { nome: 'Grande', desc: 'Para operações maiores, com regras próprias do seu negócio.', itens: ['Acesso: mais de 15 pessoas, com vários perfis de acesso', 'Guarda: mais de 5 cadastros e regras complexas', 'Relatórios: sob medida, com integrações combinadas', 'Começa pelo Diagnóstico pago, que define o valor final'], dias: [86, 129], faixa: [18000, 40000], aPartir: true }
      ],
      extras: [
        { nome: 'Integração com outro sistema', dias: [5, 10], faixa: [1000, 4000] }, { nome: 'Importar planilhas ou banco antigo', dias: [2, 5], faixa: [500, 2000] },
        { nome: 'Relatórios em PDF ou Excel', dias: [1, 4], faixa: [400, 1500] }, { nome: 'Versão instalável no celular', dias: [10, 21], faixa: [1500, 5000] },
        { nome: 'Manutenção e segurança', dias: [0, 0], faixa: [150, 400], mensal: true }
      ]
    },
    vendas: {
      nome: 'Vendas automatizadas', planos: [
        { nome: 'Básico', desc: 'Respostas automáticas e coleta de dados do interessado.', itens: ['Textos das respostas revisados por você antes de entrar no ar', 'Guarda nome, contato e o que a pessoa procura', 'Só fala com quem deu permissão (opt-in), com jeito simples de sair'], dias: [5, 10], faixa: [500, 1200] },
        { nome: 'Funil', desc: 'Página, perguntas de qualificação e aviso para quem vende.', itens: ['Inclui tudo do plano Básico', 'Página própria para receber quem chega pelo anúncio ou pelo link', 'Perguntas que separam quem só está olhando de quem quer comprar', 'Quem vende recebe o aviso com as respostas da pessoa'], dias: [10, 21], faixa: [1500, 3500] },
        { nome: 'Integrado', desc: 'Liga o funil ao seu cadastro de clientes ou ao pagamento.', itens: ['Inclui tudo do plano Funil', 'Os dados do interessado entram sozinhos no seu cadastro ou no pagamento', 'Ninguém digita a mesma informação duas vezes', 'Custo da conta e das mensagens da plataforma (WhatsApp, e-mail) é seu'], dias: [21, 43], faixa: [4000, 9000] }
      ],
      extras: [
        { nome: 'Acompanhamento mensal', dias: [0, 0], faixa: [200, 500], mensal: true }, { nome: 'Página de vendas', dias: [2, 5], faixa: [600, 1500] }
      ]
    },
    trafego: {
      nome: 'Tráfego pago', planos: [
        { nome: 'Início', desc: 'Uma plataforma e verba de anúncios de até R$ 3.000 por mês.', itens: ['Plataformas: 1, como Instagram ou Google', 'Criação e ajuste das campanhas; vídeos e artes são à parte', 'Relatório mensal com os números, sem promessa de venda'], dias: [5, 10], faixa: [500, 1200], mensal: true },
        { nome: 'Crescimento', desc: 'Até duas plataformas e verba de até R$ 10.000 por mês.', itens: ['Plataformas: até 2 ao mesmo tempo', 'Criação e ajuste das campanhas; vídeos e artes são à parte', 'Relatório mensal com os números, sem promessa de venda'], dias: [10, 15], faixa: [1200, 2000], mensal: true },
        { nome: 'Completo', desc: 'Várias campanhas, testes contínuos e relatório semanal.', itens: ['Várias campanhas ao mesmo tempo, em mais de uma plataforma', 'Anúncios testados lado a lado, mantendo o que rende mais', 'Relatório semanal com os números, sem promessa de venda'], dias: [15, 21], faixa: [2000, 3500], mensal: true }
      ],
      extras: [
        { nome: 'Configuração inicial das contas', dias: [1, 2], faixa: [500, 1000] }, { nome: 'Página de destino', dias: [2, 5], faixa: [600, 1500] }
      ],
      nota: 'A verba de anúncios é paga direto na plataforma e não entra nesta conta. Resultados não são garantidos.'
    },
    medida: {
      nome: 'Projeto sob medida', planos: [
        { nome: 'Diagnóstico', desc: 'Conversa e documento com escopo, prazo e custo do projeto.', itens: ['Você recebe um documento escrito, que é seu', 'Pode levar esse documento para outra empresa fazer o projeto', 'Sistema grande e projeto completo começam por aqui'], dias: [2, 5], faixa: [300, 800] },
        { nome: 'Protótipo', desc: 'Uma primeira versão que funciona, para testar a ideia.', itens: ['Só as telas e funções principais, sem acabamento final', 'Você testa de verdade e aponta o que mudar antes de investir mais', 'Entrega, aprovação e pagamento próprios: 50% antes, 50% na entrega'], dias: [10, 21], faixa: [2000, 6000] },
        { nome: 'Projeto completo', desc: 'Da ideia à entrega, em etapas combinadas.', itens: ['Cada etapa é entregue, testada e aprovada por você antes da próxima', 'Cada etapa tem pagamento próprio: 50% antes, 50% na entrega', 'Mudança no que foi combinado é orçada à parte, por escrito'], dias: [43, 86], faixa: [8000, 30000] }
      ],
      extras: [
        { nome: 'Banco de dados', dias: [4, 7], faixa: [500, 2000] }, { nome: 'Versão para celular', dias: [10, 21], faixa: [1500, 5000] }
      ]
    }
  };
  /* Explicação curta de cada adicional (botão "i"). Chave: tipo | nome do adicional. */
  var AJUDA = {
    'site|Página a mais': 'Uma página extra além das que o plano já inclui, como Sobre, Galeria ou Contato separado.',
    'site|Agendamento online': 'Seus clientes escolhem dia e horário direto no site, e você recebe o aviso de cada agendamento.',
    'site|Escrita dos textos': 'Eu escrevo os textos das páginas a partir do que você contar, em vez de você enviar tudo pronto.',
    'site|Otimização para o Google': 'Ajustes para o site aparecer melhor nas buscas: títulos, descrições, velocidade e cadastro no Google.',
    'site|Manutenção e segurança': 'Atualizações, cópias de segurança e correção de problemas todo mês. É cobrada por mês e não aumenta o prazo de entrega.',
    'sistema|Integração com outro sistema': 'Liga o seu sistema a outro programa, como emissor de nota, pagamento ou planilha online, para os dados passarem sozinhos.',
    'sistema|Importar planilhas ou banco antigo': 'Leva para o sistema novo as informações que você já tem em planilhas ou em um sistema antigo.',
    'sistema|Relatórios em PDF ou Excel': 'Botão para baixar os relatórios do sistema em PDF ou em planilha do Excel.',
    'sistema|Versão instalável no celular': 'O sistema pode ser instalado na tela do celular como um aplicativo, sem passar pela loja de aplicativos.',
    'sistema|Manutenção e segurança': 'Atualizações, cópias de segurança e correção de problemas todo mês. É cobrada por mês e não aumenta o prazo de entrega.',
    'vendas|Acompanhamento mensal': 'Acompanho os resultados todo mês e ajusto as mensagens e as perguntas. É cobrado por mês e não aumenta o prazo.',
    'vendas|Página de vendas': 'Uma página feita para convencer e levar a pessoa a comprar ou pedir contato.',
    'trafego|Configuração inicial das contas': 'Crio e configuro as contas de anúncios, a forma de pagamento e a medição dos resultados.',
    'trafego|Página de destino': 'A página para onde os anúncios levam, pensada para transformar visitas em contatos.',
    'medida|Banco de dados': 'A estrutura que guarda e consulta as informações do projeto com segurança.',
    'medida|Versão para celular': 'O projeto adaptado para funcionar bem no celular, como aplicativo ou versão própria.'
  };
  /* Linguagens. fator = quanto a linguagem encarece o trabalho; vale só o maior fator escolhido.
     consulta: true = aparece na aba de linguagens, mas não entra no orçamento automático. */
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
    { id: 'csharp', consulta: true, nome: 'C#', fator: 1.1, areas: ['sistema', 'site', 'desempenho'],
      faz: 'Linguagem da plataforma .NET, da Microsoft. Forte em sistemas empresariais, APIs e programas para Windows.',
      quando: 'Empresas que já usam produtos Microsoft ou precisam de programa para Windows.', exemplo: 'Sistema de gestão instalado nos computadores da loja.' },
    { id: 'go', consulta: true, nome: 'Go', fator: 1.1, areas: ['sistema', 'automacao', 'desempenho'],
      faz: 'Criada para serviços de internet rápidos e simples de manter, que aguentam muitos acessos ao mesmo tempo.',
      quando: 'APIs e serviços que recebem muito tráfego.', exemplo: 'Serviço que recebe milhares de pedidos por minuto.' },
    { id: 'ruby', consulta: true, nome: 'Ruby', fator: 1.1, areas: ['site', 'sistema'],
      faz: 'Com o Ruby on Rails, permite levantar uma plataforma web completa com pouco código.',
      quando: 'Testar uma ideia de produto rápido ou manter um sistema que já usa Rails.', exemplo: 'Primeira versão de uma plataforma por assinatura.' },
    { id: 'dart', consulta: true, nome: 'Dart (Flutter)', fator: 1.1, areas: ['app'],
      faz: 'Com o Flutter, um único código gera aplicativo para Android e iPhone.',
      quando: 'Aplicativo nas duas lojas gastando menos do que fazer dois separados.', exemplo: 'App de pedidos para clientes de uma rede de lojas.' },
    { id: 'kotlin', consulta: true, nome: 'Kotlin', fator: 1.1, areas: ['app'],
      faz: 'Linguagem recomendada pelo Google para aplicativos nativos de Android.',
      quando: 'App só para Android que precisa aproveitar bem o aparelho.', exemplo: 'App para a equipe de entregas, com câmera e GPS.' },
    { id: 'swift', consulta: true, nome: 'Swift', fator: 1.1, areas: ['app'],
      faz: 'Linguagem da Apple para aplicativos nativos de iPhone e iPad.',
      quando: 'App só para iPhone que precisa aproveitar bem o aparelho.', exemplo: 'App de atendimento para clientes de iPhone.' },
    { id: 'r', consulta: true, nome: 'R', fator: 1.1, areas: ['dados'],
      faz: 'Feita para estatística: gera análises e gráficos a partir de muitos dados.',
      quando: 'Pesquisas, indicadores e estudos estatísticos.', exemplo: 'Painel que compara o desempenho das filiais.' },
    { id: 'c', nome: 'C', fator: 1.2, areas: ['desempenho'],
      faz: 'Controle direto da memória e do hardware. Está em equipamentos e sistemas embarcados.',
      quando: 'Programas para equipamentos ou partes em que cada milissegundo conta.', exemplo: 'Programa de um sensor ligado a uma máquina.' },
    { id: 'cpp', nome: 'C++', fator: 1.2, areas: ['desempenho', 'sistema'],
      faz: 'Alto desempenho em programas maiores, como jogos, simulações e processamento pesado.',
      quando: 'Programas grandes que exigem muito do computador.', exemplo: 'Ferramenta que processa imagens ou cálculos pesados.' },
    { id: 'rust', consulta: true, nome: 'Rust', fator: 1.2, areas: ['desempenho', 'sistema'],
      faz: 'Desempenho parecido com o de C++, com verificações que evitam muitos erros de memória.',
      quando: 'Serviços críticos em que falha e segurança custam caro.', exemplo: 'Serviço que processa pagamentos ou muitos dados.' }
  ];
  var AREAS = { site: 'Sites', sistema: 'Sistemas', app: 'Aplicativos', automacao: 'Automação', dados: 'Dados e relatórios', desempenho: 'Alto desempenho' };
  /* Quais áreas cada tipo de pedido oferece. Lista vazia = o pedido não envolve escolher linguagem. */
  var AREAS_DO_PEDIDO = { site: ['site'], sistema: ['sistema', 'dados', 'app', 'desempenho'], vendas: ['automacao', 'site'], trafego: [], medida: ['site', 'sistema', 'app', 'automacao', 'dados', 'desempenho'] };

  var $ = function (s) { return document.querySelector(s); };
  var el = function (t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x !== undefined) e.textContent = x; return e; };
  var reais = function (v) { return Math.round(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); };
  var faixaTxt = function (f) { return reais(f[0]) + ' a ' + reais(f[1]); };
  var redondo = function (v) { return Math.round(v / 10) * 10; };

  var tipo = 'site', plano = 0, marcados = {}, carrinho = [], pronto = false, ouvintes = [], escolhidas = [];
  var GUARDA = 'mul-pedido', MAX_ITENS = 10;
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
    var d = [0, 0];
    if (P.horas) { var sem = Math.ceil(q / 20) * 5; d = [sem, sem + 5]; }
    else { d = pl.dias.slice(); }
    (P.extras || []).forEach(function (x, i) { if (marc[i] && x.dias) { d[0] += x.dias[0]; d[1] += x.dias[1]; } });
    /* mais linguagens tomam mais tempo; urgência encurta */
    var dm = (tecM > 1 ? tecM : 1) * (prazoM > 1 ? 0.7 : 1);
    return { aberto: !!pl.aPartir, unico: [redondo(un[0] * m), redondo(un[1] * m)], mensal: [redondo(me[0] * m), redondo(me[1] * m)], dias: [Math.max(1, Math.ceil(d[0] * dm)), Math.max(1, Math.ceil(d[1] * dm))] };
  }
  function diasTxt(d) { return d[0] === d[1] ? d[0] + (d[0] === 1 ? ' dia útil' : ' dias úteis') : d[0] + ' a ' + d[1] + ' dias úteis'; }
  function valorTxt(v) {
    var partes = [];
    if (v.unico[1]) partes.push(v.aberto ? 'a partir de ' + reais(v.unico[0]) : faixaTxt(v.unico));
    if (v.mensal[1]) partes.push(faixaTxt(v.mensal) + ' por mês');
    return partes.join(' + ');
  }
  function atual() {
    var horas = +$('#orc-horas').value, prazo = +$('#orc-prazo').value, ids = validasPara(tipo, escolhidas);
    return { tipo: tipo, plano: plano, marc: Object.assign({}, marcados), horas: horas, ids: ids, prazo: prazo, valor: calcular(tipo, plano, marcados, horas, multiplicador(ids), prazo) };
  }
  function descrever(it) {
    var P = PEDIDOS[it.tipo], d = [P.nome, 'Plano ' + P.planos[it.plano].nome];
    if (P.horas) d.push(it.horas + ' horas');
    var ex = (P.extras || []).filter(function (x, i) { return it.marc[i]; }).map(function (x) { return x.nome; });
    if (ex.length) d.push('Adicionais: ' + ex.join(', '));
    if (it.ids.length) d.push('Linguagens: ' + it.ids.map(function (id) { return ling(id).nome; }).join(', '));
    if (it.prazo > 1) d.push('Urgente');
    return d.join(', ');
  }
  function totais() {
    return carrinho.reduce(function (s, it) {
      s.unico[0] += it.valor.unico[0]; s.unico[1] += it.valor.unico[1]; if (it.valor.aberto) s.aberto = true;
      s.mensal[0] += it.valor.mensal[0]; s.mensal[1] += it.valor.mensal[1];
      s.dias[0] += it.valor.dias[0]; s.dias[1] += it.valor.dias[1];
      return s;
    }, { aberto: false, unico: [0, 0], mensal: [0, 0], dias: [0, 0] });
  }
  function texto() {
    var l = ['Olá! Montei este pedido no site da Mil e Uma Linhas!:', ''];
    carrinho.forEach(function (it) { l.push('- ' + descrever(it) + ': ' + valorTxt(it.valor) + '. Prazo: ' + diasTxt(it.valor.dias)); });
    l.push('', 'Estimativa total: ' + valorTxt(totais()) + '. Prazo somado: ' + diasTxt(totais().dias), '', 'Sobre o meu projeto:', '');
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
      b.appendChild(el('span', 'orc-preco', (pl.aPartir ? 'a partir de ' + reais(pl.faixa[0]) : faixaTxt(pl.faixa)) + (pl.mensal ? ' por mês' : P.horas ? ' por hora' : '')));
      b.appendChild(el('span', 'orc-desc', pl.desc));
      if (pl.itens) { var ul = el('ul', 'orc-itens'); pl.itens.forEach(function (t) { ul.appendChild(el('li', null, t)); }); b.appendChild(ul); }
      b.addEventListener('click', function () { plano = i; renderPlanos(); atualizar(); });
      box.appendChild(b);
    });
  }
  function renderExtras() {
    var P = PEDIDOS[tipo], box = $('#orc-extras'); box.textContent = '';
    var tit = box.previousElementSibling;
    if (tit) tit.hidden = !(P.extras && P.extras.length);
    (P.extras || []).forEach(function (x, i) {
      var linha = el('div', 'orc-extra'), l = el('label', 'radio orc-extra-rotulo'), c = document.createElement('input');
      c.type = 'checkbox'; c.checked = !!marcados[i];
      c.addEventListener('change', function () { marcados[i] = c.checked; atualizar(); });
      l.appendChild(c);
      l.appendChild(el('span', null, x.nome));
      linha.appendChild(l);
      var ajuda = AJUDA[tipo + '|' + x.nome], idp = 'ajuda-' + tipo + '-' + i;
      if (ajuda) {
        var bi = el('button', 'orc-info', 'i'); bi.type = 'button';
        bi.setAttribute('aria-label', 'O que é: ' + x.nome); bi.setAttribute('aria-expanded', 'false'); bi.setAttribute('aria-controls', idp);
        linha.appendChild(bi);
        var tx = el('p', 'orc-ajuda', ajuda); tx.id = idp; tx.hidden = true;
        bi.addEventListener('click', function () { var abre = tx.hidden; tx.hidden = !abre; bi.setAttribute('aria-expanded', abre ? 'true' : 'false'); });
        linha.appendChild(el('span', 'orc-preco', '+ ' + faixaTxt(x.faixa) + (x.mensal ? ' por mês' : '') + ' · ' + (x.mensal || !x.dias || !x.dias[1] ? 'sem prazo extra' : '+ ' + diasTxt(x.dias))));
        linha.appendChild(tx);
      } else {
        linha.appendChild(el('span', 'orc-preco', '+ ' + faixaTxt(x.faixa) + (x.mensal ? ' por mês' : '') + ' · ' + (x.mensal || !x.dias || !x.dias[1] ? 'sem prazo extra' : '+ ' + diasTxt(x.dias))));
      }
      box.appendChild(linha);
    });
    $('#orc-horas-caixa').hidden = !P.horas;
  }
  function atualizar() {
    var it = atual(), P = PEDIDOS[tipo];
    $('#orc-valor').textContent = valorTxt(it.valor);
    $('#orc-dias').textContent = 'Prazo estimado: ' + diasTxt(it.valor.dias);
    $('#orc-horas-val').textContent = it.horas + ' horas';
    var n = ['Estimativa. Valor e prazo finais saem por escrito depois de conversarmos sobre o projeto. O prazo conta em dias úteis (segunda a sexta) e só começa depois da entrada de 50%, da aprovação do escopo e do recebimento de todo o material.'];
    if (tipo === 'trafego') n.unshift('O prazo é até a primeira campanha no ar.');
    if (+$('#orc-prazo').value > 1) n.unshift('Urgente: prazo cerca de 30% menor, quando a agenda permitir.');
    if (P.nota) n.unshift(P.nota);
    n.push('Depois da entrega eu explico por cima como usar e deixo meu contato (e-mail e WhatsApp) para qualquer dúvida.');
    var extra = Math.max(0, it.ids.length - INCLUSAS), maior = it.ids.reduce(function (m, id) { return Math.max(m, ling(id).fator); }, 1);
    if (extra) n.unshift(extra + (extra === 1 ? ' linguagem' : ' linguagens') + ' além das 2 incluídas: +' + Math.round(extra * POR_EXTRA * 100) + '% no preço e no prazo.');
    if (maior > 1) n.unshift('Java, C# e outras mais exigentes levam mais tempo de teste e correção: a mais exigente que você marcou soma ' + Math.round((maior - 1) * 100) + '% (uma vez só).');
    $('#orc-nota').textContent = n.join(' ');
  }
  function renderLinguagens() {
    var areas = AREAS_DO_PEDIDO[tipo], caixa = $('#orc-ling-caixa'), box = $('#orc-langs');
    caixa.hidden = !areas.length;
    box.textContent = '';
    LINGUAGENS.filter(function (l) { return !l.consulta && l.areas.some(function (x) { return areas.indexOf(x) >= 0; }); }).forEach(function (l) {
      var on = escolhidas.indexOf(l.id) >= 0, b = el('button', 'pilula', l.nome + (l.fator > 1 ? ' +' + Math.round((l.fator - 1) * 100) + '%' : ''));
      b.type = 'button'; b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.addEventListener('click', function () { alternar(l.id); });
      box.appendChild(b);
    });
    var n = validasPara(tipo, escolhidas).length;
    $('#orc-ling-conta').textContent = !n ? 'Nenhuma marcada: decidimos juntos na conversa, sem acréscimo.' : n + (n === 1 ? ' linguagem marcada' : ' linguagens marcadas') + '. Duas estão incluídas. Cada uma a partir da terceira soma ' + Math.round(POR_EXTRA * 100) + '% no preço e no prazo. A escolha final é combinada na conversa.';
  }
  function alternar(id) {
    var i = escolhidas.indexOf(id);
    if (i >= 0) escolhidas.splice(i, 1); else escolhidas.push(id);
    if (pronto) { renderLinguagens(); atualizar(); }
    ouvintes.forEach(function (f) { f(); });
  }
  /* guarda só as escolhas; o preço é refeito com a tabela atual ao abrir de novo */
  function guardar() {
    try { localStorage.setItem(GUARDA, JSON.stringify(carrinho.map(function (it) { return { tipo: it.tipo, plano: it.plano, marc: it.marc, horas: it.horas, ids: it.ids, prazo: it.prazo }; }))); } catch (e) { /* sem armazenamento: o pedido vale até fechar a página */ }
  }
  function recuperar() {
    var lista = [];
    try { lista = JSON.parse(localStorage.getItem(GUARDA) || '[]'); } catch (e) { lista = []; }
    if (!Array.isArray(lista)) return;
    lista.slice(0, MAX_ITENS).forEach(function (x) {
      if (!x || !Object.prototype.hasOwnProperty.call(PEDIDOS, x.tipo)) return;
      var P = PEDIDOS[x.tipo];
      if (!(x.plano >= 0 && x.plano < P.planos.length && x.plano % 1 === 0)) return;
      var marc = {};
      Object.keys(x.marc || {}).forEach(function (k) { if (x.marc[k] === true && +k >= 0 && +k < (P.extras || []).length) marc[+k] = true; });
      var horas = P.horas && x.horas >= 5 && x.horas <= 160 && x.horas % 5 === 0 ? x.horas : 20;
      var ids = Array.isArray(x.ids) ? validasPara(x.tipo, x.ids.filter(function (id, i, a) { var l = ling(id); return l && !l.consulta && a.indexOf(id) === i; })) : [];
      var prazo = x.prazo === 1.25 ? 1.25 : 1;
      carrinho.push({ tipo: x.tipo, plano: x.plano, marc: marc, horas: horas, ids: ids, prazo: prazo, valor: calcular(x.tipo, x.plano, marc, horas, multiplicador(ids), prazo) });
    });
  }
  function contador() {
    var n = carrinho.length, b = $('#orc-conta'), a = $('#carrinho-topo');
    if (b) b.textContent = n ? String(n) : '';
    if (a) {
      a.hidden = !n;
      a.setAttribute('aria-label', n ? 'Meu pedido: ' + n + (n === 1 ? ' item' : ' itens') + '. Abrir o pedido.' : '');
    }
  }
  /* o botão do topo leva ao pedido e rola até a lista, mesmo já estando na aba */
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('#carrinho-topo');
    if (!a) return;
    setTimeout(function () { var t = $('#t-carrinho'); if (t && !t.closest('[hidden]')) t.scrollIntoView({ block: 'start' }); }, 60);
  });
  function mudou() { guardar(); contador(); ouvintes.forEach(function (f) { f(); }); }
  function renderCarrinho() {
    var ul = $('#orc-carrinho'); ul.textContent = '';
    if (!carrinho.length) ul.appendChild(el('li', 'vazio', 'Nada adicionado ainda. Monte um item e clique em Adicionar ao pedido.'));
    carrinho.forEach(function (it, i) {
      var li = el('li');
      li.appendChild(el('span', null, descrever(it)));
      li.appendChild(el('b', null, valorTxt(it.valor) + '. Prazo: ' + diasTxt(it.valor.dias)));
      var x = el('button', 'botao botao-mini', 'Remover'); x.type = 'button';
      x.setAttribute('aria-label', 'Remover ' + descrever(it));
      x.addEventListener('click', function () { carrinho.splice(i, 1); renderCarrinho(); });
      li.appendChild(x);
      ul.appendChild(li);
    });
    var T = totais();
    $('#orc-n').textContent = carrinho.length ? '(' + carrinho.length + (carrinho.length === 1 ? ' item)' : ' itens)') : '';
    // Com um item só, o total repetiria a linha do item: mostro o total a partir de dois itens.
    $('#orc-total').textContent = carrinho.length > 1 ? 'Total estimado: ' + valorTxt(T) + '. Um depois do outro: ' + diasTxt(T.dias) + '.' : '';
    var copia = $('#orc-copiar'), fin = $('#orc-finalizar');
    copia.disabled = !carrinho.length; $('#orc-esvaziar').disabled = !carrinho.length;
    fin.classList.toggle('desligado', !carrinho.length);
    if (carrinho.length) { fin.removeAttribute('aria-disabled'); fin.href = '#orcamento/finalizar'; } else { fin.setAttribute('aria-disabled', 'true'); fin.removeAttribute('href'); }
    $('#orc-add').disabled = carrinho.length >= MAX_ITENS;
    mudou();
  }
  /* Menu "enviar por e-mail": o cliente escolhe onde abrir (Gmail, Outlook, Yahoo, app do aparelho) ou copia o texto.
     O link mailto: sozinho só funciona se o aparelho tiver um programa de e-mail configurado; por isso há as outras opções. */
  function menuEmail(botao, caixa, montar) {
    var MAX_URL = 7000;
    function link(rotulo, href, novaAba) {
      var a = el('a', 'botao botao-mini', rotulo); a.href = href;
      if (novaAba) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      return a;
    }
    function preencher() {
      var m = montar(), corpo = m.corpo, ass = m.assunto, para = EMAIL;
      var cortar = function (extraLen) { var max = Math.max(500, MAX_URL - extraLen); var c = corpo; while (encodeURIComponent(c).length > max && c.length > 200) c = c.slice(0, Math.floor(c.length * 0.9)); return c === corpo ? c : c + '\n\n(Texto cortado. Use "Copiar texto" para enviar o pedido completo.)'; };
      var web = function (base, _x, pk, sk, bk) {
        var extra = base.length + encodeURIComponent(para).length + encodeURIComponent(ass).length + 40, c = cortar(extra);
        return base + pk + '=' + encodeURIComponent(para) + '&' + sk + '=' + encodeURIComponent(ass) + '&' + bk + '=' + encodeURIComponent(c);
      };
      caixa.textContent = '';
      caixa.appendChild(el('p', 'nota', 'Escolha onde abrir o e-mail. O texto do pedido já vai junto.'));
      var l = el('div', 'email-opcoes');
      l.appendChild(link('Gmail', web('https://mail.google.com/mail/?view=cm&fs=1&', 0, 'to', 'su', 'body'), true));
      l.appendChild(link('Outlook', web('https://outlook.live.com/mail/0/deeplink/compose?', 0, 'to', 'subject', 'body'), true));
      l.appendChild(link('Yahoo', web('https://compose.mail.yahoo.com/?', 0, 'to', 'subject', 'body'), true));
      l.appendChild(link('App de e-mail do aparelho', 'mailto:' + para + '?subject=' + encodeURIComponent(ass) + '&body=' + encodeURIComponent(corpo), false));
      var cp = el('button', 'botao botao-mini', 'Copiar texto'); cp.type = 'button';
      cp.addEventListener('click', function () {
        var t = 'Para: ' + para + '\nAssunto: ' + ass + '\n\n' + corpo;
        if (!navigator.clipboard) { cp.textContent = 'Copie pelo botão do navegador'; return; }
        navigator.clipboard.writeText(t).then(function () { cp.textContent = 'Texto copiado'; setTimeout(function () { cp.textContent = 'Copiar texto'; }, 1800); }).catch(function () { cp.textContent = 'O navegador não deixou copiar'; });
      });
      l.appendChild(cp);
      caixa.appendChild(l);
      caixa.appendChild(el('p', 'nota', 'Para: ' + para));
    }
    botao.addEventListener('click', function () {
      var abre = caixa.hidden;
      if (abre) preencher();
      caixa.hidden = !abre; botao.setAttribute('aria-expanded', abre ? 'true' : 'false');
    });
  }
  function mostrarFinalizar(sim) {
    $('#orc-montar').hidden = sim; $('#fin').hidden = !sim;
    if (sim && window.MUL_PEDIDO) window.MUL_PEDIDO.abrir();
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
    $('#orc-add').addEventListener('click', function () {
      if (carrinho.length >= MAX_ITENS) return;
      carrinho.push(atual()); renderCarrinho();
      // Aviso curto (lido por leitores de tela) que some e volta ao total.
      var n = carrinho.length;
      $('#orc-total').textContent = 'Adicionado ao pedido.';
      setTimeout(function () { if (carrinho.length === n) renderCarrinho(); }, 2500);
    });
    $('#orc-esvaziar').addEventListener('click', function () {
      var b = $('#orc-esvaziar');
      if (b.dataset.armado !== '1') { b.dataset.armado = '1'; b.textContent = 'Clique de novo para esvaziar'; setTimeout(function () { b.dataset.armado = ''; b.textContent = 'Esvaziar'; }, 4000); return; }
      b.dataset.armado = ''; b.textContent = 'Esvaziar'; carrinho = []; renderCarrinho();
    });
    $('#orc-copiar').addEventListener('click', function () {
      var b = $('#orc-copiar');
      if (!navigator.clipboard) { b.textContent = 'Copie pelo e-mail'; return; }
      navigator.clipboard.writeText(texto()).then(function () {
        b.textContent = 'Resumo copiado'; setTimeout(function () { b.textContent = 'Copiar resumo'; }, 1500);
      }).catch(function () { b.textContent = 'O navegador não deixou copiar'; });
    });
    menuEmail($('#orc-email'), $('#orc-email-menu'), function () {
      return { assunto: 'Pedido de orçamento', corpo: carrinho.length ? texto() : 'Olá! Quero um orçamento para o meu projeto:\n\n' };
    });
    escolher(tipo, 0);
    renderCarrinho();
  }
  recuperar();
  contador();
  return {
    menuEmail: menuEmail, PEDIDOS: PEDIDOS, AREAS_DO_PEDIDO: AREAS_DO_PEDIDO, diasTxt: diasTxt, faixaTxt: faixaTxt, reais: reais, EMAIL: EMAIL, LINGUAGENS: LINGUAGENS, AREAS: AREAS, INCLUSAS: INCLUSAS, POR_EXTRA: POR_EXTRA,
    alternar: alternar, escolhidas: function () { return escolhidas.slice(); },
    rota: function (sub) {
      iniciar();
      if (sub === 'finalizar') return mostrarFinalizar(true);
      mostrarFinalizar(false);
      if (sub && Object.prototype.hasOwnProperty.call(PEDIDOS, sub) && sub !== tipo) escolher(sub, 0);
    },
    adicionar: function (k) { // usado pela vitrine da aparência Loja
      iniciar();
      if (carrinho.length >= MAX_ITENS) return;
      var v = calcular(k, 0, {}, 20, 1, 1);
      carrinho.push({ tipo: k, plano: 0, marc: {}, horas: 20, ids: [], prazo: 1, valor: v });
      renderCarrinho();
    },
    resumoCarrinho: function () { return { n: carrinho.length, txt: carrinho.length ? valorTxt(totais()) : '' }; },
    /* usado pela finalização (js/pedido.js) */
    linhas: function () { return carrinho.map(function (it) { return { descricao: descrever(it), valor: valorTxt(it.valor), prazo: diasTxt(it.valor.dias) }; }); },
    total: function () { var T = totais(); return { valor: valorTxt(T), prazo: diasTxt(T.dias) }; },
    paraEnvio: function () {
      return carrinho.map(function (it) {
        var o = { tipo: it.tipo, plano: it.plano, extras: Object.keys(it.marc).filter(function (k) { return it.marc[k]; }).map(Number), linguagens: it.ids.slice(), urgente: it.prazo > 1, valor_visto: valorTxt(it.valor) };
        if (PEDIDOS[it.tipo].horas) o.horas = it.horas;
        return o;
      });
    },
    textoEmail: texto,
    esvaziar: function () { carrinho = []; if (pronto) renderCarrinho(); else mudou(); },
    aoMudar: function (f) { ouvintes.push(f); }
  };
})();
