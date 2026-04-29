<h1 align="center">BudgetWave</h1>
<p align="center">Controle financeiro com a regra dos 10% — metas automáticas, gráficos e tema retro/dark.</p>

<p align="center">
  <a href="https://lucasmotoso.github.io/budgetwave/">Demo (GitHub Pages)</a> ·
  <a href="#-recursos">Recursos</a> ·
  <a href="#-como-usar">Como usar</a> ·
  <a href="#-desenvolvimento">Desenvolvimento</a> ·
  <a href="#-arquitetura--dados">Arquitetura & Dados</a> ·
  <a href="#-licença">Licença</a>
</p>

---

## ✨ Recursos
- **Regra dos 10%**: reserva automática e distribuição de 90% do salário por categorias.
- **Metas por categoria** com sliders e normalização automática.
- **Lançamentos** (despesa/receita) com máscara BRL e persistência em `localStorage`.
- **Gráficos**: Donut Receita × Despesa × Saldo e Pizza por Categoria (Chart.js).
- **Tema light/dark** e **background parallax** com estilo retrowave.
- **Categorias personalizáveis** (nome + cor via Coloris).
- **Responsivo (mobile-first)** e toasts acessíveis.
- **Seção Sobre** com destaque de projetos do GitHub.

### 🔄 Atualizações de Design (De x Para)
- **De:** Formulário de lançamentos blocky e com bordas pesadas.
  **Para:** Inputs em estilo flutuante (floating borders), limpos, minimalistas e elegantes, adequados a um SaaS premium.
- **De:** Seção de Categorias solta e independente na interface.
  **Para:** Modal (Popup) integrado e centralizado, focado na experiência de fluxo de trabalho. Adição, seleção automática e fechamento com apenas um clique.
- **De:** Backgrounds estáticos simples.
  **Para:** Wallpapers com Parallax de Wall Street / NY (Versão Dia/Noite), com sutil desfoque (1px), garantindo total nitidez do Dashboard.

## 🚀 Como usar
1. Abra a **demo** ou baixe o repositório.
2. Informe o **salário líquido** e ajuste o **perfil** com os sliders (90%).
3. Lance **despesas/receitas**; os cards e gráficos atualizam em tempo real.
4. Crie novas **categorias** quando precisar.

## 🧰 Stack
- **Vanilla**: HTML + CSS + JS
- **Chart.js** (gráficos), **Coloris** (seletor de cor)
- Persistência: `localStorage` (sem back-end)

## 🛠 Desenvolvimento
### Rodar localmente
- Abra o `index.html` no navegador, OU
- Sirva a pasta raiz:
  ```bash
  # Python
  python3 -m http.server 8080
  # ou Node (se tiver): npx http-server -p 8080
# budgetwave
