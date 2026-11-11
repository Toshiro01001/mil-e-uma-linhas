/* Dados da loja. Tudo o que muda de um cliente para outro fica só aqui. Nesta versão de teste, os endereços das redes e o WhatsApp são os que a loja divulga; o horário ainda é de exemplo. */
window.LOJA = {
  nome: 'HAI OUTLET',
  logo: 'logo.webp',
  frase: 'Estilo que valoriza você, em todos os tamanhos e gostos!',
  frase2: 'Qualidade, variedade e looks incríveis esperam por você!',
  sobre: [
    ['✨', 'Seu estilo, seu corpo, sua melhor versão!'],
    ['👗', 'Looks incríveis para todos os gostos e tamanhos.'],
    ['🔥', 'Promoções sempre rolando para você economizar!'],
    ['🛍️', 'Venha se apaixonar e encontre o look perfeito!']
  ],
  onde: 'Dentro do Comper Nova CPA, em Cuiabá',
  /* nome curto do lugar e uma frase curta tirada do texto da própria loja, para as etiquetas do topo */
  ondeCurto: 'Comper Nova CPA',
  etiqueta: 'Todos os tamanhos',
  whatsapp: '556599406901',
  whatsappTexto: '(65) 9940-6901',
  mensagemWhats: 'Olá! Vim pelo cartão da loja.',
  instagram: 'https://www.instagram.com/hai_outlet/',
  tiktok: 'https://www.tiktok.com/@hai.outlet',
  /* ponto do supermercado onde a loja fica, tirado do Google Maps */
  lat: -15.5594108,
  lng: -56.0532517,
  endereco: 'Rua Jornalista Amaro de Figueiredo Falcão, 333, CPA I, Cuiabá, MT',
  /* central de atendimento: a página de links que a loja já usa */
  central: 'https://linktr.ee/hai_outlet',
  email: '',
  /* horário por dia da semana, de domingo (0) a sábado (6); null é dia fechado. Só a quarta-feira foi vista no perfil da loja: o resto é exemplo. */
  horario: [null, ['08:00', '19:00'], ['08:00', '19:00'], ['08:00', '19:00'], ['08:00', '19:00'], ['08:00', '19:00'], ['08:00', '19:00']],
  horarioExemplo: true,
  fuso: 'America/Cuiaba',
  qr: 'qr.svg?v=1',
  contato: 'contato.vcf?v=5',
  fotos: [
    { cor: 'a', legenda: 'Foto de peça 1' }, { cor: 'b', legenda: 'Foto de peça 2' },
    { cor: 'c', legenda: 'Foto de peça 3' }, { cor: 'd', legenda: 'Foto de peça 4' }
  ]
};
