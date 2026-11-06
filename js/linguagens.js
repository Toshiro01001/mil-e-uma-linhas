/* Programas reais: todos foram compilados ou executados e imprimem o mesmo total. */
window.MUL_LINGUAGENS = [
 {
  "nome": "SQL",
  "uso": "Consultas e relatórios em banco de dados: MySQL, PostgreSQL, SQLite.",
  "codigo": "CREATE TABLE itens (pedido INTEGER, qtd INTEGER, preco REAL);\nINSERT INTO itens VALUES (1, 2, 18), (1, 1, 24), (1, 3, 15), (1, 4, 6);\n\nSELECT 'Total: R$ ' || printf('%.2f',\n  CASE WHEN SUM(qtd * preco) > 100\n       THEN SUM(qtd * preco) * 0.9\n       ELSE SUM(qtd * preco) END) AS total\nFROM itens\nWHERE pedido = 1;",
  "saida": "Total: R$ 116.10"
 },
 {
  "nome": "Python",
  "uso": "Automações, integração entre sistemas e tratamento de dados.",
  "codigo": "def total_do_pedido(itens):\n    subtotal = sum(qtd * preco for qtd, preco in itens)\n    return subtotal * 0.9 if subtotal > 100 else subtotal\n\nitens = [(2, 18.00), (1, 24.00), (3, 15.00), (4, 6.00)]\nprint(f\"Total: R$ {total_do_pedido(itens):.2f}\")",
  "saida": "Total: R$ 116.10"
 },
 {
  "nome": "C",
  "uso": "Programas pequenos e rápidos, com controle total do hardware.",
  "codigo": "#include <stdio.h>\n\ntypedef struct { int qtd; double preco; } Item;\n\ndouble total_do_pedido(const Item *itens, int n) {\n    double subtotal = 0;\n    for (int i = 0; i < n; i++)\n        subtotal += itens[i].qtd * itens[i].preco;\n    return subtotal > 100 ? subtotal * 0.9 : subtotal;\n}\n\nint main(void) {\n    Item itens[] = {{2, 18.00}, {1, 24.00}, {3, 15.00}, {4, 6.00}};\n    printf(\"Total: R$ %.2f\\n\", total_do_pedido(itens, 4));\n    return 0;\n}",
  "saida": "Total: R$ 116.10"
 },
 {
  "nome": "C++",
  "uso": "Desempenho alto em aplicações maiores.",
  "codigo": "#include <cstdio>\n#include <vector>\n\nstruct Item { int qtd; double preco; };\n\ndouble total_do_pedido(const std::vector<Item>& itens) {\n    double subtotal = 0;\n    for (const auto& item : itens)\n        subtotal += item.qtd * item.preco;\n    return subtotal > 100 ? subtotal * 0.9 : subtotal;\n}\n\nint main() {\n    std::vector<Item> itens = {{2, 18.00}, {1, 24.00}, {3, 15.00}, {4, 6.00}};\n    std::printf(\"Total: R$ %.2f\\n\", total_do_pedido(itens));\n}",
  "saida": "Total: R$ 116.10"
 },
 {
  "nome": "Java",
  "uso": "Sistemas corporativos grandes e de longa duração.",
  "codigo": "import java.util.List;\nimport java.util.Locale;\n\npublic class Pedido {\n    record Item(int qtd, double preco) {}\n\n    static double totalDoPedido(List<Item> itens) {\n        double subtotal = itens.stream().mapToDouble(i -> i.qtd() * i.preco()).sum();\n        return subtotal > 100 ? subtotal * 0.9 : subtotal;\n    }\n\n    public static void main(String[] args) {\n        var itens = List.of(new Item(2, 18.00), new Item(1, 24.00), new Item(3, 15.00), new Item(4, 6.00));\n        System.out.printf(Locale.US, \"Total: R$ %.2f%n\", totalDoPedido(itens));\n    }\n}",
  "saida": "Total: R$ 116.10"
 },
 {
  "nome": "JavaScript",
  "uso": "Tudo o que roda no navegador, e também servidores com Node.js.",
  "codigo": "function totalDoPedido(itens) {\n  const subtotal = itens.reduce((soma, i) => soma + i.qtd * i.preco, 0);\n  return subtotal > 100 ? subtotal * 0.9 : subtotal;\n}\n\nconst itens = [\n  { qtd: 2, preco: 18 }, { qtd: 1, preco: 24 },\n  { qtd: 3, preco: 15 }, { qtd: 4, preco: 6 },\n];\nconsole.log(`Total: R$ ${totalDoPedido(itens).toFixed(2)}`);",
  "saida": "Total: R$ 116.10"
 },
 {
  "nome": "PHP",
  "uso": "Sites e sistemas web em hospedagens comuns.",
  "codigo": "<?php\nfunction total_do_pedido(array $itens): float {\n    $subtotal = 0;\n    foreach ($itens as [$qtd, $preco]) {\n        $subtotal += $qtd * $preco;\n    }\n    return $subtotal > 100 ? $subtotal * 0.9 : $subtotal;\n}\n\n$itens = [[2, 18.00], [1, 24.00], [3, 15.00], [4, 6.00]];\nprintf(\"Total: R$ %.2f\\n\", total_do_pedido($itens));",
  "saida": "Total: R$ 116.10"
 }
];
