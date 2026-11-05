/* Demonstrações. Tudo fica na memória desta aba: nada é salvo nem enviado.
   Texto digitado só entra na página por textContent, nunca como HTML. */
window.MUL_DEMOS = (function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var el = function (tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; };
  var reais = function (v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: v >= 100 ? 0 : 2 }); };
  var iniciado = {};

  /* ---------- pedidos ---------- */
  function pedidos() {
    var ITENS = [['X-Salada', 18], ['X-Bacon', 24], ['Batata frita', 15], ['Suco de cupuaçu', 9], ['Guaraná', 6]];
    var ETAPAS = [['novo', 'Novos', 'Enviar para a cozinha'], ['preparo', 'Em preparo', 'Marcar como entregue'], ['entregue', 'Entregues', null]];
    var seq = 100;
    var lista = [
      { id: ++seq, nome: 'Ana', item: 0, qtd: 2, etapa: 'preparo' },
      { id: ++seq, nome: 'Bruno', item: 3, qtd: 1, etapa: 'novo' }
    ];
    var sel = $('#ped-item');
    ITENS.forEach(function (it, i) { var o = el('option', null, it[0] + ' (' + reais(it[1]) + ')'); o.value = i; sel.appendChild(o); });
    function render() {
      var q = $('#ped-quadro'); q.textContent = '';
      ETAPAS.forEach(function (et, idx) {
        var c = el('div', 'coluna'); c.appendChild(el('h3', null, et[1] + ' [' + lista.filter(function (p) { return p.etapa === et[0]; }).length + ']'));
        var doGrupo = lista.filter(function (p) { return p.etapa === et[0]; });
        if (!doGrupo.length) c.appendChild(el('p', 'vazio', idx === 0 ? 'Nenhum pedido novo. Registre um acima.' : 'Nada por aqui ainda.'));
        doGrupo.forEach(function (p) {
          var d = el('div', 'ped');
          d.appendChild(el('b', null, '#' + p.id));
          d.appendChild(document.createTextNode(p.qtd + ' x ' + ITENS[p.item][0] + ' para ' + p.nome));
          if (et[2]) {
            var br = document.createElement('br'); d.appendChild(br);
            var b = el('button', 'botao', et[2]); b.type = 'button';
            b.addEventListener('click', function () { p.etapa = ETAPAS[idx + 1][0]; render(); });
            d.appendChild(b);
          }
          c.appendChild(d);
        });
        q.appendChild(c);
      });
      var total = lista.reduce(function (s, p) { return s + ITENS[p.item][1] * p.qtd; }, 0);
      var ent = lista.filter(function (p) { return p.etapa === 'entregue'; }).reduce(function (s, p) { return s + ITENS[p.item][1] * p.qtd; }, 0);
      $('#ped-totais').textContent = lista.length + (lista.length === 1 ? ' pedido' : ' pedidos') + ', ' + reais(total) + ' no total, ' + reais(ent) + ' já entregues.';
    }
    $('#ped-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = $('#ped-nome').value.trim(), qtd = parseInt($('#ped-qtd').value, 10), erro = $('#ped-erro');
      if (!nome) { erro.textContent = 'Escreva o nome do cliente para registrar o pedido.'; erro.hidden = false; $('#ped-nome').focus(); return; }
      if (!(qtd >= 1 && qtd <= 20)) { erro.textContent = 'A quantidade precisa ficar entre 1 e 20.'; erro.hidden = false; $('#ped-qtd').focus(); return; }
      erro.hidden = true;
      lista.push({ id: ++seq, nome: nome, item: parseInt(sel.value, 10), qtd: qtd, etapa: 'novo' });
      $('#ped-nome').value = ''; $('#ped-qtd').value = 1;
      render();
    });
    render();
  }

  /* ---------- atendimento ---------- */
  function atendimento() {
    var PRECOS = { Banho: { Pequeno: 45, Médio: 60, Grande: 80 }, Tosa: { Pequeno: 55, Médio: 70, Grande: 95 }, 'Banho e tosa': { Pequeno: 90, Médio: 115, Grande: 150 } };
    var falas = $('#at-falas'), opcoes = $('#at-opcoes'), resumo = $('#at-resumo'), dados, timers = [];
    function fala(t, eu) { var f = el('div', 'fala' + (eu ? ' eu' : ''), t); falas.appendChild(f); falas.scrollTop = falas.scrollHeight; }
    function mostrarResumo() {
      var l = [];
      l.push('serviço:  ' + (dados.servico || '...'));
      l.push('porte:    ' + (dados.porte || '...'));
      l.push('dia:      ' + (dados.dia || '...'));
      l.push('cliente:  ' + (dados.nome || '...'));
      l.push('valor:    ' + (dados.servico && dados.porte ? reais(PRECOS[dados.servico][dados.porte]) : '...'));
      l.push('situação: ' + (dados.fim ? 'pronto para confirmar' : 'em conversa'));
      resumo.textContent = l.join('\n');
    }
    function perguntar(txt, ops, cb) {
      opcoes.textContent = '';
      var t = setTimeout(function () {
        fala(txt);
        ops.forEach(function (o) {
          var b = el('button', 'botao', o); b.type = 'button';
          b.addEventListener('click', function () { fala(o, true); opcoes.textContent = ''; cb(o); mostrarResumo(); });
          opcoes.appendChild(b);
        });
      }, 260);
      timers.push(t);
    }
    function pedirNome() {
      opcoes.textContent = '';
      var t = setTimeout(function () {
        fala('Qual é o seu nome?');
        var f = el('form'), i = document.createElement('input'), b = el('button', 'botao cheio', 'Enviar');
        i.maxLength = 24; i.placeholder = 'Seu nome'; i.autocomplete = 'off'; i.setAttribute('aria-label', 'Seu nome');
        f.appendChild(i); f.appendChild(b);
        f.addEventListener('submit', function (e) {
          e.preventDefault();
          var n = i.value.trim();
          if (!n) { i.focus(); return; }
          fala(n, true); dados.nome = n; dados.fim = true; opcoes.textContent = ''; mostrarResumo();
          timers.push(setTimeout(function () {
            fala('Obrigado, ' + n + '. O resumo já foi para a loja, que só precisa confirmar o horário.');
          }, 260));
        });
        opcoes.appendChild(f);
      }, 260);
      timers.push(t);
    }
    function iniciar() {
      timers.forEach(clearTimeout); timers = [];
      dados = {}; falas.textContent = ''; opcoes.textContent = ''; mostrarResumo();
      fala('Olá! Aqui é o atendimento do Pet Shop Exemplo.');
      perguntar('O que o seu pet precisa?', Object.keys(PRECOS), function (s) {
        dados.servico = s;
        perguntar('Qual é o porte dele?', ['Pequeno', 'Médio', 'Grande'], function (p) {
          dados.porte = p;
          perguntar('Fica ' + reais(PRECOS[dados.servico][p]) + '. Qual dia é melhor?', ['Hoje', 'Amanhã', 'Sábado'], function (d) {
            dados.dia = d;
            pedirNome();
          });
        });
      });
    }
    $('#at-reiniciar').addEventListener('click', iniciar);
    iniciar();
  }

  /* ---------- funil ---------- */
  function funil() {
    var CAMPOS = [
      ['verba', 'Verba de anúncios no mês', 200, 10000, 100, 1000, reais],
      ['cpc', 'Custo por clique', 0.2, 5, 0.1, 1.5, reais],
      ['conv', 'Quem clica e chama', 1, 30, 1, 8, function (v) { return v + '%'; }],
      ['fecha', 'Quem chama e compra', 1, 60, 1, 20, function (v) { return v + '%'; }],
      ['ticket', 'Valor médio da venda', 20, 2000, 10, 150, reais]
    ];
    var box = $('#fu-controles'), ctr = {};
    CAMPOS.forEach(function (c) {
      var l = el('label'); l.appendChild(document.createTextNode(c[1] + ' '));
      var o = document.createElement('output'), i = document.createElement('input');
      i.type = 'range'; i.min = c[2]; i.max = c[3]; i.step = c[4]; i.value = c[5];
      l.appendChild(o); l.appendChild(i); box.appendChild(l);
      ctr[c[0]] = i;
      i.addEventListener('input', atualizar);
      i._fmt = c[6]; i._out = o;
    });
    function barra(v, max) {
      if (v <= 0) return '';
      var n = Math.max(1, Math.round(Math.log10(v + 1) / Math.log10(max + 1) * 26));
      return new Array(n + 1).join('#');
    }
    function atualizar() {
      Object.keys(ctr).forEach(function (k) { ctr[k]._out.textContent = ctr[k]._fmt(parseFloat(ctr[k].value)); });
      var verba = +ctr.verba.value, cliques = verba / +ctr.cpc.value, contatos = cliques * +ctr.conv.value / 100, vendas = contatos * +ctr.fecha.value / 100, fat = vendas * +ctr.ticket.value;
      var inteiro = function (v) { return Math.round(v).toLocaleString('pt-BR'); };
      var pad = function (s, n) { while (s.length < n) s = ' ' + s; return s; };
      var m = Math.max(cliques, 1);
      $('#fu-grafico').textContent = [
        'cliques  ' + pad(inteiro(cliques), 6) + ' ' + barra(cliques, m),
        'contatos ' + pad(inteiro(contatos), 6) + ' ' + barra(contatos, m),
        'vendas   ' + pad(inteiro(vendas), 6) + ' ' + barra(vendas, m)
      ].join('\n');
      var saldo = fat - verba, custo = vendas >= 1 ? reais(verba / vendas) : 'sem venda inteira';
      $('#fu-texto').textContent = 'Faturamento estimado: ' + reais(fat) + '. Depois da verba, ' + (saldo >= 0 ? 'sobram ' : 'faltam ') + reais(Math.abs(saldo)) + '. Custo por venda: ' + custo + '. As barras usam escala logarítmica para caberem na tela.';
    }
    atualizar();
  }

  /* ---------- monte uma página ---------- */
  function pagina() {
    var CORES = {
      forno: { '--p-fundo': '#FFF8EE', '--p-tinta': '#3A2412', '--p-linha': '#E8D6BC', '--p-capa': '#C4501B', '--p-capa-tinta': '#FFF8EE', '--p-botao': '#FFF8EE', '--p-botao-tinta': '#7A2E0B' },
      mar: { '--p-fundo': '#F2F8FB', '--p-tinta': '#0E2C3F', '--p-linha': '#CDE0EA', '--p-capa': '#0B5C86', '--p-capa-tinta': '#F2F8FB', '--p-botao': '#FFD45E', '--p-botao-tinta': '#0E2C3F' },
      mato: { '--p-fundo': '#F5F7EC', '--p-tinta': '#1F2E18', '--p-linha': '#D4DDBF', '--p-capa': '#2F5B2A', '--p-capa-tinta': '#F5F7EC', '--p-botao': '#E9B949', '--p-botao-tinta': '#1F2E18' }
    };
    var pr = $('#pg-previa'), form = $('#pg-form');
    function val(id, padrao) { var v = $(id).value.trim(); return v || padrao; }
    function render() {
      var cor = form.querySelector('input[name="pg-cor"]:checked').value;
      var tela = form.querySelector('input[name="pg-tela"]:checked').value;
      Object.keys(CORES[cor]).forEach(function (k) { pr.style.setProperty(k, CORES[cor][k]); });
      pr.classList.toggle('cel', tela === 'cel');
      pr.textContent = '';
      var hd = el('header'); hd.appendChild(el('div', null, val('#pg-nome', 'Seu negócio'))); hd.appendChild(el('span', null, 'Cuiabá, MT'));
      pr.appendChild(hd);
      var capa = el('div', 'capa'); capa.appendChild(el('h3', null, val('#pg-frase', 'O que você faz, em uma frase.')));
      var a = el('a', null, val('#pg-botao', 'Falar com a gente')); a.setAttribute('aria-disabled', 'true'); capa.appendChild(a);
      pr.appendChild(capa);
      if ($('#pg-serv').checked) {
        var b1 = el('div', 'bloco'); b1.appendChild(el('h4', null, 'Produtos'));
        var ul = el('ul'); ['Produto um', 'Produto dois', 'Produto três'].forEach(function (t) { ul.appendChild(el('li', null, t)); });
        b1.appendChild(ul); pr.appendChild(b1);
      }
      if ($('#pg-hora').checked) {
        var b2 = el('div', 'bloco'); b2.appendChild(el('h4', null, 'Horário'));
        b2.appendChild(el('p', null, 'Segunda a sábado, das 6h às 19h.')); pr.appendChild(b2);
      }
    }
    form.addEventListener('input', render);
    form.addEventListener('change', render);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    render();
  }

  /* ---------- foto em ASCII ---------- */
  function ascii() {
    var RAMPA = ' .:-=+*#%@', origem = null;
    var saida = $('#as-saida'), erro = $('#as-erro'), arq = $('#as-arq'), larg = $('#as-larg'), inv = $('#as-inv');
    function converter() {
      if (!origem) return;
      var cols = +larg.value;
      var w = origem.width, h = origem.height;
      var rows = Math.max(1, Math.round(cols * (h / w) * 0.5));
      var c = document.createElement('canvas'); c.width = cols; c.height = rows;
      var x = c.getContext('2d', { willReadFrequently: true });
      x.fillStyle = '#000'; x.fillRect(0, 0, cols, rows);
      x.drawImage(origem, 0, 0, cols, rows);
      var d = x.getImageData(0, 0, cols, rows).data, min = 255, max = 0, i;
      for (i = 0; i < d.length; i += 4) { var l0 = (d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000; if (l0 < min) min = l0; if (l0 > max) max = l0; }
      var esc = max - min || 1, out = [], p = 0;
      for (var r = 0; r < rows; r++) {
        var ln = '';
        for (var k = 0; k < cols; k++, p += 4) {
          var l = ((d[p] * 299 + d[p + 1] * 587 + d[p + 2] * 114) / 1000 - min) / esc;
          if (inv.checked) l = 1 - l;
          ln += RAMPA.charAt(Math.min(RAMPA.length - 1, Math.floor(l * RAMPA.length)));
        }
        out.push(ln);
      }
      saida.textContent = out.join('\n');
    }
    function logo() {
      var c = document.createElement('canvas'); c.width = 600; c.height = 460;
      var x = c.getContext('2d');
      x.fillStyle = '#000'; x.fillRect(0, 0, 600, 460); x.fillStyle = '#fff';
      x.font = '700 210px "JetBrains Mono", monospace'; x.textBaseline = 'alphabetic';
      x.fillText('10', 40, 200); x.fillText('01', 40, 410);
      x.fillRect(340 + 130, 40, 44, 280); x.beginPath(); x.arc(492, 385, 28, 0, 7); x.fill();
      origem = c; erro.hidden = true; converter();
    }
    arq.addEventListener('change', function () {
      var f = arq.files && arq.files[0];
      if (!f) return;
      if (f.size > 15 * 1024 * 1024) { erro.textContent = 'Essa imagem passa de 15 MB. Escolha um arquivo menor.'; erro.hidden = false; return; }
      if (!/^image\/(png|jpeg|webp|gif)$/.test(f.type)) { erro.textContent = 'Formato não aceito. Use PNG, JPG, WEBP ou GIF.'; erro.hidden = false; return; }
      createImageBitmap(f).then(function (b) { origem = b; erro.hidden = true; converter(); })
        .catch(function () { erro.textContent = 'Não deu para ler essa imagem. Tente outro arquivo.'; erro.hidden = false; });
    });
    larg.addEventListener('input', converter);
    inv.addEventListener('change', converter);
    $('#as-logo').addEventListener('click', logo);
    $('#as-copiar').addEventListener('click', function () {
      var b = $('#as-copiar'), t = saida.textContent;
      if (!navigator.clipboard) { erro.textContent = 'Este navegador não permite copiar daqui. Selecione o texto com o dedo ou o mouse.'; erro.hidden = false; return; }
      navigator.clipboard.writeText(t).then(function () {
        b.textContent = 'Texto copiado'; setTimeout(function () { b.textContent = 'Copiar texto'; }, 1500);
      }).catch(function () { erro.textContent = 'O navegador não deixou copiar. Selecione o texto com o dedo ou o mouse.'; erro.hidden = false; });
    });
    var f = document.fonts && document.fonts.load ? document.fonts.load('700 200px "JetBrains Mono"') : Promise.resolve();
    f.catch(function () {}).then(logo);
  }

  var MAPA = { pedidos: pedidos, atendimento: atendimento, funil: funil, pagina: pagina, ascii: ascii };
  return {
    abrir: function (id) { if (!iniciado[id] && MAPA[id]) { iniciado[id] = true; MAPA[id](); } }
  };
})();
