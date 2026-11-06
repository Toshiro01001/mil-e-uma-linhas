# Mil e Uma Linhas!

Meu código, seu site. Site principal em [mileumalinhas.com.br](https://mileumalinhas.com.br).

![Início do site Mil e Uma Linhas!](img/site.webp)

Site estático em HTML, CSS e JavaScript puro, sem dependências, sem cookies e sem nenhuma requisição a terceiros. O navegador guarda só a aparência escolhida e, nas demonstrações, os dados de teste.

| Pasta ou arquivo | Para que serve |
|---|---|
| `index.html` | Conteúdo de todas as abas |
| `css/site.css` | Aparência |
| `js/boot.js` | Prepara as abas e impede que o site seja embutido em outro |
| `js/app.js` | Abas, logo em ASCII, números de linha e terminal |
| `js/temas.js` | As 5 aparências e suas capas interativas |
| `js/orcamento.js` | Montador de orçamento e carrinho (fica salvo no aparelho do cliente). **Os preços ficam na lista `PEDIDOS` e as regras de linguagens em `LINGUAGENS`, no início do arquivo. Mudou preço aqui? Gere de novo o catálogo do servidor de cobranças (veja o README dele)** |
| `js/pedido.js` | Tela de finalização: confere o carrinho, pede nome, e-mail e WhatsApp, e uma descrição de 500 a 3.000 caracteres do que o cliente quer. Envia ao meu servidor; se ele estiver fora, oferece o e-mail com tudo escrito |
| `js/guia.js` | Aba que explica o que cada linguagem faz |
| `js/demos.js` | As demonstrações. Tudo roda no navegador de quem usa |
| `js/linguagens.js` | A mesma regra em 16 linguagens; cada programa foi compilado ou executado de verdade |
| `vitrine/` | Sistemas de demonstração, cada um em sua pasta, com aviso e rodapé comuns em `assinatura.css` |
| `fonts/` | Bricolage Grotesque e JetBrains Mono, servidas daqui (licença OFL) |
| `pagar/` | Página de pagamento por Pix: lê o código do link (`?c=`), busca valor, referência e situação no meu servidor de cobranças (Cloudflare Workers e D1, repositório privado) e gera o QR Code e o código copia e cola no navegador, no padrão BR Code do Banco Central |

Para rodar no computador, sirva a pasta com qualquer servidor local, como `python3 -m http.server`.

---

Desenvolvido por Rodrigo Terroso Junior. O Claude, da Anthropic, foi usado como ferramenta durante o desenvolvimento.

## Como o cliente faz um pedido

![Carrinho do orçamento](img/pedido-carrinho.webp)

1. Na aba orçamento, o cliente escolhe o tipo, o plano e os adicionais e clica em **Adicionar ao pedido**. Cada item mostra valor e prazo; o total aparece na hora. Cabem até 10 itens e o carrinho fica salvo no aparelho (`localStorage`, só as escolhas, nunca dados pessoais).
2. Em **Finalizar pedido** ele confere os itens, informa nome, e-mail e WhatsApp (todos obrigatórios) e escreve, com no mínimo 500 e no máximo 3.000 caracteres, exatamente o que quer. A tela traz perguntas para guiar o texto, e o rascunho fica só na aba aberta.
3. Ao enviar, o navegador manda ao meu servidor apenas as **escolhas**, não os preços. O servidor refaz a conta com o mesmo catálogo, então mexer no navegador não muda o valor. Se o valor que o cliente viu for diferente do calculado, o pedido chega marcado.
4. O cliente recebe um protocolo (`PED2611...`) para citar na conversa. O pedido aparece no meu painel de cobranças com os itens e o texto exatamente como foram enviados.

<img src="img/pedido-texto-celular.webp" alt="Etapa de descrição do pedido no celular" width="300">

A verificação contra robôs (Turnstile) só é carregada na tela de finalização.

## Vistoria de segurança

Cada alteração passa por conferência de segredos no código, política de segurança de conteúdo (CSP), tratamento de texto digitado e dependências externas. O GitHub Pages não permite definir cabeçalhos HTTP, então a CSP fica em uma etiqueta meta. As demonstrações rodam só no navegador e não enviam dados.

Na página de pagamento, a chave Pix, o nome e a cidade ficam fixos no código. O link leva só um código aleatório de 128 bits; o valor vem do servidor de cobranças, então mexer no link não muda o valor nem o recebedor. A página só conversa com esse servidor (CSP `connect-src`), sem cookies.

No pedido, nome, e-mail, WhatsApp e texto do cliente vão por HTTPS direto ao meu servidor, que os cifra (AES-256-GCM) antes de gravar. A CSP agora permite só o script do Turnstile (`challenges.cloudflare.com`) além do próprio site.

## Projetos com imagens

Fiz estas demonstrações para mostrar o que entrego. As empresas e os dados são fictícios. A lista completa, com os links, está na [aba Projetos](https://mileumalinhas.com.br/#projetos).

| | | |
|---|---|---|
| <img src="img/projetos/pinhosos.webp" alt="Pinhoso's Kicks" width="260"><br>Pinhoso's Kicks | <img src="img/projetos/friagem.webp" alt="Friagem" width="260"><br>Friagem | <img src="img/projetos/atacado.webp" alt="Atacado Digital" width="260"><br>Atacado Digital |
| <img src="img/projetos/cinelumen.webp" alt="CineLumen" width="260"><br>CineLumen | <img src="img/projetos/clinica.webp" alt="Clínica Ipê de Agosto" width="260"><br>Clínica Ipê de Agosto | <img src="img/projetos/pacu.webp" alt="Pacu Gordo" width="260"><br>Pacu Gordo |
| <img src="img/projetos/solapino.webp" alt="Sol a Pino" width="260"><br>Sol a Pino | <img src="img/projetos/moveis.webp" alt="Móveis Cerrado Alto" width="260"><br>Móveis Cerrado Alto | <img src="img/projetos/relogios.webp" alt="Ponteiro Alto" width="260"><br>Ponteiro Alto |
| <img src="img/projetos/redes.webp" alt="Ateliê Seriema" width="260"><br>Ateliê Seriema | <img src="img/projetos/anuncios.webp" alt="Prancheta de Tráfego" width="260"><br>Prancheta de Tráfego | <img src="img/projetos/cofre.webp" alt="Cofre de Dados" width="260"><br>Cofre de Dados |
