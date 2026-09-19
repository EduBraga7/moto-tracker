# 🏍️ Moto Tracker PRO

> Plataforma SaaS de alta performance para monitoramento de telemetria, consumo de combustível e gestão automotiva para motociclistas exigentes.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Neon Database](https://img.shields.io/badge/Postgres-Neon_Serverless-00e599?style=for-the-badge&logo=postgresql)](https://neon.tech/)

---

## 📸 Visão Geral do Projeto

O **Moto Tracker PRO** foi concebido com padrão visual e arquitetural de um SaaS clássico de ponta (inspirado em referências como Linear, Stripe e Vercel). O sistema calcula com precisão matemática o consumo real das motos cadastradas, gera estatísticas mensais e anuais em gráficos dinâmicos e oferece suporte completo a temas claro/escuro e identidades visuais de montadoras consagradas.

---

## ⚡ Principais Funcionalidades

- 🔐 **Tela de Login Split-Screen Profissional:**
  - Lado esquerdo com branding automotivo imersivo, métricas flutuantes de telemetria e proposta de valor.
  - Lado direito com login/cadastro, visibilidade de senha, persistência de sessão e autenticação social simulada.
  - **Acesso Rápido para Recrutadores (1 Clique):** Permite a avaliadores e recrutadores acessarem imediatamente o sistema completo com credenciais pré-carregadas e dados reais.

- 🧮 **Motor de Cálculo Automotivo Ponderado:**
  - Substitui médias aritméticas simples por fórmulas automotivas reais:
    $$\text{Média Real (km/L)} = \frac{\sum \text{Distâncias Percorridas}}{\sum \text{Litros Abastecidos}}$$
  - Acumulador de abastecimentos parciais até o próximo tanque cheio.
  - Validação estrita de odômetro sequencial (evitando distâncias negativas).

- 📊 **Painel de Estatísticas & Análises (Recharts):**
  - Métrica de km/L ao longo dos meses e anos.
  - Despesas consolidadas em R$ e km rodados por mês.
  - Variação do preço do combustível por litro abastecido.

- 🎨 **Personalização & Design System:**
  - **Modo Claro (Branco puro `#ffffff`)** e **Modo Escuro (Preto profundo `#09090b`)**.
  - **6 Cores de Destaque Esportivas:** Ducati / GasGas Red, KTM / Repsol Orange, Yamaha / BMW Racing Blue, Kawasaki Lime Green, Suzuki / Lotus Yellow e Honda Stealth Zinc.

- ☁️ **Persistência em Nuvem com Neon Serverless Postgres:**
  - Tabelas otimizadas para motos e registros de abastecimento, com Server Actions no Next.js e fallback resiliente em caso de oscilações.

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Server Actions)
- **Biblioteca UI:** [React 19](https://react.dev/)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/) com CSS variables OKLCH
- **Animações:** [Framer Motion](https://www.framer.com/motion/)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Banco de Dados:** [Neon Serverless Postgres](https://neon.tech/)
- **Ícones:** [Lucide React](https://lucide.dev/)

---

## 🚀 Como Executar Localmente

### 1. Clonar o repositório:
```bash
git clone https://github.com/EduBraga7/moto-tracker.git
cd moto-tracker
```

### 2. Instalar as dependências:
```bash
pnpm install
```

### 3. Configurar variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto (veja o modelo em `.env.example`):
```env
DATABASE_URL="sua_string_de_conexao_neon_postgres"
```

### 4. Iniciar o servidor de desenvolvimento:
```bash
pnpm dev
```
Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 📦 Build para Produção / Vercel

```bash
pnpm build
```

O projeto foi validado e otimizado para deploy na **Vercel** com static generation prévia e Server Actions sob demanda.

---

## 👨‍💻 Autor

Desenvolvido por **Eduardo Braga**.
- GitHub: [@EduBraga7](https://github.com/EduBraga7)
