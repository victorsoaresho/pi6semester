# SupplyLink API

Back-end da plataforma SupplyLink, construído com **NestJS 10**, **TypeScript**, **Prisma ORM** e **PostgreSQL**.

## Overview

A API gerencia toda a lógica de negócio da plataforma: autenticação JWT, CRUD de usuários/produtos/demandas, fluxo de cotações e pedidos, notificações em tempo real via WebSocket, e integração com o serviço de ML para previsão de demanda.

## Stack

- **Framework:** NestJS 10 (TypeScript 5)
- **ORM:** Prisma 5
- **Banco de dados:** PostgreSQL 15
- **Cache/Filas:** Redis 7 + BullMQ
- **Autenticação:** Passport.js + JWT
- **WebSocket:** Socket.io 4
- **Validação:** class-validator + class-transformer
- **Documentação:** Swagger (@nestjs/swagger)
- **Rate Limiting:** @nestjs/throttler

## Estrutura de Módulos

```
src/
├── modules/
│   ├── auth/            # Registro, login, refresh token, recuperação de senha
│   ├── users/           # CRUD de usuários, aprovação, bloqueio (Admin)
│   ├── categories/      # CRUD de categorias de matéria-prima (Admin)
│   ├── products/        # CRUD de produtos do fornecedor
│   ├── demands/         # CRUD de demandas de compra (Fábrica)
│   ├── quotes/          # Solicitação, resposta e comparação de cotações
│   ├── orders/          # Criação e acompanhamento de pedidos + WebSocket
│   ├── forecast/        # Integração com ML Service para previsões
│   ├── notifications/   # Notificações do usuário
│   └── admin/           # Métricas e logs da plataforma
├── common/              # Guards, decorators, filters, interceptors, pipes
├── config/              # Configuração centralizada
├── database/            # PrismaService
└── queues/              # Processadores BullMQ
```

## Como Rodar

### Pré-requisitos

- Node.js >= 18
- PostgreSQL 15 rodando (via Docker ou local)
- Redis 7 rodando (via Docker ou local)

### Passos

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env conforme necessário

# 3. Gerar Prisma Client
npx prisma generate

# 4. Rodar migrações
npx prisma migrate dev --name init

# 5. Popular banco com dados iniciais
npx prisma db seed

# 6. Iniciar em modo desenvolvimento
npm run start:dev
```

### Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run start:dev` | Inicia em modo watch (desenvolvimento) |
| `npm run start:prod` | Inicia build de produção |
| `npm run build` | Compila o TypeScript |
| `npm run test` | Roda testes unitários |
| `npm run test:e2e` | Roda testes end-to-end |
| `npm run prisma:studio` | Abre o Prisma Studio (GUI do banco) |

## Endpoints da API

A documentação completa e interativa está disponível via Swagger em:

```
http://localhost:3000/v1/docs
```

### Principais Rotas

| Módulo | Método | Rota | Descrição |
|--------|--------|------|-----------|
| Auth | POST | /v1/auth/register | Cadastro de Fábrica ou Fornecedor |
| Auth | POST | /v1/auth/login | Login (retorna access + refresh token) |
| Auth | POST | /v1/auth/refresh | Renovar access token |
| Users | GET | /v1/users/me | Perfil do usuário autenticado |
| Users | GET | /v1/users | Listar todos (Admin) |
| Categories | GET | /v1/categories | Listar categorias |
| Products | GET | /v1/products | Buscar produtos com filtros |
| Demands | POST | /v1/demands | Criar demanda de compra |
| Quotes | POST | /v1/quotes/request | Solicitar cotações |
| Quotes | GET | /v1/quotes/compare/:demandId | Comparar cotações |
| Orders | POST | /v1/orders | Confirmar pedido |
| Orders | PATCH | /v1/orders/:id/status | Atualizar status (WebSocket) |
| Forecast | GET | /v1/forecast/:productId | Previsão de demanda |
| Notifications | GET | /v1/notifications | Listar notificações |
| Admin | GET | /v1/admin/metrics | KPIs da plataforma |

## Padrão de Resposta

Todas as rotas seguem o padrão:

**Sucesso:**
```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "total": 50 }
}
```

**Erro:**
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Recurso não encontrado",
    "statusCode": 404
  }
}
```

## Modelo de Dados

O schema Prisma contém 11 modelos e 6 enums:

- **User** — Usuários (Fábrica, Fornecedor, Admin)
- **Category** — Categorias de matéria-prima
- **Product** — Produtos do portfólio do fornecedor
- **Demand** — Demandas de compra publicadas pela fábrica
- **QuoteRequest** — Solicitações de cotação
- **QuoteResponse** — Respostas de cotação
- **Order** — Pedidos confirmados
- **OrderHistory** — Histórico de entregas
- **DemandForecast** — Previsões de demanda (ML)
- **Notification** — Notificações do sistema

Para visualizar o banco: `npx prisma studio`

## Variáveis de Ambiente

Veja `.env.example` para a lista completa de variáveis necessárias.
