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
 },
 {
  "nome": "TypeScript",
  "uso": "JavaScript com tipos, que acusa erros antes de o programa rodar.",
  "codigo": "interface Item {\n  qtd: number;\n  preco: number;\n}\n\nfunction totalDoPedido(itens: Item[]): number {\n  const subtotal = itens.reduce((soma, i) => soma + i.qtd * i.preco, 0);\n  return subtotal > 100 ? subtotal * 0.9 : subtotal;\n}\n\nconst itens: Item[] = [\n  { qtd: 2, preco: 18 }, { qtd: 1, preco: 24 },\n  { qtd: 3, preco: 15 }, { qtd: 4, preco: 6 },\n];\nconsole.log(`Total: R$ ${totalDoPedido(itens).toFixed(2)}`);",
  "saida": "Total: R$ 116.10"
 },
 {
  "nome": "C#",
  "uso": "Sistemas empresariais e APIs na plataforma .NET, da Microsoft.",
  "codigo": "using System;\nusing System.Globalization;\nusing System.Linq;\n\nrecord Item(int Qtd, double Preco);\n\nclass Pedido {\n    static double TotalDoPedido(Item[] itens) {\n        double subtotal = itens.Sum(i => i.Qtd * i.Preco);\n        return subtotal > 100 ? subtotal * 0.9 : subtotal;\n    }\n\n    static void Main() {\n        Item[] pedido = { new(2, 18.0), new(1, 24.0), new(3, 15.0), new(4, 6.0) };\n        string total = TotalDoPedido(pedido).ToString(\"F2\", CultureInfo.InvariantCulture);\n        Console.WriteLine($\"Total: R$ {total}\");\n    }\n}",
  "saida": "Total: R$ 116.10",
  "consulta": true
 },
 {
  "nome": "Go",
  "uso": "Servidores e APIs rápidos, com um único arquivo para instalar.",
  "codigo": "package main\n\nimport \"fmt\"\n\ntype Item struct {\n\tQtd   int\n\tPreco float64\n}\n\nfunc totalDoPedido(itens []Item) float64 {\n\tsubtotal := 0.0\n\tfor _, i := range itens {\n\t\tsubtotal += float64(i.Qtd) * i.Preco\n\t}\n\tif subtotal > 100 {\n\t\treturn subtotal * 0.9\n\t}\n\treturn subtotal\n}\n\nfunc main() {\n\tpedido := []Item{{2, 18}, {1, 24}, {3, 15}, {4, 6}}\n\tfmt.Printf(\"Total: R$ %.2f\\n\", totalDoPedido(pedido))\n}",
  "saida": "Total: R$ 116.10",
  "consulta": true
 },
 {
  "nome": "Ruby",
  "uso": "Sites e sistemas com Ruby on Rails, muito produtivo para começar.",
  "codigo": "Item = Struct.new(:qtd, :preco)\n\ndef total_do_pedido(itens)\n  subtotal = itens.sum { |i| i.qtd * i.preco }\n  subtotal > 100 ? subtotal * 0.9 : subtotal\nend\n\npedido = [Item.new(2, 18.0), Item.new(1, 24.0), Item.new(3, 15.0), Item.new(4, 6.0)]\nputs format('Total: R$ %.2f', total_do_pedido(pedido))",
  "saida": "Total: R$ 116.10",
  "consulta": true
 },
 {
  "nome": "Dart",
  "uso": "Linguagem do Flutter: um só código para Android e iPhone.",
  "codigo": "class Item {\n  final int qtd;\n  final double preco;\n  const Item(this.qtd, this.preco);\n}\n\ndouble totalDoPedido(List<Item> itens) {\n  final subtotal = itens.fold<double>(0, (soma, i) => soma + i.qtd * i.preco);\n  return subtotal > 100 ? subtotal * 0.9 : subtotal;\n}\n\nvoid main() {\n  const pedido = [Item(2, 18), Item(1, 24), Item(3, 15), Item(4, 6)];\n  print('Total: R\\$ ${totalDoPedido(pedido).toStringAsFixed(2)}');\n}",
  "saida": "Total: R$ 116.10",
  "consulta": true
 },
 {
  "nome": "Kotlin",
  "uso": "Linguagem recomendada para aplicativos Android.",
  "codigo": "data class Item(val qtd: Int, val preco: Double)\n\nfun totalDoPedido(itens: List<Item>): Double {\n    val subtotal = itens.sumByDouble { it.qtd * it.preco }\n    return if (subtotal > 100) subtotal * 0.9 else subtotal\n}\n\nfun main() {\n    val pedido = listOf(Item(2, 18.0), Item(1, 24.0), Item(3, 15.0), Item(4, 6.0))\n    println(\"Total: R$ \" + String.format(java.util.Locale.ROOT, \"%.2f\", totalDoPedido(pedido)))\n}",
  "saida": "Total: R$ 116.10",
  "consulta": true
 },
 {
  "nome": "Swift",
  "uso": "Linguagem da Apple para aplicativos de iPhone e iPad.",
  "codigo": "struct Item {\n    let qtd: Int\n    let preco: Double\n}\n\nfunc totalDoPedido(_ itens: [Item]) -> Double {\n    let subtotal = itens.reduce(0.0) { $0 + Double($1.qtd) * $1.preco }\n    return subtotal > 100 ? subtotal * 0.9 : subtotal\n}\n\nfunc centavos(_ valor: Double) -> String {\n    let c = Int((valor * 100).rounded())\n    let resto = c % 100\n    return \"\\(c / 100).\\(resto < 10 ? \"0\" : \"\")\\(resto)\"\n}\n\nlet pedido = [Item(qtd: 2, preco: 18), Item(qtd: 1, preco: 24), Item(qtd: 3, preco: 15), Item(qtd: 4, preco: 6)]\nprint(\"Total: R$ \\(centavos(totalDoPedido(pedido)))\")",
  "saida": "Total: R$ 116.10",
  "consulta": true
 },
 {
  "nome": "R",
  "uso": "Estatística, análise de dados e relatórios com gráficos.",
  "codigo": "total_do_pedido <- function(itens) {\n  subtotal <- sum(itens$qtd * itens$preco)\n  if (subtotal > 100) subtotal * 0.9 else subtotal\n}\n\npedido <- data.frame(qtd = c(2, 1, 3, 4), preco = c(18, 24, 15, 6))\ncat(sprintf(\"Total: R$ %.2f\\n\", total_do_pedido(pedido)))",
  "saida": "Total: R$ 116.10",
  "consulta": true
 },
 {
  "nome": "Rust",
  "uso": "Desempenho de C com proteção contra erros de memória.",
  "codigo": "struct Item {\n    qtd: u32,\n    preco: f64,\n}\n\nfn total_do_pedido(itens: &[Item]) -> f64 {\n    let subtotal: f64 = itens.iter().map(|i| i.qtd as f64 * i.preco).sum();\n    if subtotal > 100.0 { subtotal * 0.9 } else { subtotal }\n}\n\nfn main() {\n    let pedido = [\n        Item { qtd: 2, preco: 18.0 },\n        Item { qtd: 1, preco: 24.0 },\n        Item { qtd: 3, preco: 15.0 },\n        Item { qtd: 4, preco: 6.0 },\n    ];\n    println!(\"Total: R$ {:.2}\", total_do_pedido(&pedido));\n}",
  "saida": "Total: R$ 116.10",
  "consulta": true
 }
];
