<p align="center">
  <img src="public/icon.svg" width="64" height="64" alt="Moto Tracker PRO Logo" />
</p>

<h1 align="center">Moto Tracker PRO</h1>

<p align="center">
  <strong>Plataforma SaaS moderna para gestão de combustível, cálculo automotivo ponderado, suporte a múltiplas motos na garagem e telemetria para motociclistas.</strong>
</p>

<p align="center">
  <a href="https://moto-tracker-kohl.vercel.app/"><img src="https://img.shields.io/badge/Deploy-moto--tracker--kohl.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16.3_(Turbopack)-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
  <a href="https://clerk.com/"><img src="https://img.shields.io/badge/Auth-Clerk_SSO-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk Auth" /></a>
  <a href="https://neon.tech/"><img src="https://img.shields.io/badge/Postgres-Neon_Serverless-00E599?style=for-the-badge&logo=postgresql&logoColor=black" alt="Neon Postgres" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=black" alt="Tailwind CSS" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
</p>

---

## 📸 Interface & Social Preview

<p align="center">
  <img src="public/og-image.jpg" alt="Moto Tracker PRO Dashboard Preview" width="100%" style="border-radius: 12px; border: 1px solid #27272a; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.4);" />
</p>

---

## 💡 Sobre o Projeto

O **Moto Tracker PRO** é uma solução completa desenvolvida com arquitetura moderna e design system inspirado em aplicações de referência internacional (*Linear*, *Raycast*, *Vercel* e *Stripe*).

Criado tanto para o controle prático de despesas e rendimento de frotas pessoais de motociclistas quanto como projeto de destaque técnico, ele resolve um problema frequente em aplicativos do gênero: **distorções matemáticas no cálculo de médias de consumo**, ausência de **suporte a múltiplos veículos** e **falta de ergonomia mobile**.

---

## ⚡ Principais Funcionalidades

### 🏍️ 1. "Minha Garagem" (Múltiplos Veículos)
- **Cadastro Ilimitado de Motos:** Adicione quantas motocicletas desejar (marca, modelo, placa, ano e foto).
- **Isolamento Completo por Veículo:** Histórico de abastecimentos, cálculos de autonomia, odômetros e gráficos são mantidos estritamente separados por moto.
- **Alternador Rápido:** Alterne a moto ativa com apenas 1 clique no menu lateral (desktop) ou no botão de topo rápido (mobile).
- **Proteção de Exclusão:** Garante integridade referencial mantendo sempre ao menos 1 moto ativa vinculada à conta.

### 📱 2. Experiência Mobile Nativa (PWA-Ready)
- **Barra de Navegação Inferior (Bottom Bar):** Acesso fácil com o polegar aos 5 módulos principais (*Painel*, *Métricas*, *Histórico*, *Garagem* e *Ajustes*).
- **Cards Otimizados no Smartphone:** O histórico se transforma em cartões elegantes em telas pequenas, dispensando rolagens horizontais desconfortáveis de tabelas.
- **Safe-Area Inset Support:** Adaptado perfeitamente para iPhones com home indicator (`env(safe-area-inset-bottom)`) e barras de gestos Android.
- **Modais Anti-Teclado (`max-h-[90vh]`):** Todos os modais possuem rolagem interna suave, impedindo que o teclado virtual esconda os botões de ação.

### 📸 3. Compressão Inteligente de Fotos no Navegador
- **Upload Instantâneo de Fotos da Câmera:** Fotos capturadas em celulares modernos (que pesam entre 5MB e 12MB) são redimensionadas via HTML5 Canvas para no máximo 1000px e comprimidas para ~90KB antes do upload.
- **Zero Travamento:** Não satura os limites de payload de Server Actions da nuvem nem consome planos de dados móveis 3G/4G.

### 🧭 4. Onboarding & Questionário de Boas-Vindas
- **Wizard Interativo em 5 Etapas:** Apresentado no primeiro acesso de novos usuários:
  1. Boas-vindas e proposta de valor.
  2. Perfil de utilização (*Trabalho/Entregas*, *Dia a dia/Mobilidade*, *Passeios/Viagens*).
  3. Dados da motocicleta (com sugestões de modelos populares brasileiros).
  4. Odômetro inicial e combustível de preferência.
  5. Resumo e inicialização automática do painel.

