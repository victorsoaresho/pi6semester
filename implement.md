# SupplyLink — Documento de Implementação para IA

> **Objetivo:** Este documento contém todas as instruções necessárias para que uma IA implemente a estrutura base do projeto SupplyLink. Siga cada seção na ordem apresentada, respeitando as convenções e dependências entre tarefas.

---

## Sumário

1. [Contexto e Regras Gerais](#1-contexto-e-regras-gerais)
2. [Estrutura do Repositório](#2-estrutura-do-repositório)
3. [Docker Compose — Desenvolvimento Local](#3-docker-compose--desenvolvimento-local)
4. [Modelo de Dados — Prisma Schema](#4-modelo-de-dados--prisma-schema)
5. [Implementação das Rotas Padrão — Back-end NestJS](#5-implementação-das-rotas-padrão--back-end-nestjs)
6. [Scaffolding do Front-end Web — Next.js](#6-scaffolding-do-front-end-web--nextjs)
7. [Scaffolding do Mobile — Flutter](#7-scaffolding-do-mobile--flutter)
8. [Scaffolding do ML Service — FastAPI](#8-scaffolding-do-ml-service--fastapi)
9. [Instruções de Execução](#9-instruções-de-execução)

---

## 1. Contexto e Regras Gerais

### 1.1 Sobre o Projeto

**SupplyLink** é uma plataforma multiplataforma (Web + Mobile) que conecta **fábricas** (compradores de matéria-prima) a **fornecedores**. Funcionalidades principais:

- Publicação de demandas de compra
- Solicitação e comparação de cotações
- Confirmação e acompanhamento de pedidos em tempo real (WebSocket)
- Previsão de demanda futura via Machine Learning (Regressão)

Três perfis de usuário: **Fábrica (FACTORY)**, **Fornecedor (SUPPLIER)** e **Administrador (ADMIN)**.

### 1.2 Stack Tecnológica (versões obrigatórias)

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Back-end | NestJS | 10.x |
| Back-end | TypeScript | 5.x |
| Back-end | Prisma ORM | 5.x |
| Back-end | PostgreSQL | 15 |
| Back-end | Redis | 7.x |
| Back-end | BullMQ | 5.x |
| Back-end | Passport.js | latest |
| Back-end | Socket.io | 4.x |
| Back-end | class-validator | latest |
| Back-end | Nodemailer | latest |
| Front-end Web | Next.js | 14.x |
| Front-end Web | Tailwind CSS | 3.x |
| Front-end Web | shadcn/ui | latest |
| Front-end Web | Zustand | 4.x |
| Front-end Web | TanStack Query | 5.x |
| Front-end Web | Axios | 1.x |
| Front-end Web | Recharts | 2.x |
| Front-end Web | React Hook Form | 7.x |
| Front-end Web | Zod | 3.x |
| Front-end Web | Socket.io-client | 4.x |
| Mobile | Flutter | 3.x |
| Mobile | Dart | 3.x |
| Mobile | Riverpod | 2.x |
| Mobile | go_router | 13.x |
| Mobile | Dio | 5.x |
| Mobile | fl_chart | 0.68 |
| Mobile | flutter_secure_storage | 9.x |
| ML Service | FastAPI | 0.111 |
| ML Service | scikit-learn | 1.5 |
| ML Service | Pandas | 2.x |
| ML Service | joblib | 1.4 |
| Infra | Docker + Docker Compose | latest |
| Infra | Nginx | alpine |

### 1.3 Convenções de Código

- **Idioma do código:** Inglês (nomes de variáveis, funções, classes, arquivos)
- **Idioma de comentários e documentação:** Português (quando necessário)
- **Back-end (NestJS/TypeScript):**
  - Naming: `camelCase` para variáveis e funções, `PascalCase` para classes e interfaces, `UPPER_SNAKE_CASE` para constantes e enums
  - Arquivos: `kebab-case` (ex: `auth.controller.ts`, `jwt-auth.guard.ts`)
  - Usar decorators do NestJS para validação (`class-validator`), documentação (`@nestjs/swagger`) e autorização (`Guards`)
  - Toda rota documentada com Swagger decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`)
- **Front-end (Next.js/TypeScript):**
  - Componentes: `PascalCase` (ex: `DashboardPage.tsx`)
  - Hooks: prefixo `use` (ex: `useAuth.ts`)
  - Stores: sufixo `.store.ts` (ex: `auth.store.ts`)
- **Mobile (Flutter/Dart):**
  - Arquivos: `snake_case` (ex: `login_screen.dart`)
  - Classes: `PascalCase`
- **Padrão de resposta da API (obrigatório em todas as rotas):**

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "total": 50 }
}
```

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

---

## 2. Estrutura do Repositório

Crie a seguinte estrutura de pastas e arquivos na raiz do projeto. Todos os diretórios listados devem ser criados, incluindo um arquivo `.gitkeep` dentro de diretórios vazios para que o Git os rastreie.

```
supplylink/
│
├── supplylink-api/                        # Back-end NestJS
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── dto/
│   │   │   │   │   ├── register.dto.ts
│   │   │   │   │   ├── login.dto.ts
│   │   │   │   │   ├── refresh-token.dto.ts
│   │   │   │   │   ├── forgot-password.dto.ts
│   │   │   │   │   └── reset-password.dto.ts
│   │   │   │   ├── strategies/
│   │   │   │   │   └── jwt.strategy.ts
│   │   │   │   └── guards/
│   │   │   │       └── jwt-auth.guard.ts
│   │   │   ├── users/
│   │   │   │   ├── users.module.ts
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   └── dto/
│   │   │   │       ├── update-user.dto.ts
│   │   │   │       └── user-query.dto.ts
│   │   │   ├── categories/
│   │   │   │   ├── categories.module.ts
│   │   │   │   ├── categories.controller.ts
│   │   │   │   ├── categories.service.ts
│   │   │   │   └── dto/
│   │   │   │       └── create-category.dto.ts
│   │   │   ├── products/
│   │   │   │   ├── products.module.ts
│   │   │   │   ├── products.controller.ts
│   │   │   │   ├── products.service.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-product.dto.ts
│   │   │   │       └── product-query.dto.ts
│   │   │   ├── demands/
│   │   │   │   ├── demands.module.ts
│   │   │   │   ├── demands.controller.ts
│   │   │   │   ├── demands.service.ts
│   │   │   │   └── dto/
│   │   │   │       └── create-demand.dto.ts
│   │   │   ├── quotes/
│   │   │   │   ├── quotes.module.ts
│   │   │   │   ├── quotes.controller.ts
│   │   │   │   ├── quotes.service.ts
│   │   │   │   └── dto/
│   │   │   │       ├── request-quote.dto.ts
│   │   │   │       └── respond-quote.dto.ts
│   │   │   ├── orders/
│   │   │   │   ├── orders.module.ts
│   │   │   │   ├── orders.controller.ts
│   │   │   │   ├── orders.service.ts
│   │   │   │   ├── orders.gateway.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-order.dto.ts
│   │   │   │       └── update-order-status.dto.ts
│   │   │   ├── forecast/
│   │   │   │   ├── forecast.module.ts
│   │   │   │   ├── forecast.controller.ts
│   │   │   │   └── forecast.service.ts
│   │   │   ├── notifications/
│   │   │   │   ├── notifications.module.ts
│   │   │   │   ├── notifications.controller.ts
│   │   │   │   └── notifications.service.ts
│   │   │   └── admin/
│   │   │       ├── admin.module.ts
│   │   │       ├── admin.controller.ts
│   │   │       └── admin.service.ts
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   │   ├── roles.decorator.ts
│   │   │   │   └── current-user.decorator.ts
│   │   │   ├── filters/
│   │   │   │   └── global-exception.filter.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── logging.interceptor.ts
│   │   │   │   └── transform.interceptor.ts
│   │   │   ├── guards/
│   │   │   │   └── roles.guard.ts
│   │   │   └── pipes/
│   │   │       └── validation.pipe.ts
│   │   ├── config/
│   │   │   └── configuration.ts
│   │   ├── database/
│   │   │   └── prisma.service.ts
│   │   ├── queues/
│   │   │   ├── notification.processor.ts
│   │   │   └── ml-trigger.processor.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── test/
│   │   └── app.e2e-spec.ts
│   ├── .env.example
│   ├── Dockerfile
│   ├── nest-cli.json
│   ├── package.json
│   ├── tsconfig.json
│   └── tsconfig.build.json
│
├── supplylink-web/                        # Front-end Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                   # Landing Page
│   │   │   ├── (public)/
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── cadastro/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── recuperar-senha/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── redefinir-senha/
│   │   │   │       └── page.tsx
│   │   │   ├── (fabrica)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── fabrica/
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── demandas/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   ├── nova/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   ├── cotacoes/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── comparar/
│   │   │   │   │   │       └── [demandaId]/
│   │   │   │   │   │           └── page.tsx
│   │   │   │   │   ├── pedidos/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   ├── previsao/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── fornecedores/
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       └── [id]/
│   │   │   │   │           └── page.tsx
│   │   │   ├── (fornecedor)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── fornecedor/
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── portfolio/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   ├── novo/
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       └── editar/
│   │   │   │   │   │           └── page.tsx
│   │   │   │   │   ├── cotacoes/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   └── pedidos/
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       └── [id]/
│   │   │   │   │           └── page.tsx
│   │   │   ├── (admin)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── admin/
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── usuarios/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── categorias/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── logs/
│   │   │   │   │       └── page.tsx
│   │   │   ├── perfil/
│   │   │   │   └── page.tsx
│   │   │   ├── notificacoes/
│   │   │   │   └── page.tsx
│   │   │   └── not-found.tsx
│   │   ├── components/
│   │   │   ├── ui/                        # shadcn/ui (será gerado via CLI)
│   │   │   └── shared/
│   │   │       ├── navbar.tsx
│   │   │       ├── sidebar.tsx
│   │   │       ├── data-table.tsx
│   │   │       └── modal.tsx
│   │   ├── hooks/
│   │   │   ├── use-auth.ts
│   │   │   └── use-socket.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── stores/
│   │   │   ├── auth.store.ts
│   │   │   └── notification.store.ts
│   │   ├── lib/
│   │   │   ├── validations/
│   │   │   │   └── auth.schema.ts
│   │   │   └── utils.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── middleware.ts
│   ├── public/
│   ├── .env.example
│   ├── Dockerfile
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── supplylink-mobile/                     # Mobile Flutter
│   ├── lib/
│   │   ├── main.dart
│   │   ├── app/
│   │   │   ├── router/
│   │   │   │   └── app_router.dart
│   │   │   └── theme/
│   │   │       └── app_theme.dart
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── data/
│   │   │   │   │   ├── datasources/
│   │   │   │   │   │   └── auth_remote_datasource.dart
│   │   │   │   │   └── repositories/
│   │   │   │   │       └── auth_repository_impl.dart
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   └── user.dart
│   │   │   │   │   ├── repositories/
│   │   │   │   │   │   └── auth_repository.dart
│   │   │   │   │   └── usecases/
│   │   │   │   │       ├── login_usecase.dart
│   │   │   │   │       └── register_usecase.dart
│   │   │   │   └── presentation/
│   │   │   │       ├── providers/
│   │   │   │       │   └── auth_provider.dart
│   │   │   │       ├── screens/
│   │   │   │       │   ├── login_screen.dart
│   │   │   │       │   ├── register_screen.dart
│   │   │   │       │   └── splash_screen.dart
│   │   │   │       └── widgets/
│   │   │   │           └── auth_form_field.dart
│   │   │   ├── demands/
│   │   │   │   ├── data/
│   │   │   │   │   ├── datasources/
│   │   │   │   │   └── repositories/
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   └── usecases/
│   │   │   │   └── presentation/
│   │   │   │       ├── providers/
│   │   │   │       ├── screens/
│   │   │   │       └── widgets/
│   │   │   ├── quotes/
│   │   │   │   ├── data/
│   │   │   │   │   ├── datasources/
│   │   │   │   │   └── repositories/
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   └── usecases/
│   │   │   │   └── presentation/
│   │   │   │       ├── providers/
│   │   │   │       ├── screens/
│   │   │   │       └── widgets/
│   │   │   ├── orders/
│   │   │   │   ├── data/
│   │   │   │   │   ├── datasources/
│   │   │   │   │   └── repositories/
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   └── usecases/
│   │   │   │   └── presentation/
│   │   │   │       ├── providers/
│   │   │   │       ├── screens/
│   │   │   │       └── widgets/
│   │   │   ├── portfolio/
│   │   │   │   ├── data/
│   │   │   │   │   ├── datasources/
│   │   │   │   │   └── repositories/
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   └── usecases/
│   │   │   │   └── presentation/
│   │   │   │       ├── providers/
│   │   │   │       ├── screens/
│   │   │   │       └── widgets/
│   │   │   └── forecast/
│   │   │       ├── data/
│   │   │       │   ├── datasources/
│   │   │       │   └── repositories/
│   │   │       ├── domain/
│   │   │       │   ├── entities/
│   │   │       │   ├── repositories/
│   │   │       │   └── usecases/
│   │   │       └── presentation/
│   │   │           ├── providers/
│   │   │           ├── screens/
│   │   │           └── widgets/
│   │   ├── core/
│   │   │   ├── network/
│   │   │   │   ├── dio_client.dart
│   │   │   │   └── api_interceptor.dart
│   │   │   ├── storage/
│   │   │   │   └── secure_storage.dart
│   │   │   ├── notifications/
│   │   │   │   └── fcm_service.dart
│   │   │   └── error/
│   │   │       ├── failures.dart
│   │   │       └── exceptions.dart
│   │   └── shared/
│   │       └── widgets/
│   │           ├── app_button.dart
│   │           ├── app_card.dart
│   │           └── loading_overlay.dart
│   ├── pubspec.yaml
│   ├── android/
│   └── ios/
│
├── supplylink-ml/                         # ML Service FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── forecast_model.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── health.py
│   │   │   ├── train.py
│   │   │   └── forecast.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── training_service.py
│   │   │   └── prediction_service.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── forecast.py
│   │   └── database/
│   │       ├── __init__.py
│   │       └── connection.py
│   ├── models/                            # Modelos .pkl serializados
│   │   └── .gitkeep
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_forecast.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── supplylink-infra/                      # Infraestrutura
│   ├── docker-compose.yml                 # Dev local
│   ├── docker-compose.prod.yml            # Produção
│   ├── nginx/
│   │   └── nginx.conf
│   ├── .env.example
│   └── .env.postgres.example
│
├── .gitignore
└── README.md
```

---

## 3. Docker Compose — Desenvolvimento Local

### 3.1 Tarefa: Criar `supplylink-infra/docker-compose.yml`

Crie o arquivo Docker Compose para desenvolvimento local. Ele deve subir **apenas os bancos de dados** (PostgreSQL e Redis) que os demais serviços consumirão. Os serviços da aplicação (api, web, ml) rodarão diretamente na máquina do desenvolvedor.

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    container_name: supplylink-postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: supplylink
      POSTGRES_USER: supplylink
      POSTGRES_PASSWORD: supplylink_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U supplylink -d supplylink"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: supplylink-redis
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
```

### 3.2 Tarefa: Criar `supplylink-infra/docker-compose.prod.yml`

Arquivo de produção completo com todos os serviços em containers:

```yaml
version: '3.9'

services:
  nginx:
    image: nginx:alpine
    container_name: supplylink-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - api
      - web
    restart: unless-stopped

  api:
    build: ../supplylink-api
    container_name: supplylink-api
    env_file: ../.env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  web:
    build: ../supplylink-web
    container_name: supplylink-web
    env_file: ../.env.web
    restart: unless-stopped

  ml:
    build: ../supplylink-ml
    container_name: supplylink-ml
    env_file: ../.env.ml
    volumes:
      - ml_models:/app/models
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    container_name: supplylink-postgres
    env_file: ../.env.postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U supplylink -d supplylink"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: supplylink-redis
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
  ml_models:
```

### 3.3 Tarefa: Criar `supplylink-infra/nginx/nginx.conf`

```nginx
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:3000;
    }

    upstream web {
        server web:3001;
    }

    server {
        listen 80;
        server_name api.supplylink.com.br app.supplylink.com.br;
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl;
        server_name api.supplylink.com.br;

        ssl_certificate /etc/letsencrypt/live/api.supplylink.com.br/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/api.supplylink.com.br/privkey.pem;

        location / {
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    server {
        listen 443 ssl;
        server_name app.supplylink.com.br;

        ssl_certificate /etc/letsencrypt/live/app.supplylink.com.br/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/app.supplylink.com.br/privkey.pem;

        location / {
            proxy_pass http://web;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 3.4 Tarefa: Criar `.env.example` (raiz da API — `supplylink-api/.env.example`)

```bash
# Banco de dados
DATABASE_URL=postgresql://supplylink:supplylink_dev@localhost:5432/supplylink

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=sua-chave-secreta-jwt-aqui
JWT_REFRESH_SECRET=sua-chave-secreta-refresh-aqui
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# ML Service
ML_SERVICE_URL=http://localhost:8000

# Firebase Cloud Messaging
FCM_SERVER_KEY=sua-chave-fcm-aqui

# SMTP (e-mails)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=sua-chave-sendgrid-aqui
SMTP_FROM=noreply@supplylink.com.br

# Magalu Cloud Object Storage (compatível S3)
STORAGE_ENDPOINT=https://br-se1.magaluobjects.com
STORAGE_ACCESS_KEY=sua-access-key
STORAGE_SECRET_KEY=sua-secret-key
STORAGE_BUCKET_AVATARS=supplylink-avatars
STORAGE_BUCKET_PRODUCTS=supplylink-products
STORAGE_REGION=br-se1

# App
PORT=3000
NODE_ENV=development
```

---

## 4. Modelo de Dados — Prisma Schema

### Tarefa: Criar `supplylink-api/prisma/schema.prisma`

Implemente o schema Prisma completo conforme abaixo. Todos os campos, enums, relacionamentos e índices são obrigatórios.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ===================== ENUMS =====================

enum Role {
  FACTORY
  SUPPLIER
  ADMIN
}

enum UserStatus {
  PENDING
  ACTIVE
  BLOCKED
}

enum DemandStatus {
  OPEN
  IN_NEGOTIATION
  CLOSED
  CANCELLED
}

enum QuoteStatus {
  PENDING
  ANSWERED
  ACCEPTED
  REJECTED
}

enum OrderStatus {
  CONFIRMED
  PREPARING
  IN_TRANSIT
  DELIVERED
}

enum NotificationType {
  NEW_QUOTE
  QUOTE_ANSWERED
  ORDER_STATUS
  ML_ALERT
}

// ===================== MODELS =====================

model User {
  id           String     @id @default(uuid())
  name         String
  email        String     @unique
  passwordHash String     @map("password_hash")
  role         Role
  companyName  String     @map("company_name")
  cnpj         String     @unique
  address      String?
  logoUrl      String?    @map("logo_url")
  status       UserStatus @default(PENDING)
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")

  // Relacionamentos
  products       Product[]
  demands        Demand[]
  quoteRequests  QuoteRequest[]
  factoryOrders  Order[]        @relation("FactoryOrders")
  supplierOrders Order[]        @relation("SupplierOrders")
  orderHistories OrderHistory[]
  forecasts      DemandForecast[]
  notifications  Notification[]

  @@map("users")
}

model Category {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  createdAt   DateTime @default(now()) @map("created_at")

  products Product[]

  @@map("categories")
}

model Product {
  id          String   @id @default(uuid())
  supplierId  String   @map("supplier_id")
  categoryId  String   @map("category_id")
  name        String
  description String?
  unit        String
  basePrice   Decimal  @map("base_price") @db.Decimal(12, 2)
  stockQty    Decimal  @map("stock_qty") @db.Decimal(12, 2)
  images      String[]
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  supplier       User             @relation(fields: [supplierId], references: [id], onDelete: Cascade)
  category       Category         @relation(fields: [categoryId], references: [id])
  orderHistories OrderHistory[]
  forecasts      DemandForecast[]

  @@index([supplierId])
  @@index([categoryId])
  @@index([name])
  @@map("products")
}

model Demand {
  id          String       @id @default(uuid())
  factoryId   String       @map("factory_id")
  productName String       @map("product_name")
  quantity    Decimal      @db.Decimal(12, 2)
  unit        String
  neededBy    DateTime     @map("needed_by") @db.Date
  conditions  String?
  status      DemandStatus @default(OPEN)
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  factory       User           @relation(fields: [factoryId], references: [id], onDelete: Cascade)
  quoteRequests QuoteRequest[]

  @@index([factoryId])
  @@index([status])
  @@map("demands")
}

model QuoteRequest {
  id         String      @id @default(uuid())
  demandId   String      @map("demand_id")
  supplierId String      @map("supplier_id")
  status     QuoteStatus @default(PENDING)
  createdAt  DateTime    @default(now()) @map("created_at")

  demand   Demand         @relation(fields: [demandId], references: [id], onDelete: Cascade)
  supplier User           @relation(fields: [supplierId], references: [id], onDelete: Cascade)
  response QuoteResponse?

  @@index([demandId])
  @@index([supplierId])
  @@index([status])
  @@map("quote_requests")
}

model QuoteResponse {
  id             String   @id @default(uuid())
  quoteRequestId String   @unique @map("quote_request_id")
  unitPrice      Decimal  @map("unit_price") @db.Decimal(12, 2)
  totalPrice     Decimal  @map("total_price") @db.Decimal(12, 2)
  leadTimeDays   Int      @map("lead_time_days")
  conditions     String?
  createdAt      DateTime @default(now()) @map("created_at")

  quoteRequest QuoteRequest @relation(fields: [quoteRequestId], references: [id], onDelete: Cascade)
  order        Order?

  @@map("quote_responses")
}

model Order {
  id              String      @id @default(uuid())
  quoteResponseId String      @unique @map("quote_response_id")
  factoryId       String      @map("factory_id")
  supplierId      String      @map("supplier_id")
  status          OrderStatus @default(CONFIRMED)
  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")

  quoteResponse QuoteResponse @relation(fields: [quoteResponseId], references: [id])
  factory       User          @relation("FactoryOrders", fields: [factoryId], references: [id])
  supplier      User          @relation("SupplierOrders", fields: [supplierId], references: [id])
  histories     OrderHistory[]

  @@index([factoryId])
  @@index([supplierId])
  @@index([status])
  @@map("orders")
}

model OrderHistory {
  id        String   @id @default(uuid())
  orderId   String   @map("order_id")
  productId String   @map("product_id")
  quantity  Decimal  @db.Decimal(12, 2)
  period    DateTime @db.Date
  createdAt DateTime @default(now()) @map("created_at")

  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id])

  @@index([productId, period])
  @@map("order_histories")
}

model DemandForecast {
  id                String   @id @default(uuid())
  factoryId         String   @map("factory_id")
  productId         String   @map("product_id")
  forecastDate      DateTime @map("forecast_date") @db.Date
  predictedQuantity Decimal  @map("predicted_quantity") @db.Decimal(12, 2)
  horizonDays       Int      @map("horizon_days")
  modelVersion      String   @map("model_version")
  createdAt         DateTime @default(now()) @map("created_at")

  factory User    @relation(fields: [factoryId], references: [id])
  product Product @relation(fields: [productId], references: [id])

  @@index([factoryId, productId])
  @@map("demand_forecasts")
}

model Notification {
  id        String           @id @default(uuid())
  userId    String           @map("user_id")
  type      NotificationType
  title     String
  body      String
  read      Boolean          @default(false)
  createdAt DateTime         @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, read])
  @@map("notifications")
}
```

### Tarefa: Criar `supplylink-api/prisma/seed.ts`

Crie um seed com:
- 1 usuário Admin (email: `admin@supplylink.com.br`, senha: `Admin@123`)
- 5 categorias de matéria-prima (ex: Metais, Polímeros, Químicos, Têxteis, Madeira)
- 2 usuários Fábrica de exemplo
- 2 usuários Fornecedor de exemplo com produtos cadastrados

Utilize `bcrypt` para fazer hash das senhas com 12 rounds.

---

## 5. Implementação das Rotas Padrão — Back-end NestJS

### 5.1 Configurações Globais

#### Tarefa: `supplylink-api/src/main.ts`

Configure o bootstrap do NestJS com:

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:3001',
      'https://app.supplylink.com.br',
    ],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('SupplyLink API')
    .setDescription('API da plataforma SupplyLink')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('v1/docs', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
```

#### Tarefa: `supplylink-api/src/common/interceptors/transform.interceptor.ts`

Interceptor que padroniza todas as respostas no formato `{ success: true, data, meta }`:

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  meta?: Record<string, any>;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data && data.meta) {
          return {
            success: true,
            data: data.data,
            meta: data.meta,
          };
        }
        return {
          success: true,
          data,
        };
      }),
    );
  }
}
```

#### Tarefa: `supplylink-api/src/common/filters/global-exception.filter.ts`

Filter que captura exceções e retorna no formato `{ success: false, error: { code, message, statusCode } }`:

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || message;
      code = (exceptionResponse as any).code || `HTTP_${status}`;
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        statusCode: status,
      },
    });
  }
}
```

#### Tarefa: `supplylink-api/src/common/decorators/roles.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

#### Tarefa: `supplylink-api/src/common/decorators/current-user.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
```

#### Tarefa: `supplylink-api/src/common/guards/roles.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

#### Tarefa: `supplylink-api/src/database/prisma.service.ts`

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### 5.2 Módulo Auth — `/auth`

#### Rotas a implementar:

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `POST` | `/v1/auth/register` | Público | Cadastro (Fábrica ou Fornecedor) |
| `POST` | `/v1/auth/login` | Público | Login → retorna `access_token` + `refresh_token` |
| `POST` | `/v1/auth/refresh` | Público | Renovar access token |
| `POST` | `/v1/auth/logout` | Autenticado | Invalidar refresh token |
| `POST` | `/v1/auth/forgot-password` | Público | Enviar e-mail de recuperação |
| `POST` | `/v1/auth/reset-password` | Público | Redefinir senha via token |

#### DTOs obrigatórios:

**`register.dto.ts`:**
```typescript
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: ['FACTORY', 'SUPPLIER'] })
  @IsEnum(Role)
  role: Role;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty()
  @IsString()
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, {
    message: 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX',
  })
  cnpj: string;

  @ApiProperty({ required: false })
  @IsString()
  address?: string;
}
```

**`login.dto.ts`:**
```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;
}
```

#### Lógica do Service:

- `register`: hash da senha com bcrypt (12 rounds), criar usuário com status PENDING, retornar dados sem senha
- `login`: validar credenciais, verificar se status = ACTIVE, gerar JWT access_token (exp: 15min) + refresh_token (exp: 7d)
- `refresh`: validar refresh_token, gerar novo par de tokens
- `logout`: invalidar refresh_token (armazenar em blacklist no Redis)
- `forgot-password`: gerar token temporário, enviar e-mail via Nodemailer (enfileirar com BullMQ)
- `reset-password`: validar token do e-mail, atualizar hash da senha

#### JWT Strategy (`strategies/jwt.strategy.ts`):

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; role: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user || user.status === 'BLOCKED') {
      throw new UnauthorizedException();
    }
    return { id: user.id, email: user.email, role: user.role };
  }
}
```

### 5.3 Módulo Users — `/users`

| Método | Rota | Guard | Descrição |
|--------|------|-------|-----------|
| `GET` | `/v1/users/me` | `@UseGuards(JwtAuthGuard)` | Perfil do usuário autenticado |
| `PUT` | `/v1/users/me` | `@UseGuards(JwtAuthGuard)` | Editar perfil |
| `PATCH` | `/v1/users/me/avatar` | `@UseGuards(JwtAuthGuard)` | Upload de avatar |
| `GET` | `/v1/users` | `@UseGuards(JwtAuthGuard, RolesGuard)` `@Roles(Role.ADMIN)` | Lista todos os usuários |
| `GET` | `/v1/users/:id` | `@Roles(Role.ADMIN)` | Detalhes de um usuário |
| `PATCH` | `/v1/users/:id/approve` | `@Roles(Role.ADMIN)` | Aprovar conta |
| `PATCH` | `/v1/users/:id/block` | `@Roles(Role.ADMIN)` | Bloquear conta |
| `DELETE` | `/v1/users/:id` | `@Roles(Role.ADMIN)` | Excluir usuário |

### 5.4 Módulo Categories — `/categories`

| Método | Rota | Guard | Descrição |
|--------|------|-------|-----------|
| `GET` | `/v1/categories` | `@UseGuards(JwtAuthGuard)` | Listar todas |
| `POST` | `/v1/categories` | `@Roles(Role.ADMIN)` | Criar categoria |
| `PUT` | `/v1/categories/:id` | `@Roles(Role.ADMIN)` | Editar categoria |
| `DELETE` | `/v1/categories/:id` | `@Roles(Role.ADMIN)` | Excluir categoria |

**`create-category.dto.ts`:**
```typescript
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
```

### 5.5 Módulo Products — `/products`

| Método | Rota | Guard | Descrição |
|--------|------|-------|-----------|
| `GET` | `/v1/products` | `@UseGuards(JwtAuthGuard)` | Buscar com filtros |
| `GET` | `/v1/products/:id` | `@UseGuards(JwtAuthGuard)` | Detalhes |
| `POST` | `/v1/products` | `@Roles(Role.SUPPLIER)` | Cadastrar produto |
| `PUT` | `/v1/products/:id` | `@Roles(Role.SUPPLIER)` | Editar (verificar ownership) |
| `DELETE` | `/v1/products/:id` | `@Roles(Role.SUPPLIER)` | Remover (verificar ownership) |
| `POST` | `/v1/products/:id/images` | `@Roles(Role.SUPPLIER)` | Upload de imagens |
| `DELETE` | `/v1/products/:id/images/:imgId` | `@Roles(Role.SUPPLIER)` | Remover imagem |
| `GET` | `/v1/suppliers/:id/products` | `@UseGuards(JwtAuthGuard)` | Portfólio de um fornecedor |

**`create-product.dto.ts`:**
```typescript
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty({ description: 'kg, ton, unidade, litro...' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty()
  @IsNumber()
  basePrice: number;

  @ApiProperty()
  @IsNumber()
  stockQty: number;
}
```

**`product-query.dto.ts`:**
```typescript
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ProductQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
```

### 5.6 Módulo Demands — `/demands`

| Método | Rota | Guard | Descrição |
|--------|------|-------|-----------|
| `GET` | `/v1/demands` | `@Roles(Role.FACTORY)` | Listar demandas da fábrica autenticada |
| `GET` | `/v1/demands/:id` | `@Roles(Role.FACTORY)` | Detalhes (verificar ownership) |
| `POST` | `/v1/demands` | `@Roles(Role.FACTORY)` | Criar demanda |
| `PUT` | `/v1/demands/:id` | `@Roles(Role.FACTORY)` | Editar (apenas se status = OPEN) |
| `DELETE` | `/v1/demands/:id` | `@Roles(Role.FACTORY)` | Cancelar demanda |

**`create-demand.dto.ts`:**
```typescript
import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDemandDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ description: 'Data limite no formato ISO' })
  @IsDateString()
  neededBy: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  conditions?: string;
}
```

### 5.7 Módulo Quotes — `/quotes`

| Método | Rota | Guard | Descrição |
|--------|------|-------|-----------|
| `POST` | `/v1/quotes/request` | `@Roles(Role.FACTORY)` | Solicitar cotação |
| `GET` | `/v1/quotes/requests` | `@Roles(Role.FACTORY)` | Cotações enviadas |
| `GET` | `/v1/quotes/requests/:id` | `@Roles(Role.FACTORY)` | Detalhes da solicitação |
| `GET` | `/v1/quotes/received` | `@Roles(Role.SUPPLIER)` | Cotações recebidas |
| `POST` | `/v1/quotes/:requestId/respond` | `@Roles(Role.SUPPLIER)` | Responder cotação |
| `PATCH` | `/v1/quotes/:requestId/accept` | `@Roles(Role.FACTORY)` | Aceitar cotação |
| `PATCH` | `/v1/quotes/:requestId/reject` | `@Roles(Role.FACTORY)` | Rejeitar cotação |
| `GET` | `/v1/quotes/compare/:demandId` | `@Roles(Role.FACTORY)` | Comparar cotações |

**`request-quote.dto.ts`:**
```typescript
import { IsUUID, IsArray, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestQuoteDto {
  @ApiProperty()
  @IsUUID()
  demandId: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  supplierIds: string[];
}
```

**`respond-quote.dto.ts`:**
```typescript
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RespondQuoteDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  totalPrice: number;

  @ApiProperty({ description: 'Prazo de entrega em dias' })
  @IsNumber()
  @Min(1)
  leadTimeDays: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  conditions?: string;
}
```

### 5.8 Módulo Orders — `/orders`

| Método | Rota | Guard | Descrição |
|--------|------|-------|-----------|
| `POST` | `/v1/orders` | `@Roles(Role.FACTORY)` | Confirmar pedido a partir de cotação aceita |
| `GET` | `/v1/orders` | `@UseGuards(JwtAuthGuard)` | Listar pedidos (filtro por role) |
| `GET` | `/v1/orders/:id` | `@UseGuards(JwtAuthGuard)` | Detalhes do pedido |
| `PATCH` | `/v1/orders/:id/status` | `@Roles(Role.SUPPLIER)` | Atualizar status da entrega |
| `GET` | `/v1/orders/history` | `@Roles(Role.FACTORY)` | Histórico com filtros |

**Ao atualizar status**, emitir evento WebSocket via `OrdersGateway`:

```typescript
@WebSocketGateway({ cors: true, namespace: '/orders' })
export class OrdersGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-order')
  handleJoin(client: Socket, orderId: string) {
    client.join(`order:${orderId}`);
  }

  emitStatusUpdate(orderId: string, status: string) {
    this.server.to(`order:${orderId}`).emit('status-updated', { orderId, status });
  }
}
```

**`create-order.dto.ts`:**
```typescript
import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: 'ID da resposta de cotação aceita' })
  @IsUUID()
  quoteResponseId: string;
}
```

**`update-order-status.dto.ts`:**
```typescript
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
```

### 5.9 Módulo Forecast — `/forecast`

| Método | Rota | Guard | Descrição |
|--------|------|-------|-----------|
| `GET` | `/v1/forecast/:productId` | `@Roles(Role.FACTORY)` | Previsão 30/60/90 dias |
| `GET` | `/v1/forecast/alerts` | `@Roles(Role.FACTORY)` | Alertas de reposição |
| `POST` | `/v1/forecast/trigger` | `@Roles(Role.ADMIN)` | Disparar treinamento manual |

O service deve fazer chamadas HTTP internas para o ML Service (FastAPI) em `ML_SERVICE_URL`.

### 5.10 Módulo Notifications — `/notifications`

| Método | Rota | Guard | Descrição |
|--------|------|-------|-----------|
| `GET` | `/v1/notifications` | `@UseGuards(JwtAuthGuard)` | Listar notificações do usuário |
| `PATCH` | `/v1/notifications/:id/read` | `@UseGuards(JwtAuthGuard)` | Marcar como lida |
| `PATCH` | `/v1/notifications/read-all` | `@UseGuards(JwtAuthGuard)` | Marcar todas como lidas |

### 5.11 Módulo Admin — `/admin`

| Método | Rota | Guard | Descrição |
|--------|------|-------|-----------|
| `GET` | `/v1/admin/metrics` | `@Roles(Role.ADMIN)` | KPIs da plataforma |
| `GET` | `/v1/admin/logs` | `@Roles(Role.ADMIN)` | Logs de atividade |

### 5.12 AppModule — Registro global

#### Tarefa: `supplylink-api/src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';

