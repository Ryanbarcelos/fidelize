# 📱 Fidelize – Carteira Digital de Cartões de Fidelidade  
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Tech Stack](https://img.shields.io/badge/stack-React_Native-Supabase-blueviolet)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Overview do Projeto

O **Fidelize** é um aplicativo mobile desenvolvido para digitalizar cartões de fidelidade de lojas e restaurantes.  
Ele substitui os tradicionais cartões físicos, permitindo que usuários armazenem, visualizem e gerenciem todos os seus pontos diretamente no celular.

O sistema oferece:
- Carteira unificada de cartões
- Pontuação automática
- QR Code integrado para interação entre loja e cliente
- Recompensas automáticas
- Modo Cliente e Modo Empresa
- Backup e sincronização via Supabase

O projeto foi desenvolvido com foco em **simplicidade**, **segurança**, **praticidade** e **escalabilidade**, utilizando tecnologias modernas e adequadas para um ambiente de produção.

---

## ⭐ Principais Funcionalidades

- 🪪 **Carteira digital de cartões de fidelidade**  
- 🔢 **Sistema de pontos com limite de 10**  
- 🎁 **Resgate de recompensas com confirmação segura**  
- 🔐 **Modo loja com autenticação e validações**  
- 📱 **QR Code para adicionar pontos rapidamente**  
- ☁️ **Integração com Supabase (auth + database + storage)**  
- 📨 **Notificações de promoções**  
- 🎯 **Sistema de metas e campanhas da loja**  
- 🔄 **Sincronização em nuvem entre dispositivos**

---

## 🛠️ Stack Tecnológica

| Categoria | Tecnologia | Justificativa |
|----------|------------|----------------|
| Mobile | React Native | Framework robusto, multiplataforma e escalável |
| Backend-as-a-Service | Supabase | PostgreSQL, Auth, Storage e APIs prontas |
| Autenticação | Supabase Auth | Seguro, rápido e fácil de integrar |
| Banco de Dados | PostgreSQL | Estruturas relacionais perfeitas para fidelidade |
| QR Code | react-native-qrcode-svg | Geração estável e rápida |
| Estado | Context API / Hooks | Simplicidade e alta legibilidade |

---

# 🏗 Arquitetura e Design

O projeto utiliza uma arquitetura **feature-based**, com separação clara entre camadas:

- **components** → UI reutilizável  
- **screens** → Telas do app  
- **services** → Integração com Supabase  
- **contexts** → Estado global  
- **utils** → Funções auxiliares  
- **types** → Tipagem TypeScript  
- **hooks** → Lógica isolada  

---

## 🔄 Fluxo de Dados (Diagrama)

```mermaid
flowchart TD
    A[Usuário] --> B[Aplicativo Fidelize - React Native]
    B --> C[Context / Hooks]
    C --> D[Supabase Client]
    D --> E[(PostgreSQL)]
    D --> F[Supabase Auth]
    D --> G[Supabase Storage]
    B --> H[Gerador de QR Code]
    L[Modo Loja] --> J[Scanner QR Code] --> D


fidelize/
├── src/
│   ├── screens/          # Telas (Login, Home, Cartão, QR Code...)
│   ├── components/       # Componentes reutilizáveis
│   ├── services/         # Supabase client + funções
│   ├── contexts/         # Autenticação e cartões
│   ├── utils/            # Funções auxiliares
│   ├── hooks/            # Regras de negócio isoladas
│   ├── types/            # Tipos TypeScript
│   └── App.tsx           # Entry point
├── .env.example
└── README.md

🚀 Guia de Instalação e Execução
✔ Pré-requisitos

Node.js 18+

npm ou yarn

Conta no Supabase

Ambiente configurado para React Native (Android Studio)

🧭 Passo a Passo
1️⃣ Clonar o repositório
git clone https://github.com/Ryanbarcelos/fidelize
cd fidelize

2️⃣ Instalar dependências
npm install

3️⃣ Configurar variáveis de ambiente

Crie o arquivo:

.env


Com o conteúdo:

SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=xxxx

4️⃣ Rodar o app
npm run android

🔑 Variáveis de Ambiente
Variável	Tipo	Descrição	Exemplo
SUPABASE_URL	string	URL do projeto Supabase	https://xyz.supabase.co

SUPABASE_ANON_KEY	string	Chave pública ANON	eyJhbGc...
🧪 Testes

(Opcional caso o app ainda não tenha testes)

O projeto está preparado para receber testes usando:

Jest (unitários)

React Native Testing Library (UI)

Detox (E2E)

Para iniciar:

npm run test

☁️ Deployment

O app pode ser publicado na:

Google Play Store

Huawei App Gallery

APK distribuído manualmente

Para gerar build:

npx expo prebuild
npx react-native run-android --variant release

🤝 Guidelines de Contribuição

Usar Conventional Commits

feat: add qr code screen  
fix: supabase client error  


Manter componentes isolados

Criar hooks para lógica complexa

Não deixar chaves expostas no repositório

Criar PRs pequenas e bem documentadas

📌 Licença

MIT © 2025 – Ryan Barcelos.


# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/33792971-5d62-4aeb-943c-e1bc4c8a9ab4

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/33792971-5d62-4aeb-943c-e1bc4c8a9ab4) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/33792971-5d62-4aeb-943c-e1bc4c8a9ab4) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
