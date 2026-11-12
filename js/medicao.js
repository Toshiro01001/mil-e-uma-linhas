// Medição de visitas (Google Analytics) e de anúncios (Pixel da Meta).
// Nada daqui é carregado antes de a pessoa tocar em "Aceitar". Sem os dois IDs abaixo, este arquivo não faz nada.
(function () {
  'use strict';
  var GA_ID = 'G-FGK3Y3S8ZJ';     // ID de medição do Google Analytics 4, no formato G-XXXXXXXXXX
  var PIXEL_ID = '4824625814524904';  // ID do Pixel da Meta, só números (15 ou 16 dígitos)

  if (!/^G-[A-Z0-9]{6,14}$/.test(GA_ID)) GA_ID = '';
  if (!/^\d{15,16}$/.test(PIXEL_ID)) PIXEL_ID = '';
  if (!GA_ID && !PIXEL_ID) return;

  var CHAVE = 'mul-medicao', ligado = false, aviso = null;

  function ler() { try { var v = localStorage.getItem(CHAVE); return v === 'sim' || v === 'nao' ? v : ''; } catch (e) { return ''; } }
  function gravar(v) { try { localStorage.setItem(CHAVE, v); } catch (e) {} }

  function script(src) {
    var s = document.createElement('script');
    s.async = true; s.src = src;
    document.head.appendChild(s);
  }

  function pagina() { return location.origin + location.pathname + (location.hash || '#inicio'); }

  function ligar() {
    if (ligado) return;
    ligado = true;
    if (GA_ID) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', GA_ID, { send_page_view: false });
      script('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID));
    }
    if (PIXEL_ID) {
      var n = window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!window._fbq) window._fbq = n;
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      script('https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', PIXEL_ID);
    }
    visita();
    window.addEventListener('hashchange', visita);
    // Só o nome do evento sai daqui: nenhum dado digitado no pedido é enviado ao Google ou à Meta.
    document.addEventListener('mul:pedido-enviado', function () { evento('generate_lead', 'Lead'); });
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href^="mailto:"]') : null;
      if (a) evento('contact', 'Contact');
    });
  }

  function visita() {
    if (window.gtag && GA_ID) window.gtag('event', 'page_view', { page_location: pagina(), page_title: document.title });
    if (window.fbq && PIXEL_ID) window.fbq('track', 'PageView');
  }
  function evento(nomeGa, nomePixel) {
    if (window.gtag && GA_ID) window.gtag('event', nomeGa);
    if (window.fbq && PIXEL_ID) window.fbq('track', nomePixel);
  }

  function apagarCookies() {
    var nomes = document.cookie.split(';').map(function (c) { return c.split('=')[0].trim(); })
      .filter(function (n) { return /^(_ga|_gid|_gat|_fbp|_fbc)/.test(n); });
    var host = location.hostname, dominios = ['', host, '.' + host];
    nomes.forEach(function (n) {
      dominios.forEach(function (d) {
        document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }

  function fechar() { if (aviso) { aviso.remove(); aviso = null; } }

  function mostrar() {
    if (aviso) { aviso.querySelector('button').focus(); return; }
    aviso = document.createElement('section');
    aviso.className = 'medicao';
    aviso.setAttribute('aria-label', 'Aviso sobre medição de visitas');
    var p = document.createElement('p');
    p.appendChild(document.createTextNode('Posso contar a sua visita? Uso o Google Analytics e o Pixel da Meta para medir as visitas e os meus anúncios. Só ligo se você aceitar. '));
    var l = document.createElement('a');
    l.href = 'privacidade.html#cookies'; l.textContent = 'Ver o que é medido';
    p.appendChild(l);
    var linha = document.createElement('div');
    linha.className = 'medicao-acoes';
    var sim = document.createElement('button'), nao = document.createElement('button');
    sim.type = nao.type = 'button';
    sim.className = nao.className = 'botao';
    nao.textContent = 'Recusar'; sim.textContent = 'Aceitar';
    nao.addEventListener('click', function () {
      var antes = ler();
      gravar('nao'); apagarCookies(); fechar();
      if (antes === 'sim' || ligado) location.reload(); // tira da memória o que já tinha sido carregado
    });
    sim.addEventListener('click', function () { gravar('sim'); fechar(); ligar(); });
    linha.appendChild(nao); linha.appendChild(sim);
    aviso.appendChild(p); aviso.appendChild(linha);
    document.body.appendChild(aviso);
  }

  function pronto() {
    // O atalho para mudar a escolha fica no rodapé (aparência ASCII) e junto do link da Política, na aba orçamento (todas as aparências).
    function atalho(texto, classe) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = classe; b.textContent = texto;
      b.setAttribute('aria-label', 'Mudar a escolha sobre medição de visitas');
      b.addEventListener('click', mostrar);
      return b;
    }
    var leis = document.querySelector('.st-leis');
    if (leis) leis.appendChild(atalho('Medição', 'st-medicao'));
    var nota = document.querySelector('p.nota a[href="privacidade.html"]');
    if (nota && nota.parentNode) {
      nota.parentNode.appendChild(document.createTextNode(' '));
      nota.parentNode.appendChild(atalho('Mudar a escolha sobre medição de visitas', 'medicao-link'));
    }
    var escolha = ler();
    if (escolha === 'sim') ligar();
    else if (!escolha) mostrar();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pronto);
  else pronto();
})();