import { PrismaService } from './database/prisma.service';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { DemandsModule } from './modules/demands/demands.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ForecastModule } from './modules/forecast/forecast.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_URL ? new URL(process.env.REDIS_URL).hostname : 'localhost',
        port: process.env.REDIS_URL ? Number(new URL(process.env.REDIS_URL).port) : 6379,
      },
    }),
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    DemandsModule,
    QuotesModule,
    OrdersModule,
    ForecastModule,
    NotificationsModule,
    AdminModule,
  ],
  providers: [
    PrismaService,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  exports: [PrismaService],
})
export class AppModule {}
```

### 5.13 Dependências — `package.json`

Instale as seguintes dependências no projeto `supplylink-api`:

```bash
# Core
npm install @nestjs/core @nestjs/common @nestjs/platform-express
npm install @nestjs/config @nestjs/swagger swagger-ui-express
npm install @nestjs/passport passport passport-jwt
npm install @nestjs/jwt
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install @nestjs/bullmq bullmq
npm install @nestjs/throttler
npm install @prisma/client
npm install class-validator class-transformer
npm install bcrypt
npm install nodemailer

# Dev
npm install -D prisma typescript @types/node @types/express
npm install -D @types/passport-jwt @types/bcrypt @types/nodemailer
npm install -D jest @nestjs/testing ts-jest @types/jest
```

---

## 6. Scaffolding do Front-end Web — Next.js

### Tarefa: Inicializar projeto

```bash
npx create-next-app@14 supplylink-web --typescript --tailwind --eslint --app --src-dir
```

### Tarefa: Instalar dependências

```bash
cd supplylink-web
npm install zustand @tanstack/react-query axios recharts react-hook-form @hookform/resolvers zod socket.io-client
npx shadcn-ui@latest init
```

### Tarefa: Criar `src/middleware.ts`

Middleware do Next.js para proteção de rotas por role:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/', '/login', '/cadastro', '/recuperar-senha', '/redefinir-senha'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  if (publicPaths.some((path) => pathname === path || pathname.startsWith(path + '/'))) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Tarefa: Criar `src/services/api.ts`

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
```

