'use strict';
(function () {
  var RODADAS = 600000;
  var $ = function (id) { return document.getElementById(id); };
  var cod = new TextEncoder(), dec = new TextDecoder();
  var ultimo = null;
  var EXEMPLO = 'Cliente: Marina Exemplo\nDocumento: 000.000.000-00 (fictício)\nObservação: prefere contato à tarde';
  $('texto').value = EXEMPLO;
  $('senha').value = 'cerrado-pequi-ponte-sol';

  function hex(b) { return Array.from(new Uint8Array(b), function (x) { return x.toString(16).padStart(2, '0'); }).join(''); }
  function b64(b) { var s = ''; new Uint8Array(b).forEach(function (x) { s += String.fromCharCode(x); }); return btoa(s); }
  function iguais(a, b) { if (a.length !== b.length) return false; for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false; return true; }

  async function derivar(senha, salt) {
    var base = await crypto.subtle.importKey('raw', cod.encode(senha), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt, iterations: RODADAS, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function cifrar(texto, senha) {
    var salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    var chave = await derivar(senha, salt);
    var c = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, chave, cod.encode(texto));
    return { salt: salt, iv: iv, dados: new Uint8Array(c) };
  }
  async function decifrar(reg, senha) {
    var chave = await derivar(senha, reg.salt);
    return dec.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: reg.iv }, chave, reg.dados));
  }

  function forca() {
    var s = $('senha').value, el = $('forca');
    if (!s) { el.textContent = 'Escreva uma senha para o cofre.'; el.className = 'forca fraca'; return; }
    var tipos = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z0-9]/].filter(function (r) { return r.test(s); }).length;
    var nota = s.length >= 16 && tipos >= 2 ? 'boa' : s.length >= 12 && tipos >= 2 ? 'media' : 'fraca';
    el.className = 'forca ' + nota;
    el.textContent = nota === 'boa' ? 'Senha longa: boa para o cofre.' : nota === 'media' ? 'Razoável. Algumas palavras a mais deixam bem mais difícil.' : 'Curta demais. Prefira uma frase com 16 caracteres ou mais.';
  }
  function ocupado(botao, sim, texto) { botao.disabled = sim; if (texto) botao.textContent = texto; }
  function mostrar(reg) {
    $('saida').textContent = b64(reg.dados).replace(/(.{44})/g, '$1\n');
    $('salt').textContent = hex(reg.salt);
    $('iv').textContent = hex(reg.iv);
  }
  function resultado(id, ok, txt) { var el = $(id); el.className = 'res ' + (ok ? 'bom' : 'ruim'); el.textContent = txt; }

  $('senha').addEventListener('input', forca);
  $('ver-senha').addEventListener('change', function () { $('senha').type = this.checked ? 'text' : 'password'; });

  $('cifrar').addEventListener('click', async function () {
    var b = this, t = $('texto').value, s = $('senha').value;
    if (!s) { $('tempo').textContent = 'Escreva uma senha antes de cifrar.'; $('senha').focus(); return; }
    if (!t.trim()) { $('tempo').textContent = 'Escreva a ficha antes de cifrar.'; $('texto').focus(); return; }
    ocupado(b, true, 'Cifrando...');
    try {
      var i = performance.now();
      ultimo = await cifrar(t, s);
      mostrar(ultimo);
      $('tempo').textContent = 'Cifrado em ' + Math.round(performance.now() - i).toLocaleString('pt-BR') + ' ms. A senha não foi guardada em lugar nenhum.';
      ['abrir', 'violar', 'repetir'].forEach(function (k) { $(k).disabled = false; });
      ['r-abrir', 'r-violar', 'r-repetir'].forEach(function (k) { $(k).textContent = ''; });
    } catch (e) { $('tempo').textContent = 'A criptografia do navegador não está disponível. Abra a página por HTTPS.'; }
    ocupado(b, false, 'Cifrar a ficha');
  });

  $('abrir').addEventListener('click', async function () {
    var b = this; ocupado(b, true);
    try {
      var t = await decifrar(ultimo, $('tentativa').value);
      resultado('r-abrir', true, 'Senha certa. Ficha aberta: ' + t);
    } catch (e) {
      resultado('r-abrir', false, 'Senha errada: a ficha continua fechada.');
    }
    ocupado(b, false);
  });

  $('violar').addEventListener('click', async function () {
    var b = this; ocupado(b, true);
    var alterado = { salt: ultimo.salt, iv: ultimo.iv, dados: ultimo.dados.slice() };
    alterado.dados[0] ^= 1;
    try {
      await decifrar(alterado, $('senha').value);
      resultado('r-violar', false, 'A alteração não foi percebida.');
    } catch (e) {
      resultado('r-violar', true, 'Alteração detectada: mesmo com a senha certa, o sistema recusou a ficha adulterada.');
    }
    ocupado(b, false);
  });

  $('repetir').addEventListener('click', async function () {
    var b = this; ocupado(b, true);
    var r = await cifrar($('texto').value, $('senha').value);
    var dif = !iguais(r.dados, ultimo.dados);
    var d0 = b64(ultimo.dados).slice(0, 20), d1 = b64(r.dados).slice(0, 20);
    resultado('r-repetir', dif, dif ? 'Mesmo texto, resultado diferente: ' + d0 + '... e ' + d1 + '...' : 'Os dois resultados ficaram iguais.');
    ocupado(b, false);
  });

  $('medir').addEventListener('click', async function () {
    var b = this; ocupado(b, true);
    var i = performance.now();
    await derivar('palpite', crypto.getRandomValues(new Uint8Array(16)));
    var ms = performance.now() - i, porDia = Math.floor(86400000 / Math.max(ms, 1));
    resultado('r-medir', true, 'Um palpite levou ' + Math.round(ms).toLocaleString('pt-BR') + ' ms neste aparelho, cerca de ' + porDia.toLocaleString('pt-BR') + ' palpites por dia em um único processo. Computadores especializados são bem mais rápidos, por isso a senha longa continua importante.');
    ocupado(b, false);
  });

  forca();
})();
