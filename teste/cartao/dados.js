/* Dados da loja. Tudo o que muda de um cliente para outro fica só aqui. Nesta versão de teste, os endereços das redes e o WhatsApp são os que a loja divulga; o horário veio da ficha da loja no Google e a entrega em casa é uma suposição a confirmar. */
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
  onde: 'Dentro do Supermercado Comper CPA, em Cuiabá',
  /* nome curto do lugar e uma frase curta tirada do texto da própria loja, para as etiquetas do topo */
  ondeCurto: 'Supermercado Comper CPA',
  etiqueta: 'Todos os tamanhos',
  /* fita que corre no alto da página: só palavras que a própria loja usa */
  fita: ['Todos os tamanhos', 'Todos os gostos', 'Looks incríveis', 'Qualidade e variedade', 'Supermercado Comper CPA'],
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
  email: 'haioutlet@gmail.com',
  /* horário por dia da semana, de domingo (0) a sábado (6); null é dia fechado. Tirado da ficha da loja no Google; a dona ainda vai confirmar. */
  horario: [null, ['08:30', '17:00'], ['08:30', '18:30'], ['08:30', '18:30'], ['08:30', '18:30'], ['08:30', '18:30'], ['08:30', '17:00']],
  horarioExemplo: false,
  /* entrega em casa: presumida por enquanto; a dona ainda vai confirmar */
  entrega: true,
  mensagemEntrega: 'Olá! Vim pelo cartão da loja e quero solicitar uma entrega.',
  fuso: 'America/Cuiaba',
  qr: 'qr.svg?v=1',
  contato: 'contato.vcf?v=5',
  /* fotos tiradas do Instagram da própria loja, recortadas do pescoço para baixo para não mostrar o rosto de ninguém. A dona ainda vai dizer se pode usar. */
  fotos: [
    { arquivo: 'fotos/peca-1.webp', legenda: 'Regatas bordadas no cabide' },
    { arquivo: 'fotos/peca-2.webp', legenda: 'Vestido rosa com bolsa clara' },
    { arquivo: 'fotos/peca-3.webp', legenda: 'Blusa verde-limão com short-saia preto' },
    { arquivo: 'fotos/peca-4.webp', legenda: 'Camiseta verde com short verde-oliva' },
    { arquivo: 'fotos/peca-5.webp', legenda: 'Conjunto amarelo de alças' },
    { arquivo: 'fotos/peca-6.webp', legenda: 'Vestido marrom midi' },
    { arquivo: 'fotos/peca-7.webp', legenda: 'Camisa e short amarelo-claro' },
    { arquivo: 'fotos/peca-8.webp', legenda: 'Regata preta com short branco' }
  ],
  /* catálogo: tipos de peça e fotos do Instagram da própria loja, recortadas do pescoço para baixo para não mostrar o rosto de ninguém.
     São fotos de catálogo das marcas que a loja revende; a dona ainda vai dizer se pode usar. Sem preço nem tamanho: isso muda e a loja responde pelo WhatsApp. */
  /* grupos do catálogo, na ordem em que aparecem. Um grupo sem nenhuma peça não é mostrado.
     Para uma peça entrar em Fitness, acrescente grupo: 'x' nela, por exemplo: { arquivo: '...', legenda: '...', tipo: 'c', grupo: 'x' } */
  grupos: [['f', 'Feminino'], ['m', 'Masculino'], ['x', 'Fitness']],
  /* tipos de peça: código, nome e o grupo a que pertencem */
  tipos: [['v', 'Vestidos', 'f'], ['c', 'Conjuntos', 'f'], ['b', 'Blusas', 'f'], ['m', 'Masculino', 'm']],
  mensagemPeca: 'Olá! Vim pelo cartão da loja e gostei desta peça do catálogo: ',
  /* fundo do catálogo: 'seda' põe o vídeo de tecido em movimento atrás das peças; qualquer outro valor deixa só a trama de pontos */
  fundoCatalogo: 'seda',
  mensagemLista: 'Olá! Vim pelo cartão da loja e gostei destas peças do catálogo:',
  catalogo: [
    { arquivo: 'fotos/c-04.webp', grande: 'fotos/g/c-04.webp', legenda: 'Vestido marrom midi', tipo: 'v' },
    { arquivo: 'fotos/c-01.webp', grande: 'fotos/g/c-01.webp', legenda: 'Blusa verde-oliva com short claro', tipo: 'c' },
    { arquivo: 'fotos/c-58.webp', legenda: 'Blusa laranja com laço', tipo: 'b' },
    { arquivo: 'fotos/c-23.webp', grande: 'fotos/g/c-23.webp', legenda: 'Camiseta azul', tipo: 'm' },
    { arquivo: 'fotos/c-49.webp', grande: 'fotos/g/c-49.webp', legenda: 'Vestido listrado colorido', tipo: 'v' },
    { arquivo: 'fotos/c-03.webp', legenda: 'Conjunto amarelo de alças', tipo: 'c' },
    { arquivo: 'fotos/c-14.webp', legenda: 'Colete jeans', tipo: 'b' },
    { arquivo: 'fotos/c-28.webp', grande: 'fotos/g/c-28.webp', legenda: 'Polo azul-marinho', tipo: 'm' },
    { arquivo: 'fotos/c-39.webp', grande: 'fotos/g/c-39.webp', legenda: 'Vestido longo estampado', tipo: 'v' },
    { arquivo: 'fotos/c-02.webp', legenda: 'Camiseta verde com short verde-oliva', tipo: 'c' },
    { arquivo: 'fotos/c-59.webp', legenda: 'Blusa verde-limão com babado', tipo: 'b' },
    { arquivo: 'fotos/c-24.webp', grande: 'fotos/g/c-24.webp', legenda: 'Camiseta verde', tipo: 'm' },
    { arquivo: 'fotos/c-22.webp', grande: 'fotos/g/c-22.webp', legenda: 'Vestido amarelo longo', tipo: 'v' },
    { arquivo: 'fotos/c-10.webp', grande: 'fotos/g/c-10.webp', legenda: 'Camisa e short amarelo-claro', tipo: 'c' },
    { arquivo: 'fotos/c-13.webp', grande: 'fotos/g/c-13.webp', legenda: 'Blusa estampada geométrica', tipo: 'b' },
    { arquivo: 'fotos/c-26.webp', grande: 'fotos/g/c-26.webp', legenda: 'Camiseta bege', tipo: 'm' },
    { arquivo: 'fotos/c-40.webp', grande: 'fotos/g/c-40.webp', legenda: 'Vestido floral azul-marinho', tipo: 'v' },
    { arquivo: 'fotos/c-09.webp', legenda: 'Regata preta com short bege', tipo: 'c' },
    { arquivo: 'fotos/c-35.webp', grande: 'fotos/g/c-35.webp', legenda: 'Camisa azul com babados', tipo: 'b' },
    { arquivo: 'fotos/c-32.webp', grande: 'fotos/g/c-32.webp', legenda: 'Polo cinza', tipo: 'm' },
    { arquivo: 'fotos/c-05.webp', legenda: 'Vestido verde canelado', tipo: 'v' },
    { arquivo: 'fotos/c-00.webp', legenda: 'Blusa preta com short-saia preto', tipo: 'c' },
    { arquivo: 'fotos/c-12.webp', grande: 'fotos/g/c-12.webp', legenda: 'Regata marrom decote V', tipo: 'b' },
    { arquivo: 'fotos/c-27.webp', legenda: 'Camiseta branca', tipo: 'm' },
    { arquivo: 'fotos/c-43.webp', grande: 'fotos/g/c-43.webp', legenda: 'Vestido azul listrado longo', tipo: 'v' },
    { arquivo: 'fotos/c-17.webp', grande: 'fotos/g/c-17.webp', legenda: 'Colete caramelo com calça', tipo: 'c' },
    { arquivo: 'fotos/c-21.webp', grande: 'fotos/g/c-21.webp', legenda: 'Camisa azul-clara bordada', tipo: 'b' },
    { arquivo: 'fotos/c-25.webp', legenda: 'Camiseta verde-oliva gola V', tipo: 'm' },
    { arquivo: 'fotos/c-48.webp', legenda: 'Vestido azul de alças', tipo: 'v' },
    { arquivo: 'fotos/c-15.webp', legenda: 'Blusa azul-clara com babado', tipo: 'b' },
    { arquivo: 'fotos/c-31.webp', legenda: 'Camiseta cinza', tipo: 'm' },
    { arquivo: 'fotos/c-41.webp', grande: 'fotos/g/c-41.webp', legenda: 'Macacão listrado', tipo: 'v' },
    { arquivo: 'fotos/c-11.webp', grande: 'fotos/g/c-11.webp', legenda: 'Regata preta decote V', tipo: 'b' },
    { arquivo: 'fotos/c-29.webp', legenda: 'Regata preta', tipo: 'm' },
    { arquivo: 'fotos/c-56.webp', grande: 'fotos/g/c-56.webp', legenda: 'Vestido longo rosé com poás', tipo: 'v' },
    { arquivo: 'fotos/c-37.webp', legenda: 'Camisa xadrez rosa', tipo: 'b' },
    { arquivo: 'fotos/c-38.webp', legenda: 'Camiseta azul estampada', tipo: 'm' },
    { arquivo: 'fotos/c-34.webp', legenda: 'Top verde tomara que caia', tipo: 'b' },
    { arquivo: 'fotos/c-18.webp', legenda: 'Camisa listrada', tipo: 'b' },
    { arquivo: 'fotos/c-19.webp', legenda: 'Blusa branca de um ombro', tipo: 'b' },
    { arquivo: 'fotos/c-16.webp', grande: 'fotos/g/c-16.webp', legenda: 'Blusa cinza de gola alta', tipo: 'b' },
    { arquivo: 'fotos/c-33.webp', grande: 'fotos/g/c-33.webp', legenda: 'Camiseta preta', tipo: 'b' },
    { arquivo: 'fotos/c-20.webp', grande: 'fotos/g/c-20.webp', legenda: 'Jaqueta preta esportiva', tipo: 'b', grupo: 'x' },
    { arquivo: 'fotos/c-46.webp', grande: 'fotos/g/c-46.webp', legenda: 'Colete jeans com cinto', tipo: 'b' }
  ]
};