### Tarefa: Criar `src/types/index.ts`

Defina todas as interfaces TypeScript correspondentes ao modelo de dados Prisma:

```typescript
export type Role = 'FACTORY' | 'SUPPLIER' | 'ADMIN';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'BLOCKED';
export type DemandStatus = 'OPEN' | 'IN_NEGOTIATION' | 'CLOSED' | 'CANCELLED';
export type QuoteStatus = 'PENDING' | 'ANSWERED' | 'ACCEPTED' | 'REJECTED';
export type OrderStatus = 'CONFIRMED' | 'PREPARING' | 'IN_TRANSIT' | 'DELIVERED';
export type NotificationType = 'NEW_QUOTE' | 'QUOTE_ANSWERED' | 'ORDER_STATUS' | 'ML_ALERT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyName: string;
  cnpj: string;
  address?: string;
  logoUrl?: string;
  status: UserStatus;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  supplierId: string;
  categoryId: string;
  name: string;
  description?: string;
  unit: string;
  basePrice: number;
  stockQty: number;
  images: string[];
  createdAt: string;
}

export interface Demand {
  id: string;
  factoryId: string;
  productName: string;
  quantity: number;
  unit: string;
  neededBy: string;
  conditions?: string;
  status: DemandStatus;
  createdAt: string;
}

export interface QuoteRequest {
  id: string;
  demandId: string;
  supplierId: string;
  status: QuoteStatus;
  createdAt: string;
  response?: QuoteResponse;
}

export interface QuoteResponse {
  id: string;
  quoteRequestId: string;
  unitPrice: number;
  totalPrice: number;
  leadTimeDays: number;
  conditions?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  quoteResponseId: string;
  factoryId: string;
  supplierId: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { page: number; total: number };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
  };
}
```

