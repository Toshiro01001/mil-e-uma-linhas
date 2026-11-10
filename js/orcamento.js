/* Montador do pedido. O site não mostra preços: o cliente escolhe o serviço, o plano e os adicionais, vê o prazo
   e envia; o preço sai por escrito depois da conversa. A tabela de preços fica só no servidor de cobranças (privado).
   Se mudar a lista PEDIDOS, gere de novo o catálogo do servidor (tests/gerar-catalogo.cjs no sistema de cobranças).
   dias = [mínimo, máximo] em dias úteis (segunda a sexta).
   O carrinho fica só neste aparelho (localStorage) até o cliente enviar o pedido em js/pedido.js. */
window.MUL_ORC = (function () {
  'use strict';
  var EMAIL = 'contato@mileumalinhas.com.br';
  var PEDIDOS = {
    site: {
      nome: 'Site', planos: [
        { nome: 'Essencial', desc: 'Uma página com seus serviços e botão de contato. Pronta em até 10 dias úteis depois de receber textos e fotos.', itens: ['Funciona no celular e no computador', 'Estrutura pronta para o Google: títulos, descrição e imagens leves', 'Conexão segura (https) e botão de contato', 'Você testa uma versão antes de ir ao ar e pede ajustes (até 2 rodadas)'], dias: [5, 10] },
        { nome: 'Profissional', desc: 'Até 5 páginas, formulário e aparência própria da sua marca.', itens: ['Inclui tudo do plano Essencial', 'Páginas como Início, Serviços, Sobre, Galeria e Contato', 'Formulário: o cliente preenche e a mensagem chega para você', 'Desenho próprio, aprovado por você antes da programação'], dias: [15, 21] },
        { nome: 'Completo', desc: 'Até 10 páginas, galeria e área do cliente simples.', itens: ['Inclui tudo do plano Profissional', 'Até 10 páginas, galeria de fotos e espaço de notícias ou blog', 'Área do cliente: login simples para ver pedidos ou documentos', 'Para vender com carrinho e pagamento, veja o pedido E-commerce'], dias: [21, 32] }
      ],
      extras: [
        { nome: 'Página a mais', dias: [1, 1] }, { nome: 'Agendamento online', dias: [2, 4] },
        { nome: 'Escrita dos textos', dias: [1, 3] }, { nome: 'Otimização para o Google', dias: [1, 1] },
        { nome: 'Manutenção e segurança', dias: [0, 0], mensal: true }
      ]
    },
    ecommerce: {
      nome: 'E-commerce', planos: [
        { nome: 'Loja Inicial', desc: 'Catálogo com carrinho e pedido que chega para você, sem pagamento online.', itens: ['Até 30 produtos, cadastrados por você em uma tela simples', 'Carrinho e pedido enviado por WhatsApp ou e-mail, para você combinar o pagamento', 'Funciona no celular e no computador, com conexão segura (https)', 'Você testa uma versão antes de ir ao ar e pede ajustes (até 2 rodadas)'], dias: [15, 25] },
        { nome: 'Loja com Pagamento', desc: 'Pix e cartão no próprio site, frete calculado e painel de pedidos.', itens: ['Inclui tudo da Loja Inicial, com até 200 produtos', 'Pagamento online (Pix e cartão) por um intermediador, como o Mercado Pago; a taxa por venda é cobrada por ele', 'Cálculo de frete pelos Correios ou por tabela própria', 'Painel para acompanhar os pedidos e marcar o envio'], dias: [25, 43] },
        { nome: 'Loja Completa', desc: 'Estoque, cupons, relatórios e integração com nota fiscal ou sistema de gestão.', itens: ['Inclui tudo da Loja com Pagamento, sem limite de produtos', 'Controle de estoque, cupons de desconto e relatórios de vendas', 'Integração combinada com emissor de nota fiscal ou sistema de gestão', 'Começa por um escopo escrito aprovado por você, que define o valor final'], dias: [43, 64], aPartir: true }
      ],
      extras: [
        { nome: 'Cadastro dos produtos', dias: [2, 5] }, { nome: 'Cupons e promoções', dias: [2, 4] },
        { nome: 'Integração com marketplace', dias: [5, 10] }, { nome: 'Manutenção e segurança', dias: [0, 0], mensal: true },
        // adicionado em 10/11/2026 no fim da lista, para não mudar a posição dos adicionais de carrinhos já salvos
        { nome: 'Automatização de redes sociais', dias: [3, 7] }
      ]
    },
    sistema: {
      nome: 'Sistema', planos: [
        { nome: 'Pequeno', desc: 'Para quem precisa organizar um assunto só, como clientes ou pedidos.', itens: ['Acesso: até 3 pessoas', 'Guarda: 1 cadastro principal, até 5.000 registros', 'Relatórios: 1 relatório simples, com filtro por período', 'Busca e filtros no cadastro'], dias: [21, 32] },
        { nome: 'Médio', desc: 'Para uma equipe que trabalha junta, com cada pessoa vendo só o que pode.', itens: ['Acesso: de 4 a 15 pessoas, com login e permissões por usuário', 'Guarda: até 5 cadastros ligados entre si, até 50.000 registros', 'Relatórios: até 5 relatórios, com filtros e totais', 'Histórico de quem alterou cada informação'], dias: [43, 64] },
        { nome: 'Grande', desc: 'Para operações maiores, com regras próprias do seu negócio.', itens: ['Acesso: mais de 15 pessoas, com vários perfis de acesso', 'Guarda: mais de 5 cadastros e regras complexas', 'Relatórios: sob medida, com integrações combinadas', 'Começa por um escopo escrito aprovado por você, que define o valor final'], dias: [86, 129], aPartir: true }
      ],
      extras: [
        { nome: 'Integração com outro sistema', dias: [5, 10] }, { nome: 'Importar planilhas ou banco antigo', dias: [2, 5] },
        { nome: 'Relatórios em PDF ou Excel', dias: [1, 4] }, { nome: 'Versão instalável no celular', dias: [10, 21] },
        { nome: 'Manutenção e segurança', dias: [0, 0], mensal: true }
      ]
    },
    vendas: {
      nome: 'Vendas automatizadas', planos: [
        { nome: 'Básico', desc: 'Respostas automáticas e coleta de dados do interessado.', itens: ['Textos das respostas revisados por você antes de entrar no ar', 'Guarda nome, contato e o que a pessoa procura', 'Só fala com quem deu permissão (opt-in), com jeito simples de sair'], dias: [5, 10] },
        { nome: 'Funil', desc: 'Página, perguntas de qualificação e aviso para quem vende.', itens: ['Inclui tudo do plano Básico', 'Página própria para receber quem chega pelo anúncio ou pelo link', 'Perguntas que separam quem só está olhando de quem quer comprar', 'Quem vende recebe o aviso com as respostas da pessoa'], dias: [10, 21] },
        { nome: 'Integrado', desc: 'Liga o funil ao seu cadastro de clientes ou ao pagamento.', itens: ['Inclui tudo do plano Funil', 'Os dados do interessado entram sozinhos no seu cadastro ou no pagamento', 'Ninguém digita a mesma informação duas vezes', 'Custo da conta e das mensagens da plataforma (WhatsApp, e-mail) é seu'], dias: [21, 43] }
      ],
      extras: [
        { nome: 'Acompanhamento mensal', dias: [0, 0], mensal: true }, { nome: 'Página de vendas', dias: [2, 5] }
      ]
    },
    trafego: {
      nome: 'Tráfego pago', planos: [
        { nome: 'Início', desc: 'Uma plataforma, para quem está começando a anunciar.', itens: ['Plataformas: 1, como Instagram ou Google', 'Criação e ajuste das campanhas; vídeos e artes são à parte', 'Relatório mensal com os números, sem promessa de venda'], dias: [5, 10], mensal: true },
        { nome: 'Crescimento', desc: 'Até duas plataformas, para quem já anuncia e quer crescer.', itens: ['Plataformas: até 2 ao mesmo tempo', 'Criação e ajuste das campanhas; vídeos e artes são à parte', 'Relatório mensal com os números, sem promessa de venda'], dias: [10, 15], mensal: true },
        { nome: 'Completo', desc: 'Várias campanhas, testes contínuos e relatório semanal.', itens: ['Várias campanhas ao mesmo tempo, em mais de uma plataforma', 'Anúncios testados lado a lado, mantendo o que rende mais', 'Relatório semanal com os números, sem promessa de venda'], dias: [15, 21], mensal: true }
      ],
      extras: [
        { nome: 'Configuração inicial das contas', dias: [1, 2] }, { nome: 'Página de destino', dias: [2, 5] }
      ],
      nota: 'A verba de anúncios é paga por você direto na plataforma e não entra no meu serviço. Resultados não são garantidos.'
    },
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
    'ecommerce|Cadastro dos produtos': 'Eu cadastro os produtos na loja a partir da sua lista com nomes, preços e fotos, em vez de você cadastrar um por um.',
    'ecommerce|Cupons e promoções': 'Cupons de desconto com validade e regras, como frete grátis acima de um valor ou desconto na primeira compra.',
    'ecommerce|Integração com marketplace': 'Liga a loja a um marketplace, como Mercado Livre ou Shopee, para o estoque e os pedidos andarem juntos.',
    'ecommerce|Manutenção e segurança': 'Atualizações, cópias de segurança e correção de problemas todo mês. É cobrada por mês e não aumenta o prazo de entrega.',
    'ecommerce|Automatização de redes sociais': 'Liga a loja ao Instagram e ao Facebook: seus produtos aparecem no catálogo das redes, os produtos novos e as promoções são postados sozinhos, e as perguntas mais comuns no Direct recebem resposta automática. As contas e os anúncios são seus.'
  };
  /* Linguagens que uso, explicadas na aba Linguagens. O cliente não escolhe: a Mil e Uma Linhas! decide a ferramenta
     certa para cada projeto. consulta: true = usada só quando o projeto pede, depois de conversar. */
  var LINGUAGENS = [
    { id: 'javascript', nome: 'JavaScript', areas: ['site', 'sistema', 'automacao', 'app'],
      faz: 'É a linguagem dos navegadores: faz botões, formulários e telas reagirem. Com Node.js, também roda no servidor.',
      quando: 'Quase todo site ou sistema web usa em alguma parte.', exemplo: 'Carrinho de compras e painel que atualiza sem recarregar a página.' },
    { id: 'typescript', nome: 'TypeScript', areas: ['site', 'sistema', 'app'],
      faz: 'É JavaScript com tipos: o computador avisa muitos erros antes de o programa chegar ao cliente.',
      quando: 'Sistemas web que vão crescer e receber manutenção por anos.', exemplo: 'Portal do cliente com várias telas e regras.' },
    { id: 'python', nome: 'Python', areas: ['sistema', 'automacao', 'dados', 'site'],
      faz: 'Escrita simples e muitas bibliotecas prontas para dados, automação e inteligência artificial.',
      quando: 'Automatizar tarefas repetitivas, integrar sistemas e analisar dados.', exemplo: 'Robô que lê planilhas e gera relatórios sozinho.' },
    { id: 'php', nome: 'PHP', areas: ['site', 'sistema'],
      faz: 'Roda no servidor e gera páginas. É a base do WordPress e funciona em hospedagens comuns e baratas.',
      quando: 'Sites e sistemas web em que o custo de hospedagem pesa.', exemplo: 'Site com área administrativa para editar produtos.' },
    { id: 'sql', nome: 'SQL', areas: ['sistema', 'dados'],
      faz: 'É a linguagem dos bancos de dados: guarda, busca, cruza e soma informações com segurança.',
      quando: 'Sempre que o projeto precisa guardar clientes, pedidos ou estoque. Trabalha junto de outra linguagem.', exemplo: 'Relatório de vendas por mês em segundos.' },
    { id: 'java', nome: 'Java', areas: ['sistema', 'app', 'desempenho'],
      faz: 'Muito usada em empresas grandes e bancos. Estável e feita para sistemas que duram muitos anos.',
      quando: 'Sistemas corporativos grandes ou uma base que já está em Java.', exemplo: 'Sistema interno com muitos usuários e regras.' },
    { id: 'csharp', consulta: true, nome: 'C#', areas: ['sistema', 'site', 'desempenho'],
      faz: 'Linguagem da plataforma .NET, da Microsoft. Forte em sistemas empresariais, APIs e programas para Windows.',
      quando: 'Empresas que já usam produtos Microsoft ou precisam de programa para Windows.', exemplo: 'Sistema de gestão instalado nos computadores da loja.' },
    { id: 'go', consulta: true, nome: 'Go', areas: ['sistema', 'automacao', 'desempenho'],
      faz: 'Criada para serviços de internet rápidos e simples de manter, que aguentam muitos acessos ao mesmo tempo.',
      quando: 'APIs e serviços que recebem muito tráfego.', exemplo: 'Serviço que recebe milhares de pedidos por minuto.' },
    { id: 'ruby', consulta: true, nome: 'Ruby', areas: ['site', 'sistema'],
      faz: 'Com o Ruby on Rails, permite levantar uma plataforma web completa com pouco código.',
      quando: 'Testar uma ideia de produto rápido ou manter um sistema que já usa Rails.', exemplo: 'Primeira versão de uma plataforma por assinatura.' },
    { id: 'dart', consulta: true, nome: 'Dart (Flutter)', areas: ['app'],
      faz: 'Com o Flutter, um único código gera aplicativo para Android e iPhone.',
      quando: 'Aplicativo nas duas lojas gastando menos do que fazer dois separados.', exemplo: 'App de pedidos para clientes de uma rede de lojas.' },
    { id: 'kotlin', consulta: true, nome: 'Kotlin', areas: ['app'],
      faz: 'Linguagem recomendada pelo Google para aplicativos nativos de Android.',
      quando: 'App só para Android que precisa aproveitar bem o aparelho.', exemplo: 'App para a equipe de entregas, com câmera e GPS.' },
    { id: 'swift', consulta: true, nome: 'Swift', areas: ['app'],
      faz: 'Linguagem da Apple para aplicativos nativos de iPhone e iPad.',
      quando: 'App só para iPhone que precisa aproveitar bem o aparelho.', exemplo: 'App de atendimento para clientes de iPhone.' },
    { id: 'r', consulta: true, nome: 'R', areas: ['dados'],
      faz: 'Feita para estatística: gera análises e gráficos a partir de muitos dados.',
      quando: 'Pesquisas, indicadores e estudos estatísticos.', exemplo: 'Painel que compara o desempenho das filiais.' },
    { id: 'c', nome: 'C', areas: ['desempenho'],
      faz: 'Controle direto da memória e do hardware. Está em equipamentos e sistemas embarcados.',
      quando: 'Programas para equipamentos ou partes em que cada milissegundo conta.', exemplo: 'Programa de um sensor ligado a uma máquina.' },
    { id: 'cpp', nome: 'C++', areas: ['desempenho', 'sistema'],
      faz: 'Alto desempenho em programas maiores, como jogos, simulações e processamento pesado.',
      quando: 'Programas grandes que exigem muito do computador.', exemplo: 'Ferramenta que processa imagens ou cálculos pesados.' },
    { id: 'rust', consulta: true, nome: 'Rust', areas: ['desempenho', 'sistema'],
      faz: 'Desempenho parecido com o de C++, com verificações que evitam muitos erros de memória.',
      quando: 'Serviços críticos em que falha e segurança custam caro.', exemplo: 'Serviço que processa pagamentos ou muitos dados.' }
  ];
  var AREAS = { site: 'Sites', sistema: 'Sistemas', app: 'Aplicativos', automacao: 'Automação', dados: 'Dados e relatórios', desempenho: 'Alto desempenho' };

  var $ = function (s) { return document.querySelector(s); };
  var el = function (t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x !== undefined) e.textContent = x; return e; };

  var tipo = 'site', plano = 0, marcados = {}, carrinho = [], pronto = false, ouvintes = [];
  var GUARDA = 'mul-pedido', MAX_ITENS = 10;

  /* prazo estimado do item: o do plano mais o de cada adicional marcado; urgência encurta cerca de 30% */
  function prazoDe(t, p, marc, horas, prazoM) {
    var P = PEDIDOS[t], pl = P.planos[p], d;
    if (P.horas) { var sem = Math.ceil(horas / 20) * 5; d = [sem, sem + 5]; }
    else d = (pl.dias || [0, 0]).slice();
    (P.extras || []).forEach(function (x, i) { if (marc[i] && x.dias) { d[0] += x.dias[0]; d[1] += x.dias[1]; } });
    var dm = prazoM > 1 ? 0.7 : 1;
    return [Math.max(1, Math.ceil(d[0] * dm)), Math.max(1, Math.ceil(d[1] * dm))];
  }
  function diasTxt(d) { return d[0] === d[1] ? d[0] + (d[0] === 1 ? ' dia útil' : ' dias úteis') : d[0] + ' a ' + d[1] + ' dias úteis'; }
  function prazoTxt(t, p, dias) {
    var P = PEDIDOS[t];
    if (P.planos[p].mensal) return 'serviço mensal, primeira campanha em ' + diasTxt(dias);
    return diasTxt(dias);
  }
  function atual() {
    var horas = +$('#orc-horas').value, prazo = +$('#orc-prazo').value;
    return { tipo: tipo, plano: plano, marc: Object.assign({}, marcados), horas: horas, prazo: prazo, dias: prazoDe(tipo, plano, marcados, horas, prazo) };
  }
  function descrever(it) {
    var P = PEDIDOS[it.tipo], d = [P.nome, 'Plano ' + P.planos[it.plano].nome];
    if (P.horas) d.push(it.horas + ' horas');
    var ex = (P.extras || []).filter(function (x, i) { return it.marc[i]; }).map(function (x) { return x.nome; });
    if (ex.length) d.push('Adicionais: ' + ex.join(', '));
    if (it.prazo > 1) d.push('Urgente');
    return d.join(', ');
  }
  function somaDias() {
    return carrinho.reduce(function (s, it) { s[0] += it.dias[0]; s[1] += it.dias[1]; return s; }, [0, 0]);
  }
  function texto() {
    var l = ['Olá! Montei este pedido no site da Mil e Uma Linhas!:', ''];
    carrinho.forEach(function (it) { l.push('- ' + descrever(it) + '. Prazo estimado: ' + prazoTxt(it.tipo, it.plano, it.dias)); });
    l.push('', 'Quero receber o orçamento por escrito.', '', 'Sobre o meu projeto:', '');
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
      b.appendChild(el('span', 'orc-preco', pl.mensal ? 'Serviço mensal' : pl.dias ? 'Prazo: ' + diasTxt(pl.dias) : ''));
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
      var prazoX = x.mensal ? 'mensal, sem prazo extra' : !x.dias || !x.dias[1] ? 'sem prazo extra' : '+ ' + diasTxt(x.dias);
      var ajuda = AJUDA[tipo + '|' + x.nome], idp = 'ajuda-' + tipo + '-' + i;
      if (ajuda) {
        var bi = el('button', 'orc-info', 'i'); bi.type = 'button';
        bi.setAttribute('aria-label', 'O que é: ' + x.nome); bi.setAttribute('aria-expanded', 'false'); bi.setAttribute('aria-controls', idp);
        linha.appendChild(bi);
        var tx = el('p', 'orc-ajuda', ajuda); tx.id = idp; tx.hidden = true;
        bi.addEventListener('click', function () { var abre = tx.hidden; tx.hidden = !abre; bi.setAttribute('aria-expanded', abre ? 'true' : 'false'); });
        linha.appendChild(el('span', 'orc-preco', prazoX));
        linha.appendChild(tx);
      } else {
        linha.appendChild(el('span', 'orc-preco', prazoX));
      }
      box.appendChild(linha);
    });
    $('#orc-horas-caixa').hidden = !P.horas;
  }
  function atualizar() {
    var it = atual(), P = PEDIDOS[tipo];
    $('#orc-valor').textContent = descrever(it);
    $('#orc-dias').textContent = 'Prazo estimado: ' + prazoTxt(it.tipo, it.plano, it.dias);
    $('#orc-horas-val').textContent = it.horas + ' horas';
    var n = ['O preço sai por escrito depois que conversarmos sobre o projeto, sem compromisso. O prazo conta em dias úteis (segunda a sexta) e só começa depois da entrada de 50%, da aprovação do escopo e do recebimento de todo o material.'];
    if (tipo === 'trafego') n.unshift('O prazo é até a primeira campanha no ar.');
    if (+$('#orc-prazo').value > 1) n.unshift('Urgente: prazo cerca de 30% menor, quando a agenda permitir.');
    if (P.nota) n.unshift(P.nota);
    n.push('Depois da entrega eu explico por cima como usar e deixo meu contato (e-mail e WhatsApp) para qualquer dúvida.');
    $('#orc-nota').textContent = n.join(' ');
  }
  /* guarda só as escolhas; o prazo é refeito com a tabela atual ao abrir de novo */
  function guardar() {
    try { localStorage.setItem(GUARDA, JSON.stringify(carrinho.map(function (it) { return { tipo: it.tipo, plano: it.plano, marc: it.marc, horas: it.horas, prazo: it.prazo }; }))); } catch (e) { /* sem armazenamento: o pedido vale até fechar a página */ }
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
      var prazo = x.prazo === 1.25 ? 1.25 : 1;
      carrinho.push({ tipo: x.tipo, plano: x.plano, marc: marc, horas: horas, prazo: prazo, dias: prazoDe(x.tipo, x.plano, marc, horas, prazo) });
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
      li.appendChild(el('b', null, 'Prazo estimado: ' + prazoTxt(it.tipo, it.plano, it.dias)));
      var x = el('button', 'botao botao-mini', 'Remover'); x.type = 'button';
      x.setAttribute('aria-label', 'Remover ' + descrever(it));
      x.addEventListener('click', function () { carrinho.splice(i, 1); renderCarrinho(); });
      li.appendChild(x);
      ul.appendChild(li);
    });
    $('#orc-n').textContent = carrinho.length ? '(' + carrinho.length + (carrinho.length === 1 ? ' item)' : ' itens)') : '';
    // Com um item só, a soma repetiria a linha do item: mostro a soma a partir de dois itens.
    $('#orc-total').textContent = carrinho.length > 1 ? 'Um depois do outro: ' + diasTxt(somaDias()) + '.' : '';
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
    renderTipos(); renderPlanos(); renderExtras(); atualizar();
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
    menuEmail: menuEmail, PEDIDOS: PEDIDOS, diasTxt: diasTxt, EMAIL: EMAIL, LINGUAGENS: LINGUAGENS, AREAS: AREAS,
    rota: function (sub) {
      iniciar();
      if (sub === 'finalizar') return mostrarFinalizar(true);
      mostrarFinalizar(false);
      if (sub && Object.prototype.hasOwnProperty.call(PEDIDOS, sub) && sub !== tipo) escolher(sub, 0);
    },
    adicionar: function (k) { // usado pela vitrine da aparência Loja
      iniciar();
      if (carrinho.length >= MAX_ITENS) return;
      carrinho.push({ tipo: k, plano: 0, marc: {}, horas: 20, prazo: 1, dias: prazoDe(k, 0, {}, 20, 1) });
      renderCarrinho();
    },
    resumoCarrinho: function () { return { n: carrinho.length, txt: carrinho.map(function (it) { return PEDIDOS[it.tipo].nome; }).join(', ') }; },
    /* usado pela finalização (js/pedido.js) */
    linhas: function () { return carrinho.map(function (it) { return { descricao: descrever(it), prazo: prazoTxt(it.tipo, it.plano, it.dias) }; }); },
    total: function () { return { prazo: diasTxt(somaDias()) }; },
    paraEnvio: function () {
      return carrinho.map(function (it) {
        var o = { tipo: it.tipo, plano: it.plano, extras: Object.keys(it.marc).filter(function (k) { return it.marc[k]; }).map(Number), urgente: it.prazo > 1 };
        if (PEDIDOS[it.tipo].horas) o.horas = it.horas;
        return o;
      });
    },
    textoEmail: texto,
    esvaziar: function () { carrinho = []; if (pronto) renderCarrinho(); else mudou(); },
    aoMudar: function (f) { ouvintes.push(f); }
  };
})();
