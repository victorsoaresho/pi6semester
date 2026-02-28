# SupplyLink

Plataforma multiplataforma (Web + Mobile) que conecta **fábricas** (compradores de matéria-prima) a **fornecedores**, com previsão de demanda via Machine Learning.

## Visão Geral

O SupplyLink permite que fábricas publiquem demandas de compra de matéria-prima, solicitem e comparem cotações de múltiplos fornecedores, confirmem pedidos e acompanhem entregas em tempo real via WebSocket. Um serviço de ML integrado fornece previsão de demanda futura usando modelos de regressão.

### Perfis de Usuário

| Perfil | Descrição |
|--------|-----------|
| **Fábrica (FACTORY)** | Publica demandas, solicita cotações, confirma pedidos, visualiza previsões de demanda |
| **Fornecedor (SUPPLIER)** | Cadastra produtos no portfólio, responde cotações, gerencia entregas |
| **Administrador (ADMIN)** | Gerencia usuários, categorias, visualiza métricas e logs da plataforma |

## Arquitetura

```
supplylink/
├── supplylink-api/          # Back-end — NestJS 10 + Prisma + PostgreSQL
├── supplylink-web/          # Front-end Web — Next.js 14 + Tailwind + shadcn/ui
├── supplylink-mobile/       # Mobile — Flutter 3 + Riverpod + Dio
├── supplylink-ml/           # ML Service — FastAPI + scikit-learn
└── supplylink-infra/        # Infraestrutura — Docker Compose + Nginx
```

### Stack Tecnológica

| Camada | Tecnologias |
|--------|-------------|
| Back-end | NestJS 10, TypeScript 5, Prisma 5, PostgreSQL 15, Redis 7, BullMQ, Socket.io, Passport.js |
| Front-end Web | Next.js 14, Tailwind CSS 3, shadcn/ui, Zustand, TanStack Query, Recharts |
| Mobile | Flutter 3, Dart 3, Riverpod, go_router, Dio, fl_chart |
| ML | FastAPI, scikit-learn, Pandas, XGBoost, joblib |
| Infra | Docker, Docker Compose, Nginx |

## Como Rodar (Desenvolvimento)

### Pré-requisitos

- **Node.js** >= 18
- **npm** >= 9
- **Python** >= 3.11
- **Docker** e **Docker Compose**
- **Flutter** >= 3.0 (para o mobile)

### 1. Subir os bancos de dados

```bash
cd supplylink-infra
docker compose up -d
```

Verificar se os containers estão saudáveis:

```bash
docker compose ps
```

### 2. Rodar a API (NestJS)

```bash
cd supplylink-api
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

- API: http://localhost:3000/v1
- Swagger: http://localhost:3000/v1/docs

### 3. Rodar o Front-end Web (Next.js)

```bash
cd supplylink-web
cp .env.example .env.local
npm install
npm run dev
```

- Web: http://localhost:3000 (Next.js padrão)

### 4. Rodar o Mobile (Flutter)

```bash
cd supplylink-mobile
flutter pub get
flutter run
```

### 5. Rodar o ML Service (FastAPI)

```bash
cd supplylink-ml
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

- ML Service: http://localhost:8000
- Docs: http://localhost:8000/docs

## Usuários de Teste (Seed)

| E-mail | Senha | Role |
|--------|-------|------|
| admin@supplylink.com.br | Admin@123 | ADMIN |
| fabrica1@example.com | User@123 | FACTORY |
| fabrica2@example.com | User@123 | FACTORY |
| fornecedor1@example.com | User@123 | SUPPLIER |
| fornecedor2@example.com | User@123 | SUPPLIER |

## Documentação por Módulo

Para instruções detalhadas de cada parte do projeto, consulte:

- [Back-end API](supplylink-api/README.md)
- [Front-end Web](supplylink-web/README.md)
- [Mobile](supplylink-mobile/README.md)
- [ML Service](supplylink-ml/README.md)
- [Infraestrutura](supplylink-infra/README.md)

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