### Tarefa: Criar páginas placeholder

Para cada `page.tsx` listado na estrutura de pastas (Seção 2), crie um componente mínimo funcional com:

```typescript
export default function NomeDaPagina() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">Nome da Página</h1>
      <p className="text-muted-foreground mt-2">Em desenvolvimento...</p>
    </div>
  );
}
```

Substituindo "Nome da Página" pelo nome correto de cada tela conforme a tabela da Seção 4 do `project.md`.

---

## 7. Scaffolding do Mobile — Flutter

### Tarefa: Inicializar projeto

```bash
flutter create supplylink_mobile --org com.supplylink --project-name supplylink_mobile
```

Depois renomeie a pasta para `supplylink-mobile` para manter o padrão.

### Tarefa: Configurar `pubspec.yaml`

```yaml
name: supplylink_mobile
description: SupplyLink - Plataforma de conexão Fábricas e Fornecedores

environment:
  sdk: '>=3.0.0 <4.0.0'
  flutter: '>=3.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.4.0
  riverpod_annotation: ^2.3.0
  go_router: ^13.0.0
  dio: ^5.4.0
  flutter_secure_storage: ^9.0.0
  firebase_core: ^2.24.0
  firebase_messaging: ^14.7.0
  fl_chart: ^0.68.0
  image_picker: ^1.0.0
  intl: ^0.19.0
  freezed_annotation: ^2.4.0
  json_annotation: ^4.8.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
  build_runner: ^2.4.0
  freezed: ^2.4.0
  json_serializable: ^6.7.0
  riverpod_generator: ^2.3.0
```

