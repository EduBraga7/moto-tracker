<p align="center">
  <img src="public/icon.svg" width="64" height="64" alt="Moto Tracker PRO Logo" />
</p>

<h1 align="center">Moto Tracker PRO</h1>

<p align="center">
  <strong>Plataforma SaaS de alta precisão para telemetria, análise de consumo de combustível e gestão automotiva para motociclistas.</strong>
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16.3_(Turbopack)-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=black" alt="Tailwind CSS" /></a>
  <a href="https://neon.tech/"><img src="https://img.shields.io/badge/Postgres-Neon_Serverless-00E599?style=for-the-badge&logo=postgresql&logoColor=black" alt="Neon Postgres" /></a>
  <a href="https://vercel.com/"><img src="https://img.shields.io/badge/Deploy-Vercel_Ready-white?style=for-the-badge&logo=vercel&logoColor=black" alt="Vercel Ready" /></a>
</p>

---

## 📸 Interface do Sistema

<p align="center">
  <img src="public/print.png" alt="Moto Tracker PRO Dashboard Preview" width="100%" style="border-radius: 12px; border: 1px solid #27272a; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.3);" />
</p>

---

## 💡 Sobre o Projeto

O **Moto Tracker PRO** foi desenvolvido com padrão de engenharia de software e design system comparáveis a produtos SaaS internacionais de referência (como *Linear*, *Stripe* e *Vercel*). 

Projetado como solução para controle de frota pessoal e como peça central de portfólio técnico, o projeto combina cálculo matemático automotivo por médias ponderadas, interface responsiva adaptável a temas claro/escuro com identidades visuais de montadoras esportivas, persistência resiliente em nuvem via **Neon Serverless Postgres** e esteira de CI/CD otimizada para a **Vercel**.

---

## 🎯 Destaque para Recrutadores & Avaliadores (Frictionless UX)

Recrutadores e líderes técnicos podem explorar o sistema completo instantaneamente:
- **Acesso Rápido em 1 Clique:** Na tela de login split-screen, o botão *"Entrar como Recrutador"* preenche credenciais demonstrativas e abre imediatamente o painel completo com métricas reais, sem a necessidade de criar conta.
- **Alternância de Sessão:** O botão *"Encerrar Sessão"* no perfil do usuário permite testar o fluxo completo de ida e volta (Login ⇄ Dashboard).

---

## ⚡ Principais Funcionalidades

### 🔐 1. Tela de Login Split-Screen Profissional
- **Painel de Showcase Automotivo:** Branding imersivo com grid de telemetria, iluminação esportiva e widget dinâmico de consumo.
- **Painel de Autenticação:** Alternância animada (Framer Motion) entre *Acessar Conta* e *Criar Nova Conta*, botão de exibir/ocultar senha, login social estético (Google & GitHub) e seletor de tema antes da autenticação.

### 🧮 2. Motor de Cálculo Automotivo Ponderado
Muitas aplicações de odômetro cometem o erro de aplicar média aritmética simples sobre médias individuais $(\frac{e_1 + e_2}{2})$, gerando distorções graves. O **Moto Tracker PRO** implementa fórmulas automotivas de engenharia:
- **Média Real de Consumo (km/L):**
  $$\text{Consumo Real} = \frac{\sum_{i=1}^{n} \text{Distância}_i}{\sum_{i=1}^{n} \text{Litros}_i}$$
- **Custo Médio por Km:**
  $$\text{Custo/Km} = \frac{\sum \text{Custo (R\$)}}{\sum \text{Distância (km)}}$$
- **Tratamento de Tanque Parcial:** Acúmulo de litros e quilometragem de múltiplos abastecimentos parciais até o próximo tanque cheio para apuração exata do rendimento.
- **Validação Sequencial de Odômetro:** Impede registros com quilometragem regressiva ou inconsistente.

### 📊 3. Telemetria & Gráficos Analíticos (Recharts)
- **Tendência de km/L:** Gráfico de linha temporal com média real e identificação de picos de consumo.
- **Despesas Mensais (R\$):** Barras comparativas mês a mês com consolidação anual.
- **Quilômetros Rodados:** Acompanhamento visual da rodagem mensal e uso da motocicleta.
- **Variação de Preço (R\$/L):** Acompanhamento da flutuação dos preços do combustível ao longo do tempo.

### 🎨 4. Design System & Customização Esportiva
- **Dual Theme Nativo:** *Modo Claro* (Branco nítido `#ffffff`) e *Modo Escuro* (Preto profundo `#09090b`).
- **6 Paletas Esportivas Inspiradas no Motorsport:**
  - 🔴 **Ducati / GasGas** — Performance Red
  - 🟠 **KTM / Repsol** — Factory Orange
  - 🔵 **Yamaha / BMW** — Racing Blue
  - 🟢 **Kawasaki** — Lime Green
  - 🟡 **Suzuki / Lotus** — Competition Yellow
  - ⚪ **Honda HRC** — Stealth Zinc

### ☁️ 5. Nuvem & Resiliência
- Arquitetura com **Neon Serverless Postgres** em `sa-east-1` (São Paulo) com pooler de conexões.
- **Server Actions** do Next.js com fallbacks elegantes para funcionamento contínuo mesmo sob oscilações de rede.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Propósito |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3 (Turbopack) | App Router, Server Actions e renderização híbrida |
| **Linguagem** | TypeScript 5.7 | Tipagem estrita de dados de telemetria e componentes |
| **UI Library** | React 19 | Hooks modernos, useMemo analítico e Server Components |
| **Estilização** | Tailwind CSS v4 | Estilização utility-first com OKLCH CSS Variables dinâmicas |
| **Gráficos** | Recharts 3.8 | Gráficos de telemetria responsivos e otimizados |
| **Animações** | Framer Motion 13 | Transições de abas, modais e feedback de microinteração |
| **Banco de Dados**| Neon Postgres Serverless | Armazenamento relacional escalável em nuvem |
| **Ícones** | Lucide React | Conjunto consistente de iconografia técnica |

---

## 🚀 Como Executar Localmente

### 1. Clonar o repositório:
```bash
git clone https://github.com/EduBraga7/moto-tracker.git
cd moto-tracker
```

### 2. Instalar dependências:
```bash
pnpm install
```

### 3. Variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto (exemplo disponível em `.env.example`):
```env
DATABASE_URL="postgresql://usuario:senha@host-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"
```

### 4. Iniciar em modo de desenvolvimento:
```bash
pnpm dev
```
Abra [http://localhost:3000](http://localhost:3000) no navegador.

---

## 📦 Build de Produção

```bash
pnpm build
```

O build gera rotas estáticas otimizadas sem dependência de banco em tempo de compilação, atendendo aos requisitos da Vercel:
```
Route (app)
┌ ○ /
└ ○ /_not-found
○ (Static) prerendered as static content
```

---

## 👨‍💻 Autor

Desenvolvido por **Eduardo Braga**.
- GitHub: [@EduBraga7](https://github.com/EduBraga7)
- Projeto: [Moto Tracker PRO](https://github.com/EduBraga7/moto-tracker)