### 🧮 5. Motor de Cálculo Automotivo Ponderado
Muitas aplicações de odômetro cometem o erro grave de calcular médias aritméticas simples sobre médias individuais $(\frac{e_1 + e_2}{2})$. O **Moto Tracker PRO** adota fórmulas automotivas de engenharia:
- **Média Real de Consumo (km/L):**
  $$\text{Consumo Real} = \frac{\sum_{i=1}^{n} \text{Distância}_i}{\sum_{i=1}^{n} \text{Litros}_i}$$
- **Custo Médio por Km:**
  $$\text{Custo/Km} = \frac{\sum \text{Custo (R\$)}}{\sum \text{Distância (km)}}$$
- **Tratamento de Tanque Parcial:** Acúmulo de litros e quilometragem de múltiplos abastecimentos parciais até o próximo tanque cheio para apuração de rendimento preciso.
- **Validação Sequencial de Odômetro:** Impede registros com quilometragem regressiva ou inconsistente.

### 🔐 6. Autenticação Moderna & Isolamento de Usuários
- **Clerk Authentication:** Login social via Google e e-mail com sessões gerenciadas e seguras.
- **Sincronização Neon Postgres:** Cada usuário possui seus próprios registros de motos e abastecimentos isolados no banco de dados relacional.
- **Modo Demonstração (1 Clique):** Recrutadores e avaliadores podem entrar instantaneamente sem cadastro prévio para testar a aplicação completa.

### 📊 7. Telemetria & Gráficos Analíticos (Recharts)
- **Evolução de Consumo ao Longo do Tempo:** Área com gradiente e identificação de picos de eficiência.
- **Visão Mês a Mês e Ano a Ano:** Filtro cronológico rápido para acompanhar custos e quilômetros rodados.
- **Preço Médio Ponderado por Litro:** Análise de histórico de flutuação de preços nos postos de combustível.

### 🎨 8. Design System Esportivo & Temas
- **Dual Theme:** *Modo Claro* (Branco nítido `#ffffff`) e *Modo Escuro* (Preto profundo `#09090b`).
- **6 Paletas Motorsport:**
  - 🔴 **Ducati / GasGas** — Performance Red
  - 🟠 **KTM / Repsol** — Factory Orange
  - 🔵 **Yamaha / BMW** — Racing Blue
  - 🟢 **Kawasaki** — Lime Green
  - 🟡 **Suzuki / Lotus** — Competition Yellow
  - ⚪ **Honda HRC** — Stealth Zinc

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Propósito |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3 (Turbopack) | App Router, Server Actions, Dynamic OG Image e rotas estáticas |
| **Autenticação** | Clerk Auth | SSO com Google, modal responsivo e gestão de sessões |
| **Banco de Dados**| Neon Serverless Postgres | Banco relacional em nuvem (`sa-east-1` São Paulo) com connection pooling |
| **Linguagem** | TypeScript 5.7 | Tipagem estrita de telemetria, motos e formulários |
| **UI Library** | React 19 | Hooks modernos, useMemo e componentes interativos |
| **Estilização** | Tailwind CSS v4 | Estilização utility-first com OKLCH CSS Variables dinâmicas |
| **Gráficos** | Recharts 3.8 | Gráficos de telemetria responsivos e otimizados |
| **Animações** | Framer Motion 13 | Transições de abas, modais e microinterações fluidas |
| **Ícones** | Lucide React | Iconografia técnica limpa e padronizada |
| **Deploy** | Vercel | Hospedagem em Edge com CI/CD contínuo |

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

### 3. Configurar variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto:
```env
# Neon Postgres
DATABASE_URL="postgresql://usuario:senha@host-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 4. Iniciar o servidor de desenvolvimento:
```bash
pnpm dev
```
Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## 📦 Build de Produção

```bash
pnpm build
```

O build gera rotas estáticas otimizadas incluindo a rota do Open Graph (`/opengraph-image.jpg`):
```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/auth/callback/github
├ ƒ /api/auth/callback/google
├ ƒ /api/auth/github
├ ƒ /api/auth/google
├ ○ /icon.svg
└ ○ /opengraph-image.jpg
```

---

## 👨‍💻 Autor

Desenvolvido por **Eduardo Braga**.
- **GitHub:** [@EduBraga7](https://github.com/EduBraga7)
- **Repositório:** [moto-tracker](https://github.com/EduBraga7/moto-tracker)
- **Live Demo:** [moto-tracker-kohl.vercel.app](https://moto-tracker-kohl.vercel.app/)