### Tarefa: Criar `lib/main.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app/router/app_router.dart';
import 'app/theme/app_theme.dart';

void main() {
  runApp(const ProviderScope(child: SupplyLinkApp()));
}

class SupplyLinkApp extends ConsumerWidget {
  const SupplyLinkApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'SupplyLink',
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
```

### Tarefa: Criar `lib/core/network/dio_client.dart`

```dart
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../storage/secure_storage.dart';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: 'http://10.0.2.2:3000/v1', // localhost para emulador Android
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {'Content-Type': 'application/json'},
  ));

  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      final storage = ref.read(secureStorageProvider);
      final token = await storage.read(key: 'access_token');
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      handler.next(options);
    },
    onError: (error, handler) async {
      if (error.response?.statusCode == 401) {
        // TODO: implementar refresh token
      }
      handler.next(error);
    },
  ));

  return dio;
});
```

### Tarefa: Criar estrutura de cada feature

Para cada feature (demands, quotes, orders, portfolio, forecast), crie arquivos `.gitkeep` dentro dos subdiretórios `data/datasources`, `data/repositories`, `domain/entities`, `domain/repositories`, `domain/usecases`, `presentation/providers`, `presentation/screens`, `presentation/widgets`.

A feature `auth` deve ter os arquivos concretos descritos na Seção 2.

---

## 8. Scaffolding do ML Service — FastAPI

### Tarefa: Criar `supplylink-ml/requirements.txt`

```
fastapi==0.111.0
uvicorn[standard]==0.29.0
sqlalchemy==2.0.29
psycopg2-binary==2.9.9
pandas==2.2.1
numpy==1.26.4
scikit-learn==1.5.0
xgboost==2.0.3
joblib==1.4.2
pydantic==2.7.0
python-dotenv==1.0.1
pytest==8.1.1
httpx==0.27.0
```

### Tarefa: Criar `supplylink-ml/app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import health, train, forecast

