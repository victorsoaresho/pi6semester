# SupplyLink Web

Front-end web da plataforma SupplyLink, construído com **Next.js 14**, **Tailwind CSS**, **shadcn/ui** e **TypeScript**.

## Overview

Aplicação web responsiva que oferece interfaces para os três perfis de usuário:
- **Fábrica:** Dashboard, gerenciamento de demandas, solicitação de cotações, acompanhamento de pedidos, previsão de demanda
- **Fornecedor:** Dashboard, portfólio de produtos, respostas a cotações, gerenciamento de entregas
- **Admin:** Dashboard com métricas, gerenciamento de usuários e categorias, logs de atividade

## Stack

- **Framework:** Next.js 14 (App Router)
- **Estilização:** Tailwind CSS 3 + shadcn/ui
- **Estado global:** Zustand 4
- **Data fetching:** TanStack Query 5
- **HTTP Client:** Axios 1
- **Formulários:** React Hook Form 7 + Zod 3
- **Gráficos:** Recharts 2
- **WebSocket:** Socket.io-client 4

## Estrutura de Páginas

```
src/app/
├── page.tsx                          # Landing Page
├── (public)/                         # Rotas públicas (sem autenticação)
│   ├── login/
│   ├── cadastro/
│   ├── recuperar-senha/
│   └── redefinir-senha/
├── (fabrica)/                        # Área da Fábrica
│   └── fabrica/
│       ├── dashboard/
│       ├── demandas/  (lista, nova, [id])
│       ├── cotacoes/  (lista, comparar/[demandaId])
│       ├── pedidos/   (lista, [id])
│       ├── previsao/
│       └── fornecedores/ (lista, [id])
├── (fornecedor)/                     # Área do Fornecedor
│   └── fornecedor/
│       ├── dashboard/
│       ├── portfolio/  (lista, novo, [id]/editar)
│       ├── cotacoes/   (lista, [id])
│       └── pedidos/    (lista, [id])
├── (admin)/                          # Área Administrativa
│   └── admin/
│       ├── dashboard/
│       ├── usuarios/
│       ├── categorias/
│       └── logs/
├── perfil/
├── notificacoes/
└── not-found.tsx
```

## Como Rodar

### Pré-requisitos

- Node.js >= 18
- API do SupplyLink rodando em http://localhost:3000

### Passos

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local

# 3. Iniciar em modo desenvolvimento
npm run dev
```

A aplicação estará disponível em http://localhost:3000.

### Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia em modo desenvolvimento com hot-reload |
| `npm run build` | Gera build de produção |
| `npm run start` | Inicia build de produção |
| `npm run lint` | Verifica erros de lint |

## Estrutura do Código

```
src/
├── app/            # Páginas e layouts (App Router)
├── components/
│   ├── ui/         # Componentes shadcn/ui
│   └── shared/     # Componentes compartilhados (Navbar, Sidebar, DataTable, Modal)
├── hooks/          # Custom hooks (useAuth, useSocket)
├── services/       # API client (Axios)
├── stores/         # Estado global (Zustand)
├── lib/
│   ├── utils.ts    # Utilitários (cn, formatCurrency, formatDate)
│   └── validations/# Schemas de validação (Zod)
└── types/          # TypeScript interfaces
```

## Variáveis de Ambiente

| Variável | Descrição | Default |
|----------|-----------|---------|
| `NEXT_PUBLIC_API_URL` | URL base da API | `http://localhost:3000/v1` |
| `NEXT_PUBLIC_WS_URL` | URL do WebSocket | `http://localhost:3000` |

## Autenticação

O middleware do Next.js (`src/middleware.ts`) protege automaticamente todas as rotas exceto as públicas (login, cadastro, etc.). O token JWT é armazenado no `localStorage` e enviado automaticamente via interceptor do Axios.

## Estado Atual

As páginas estão em modo **placeholder** com estrutura básica. Cada página exibe o título correto e uma mensagem "Em desenvolvimento...". Os layouts das áreas (Fábrica, Fornecedor, Admin) já incluem sidebar de navegação funcional.
