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
| `js/orcamento.js` | Montador de orçamento. **Os preços ficam na lista `PEDIDOS` e as regras de linguagens em `LINGUAGENS`, no início do arquivo** |
| `js/guia.js` | Aba que explica o que cada linguagem faz |
| `js/demos.js` | As demonstrações. Tudo roda no navegador de quem usa |
| `js/linguagens.js` | A mesma regra em 16 linguagens; cada programa foi compilado ou executado de verdade |
| `vitrine/` | Sistemas de demonstração, cada um em sua pasta, com aviso e rodapé comuns em `assinatura.css` |
| `fonts/` | Bricolage Grotesque e JetBrains Mono, servidas daqui (licença OFL) |
| `pagar/` | Página de pagamento por Pix: lê o valor e a referência do link que envio e gera o QR Code e o código copia e cola no navegador, no padrão BR Code do Banco Central. Em `pagar/gerar/` fica a tela onde monto esse link |

Para rodar no computador, sirva a pasta com qualquer servidor local, como `python3 -m http.server`.

---

Desenvolvido por Rodrigo Terroso Junior. O Claude, da Anthropic, foi usado como ferramenta durante o desenvolvimento.

## Vistoria de segurança

Cada alteração passa por conferência de segredos no código, política de segurança de conteúdo (CSP), tratamento de texto digitado e dependências externas. O GitHub Pages não permite definir cabeçalhos HTTP, então a CSP fica em uma etiqueta meta. As demonstrações rodam só no navegador e não enviam dados.

Na página de pagamento, a chave Pix, o nome e a cidade ficam fixos no código. Do endereço da página só leio o valor e a referência do orçamento, mostrados travados, e a referência passa por um filtro que aceita só letras e números. Um link adulterado pode mudar o valor, mas nunca para quem o dinheiro vai; por isso confiro cada pagamento no extrato contra o orçamento.

## Projetos com imagens

Fiz estas demonstrações para mostrar o que entrego. As empresas e os dados são fictícios. A lista completa, com os links, está na [aba Projetos](https://mileumalinhas.com.br/#projetos).

| | | |
|---|---|---|
| <img src="img/projetos/pinhosos.webp" alt="Pinhoso's Kicks" width="260"><br>Pinhoso's Kicks | <img src="img/projetos/friagem.webp" alt="Friagem" width="260"><br>Friagem | <img src="img/projetos/atacado.webp" alt="Atacado Digital" width="260"><br>Atacado Digital |
| <img src="img/projetos/cinelumen.webp" alt="CineLumen" width="260"><br>CineLumen | <img src="img/projetos/clinica.webp" alt="Clínica Ipê de Agosto" width="260"><br>Clínica Ipê de Agosto | <img src="img/projetos/pacu.webp" alt="Pacu Gordo" width="260"><br>Pacu Gordo |
| <img src="img/projetos/solapino.webp" alt="Sol a Pino" width="260"><br>Sol a Pino | <img src="img/projetos/moveis.webp" alt="Móveis Cerrado Alto" width="260"><br>Móveis Cerrado Alto | <img src="img/projetos/relogios.webp" alt="Ponteiro Alto" width="260"><br>Ponteiro Alto |
| <img src="img/projetos/redes.webp" alt="Ateliê Seriema" width="260"><br>Ateliê Seriema | <img src="img/projetos/anuncios.webp" alt="Prancheta de Tráfego" width="260"><br>Prancheta de Tráfego | <img src="img/projetos/cofre.webp" alt="Cofre de Dados" width="260"><br>Cofre de Dados |