app = FastAPI(
    title="SupplyLink ML Service",
    description="Serviço de previsão de demanda",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(train.router, prefix="/train", tags=["Training"])
app.include_router(forecast.router, prefix="/forecast", tags=["Forecast"])
```

### Tarefa: Criar `supplylink-ml/app/routes/health.py`

```python
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "supplylink-ml"}
```

### Tarefa: Criar `supplylink-ml/app/routes/train.py`

```python
from fastapi import APIRouter

router = APIRouter()

@router.post("/")
async def trigger_training():
    # TODO: implementar pipeline de treinamento
    return {"message": "Treinamento iniciado", "status": "queued"}
```

### Tarefa: Criar `supplylink-ml/app/routes/forecast.py`

```python
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ForecastRequest(BaseModel):
    product_id: str
    factory_id: str
    horizon_days: int = 30  # 30, 60, ou 90

class ForecastResponse(BaseModel):
    product_id: str
    predictions: list[dict]
    model_version: str

@router.post("/", response_model=ForecastResponse)
async def generate_forecast(request: ForecastRequest):
    # TODO: implementar predição com modelo serializado
    return ForecastResponse(
        product_id=request.product_id,
        predictions=[],
        model_version="v0.0.0",
    )
```

### Tarefa: Criar `supplylink-ml/Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Tarefa: Criar `supplylink-ml/.env.example`

