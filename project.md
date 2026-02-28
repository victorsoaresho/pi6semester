# 📦 SupplyLink — Plano de Projeto Técnico

> **Plataforma de Conexão entre Fábricas e Fornecedores de Matéria-Prima**
> Fatec Franca — 6º Semestre · Lab. Desenvolvimento Multiplataforma · Computação em Nuvem II · Mineração de Dados

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura da Solução](#2-arquitetura-da-solução)
3. [Rotas da API REST (Back-end)](#3-rotas-da-api-rest-back-end)
4. [Rotas do Front-end Web (Next.js)](#4-rotas-do-front-end-web-nextjs)
5. [Rotas / Telas do Mobile (Flutter)](#5-rotas--telas-do-mobile-flutter)
6. [Telas — Descrição Completa](#6-telas--descrição-completa)
7. [Padrões de Projeto](#7-padrões-de-projeto)
8. [Sistema de Mensageria e Tempo Real](#8-sistema-de-mensageria-e-tempo-real)
9. [Infraestrutura — Google Cloud + Magalu Cloud](#9-infraestrutura--google-cloud--magalu-cloud)
10. [Modelo de Dados](#10-modelo-de-dados)
11. [Módulo ML — Previsão de Demanda](#11-módulo-ml--previsão-de-demanda)
12. [Requisitos Funcionais e Não Funcionais](#12-requisitos-funcionais-e-não-funcionais)
13. [Stack Tecnológica Completa + Documentações](#13-stack-tecnológica-completa--documentações)
14. [CI/CD e Versionamento](#14-cicd-e-versionamento)
15. [Estrutura de Repositórios](#15-estrutura-de-repositórios)

---

## 1. Visão Geral

**SupplyLink** é uma plataforma **multiplataforma** (Mobile · Web) que conecta **fábricas** (compradores de matéria-prima) a **fornecedores**, permitindo:

- Publicação de demandas de compra
- Solicitação e comparação de cotações
- Confirmação e acompanhamento de pedidos em tempo real
- Previsão de demanda futura via Machine Learning (Regressão)

### Perfis de Usuário

| Perfil | Papel |
|--------|-------|
| **Fábrica (Comprador)** | Publica demandas, solicita cotações, confirma pedidos, visualiza previsões ML |
| **Fornecedor** | Cadastra portfólio, responde cotações, gerencia entregas |
| **Administrador** | Gerencia usuários, categorias e monitora a plataforma |

---

## 2. Arquitetura da Solução

```
┌──────────────────────────────────────────────────────┐
│                       CLIENTES                       │
│  ┌───────────────┐         ┌───────────────┐         │
│  │  Mobile App   │         │   Web App     │         │
│  │  (Flutter)    │         │  (Next.js 14) │         │
│  └──────┬────────┘         └──────┬────────┘         │
└─────────┼────────────────────────┼──────────────────┘
          │                        │
          └────────────────────────┘
                         HTTPS / WSS
                               │
          ┌────────────────────▼──────────────────────┐
          │              BACK-END (NestJS)             │
          │                                            │
          │  ┌──────────┐ ┌──────────┐ ┌───────────┐  │
          │  │   Auth   │ │ Usuários │ │ Cotações  │  │
          │  └──────────┘ └──────────┘ └───────────┘  │
          │  ┌──────────┐ ┌──────────┐ ┌───────────┐  │
          │  │ Pedidos  │ │ Produtos │ │  Notif.   │  │
          │  └──────────┘ └──────────┘ └───────────┘  │
          │           WebSocket Gateway                │
          └──────────────┬─────────────┬──────────────┘
                         │             │
               ┌──────────▼──┐   ┌─────▼──────────────┐
               │ PostgreSQL  │   │  Redis              │
               │ (container) │   │  Cache + BullMQ     │
               │             │   │  (container)        │
               └──────────┬──┘   └─────────────────────┘
                          │
               ┌──────────▼──────────────────────────────┐
               │        ML SERVICE (Python/FastAPI)       │
               │  Regressão | Previsão | Alertas Cron     │
               │               (container)                │
               └──────────────────────────────────────────┘
                          │
               ┌──────────▼──────────────────────────────┐
               │      NUVEM: Google Cloud + Magalu Cloud  │
               │  VM Compute Engine · VM MagaluCloud      │
               │  Object Storage (imagens/arquivos)       │
               └──────────────────────────────────────────┘
```

### Princípio de Comunicação

| Canal | Protocolo | Uso |
|-------|-----------|-----|
| Clientes → API | HTTPS REST | Operações CRUD, autenticação |
| API → Clientes | WebSocket (Socket.io) | Status de pedidos em tempo real |
| API → ML Service | HTTP interno | Solicitar previsões |
| Notificações assíncronas | BullMQ (Redis) | E-mail, push notifications |
| Push Notifications | FCM (Firebase Cloud Messaging) | Notificações mobile |

---

## 3. Rotas da API REST (Back-end)

> Base URL: `https://api.supplylink.com.br/v1`
> Todas as rotas protegidas exigem header: `Authorization: Bearer <JWT>`

### 3.1 Autenticação — `/auth`

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `POST` | `/auth/register` | Público | Cadastro de usuário (Fábrica ou Fornecedor) |
| `POST` | `/auth/login` | Público | Login com e-mail/senha → retorna `access_token` + `refresh_token` |
| `POST` | `/auth/refresh` | Público | Renovar access token via refresh token |
| `POST` | `/auth/logout` | Autenticado | Invalidar refresh token |
| `POST` | `/auth/forgot-password` | Público | Enviar e-mail de recuperação de senha |
| `POST` | `/auth/reset-password` | Público | Redefinir senha via token do e-mail |

### 3.2 Usuários — `/users`

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `GET` | `/users/me` | Autenticado | Retorna perfil do usuário autenticado |
| `PUT` | `/users/me` | Autenticado | Edita perfil (nome, empresa, endereço, CNPJ) |
| `PATCH` | `/users/me/avatar` | Autenticado | Upload de logo/avatar da empresa |
| `GET` | `/users` | Admin | Lista todos os usuários com filtros |
| `GET` | `/users/:id` | Admin | Detalhes de um usuário |
| `PATCH` | `/users/:id/approve` | Admin | Aprovar conta de usuário |
| `PATCH` | `/users/:id/block` | Admin | Bloquear conta de usuário |
| `DELETE` | `/users/:id` | Admin | Excluir usuário |

### 3.3 Categorias — `/categories`

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `GET` | `/categories` | Autenticado | Listar todas as categorias |
| `POST` | `/categories` | Admin | Criar categoria |
| `PUT` | `/categories/:id` | Admin | Editar categoria |
| `DELETE` | `/categories/:id` | Admin | Excluir categoria |

### 3.4 Produtos (Portfólio do Fornecedor) — `/products`

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `GET` | `/products` | Autenticado | Buscar produtos com filtros (nome, categoria, localidade, preço) |
| `GET` | `/products/:id` | Autenticado | Detalhes de um produto |
| `POST` | `/products` | Fornecedor | Cadastrar novo produto no portfólio |
| `PUT` | `/products/:id` | Fornecedor (dono) | Editar produto |
| `DELETE` | `/products/:id` | Fornecedor (dono) | Remover produto |
| `POST` | `/products/:id/images` | Fornecedor (dono) | Upload de imagens do produto |
| `DELETE` | `/products/:id/images/:imgId` | Fornecedor (dono) | Remover imagem |
| `GET` | `/suppliers/:id/products` | Autenticado | Portfólio de um fornecedor específico |

### 3.5 Demandas — `/demands`

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `GET` | `/demands` | Fábrica | Listar demandas da fábrica autenticada |
| `GET` | `/demands/:id` | Fábrica (dona) | Detalhes de uma demanda |
| `POST` | `/demands` | Fábrica | Criar nova demanda de compra |
| `PUT` | `/demands/:id` | Fábrica (dona) | Editar demanda (apenas se status = OPEN) |
| `DELETE` | `/demands/:id` | Fábrica (dona) | Cancelar demanda |

### 3.6 Cotações — `/quotes`

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `POST` | `/quotes/request` | Fábrica | Solicitar cotação (selecionar fornecedores para a demanda) |
| `GET` | `/quotes/requests` | Fábrica | Cotações enviadas pela fábrica |
| `GET` | `/quotes/requests/:id` | Fábrica | Detalhes de uma solicitação de cotação |
| `GET` | `/quotes/received` | Fornecedor | Cotações recebidas pelo fornecedor |
| `POST` | `/quotes/:requestId/respond` | Fornecedor | Responder cotação (preço, prazo, condições) |
| `PATCH` | `/quotes/:requestId/accept` | Fábrica | Aceitar resposta de cotação |
| `PATCH` | `/quotes/:requestId/reject` | Fábrica | Rejeitar resposta de cotação |
| `GET` | `/quotes/compare/:demandId` | Fábrica | Comparar cotações de uma mesma demanda |

### 3.7 Pedidos — `/orders`

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `POST` | `/orders` | Fábrica | Confirmar pedido a partir de cotação aceita |
| `GET` | `/orders` | Fábrica / Fornecedor | Listar pedidos (filtro automático por perfil) |
| `GET` | `/orders/:id` | Autenticado (participante) | Detalhes do pedido |
| `PATCH` | `/orders/:id/status` | Fornecedor | Atualizar status da entrega |
| `GET` | `/orders/history` | Fábrica | Histórico de pedidos com filtros (período, produto, fornecedor) |

### 3.8 Previsão de Demanda (ML) — `/forecast`

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `GET` | `/forecast/:productId` | Fábrica | Previsão de demanda para um produto (30/60/90 dias) |
| `GET` | `/forecast/alerts` | Fábrica | Alertas de reposição urgente gerados pelo ML |
| `POST` | `/forecast/trigger` | Admin | Disparar treinamento manual do modelo |

### 3.9 Notificações — `/notifications`

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `GET` | `/notifications` | Autenticado | Listar notificações do usuário |
| `PATCH` | `/notifications/:id/read` | Autenticado | Marcar notificação como lida |
| `PATCH` | `/notifications/read-all` | Autenticado | Marcar todas como lidas |

### 3.10 Admin / Métricas — `/admin`

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `GET` | `/admin/metrics` | Admin | KPIs: usuários ativos, pedidos, volume transacionado |
| `GET` | `/admin/logs` | Admin | Logs de atividade da plataforma |

### 3.11 Documentação

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/docs` | Swagger UI com toda a documentação da API |

---

## 4. Rotas do Front-end Web (Next.js)

> App Router (Next.js 14). Rotas protegidas verificam JWT no middleware.

### Públicas

| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | Landing Page | Apresentação da plataforma, CTAs de cadastro/login |
| `/login` | Login | Formulário de autenticação |
| `/cadastro` | Cadastro | Seleção de perfil + formulário de registro |
| `/recuperar-senha` | Recuperar Senha | Solicitar e-mail de recuperação |
| `/redefinir-senha` | Redefinir Senha | Formulário com token do e-mail |

### Fábrica — (autenticada, role = FACTORY)

| Rota | Página | Descrição |
|------|--------|-----------|
| `/fabrica/dashboard` | Dashboard Fábrica | KPIs, gráfico de previsão ML, pedidos recentes, alertas |
| `/fabrica/demandas` | Gerenciar Demandas | Tabela de demandas com filtros e status |
| `/fabrica/demandas/nova` | Nova Demanda | Formulário multistep de criação de demanda |
| `/fabrica/demandas/:id` | Detalhe da Demanda | Detalhes e cotações associadas |
| `/fabrica/cotacoes` | Minhas Cotações | Cotações enviadas e recebidas |
| `/fabrica/cotacoes/comparar/:demandaId` | Comparador | Tabela comparativa de cotações lado a lado |
| `/fabrica/pedidos` | Gerenciar Pedidos | Tabela com filtros avançados |
| `/fabrica/pedidos/:id` | Detalhe do Pedido | Status em tempo real, histórico |
| `/fabrica/previsao` | Previsão de Demanda | Gráficos ML 30/60/90 dias por produto |
| `/fabrica/fornecedores` | Buscar Fornecedores | Busca com filtros de categoria/localidade |
| `/fabrica/fornecedores/:id` | Perfil do Fornecedor | Portfólio de produtos, informações |

### Fornecedor — (autenticada, role = SUPPLIER)

| Rota | Página | Descrição |
|------|--------|-----------|
| `/fornecedor/dashboard` | Dashboard Fornecedor | KPIs, cotações pendentes, pedidos em andamento |
| `/fornecedor/portfolio` | Meu Portfólio | CRUD de produtos com imagens |
| `/fornecedor/portfolio/novo` | Novo Produto | Formulário de cadastro de produto |
| `/fornecedor/portfolio/:id/editar` | Editar Produto | Edição de produto |
| `/fornecedor/cotacoes` | Cotações Recebidas | Lista de cotações aguardando resposta |
| `/fornecedor/cotacoes/:id` | Responder Cotação | Formulário de resposta com detalhes da demanda |
| `/fornecedor/pedidos` | Pedidos Confirmados | Lista de pedidos com opção de atualizar status |
| `/fornecedor/pedidos/:id` | Detalhe do Pedido | Atualizar status de entrega |

### Admin — (autenticada, role = ADMIN)

| Rota | Página | Descrição |
|------|--------|-----------|
| `/admin/dashboard` | Dashboard Admin | Métricas gerais, gráficos, volume transacionado |
| `/admin/usuarios` | Gerenciar Usuários | Tabela com aprovação/bloqueio/exclusão |
| `/admin/categorias` | Gerenciar Categorias | CRUD de categorias de matérias-primas |
| `/admin/logs` | Logs de Atividade | Histórico de ações na plataforma |

### Compartilhadas

| Rota | Página | Descrição |
|------|--------|-----------|
| `/perfil` | Meu Perfil | Edição de dados, logo, endereço, CNPJ |
| `/notificacoes` | Notificações | Lista completa de notificações |
| `/docs` | Documentação API | Swagger UI integrado |
| `*` | 404 | Página não encontrada |

---

## 5. Rotas / Telas do Mobile (Flutter)

> Gerenciadas via `go_router`. Rotas protegidas verificam token armazenado em `flutter_secure_storage`.

### Públicas

| Rota | Tela | Descrição |
|------|------|-----------|
| `/` | Splash / Onboarding | Apresentação + seleção de perfil (Fábrica/Fornecedor) |
| `/login` | Login | E-mail, senha, link "Esqueci a senha" |
| `/cadastro` | Cadastro | Dados pessoais, empresa, CNPJ, upload de logo |
| `/recuperar-senha` | Recuperar Senha | Inserir e-mail |

### Fábrica (role = FACTORY)

| Rota | Tela | Descrição |
|------|------|-----------|
| `/home` | Home Fábrica | Cards: cotações pendentes, pedidos ativos, alerta ML |
| `/buscar` | Buscar Fornecedores | Campo de busca + filtros + resultados |
| `/fornecedor/:id` | Perfil do Fornecedor | Portfólio de produtos, contato |
| `/demanda/criar` | Criar Demanda | Formulário: produto, qtd, data, observações |
| `/cotacao/solicitar` | Solicitar Cotação | Seleção de fornecedores |
| `/cotacao/comparar/:demandaId` | Comparar Cotações | Tabela comparativa |
| `/pedido/confirmar` | Confirmar Pedido | Resumo da cotação aceita + confirmação |
| `/pedido/:id` | Acompanhar Pedido | Timeline stepper de status em tempo real |
| `/pedidos` | Histórico de Pedidos | Lista com filtros |
| `/previsao` | Previsão de Demanda | Gráfico: histórico + projeção ML 30/60/90 dias |

### Fornecedor (role = SUPPLIER)

| Rota | Tela | Descrição |
|------|------|-----------|
| `/home` | Home Fornecedor | Cards: cotações recebidas, pedidos em andamento |
| `/portfolio` | Meu Portfólio | Lista de produtos cadastrados |
| `/portfolio/novo` | Adicionar Produto | Formulário completo + upload de fotos |
| `/portfolio/:id/editar` | Editar Produto | Edição de produto |
| `/cotacao/:id` | Responder Cotação | Formulário: preço, prazo, condições |
| `/pedido/:id/status` | Atualizar Entrega | Seleção do novo status |

### Compartilhadas

| Rota | Tela | Descrição |
|------|------|-----------|
| `/notificacoes` | Notificações | Lista de notificações push recebidas |
| `/perfil` | Perfil / Configurações | Edição de perfil, troca de senha, logout |

---

## 6. Telas — Descrição Completa

### 6.1 App Mobile (Flutter) — 20 telas

| # | Tela | Campos / Componentes Principais |
|---|------|---------------------------------|
| M-01 | Splash / Onboarding | Animação logo, cards de perfil (Fábrica / Fornecedor) |
| M-02 | Login | TextFields e-mail/senha, botão primary, link recuperação |
| M-03 | Cadastro | Stepper 2 passos: dados pessoais + dados da empresa + upload logo |
| M-04 | Home — Fábrica | 3 cards resumo, lista pedidos recentes, banner alerta ML |
| M-05 | Buscar Fornecedores | SearchBar, chips de filtro, ListView de resultados |
| M-06 | Perfil do Fornecedor | Avatar, nome, cards de produtos do portfólio, botão "Solicitar Cotação" |
| M-07 | Criar Demanda | Formulário: produto (text), qtd (num), unidade, data (datepicker), obs |
| M-08 | Solicitar Cotação | Checkbox list de fornecedores disponíveis + botão enviar |
| M-09 | Comparar Cotações | DataTable horizontal com colunas: fornecedor, preço, prazo, condições |
| M-10 | Confirmar Pedido | Card resumo: fornecedor, produto, qtd, valor total, botão confirmar |
| M-11 | Acompanhar Pedido | Stepper vertical: Confirmado → Preparando → Em Trânsito → Entregue |
| M-12 | Previsão de Demanda | fl_chart LineChart com legenda, seletor 30/60/90 dias |
| M-13 | Histórico de Pedidos | ListView com filtros chips (período, produto, fornecedor) |
| M-14 | Home — Fornecedor | Cards: cotações pendentes, pedidos ativos |
| M-15 | Meu Portfólio | GridView de produtos com imagem, nome, preço |
| M-16 | Adicionar / Editar Produto | Formulário com image picker (múltiplas fotos), campos completos |
| M-17 | Responder Cotação | Card com detalhes da demanda + formulário de resposta |
| M-18 | Atualizar Status Entrega | RadioGroup de status + botão confirmar |
| M-19 | Notificações | ListView de notificações com ícone tipo e timestamp |
| M-20 | Perfil / Configurações | Editar perfil, troca de senha, toggle notificações, logout |

### 6.2 Web App (Next.js) — 14 telas

| # | Tela | Componentes Principais |
|---|------|-----------------------|
| W-01 | Landing Page | Hero, features, CTA, footer |
| W-02 | Login / Cadastro | Tabs login/cadastro, formulários validados com React Hook Form + Zod |
| W-03 | Dashboard Fábrica | Cards KPI, `<LineChart>` Recharts (previsão ML), tabela pedidos recentes |
| W-04 | Gerenciar Demandas | DataTable com paginação, filtros, badges de status, ações |
| W-05 | Nova Demanda | Formulário multistep (shadcn/ui Steps): produto → qtd/data → fornecedores |
| W-06 | Comparador de Cotações | Tabela comparativa sticky com highlight da melhor oferta |
| W-07 | Gerenciar Pedidos | DataTable avançado com filtros de período, produto, fornecedor |
| W-08 | Dashboard Fornecedor | Cards KPI, lista cotações pendentes, tabela pedidos em andamento |
| W-09 | Gerenciar Portfólio | Grid de produtos + modal CRUD + drag-and-drop de imagens |
| W-10 | Responder Cotação | Split view: demanda (esquerda) + formulário de resposta (direita) |
| W-11 | Dashboard Admin | Cards métricas, gráficos de barras (pedidos/mês), tabela logs |
| W-12 | Gerenciar Usuários | DataTable com filtros, botões de ação, modal de confirmação |
| W-13 | Gerenciar Categorias | CRUD inline em tabela |
| W-14 | Documentação API | Swagger UI embed (`/docs`) |

---

## 7. Padrões de Projeto

### 7.1 Back-end (NestJS)

#### Arquitetura em Camadas (Layered Architecture)

```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts      ← Recebe requisições HTTP
│   │   ├── auth.service.ts         ← Regras de negócio
│   │   ├── auth.module.ts
│   │   ├── strategies/             ← Passport JWT Strategy
│   │   └── guards/                 ← AuthGuard, RolesGuard
│   ├── users/
│   ├── products/
│   ├── demands/
│   ├── quotes/
│   ├── orders/
│   ├── forecast/
│   └── notifications/
├── common/
│   ├── decorators/                 ← @Roles(), @CurrentUser()
│   ├── filters/                    ← GlobalExceptionFilter
│   ├── interceptors/               ← LoggingInterceptor, TransformInterceptor
│   ├── guards/                     ← JwtAuthGuard, RolesGuard
│   └── pipes/                      ← ValidationPipe (class-validator)
├── config/                         ← ConfigModule (.env)
├── database/
│   ├── prisma.service.ts
│   └── migrations/
└── queues/                         ← BullMQ producers/consumers
    ├── notification.queue.ts
    └── ml-trigger.queue.ts
```

#### Padrões Aplicados

| Padrão | Onde | Motivo |
|--------|------|--------|
| **Repository Pattern** | Prisma Service por módulo | Isola acesso ao banco |
| **DTO (Data Transfer Object)** | Entrada de toda rota | Validação com `class-validator` |
| **Guard + Decorator** | Autenticação e autorização | `@Roles(Role.FACTORY)` em rotas |
| **Interceptor** | Logging e transformação de resposta | Padronizar `{ data, meta, error }` |
| **Global Exception Filter** | Erros HTTP e Prisma | Respostas de erro uniformes |
| **Queue / Worker (BullMQ)** | Notificações e ML trigger | Processamento assíncrono |
| **Event Emitter** | WebSocket Gateway | Notificar clientes sobre mudanças de status |

#### Padrão de Resposta Padronizado

```typescript
// Sucesso
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "total": 50 }
}

// Erro
{
  "success": false,
  "error": {
    "code": "QUOTE_NOT_FOUND",
    "message": "Cotação não encontrada",
    "statusCode": 404
  }
}
```

---

### 7.2 Front-end Web (Next.js)

#### Estrutura de Pastas

```
src/
├── app/                            ← App Router Next.js 14
│   ├── (public)/                   ← Grupo: páginas públicas
│   │   ├── page.tsx                ← Landing Page
│   │   ├── login/page.tsx
│   │   └── cadastro/page.tsx
│   ├── (fabrica)/                  ← Grupo: autenticado, role=FACTORY
│   │   ├── layout.tsx              ← Sidebar Fábrica
│   │   └── dashboard/page.tsx
│   ├── (fornecedor)/               ← Grupo: autenticado, role=SUPPLIER
│   └── (admin)/                    ← Grupo: autenticado, role=ADMIN
├── components/
│   ├── ui/                         ← shadcn/ui base components
│   ├── shared/                     ← Navbar, Sidebar, Modal, DataTable
│   └── [feature]/                  ← Componentes específicos por feature
├── hooks/                          ← Custom hooks (useAuth, useSocket, etc.)
├── services/
│   └── api.ts                      ← Instância Axios + interceptors
├── stores/                         ← Zustand stores
│   ├── auth.store.ts
│   └── notification.store.ts
├── lib/
│   ├── validations/                ← Schemas Zod por feature
│   └── utils.ts
└── types/                          ← Interfaces TypeScript
```

#### Padrões Aplicados

| Padrão | Onde | Motivo |
|--------|------|--------|
| **Server Components + Client Components** | Pages vs interativos | Performance com SSR |
| **React Query (TanStack)** | Fetching de dados | Cache, refetch, loading states automáticos |
| **Zustand** | Estado global (auth, notificações) | Leve, sem boilerplate |
| **Container / Presentational** | Feature components | Separa lógica de UI |
| **Form Object** | React Hook Form + Zod | Validação tipada |
| **Optimistic Update** | Ações de status | UX responsiva sem esperar API |
| **Middleware (Next.js)** | Proteção de rotas | Redireciona não autenticados |

---

### 7.3 Mobile (Flutter)

#### Estrutura de Pastas

```
lib/
├── main.dart
├── app/
│   ├── router/                     ← go_router configuração
│   └── theme/                      ← ThemeData, cores, tipografia
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   ├── datasources/        ← AuthRemoteDatasource (Dio)
│   │   │   └── repositories/       ← AuthRepositoryImpl
│   │   ├── domain/
│   │   │   ├── entities/           ← User
│   │   │   ├── repositories/       ← AuthRepository (abstract)
│   │   │   └── usecases/           ← LoginUseCase, RegisterUseCase
│   │   └── presentation/
│   │       ├── providers/          ← Riverpod providers
│   │       ├── screens/            ← LoginScreen, RegisterScreen
│   │       └── widgets/            ← AuthFormField, etc.
│   ├── demands/
│   ├── quotes/
│   ├── orders/
│   ├── portfolio/
│   └── forecast/
├── core/
│   ├── network/                    ← Dio client, interceptors, error handler
│   ├── storage/                    ← flutter_secure_storage wrapper
│   ├── notifications/              ← FCM setup
│   └── error/                      ← Failures, Exceptions
└── shared/
    └── widgets/                    ← AppButton, AppCard, LoadingOverlay
```

#### Padrões Aplicados

| Padrão | Onde | Motivo |
|--------|------|--------|
| **Clean Architecture** | Toda a aplicação | Separação data / domain / presentation |
| **Repository Pattern** | Cada feature | Abstrai fontes de dados |
| **Use Case** | Lógica de negócio | Regras fora da UI |
| **Riverpod (AsyncNotifier)** | Estado de cada tela | Tipado, testável, reativo |
| **go_router (ShellRoute)** | Navegação | Bottom nav com rotas aninhadas |
| **Dio Interceptor** | Token refresh | Renova JWT transparentemente |
| **Error Handling (Either/Failure)** | Retorno de repositórios | Trata erros sem exceptions não capturadas |

---

## 8. Sistema de Mensageria e Tempo Real

### 8.1 Visão Geral

```
Evento                    Producer               Fila (BullMQ/Redis)       Consumer
─────────────────────────────────────────────────────────────────────────────────────
Nova cotação recebida  →  NestJS QuoteService  →  notification:queue   →  NotificationWorker
                                                                              → envia e-mail (Nodemailer)
                                                                              → envia push (FCM)

Pedido atualizado      →  NestJS OrderService  →  notification:queue   →  NotificationWorker
                       →  WebSocket Gateway                             →  Socket.io → Clientes

Treino ML semanal      →  CronJob (NestJS)     →  ml:trigger:queue     →  MLWorker
                                                                              → POST /ml-service/train

Alerta de reposição    →  MLWorker             →  notification:queue   →  NotificationWorker
```

### 8.2 Filas BullMQ

```typescript
// Fila de notificações
@Processor('notification')
export class NotificationProcessor {
  @Process('send-email')
  async sendEmail(job: Job<EmailPayload>) { ... }

  @Process('send-push')
  async sendPush(job: Job<PushPayload>) { ... }
}

// Fila de ML
@Processor('ml-trigger')
export class MLTriggerProcessor {
  @Process('train-model')
  async triggerTraining(job: Job) {
    await this.mlService.triggerTraining();
  }
}
```

### 8.3 WebSocket (Socket.io)

```typescript
// Gateway NestJS
@WebSocketGateway({ cors: true, namespace: '/orders' })
export class OrdersGateway {
  @SubscribeMessage('join-order')
  handleJoin(client: Socket, orderId: string) {
    client.join(`order:${orderId}`);
  }
}

// Emitir ao atualizar status
this.ordersGateway.server
  .to(`order:${orderId}`)
  .emit('status-updated', { orderId, status });
```

### 8.4 Eventos WebSocket por Funcionalidade

| Evento (emit) | Direção | Descrição |
|--------------|---------|-----------|
| `status-updated` | Servidor → Cliente | Atualização de status do pedido |
| `quote-received` | Servidor → Cliente | Nova resposta de cotação chegou |
| `forecast-alert` | Servidor → Cliente | Alerta de reposição urgente do ML |
| `join-order` | Cliente → Servidor | Inscrito no canal de um pedido |
| `join-user` | Cliente → Servidor | Inscrito no canal pessoal do usuário |

### 8.5 Push Notifications (FCM)

| Trigger | Destinatário | Mensagem |
|---------|-------------|----------|
| Fornecedor recebe cotação | Fornecedor | "Nova solicitação de cotação recebida" |
| Fábrica recebe resposta | Fábrica | "Sua cotação foi respondida" |
| Status do pedido muda | Fábrica | "Pedido #X está Em Trânsito" |
| Alerta ML | Fábrica | "Atenção: reposição urgente de [produto]" |

---

## 9. Infraestrutura — Google Cloud + Magalu Cloud

> **Estratégia:** todos os serviços rodam em **VMs** via **Docker / Docker Compose**. Não há Kubernetes nem serviços gerenciados de banco ou cache — tudo sobe como container dentro da VM. O único serviço externo às VMs é o **Object Storage** (para arquivos/imagens), usando buckets do Magalu Cloud e Google Cloud Storage.

### 9.1 Divisão de Responsabilidades

| Recurso | Provedor | Como é provisionado |
|---------|----------|---------------------|
| **VM principal** (API + Web + ML + Redis + Postgres) | **Google Cloud** | Compute Engine (e2-standard-4 ou superior) |
| **VM de staging** | **Magalu Cloud** | VM MagaluCloud |
| **Object Storage** (imagens de produtos, logos) | **Magalu Cloud** | MagaluCloud Object Storage |
| **Backup de arquivos / modelos ML** | **Google Cloud** | Cloud Storage (bucket) |
| **DNS** | **Google Cloud** | Cloud DNS |
| **SSL/HTTPS** | Nginx na VM | Certbot + Let's Encrypt (gratuito) |

### 9.2 Arquitetura da VM — Docker Compose

Todos os serviços rodam em **containers Docker** dentro da VM, orquestrados por um único `docker-compose.yml`:

```
VM Google Compute Engine (produção)
├── Container: nginx             ← Reverse proxy + SSL termination
│     ├── :443 → api:3000        ← NestJS API
│     └── :443 → web:3001        ← Next.js Web
├── Container: api               ← NestJS (porta 3000, interna)
├── Container: web               ← Next.js (porta 3001, interna)
├── Container: ml                ← FastAPI (porta 8000, interna)
├── Container: postgres          ← PostgreSQL 15 (porta 5432, interna)
└── Container: redis             ← Redis 7 (porta 6379, interna)

Volumes Docker (dados persistentes):
  ├── postgres_data  → dados do banco
  ├── redis_data     → persistência AOF do Redis
  └── ml_models      → modelos .pkl serializados pelo FastAPI
```

### 9.3 docker-compose.yml (Produção — Referência)

```yaml
version: '3.9'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on: [api, web]

  api:
    build: ./supplylink-api
    env_file: .env
    depends_on: [postgres, redis]
    restart: unless-stopped

  web:
    build: ./supplylink-web
    env_file: .env.web
    restart: unless-stopped

  ml:
    build: ./supplylink-ml
    env_file: .env.ml
    volumes:
      - ml_models:/app/models
    depends_on: [postgres]
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    env_file: .env.postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  ml_models:
```

### 9.4 Mensageria na VM

O sistema de mensageria **roda inteiramente dentro da VM**, sem serviço gerenciado externo:

| Componente | Onde roda | Papel |
|-----------|-----------|-------|
| **Redis** | Container `redis` na VM | Broker de filas para o BullMQ |
| **BullMQ Workers** | Dentro do container `api` (NestJS) | Consumers das filas de notificação e ML |
| **WebSocket (Socket.io)** | Dentro do container `api` (NestJS) | Tempo real para clientes web e mobile |
| **Cron Jobs** | Dentro do container `api` (NestJS `@Cron`) | Dispara treinamento ML semanalmente |

> **Escalabilidade futura:** o Redis pode ser migrado para Upstash ou Redis Cloud sem mudança de código — apenas alterando `REDIS_URL`.

### 9.5 Object Storage — Arquivos e Imagens

Arquivos (logos, fotos de produtos) **não ficam na VM**. São enviados via **signed URL** gerada pelo back-end diretamente ao bucket:

| Tipo de arquivo | Bucket | Provedor |
|----------------|--------|----------|
| Logos de empresa | `supplylink-avatars` | **Magalu Cloud Object Storage** |
| Fotos de produtos | `supplylink-products` | **Magalu Cloud Object Storage** |
| Backups de modelos ML | `supplylink-ml-backups` | **Google Cloud Storage** |

### 9.6 Variáveis de Ambiente

```bash
# .env — NestJS API
DATABASE_URL=postgresql://supplylink:senha@postgres:5432/supplylink
REDIS_URL=redis://redis:6379
JWT_SECRET=...
JWT_REFRESH_SECRET=...
ML_SERVICE_URL=http://ml:8000
FCM_SERVER_KEY=...
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=...
SMTP_PASS=...

# Magalu Cloud Object Storage (compatível com S3)
STORAGE_ENDPOINT=https://br-se1.magaluobjects.com
STORAGE_ACCESS_KEY=...
STORAGE_SECRET_KEY=...
STORAGE_BUCKET_AVATARS=supplylink-avatars
STORAGE_BUCKET_PRODUCTS=supplylink-products
STORAGE_REGION=br-se1

# .env.ml — FastAPI
DATABASE_URL=postgresql://supplylink:senha@postgres:5432/supplylink
MODEL_PATH=/app/models/

# .env.postgres
POSTGRES_DB=supplylink
POSTGRES_USER=supplylink
POSTGRES_PASSWORD=...
```

### 9.7 SSL com Certbot (Let's Encrypt) na VM

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.supplylink.com.br -d app.supplylink.com.br
# Renovação automática via cron do sistema operacional
```

### 9.8 Documentações dos Provedores

| Serviço | URL |
|---------|-----|
| Google Compute Engine | https://cloud.google.com/compute/docs |
| Google Cloud Storage | https://cloud.google.com/storage/docs |
| Google Cloud DNS | https://cloud.google.com/dns/docs |
| Magalu Cloud VMs | https://docs.magalu.cloud/docs/compute |
| MagaluCloud Object Storage | https://docs.magalu.cloud/docs/storage/object-storage |
| Docker Compose | https://docs.docker.com/compose |
| Certbot / Let's Encrypt | https://certbot.eff.org/instructions |
| Nginx reverse proxy | https://nginx.org/en/docs |
---

## 10. Modelo de Dados

```sql
-- Usuários
User {
  id            UUID        PK
  name          VARCHAR
  email         VARCHAR     UNIQUE
  password_hash VARCHAR
  role          ENUM(FACTORY, SUPPLIER, ADMIN)
  company_name  VARCHAR
  cnpj          VARCHAR     UNIQUE
  address       VARCHAR
  logo_url      VARCHAR
  status        ENUM(PENDING, ACTIVE, BLOCKED)
  created_at    TIMESTAMP
}

-- Categorias de matérias-primas
Category {
  id          UUID    PK
  name        VARCHAR UNIQUE
  description TEXT
}

-- Portfólio do fornecedor
Product {
  id          UUID      PK
  supplier_id UUID      FK → User
  category_id UUID      FK → Category
  name        VARCHAR
  description TEXT
  unit        VARCHAR   (kg, ton, unidade, litro...)
  base_price  DECIMAL
  stock_qty   DECIMAL
  images      VARCHAR[] (URLs no Object Storage)
  created_at  TIMESTAMP
}

-- Demanda da fábrica
Demand {
  id           UUID    PK
  factory_id   UUID    FK → User
  product_name VARCHAR
  quantity     DECIMAL
  unit         VARCHAR
  needed_by    DATE
  conditions   TEXT
  status       ENUM(OPEN, IN_NEGOTIATION, CLOSED, CANCELLED)
  created_at   TIMESTAMP
}

-- Solicitação de cotação
QuoteRequest {
  id          UUID PK
  demand_id   UUID FK → Demand
  supplier_id UUID FK → User
  status      ENUM(PENDING, ANSWERED, ACCEPTED, REJECTED)
  created_at  TIMESTAMP
}

-- Resposta de cotação
QuoteResponse {
  id               UUID    PK
  quote_request_id UUID    FK → QuoteRequest
  unit_price       DECIMAL
  total_price      DECIMAL
  lead_time_days   INT
  conditions       TEXT
  created_at       TIMESTAMP
}

-- Pedido confirmado
Order {
  id               UUID PK
  quote_response_id UUID FK → QuoteResponse
  factory_id       UUID FK → User
  supplier_id      UUID FK → User
  status           ENUM(CONFIRMED, PREPARING, IN_TRANSIT, DELIVERED)
  created_at       TIMESTAMP
  updated_at       TIMESTAMP
}

-- Histórico para ML
OrderHistory {
  id         UUID      PK
  order_id   UUID      FK → Order
  product_id UUID      FK → Product
  quantity   DECIMAL
  period     DATE      (primeiro dia do mês do pedido)
  created_at TIMESTAMP
}

-- Previsões geradas pelo ML
DemandForecast {
  id                UUID    PK
  factory_id        UUID    FK → User
  product_id        UUID    FK → Product
  forecast_date     DATE
  predicted_quantity DECIMAL
  horizon_days      INT     (30, 60 ou 90)
  model_version     VARCHAR
  created_at        TIMESTAMP
}

-- Notificações
Notification {
  id         UUID PK
  user_id    UUID FK → User
  type       ENUM(NEW_QUOTE, QUOTE_ANSWERED, ORDER_STATUS, ML_ALERT)
  title      VARCHAR
  body       TEXT
  read       BOOLEAN DEFAULT false
  created_at TIMESTAMP
}
```

---

## 11. Módulo ML — Previsão de Demanda

### Pipeline Completo

```
PostgreSQL (OrderHistory)
        ↓
FastAPI → Pandas DataFrame
        ↓
Feature Engineering:
  - month, quarter, year
  - lag_1, lag_2 (períodos anteriores)
  - rolling_mean_3, rolling_std_3
  - product_category (Label Encoded)
        ↓
Train/Test Split (últimos 3 meses = teste)
        ↓
scikit-learn Pipeline:
  - SimpleImputer → StandardScaler → RandomForestRegressor
  - GridSearchCV para hiperparâmetros
        ↓
Avaliação: MAE, RMSE, R² (meta: R² > 0.75)
        ↓
Serialização: joblib.dump(model, 'model_v{date}.pkl')
        ↓
Endpoint POST /forecast → retorna JSON com previsões 30/60/90d
        ↓
NestJS consome → salva em DemandForecast → emite alerta se crítico
```

### Endpoints do ML Service (FastAPI)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/health` | Health check |
| `POST` | `/train` | Disparar treinamento do modelo |
| `POST` | `/forecast` | Gerar previsão para produto/fábrica |
| `GET` | `/metrics` | Métricas do modelo atual (MAE, RMSE, R²) |

### Agendamento

```
Cron: todo domingo às 02:00 → BullMQ enfileira job "train-model"
MLWorker processa → POST /train no FastAPI
FastAPI treina, avalia, serializa e substitui modelo anterior
```

---

## 12. Requisitos Funcionais e Não Funcionais

### Requisitos Funcionais

| ID | Módulo | Descrição |
|----|--------|-----------|
| RF-01 | Auth | Cadastro com papel Fábrica ou Fornecedor |
| RF-02 | Auth | Login JWT com refresh token |
| RF-03 | Auth | Recuperação de senha via e-mail |
| RF-04 | Auth | Edição de perfil (empresa, logo, endereço, CNPJ) |
| RF-05 | Admin | Aprovação/bloqueio de contas |
| RF-06 | Fornecedor | Cadastro de portfólio (nome, desc, unidade, preço, estoque, fotos) |
| RF-07 | Fornecedor | Edição e remoção de produtos |
| RF-08 | Fornecedor | Visualização de cotações recebidas |
| RF-09 | Fornecedor | Resposta a cotações (preço, prazo, condições) |
| RF-10 | Fornecedor | Painel de pedidos confirmados e histórico |
| RF-11 | Fornecedor | Atualização de status de entrega |
| RF-12 | Fornecedor | Notificação push/e-mail ao receber cotação |
| RF-13 | Fábrica | Busca de matérias-primas por categoria, nome, localização |
| RF-14 | Fábrica | Criação de demanda de compra |
| RF-15 | Fábrica | Solicitação de cotação para múltiplos fornecedores |
| RF-16 | Fábrica | Comparação de cotações lado a lado |
| RF-17 | Fábrica | Confirmação de pedido |
| RF-18 | Fábrica | Acompanhamento de status em tempo real |
| RF-19 | Fábrica | Histórico de pedidos com filtros |
| RF-20 | Fábrica | Notificação push/e-mail ao receber resposta de cotação |
| RF-21 | ML | Coleta e armazenamento de histórico de pedidos |
| RF-22 | ML | Treinamento automático semanal/mensal |
| RF-23 | ML | Previsão de demanda 30/60/90 dias |
| RF-24 | ML | Gráficos de tendência no dashboard |
| RF-25 | ML | Alertas de reposição urgente |
| RF-26 | Admin | CRUD de categorias |
| RF-27 | Admin | Dashboard com métricas da plataforma |
| RF-28 | Admin | Gerenciamento de usuários |
| RF-29 | Admin | Logs de atividade |

### Requisitos Não Funcionais

| ID | Categoria | Descrição | Como Atender |
|----|-----------|-----------|--------------|
| RNF-01 | Segurança | JWT com refresh token, HTTPS obrigatório | NestJS + GCP Load Balancer SSL |
| RNF-02 | Segurança | Senhas com hash bcrypt (rounds: 12) | bcrypt no NestJS |
| RNF-03 | Desempenho | Resposta API < 500ms em 95% das req | Redis cache + índices PostgreSQL |
| RNF-04 | Escalabilidade | Suporte a crescimento horizontal | Docker Compose na VM; migração futura para múltiplas VMs com load balancer |
| RNF-05 | Disponibilidade | SLA 99,5% | VM com restart automático (`restart: unless-stopped`) + Nginx |
| RNF-06 | Versionamento | GitFlow | GitHub + branch protection rules |
| RNF-07 | Testes | Cobertura mínima 70% | Jest (NestJS) + pytest (FastAPI) |
| RNF-08 | Mobile | Android e iOS via Flutter | Flutter 3.x |
| RNF-09 | Web | Responsiva em qualquer navegador moderno | Next.js + Tailwind responsive |
| RNF-10 | Documentação | API via Swagger/OpenAPI | NestJS @ApiProperty decorators |

---

## 13. Stack Tecnológica Completa + Documentações

### Back-end (NestJS)

| Tecnologia | Versão | Uso | Documentação |
|-----------|--------|-----|-------------|
| NestJS | 10.x | Framework principal | https://docs.nestjs.com |
| TypeScript | 5.x | Linguagem | https://www.typescriptlang.org/docs |
| Prisma | 5.x | ORM | https://www.prisma.io/docs |
| PostgreSQL | 15 | Banco principal | https://www.postgresql.org/docs/current |
| Redis | 7.x | Cache + Filas | https://redis.io/docs |
| BullMQ | 5.x | Sistema de filas | https://docs.bullmq.io |
| Passport.js | - | Estratégias de auth | https://www.passportjs.org/docs |
| Socket.io | 4.x | WebSocket | https://socket.io/docs/v4 |
| Jest | 29.x | Testes | https://jestjs.io/docs/getting-started |
| Swagger | - | Documentação API | https://docs.nestjs.com/openapi/introduction |
| class-validator | - | Validação DTOs | https://github.com/typestack/class-validator |
| Nodemailer | - | Envio de e-mails | https://nodemailer.com/about |
| Firebase Admin | - | Push FCM | https://firebase.google.com/docs/admin/setup |

### Front-end Web (Next.js)

| Tecnologia | Versão | Uso | Documentação |
|-----------|--------|-----|-------------|
| Next.js | 14.x | Framework web (SSR/CSR) | https://nextjs.org/docs |
| TypeScript | 5.x | Linguagem | https://www.typescriptlang.org/docs |
| Tailwind CSS | 3.x | Estilização | https://tailwindcss.com/docs |
| shadcn/ui | - | Componentes UI | https://ui.shadcn.com |
| Zustand | 4.x | Estado global | https://docs.pmnd.rs/zustand |
| TanStack Query | 5.x | Fetching + cache | https://tanstack.com/query/latest |
| Axios | 1.x | HTTP client | https://axios-http.com/docs/intro |
| Recharts | 2.x | Gráficos | https://recharts.org/en-US/api |
| React Hook Form | 7.x | Formulários | https://react-hook-form.com |
| Zod | 3.x | Validação schemas | https://zod.dev |
| Socket.io-client | 4.x | WebSocket client | https://socket.io/docs/v4/client-api |

### Mobile (Flutter)

| Tecnologia | Versão | Uso | Documentação |
|-----------|--------|-----|-------------|
| Flutter | 3.x | Framework mobile (Android/iOS) | https://docs.flutter.dev |
| Dart | 3.x | Linguagem | https://dart.dev/guides |
| Riverpod | 2.x | Gerenciamento de estado | https://riverpod.dev |
| go_router | 13.x | Navegação | https://pub.dev/packages/go_router |
| Dio | 5.x | HTTP client | https://pub.dev/packages/dio |
| firebase_messaging | - | Push notifications | https://pub.dev/packages/firebase_messaging |
| fl_chart | 0.68 | Gráficos | https://pub.dev/packages/fl_chart |
| flutter_secure_storage | 9.x | Token storage seguro | https://pub.dev/packages/flutter_secure_storage |
| image_picker | - | Upload de fotos | https://pub.dev/packages/image_picker |

### ML Service (Python)

| Tecnologia | Versão | Uso | Documentação |
|-----------|--------|-----|-------------|
| FastAPI | 0.111 | Framework API | https://fastapi.tiangolo.com |
| scikit-learn | 1.5 | ML Pipeline | https://scikit-learn.org/stable/user_guide.html |
| XGBoost | 2.x | Algoritmo principal | https://xgboost.readthedocs.io |
| Pandas | 2.x | Manipulação de dados | https://pandas.pydata.org/docs |
| NumPy | 1.26 | Computação numérica | https://numpy.org/doc |
| joblib | 1.4 | Serialização de modelos | https://joblib.readthedocs.io |
| pytest | 8.x | Testes | https://docs.pytest.org |
| APScheduler | 3.x | Agendamento cron | https://apscheduler.readthedocs.io |

### Infraestrutura

| Tecnologia | Uso | Documentação |
|-----------|-----|-------------|
| Docker | Containerização | https://docs.docker.com |
| Docker Compose | Dev local | https://docs.docker.com/compose |
| Nginx | Reverse proxy + SSL | https://nginx.org/en/docs |
| Certbot | SSL Let's Encrypt | https://certbot.eff.org/instructions |
| GitHub Actions | CI/CD | https://docs.github.com/en/actions |
| Google Compute Engine | VM de produção | https://cloud.google.com/compute/docs |
| Google Cloud Storage | Backup arquivos / modelos | https://cloud.google.com/storage/docs |
| Magalu Cloud | VM staging + Object Storage | https://docs.magalu.cloud |
| GitFlow | Versionamento | https://nvie.com/posts/a-successful-git-branching-model |

---

## 14. CI/CD e Versionamento

### GitFlow

```
main          ← produção (protegida, requer PR + aprovação)
  └── develop ← integração
        ├── feature/auth
        ├── feature/cotacoes
        ├── feature/ml-forecast
        ├── feature/websocket
        └── fix/bug-xxx
```

### GitHub Actions Pipeline

```yaml
# .github/workflows/pipeline.yml (resumo)

on:
  push:
    branches: [develop, main]

jobs:
  test:
    # Roda Jest (NestJS) + pytest (FastAPI)
    # Falha bloqueia merge

  build:
    needs: test
    # docker build + push para GCR (Google Container Registry)

  deploy-staging:
    needs: build
    if: branch == develop
    # SSH para VM de staging (Magalu Cloud)
    # docker compose pull && docker compose up -d
    # npx prisma migrate deploy

  deploy-production:
    needs: build
    if: branch == main
    # SSH para VM de produção (Google Compute Engine)
    # docker compose pull && docker compose up -d
    # npx prisma migrate deploy
```

---

## 15. Estrutura de Repositórios

```
supplylink/                             ← GitHub Organization
├── supplylink-api/                     ← NestJS (Back-end)
│   ├── src/
│   ├── prisma/
│   ├── Dockerfile
│   └── .github/workflows/
│
├── supplylink-web/                     ← Next.js (Front-end Web)
│   ├── src/
│   ├── Dockerfile
│   └── .github/workflows/
│
├── supplylink-mobile/                  ← Flutter (Android + iOS)
│   ├── lib/
│   ├── android/
│   └── ios/
│
├── supplylink-ml/                      ← FastAPI + scikit-learn
│   ├── app/
│   ├── models/
│   ├── Dockerfile
│   └── .github/workflows/
│
└── supplylink-infra/                   ← Infraestrutura
    ├── docker-compose.yml              ← Dev local
    ├── docker-compose.prod.yml         ← Produção (VM GCP)
    ├── nginx/
    │   └── nginx.conf                  ← Config do reverse proxy
    └── .github/workflows/             ← Deploy via SSH para VM
```

---

## Observações Finais

- **Ambiente de desenvolvimento local:** `docker-compose up` sobe PostgreSQL, Redis e todos os serviços
- **Segredos:** Arquivo `.env` na VM (fora do repositório); nunca commitar credenciais no git
- **Monitoramento:** Logs via `docker compose logs` + opcionalmente Grafana + Loki rodando na VM; erros de aplicação reportados via Sentry
- **Rate Limiting:** `@nestjs/throttler` aplicado globalmente (100 req/min por IP)
- **CORS:** Configurado no NestJS para permitir apenas domínios da plataforma
- **Uploads:** Imagens enviadas diretamente ao **MagaluCloud Object Storage** via signed URLs geradas pelo back-end

---

*Documento gerado para o projeto SupplyLink — Fatec Franca · 6º Semestre · 2025*
