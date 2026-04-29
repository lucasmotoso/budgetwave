# MVP: BudgetWave SaaS

## 1. Visão do Produto
O BudgetWave deixará de ser apenas um projeto pessoal para se tornar um SaaS de controle financeiro premium focado em profissionais CLT que ganham na faixa de **R$ 11.342,00**. A proposta de valor é aplicar a Regra dos 10% de forma automatizada, combater a "inflação de estilo de vida" e prover gráficos analíticos numa interface incrivelmente moderna e imersiva (Retrowave/Glassmorphism).

## 2. Personas
- **Usuário Alvo:** CLT (Ex: Analistas Sênior, Coordenadores, Desenvolvedores), idade entre 25 e 40 anos, renda líquida de R$ 11.342,00.
- **Dores:** Ganha bem, mas sente que o dinheiro some. Não tem tempo para preencher planilhas complexas. Precisa de uma visão executiva rápida do seu mês e limites claros por categoria.

## 3. Escopo do MVP (Mínimo Produto Viável)

### Funcionalidades Core (O que será mantido e melhorado do projeto atual)
1. **Dashboard Executivo de KPIs:** Receita, Despesas, Saldo.
2. **Configuração de Perfil de Gastos (Sliders):** Divisão dos 90% (Pool de orçamento). A reserva inegociável de 10% (R$ 1.134,20) fica destacada.
3. **Lançamentos Dinâmicos:** Adição rápida de receitas e despesas.
4. **Gráficos em Tempo Real:** Donut (Receita vs Despesa) e Pizza (Por categoria).
5. **Persistência Local (Fase 1):** Dados ainda no LocalStorage para validar a aderência, mas com botões de Import/Export (Backup).

### Novas Funcionalidades para Validação
1. **Seletor de Meses (Histórico):** Possibilidade de ver gráficos e transações de meses anteriores para análise de evolução.
2. **Edição de Lançamentos:** Funcionalidade básica exigida por usuários reais.
3. **Gamificação / Alertas SaaS:** Toasts e mensagens inteligentes encorajando o usuário quando ele poupa além dos 10% ou bate a meta do mês.

### Estética Premium SaaS (Visual MVP)
- **Tema Retrowave 2.0:** Cores neons aprimoradas, contraste adequado para não cansar a visão, tipografia moderna (Google Fonts - Inter/Outfit).
- **Glassmorphism:** Cards e seções levemente translúcidas para dar sensação de profundidade contra um fundo em parallax.
- **Mobile First e Add-Action Floating:** O formulário de lançamentos ficará elegante e rápido de usar no celular, como um cartão flutuante de adição.
- **Micro-interações:** Animações fluidas nos gráficos e barras de progresso.

## 4. Próximos Passos (Roadmap de Implementação)
- [x] Atualizar contexto da inteligência (Skill e Persona do Agente).
- [x] Aplicar nova camada visual premium no HTML e CSS (Concluído: Parallax Wall Street, Modal de Categorias e UI fluida).
- [ ] Implementar as novas lógicas no `app.js` (Backup JSON, Seletor de Mês e Edição).
- [ ] Migrar posteriormente do LocalStorage para um backend (Supabase ou Firebase) quando o MVP estiver validado.