```bash
DATABASE_URL=postgresql://supplylink:supplylink_dev@localhost:5432/supplylink
MODEL_PATH=/app/models/
```

---

## 9. Instruções de Execução

### Ordem de execução (obrigatória):

```
1. Infraestrutura (bancos de dados)
2. Back-end (API NestJS)
3. Front-end Web (Next.js) — pode rodar em paralelo com Mobile
4. Mobile (Flutter) — pode rodar em paralelo com Web
5. ML Service (FastAPI) — pode rodar em paralelo com Web/Mobile
```

### Passo 1 — Subir bancos de dados

```bash
cd supplylink-infra
docker compose up -d
```

Verificar se os containers estão saudáveis:

```bash
docker compose ps
```

### Passo 2 — Configurar e rodar a API

```bash
cd supplylink-api

# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env

# Gerar Prisma Client e rodar migrações
npx prisma generate
npx prisma migrate dev --name init

# Popular banco com dados iniciais
npx prisma db seed

# Iniciar em modo desenvolvimento
npm run start:dev
```

A API estará disponível em `http://localhost:3000/v1`.
Swagger em `http://localhost:3000/v1/docs`.

### Passo 3 — Rodar o Front-end Web

```bash
cd supplylink-web

# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env.local

# Iniciar em modo desenvolvimento
npm run dev
```

A aplicação web estará disponível em `http://localhost:3001`.

### Passo 4 — Rodar o Mobile

```bash
cd supplylink-mobile

# Instalar dependências
flutter pub get

# Rodar no emulador/dispositivo
flutter run
```

### Passo 5 — Rodar o ML Service

```bash
cd supplylink-ml

# Criar e ativar virtualenv
python -m venv venv
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Copiar variáveis de ambiente
cp .env.example .env

# Iniciar servidor
uvicorn app.main:app --reload --port 8000
```

O ML Service estará disponível em `http://localhost:8000`.
Docs em `http://localhost:8000/docs`.

---

## Checklist Final

Após completar todas as tarefas, verifique:

- [ ] `docker compose up -d` sobe PostgreSQL e Redis sem erros
- [ ] `npx prisma migrate dev` cria todas as tabelas no banco
- [ ] `npx prisma db seed` popula dados iniciais
- [ ] `npm run start:dev` (API) inicia sem erros na porta 3000
- [ ] `http://localhost:3000/v1/docs` exibe o Swagger com todas as rotas documentadas
- [ ] `POST /v1/auth/register` cria um usuário com sucesso
- [ ] `POST /v1/auth/login` retorna `access_token` e `refresh_token`
- [ ] Rotas protegidas retornam 401 sem token
- [ ] Rotas com `@Roles()` retornam 403 para roles incorretos
- [ ] `npm run dev` (Web) inicia na porta 3001 sem erros
- [ ] Todas as páginas do Next.js renderizam o placeholder correto
- [ ] `flutter run` compila e exibe a splash screen
- [ ] `uvicorn app.main:app` inicia o ML Service na porta 8000
- [ ] `GET /health` no ML Service retorna status healthy
