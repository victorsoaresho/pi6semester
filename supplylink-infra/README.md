# SupplyLink Infra

Configuração de infraestrutura da plataforma SupplyLink, utilizando **Docker Compose** e **Nginx** como reverse proxy.

## Overview

Este módulo contém os arquivos de configuração para rodar a infraestrutura da plataforma tanto em ambiente de desenvolvimento quanto em produção. Em desenvolvimento, apenas os bancos de dados (PostgreSQL e Redis) rodam em containers Docker. Em produção, todos os serviços são containerizados.

## Estrutura

```
supplylink-infra/
├── docker-compose.yml          # Desenvolvimento local (Postgres + Redis)
├── docker-compose.prod.yml     # Produção (todos os serviços)
├── nginx/
│   └── nginx.conf              # Configuração do Nginx (reverse proxy)
├── .env.example                # Variáveis de ambiente da infra
└── .env.postgres.example       # Variáveis do PostgreSQL (produção)
```

## Desenvolvimento Local

No ambiente de desenvolvimento, o Docker Compose sobe apenas os bancos de dados. Os demais serviços (API, Web, ML) rodam diretamente na máquina do desenvolvedor.

### Serviços

| Serviço | Imagem | Porta | Descrição |
|---------|--------|-------|-----------|
| PostgreSQL | postgres:15-alpine | 5432 | Banco de dados principal |
| Redis | redis:7-alpine | 6379 | Cache e filas (BullMQ) |

### Como Subir

```bash
# Subir os containers
docker compose up -d

# Verificar se estão saudáveis
docker compose ps

# Ver logs
docker compose logs -f

# Parar os containers
docker compose down

# Parar e remover volumes (APAGA os dados)
docker compose down -v
```

### Credenciais Padrão (Dev)

| Serviço | Credencial | Valor |
|---------|-----------|-------|
| PostgreSQL | Database | supplylink |
| PostgreSQL | User | supplylink |
| PostgreSQL | Password | supplylink_dev |
| PostgreSQL | URL | `postgresql://supplylink:supplylink_dev@localhost:5432/supplylink` |
| Redis | URL | `redis://localhost:6379` |

## Produção

O arquivo `docker-compose.prod.yml` sobe todos os serviços em containers:

| Serviço | Container | Descrição |
|---------|-----------|-----------|
| Nginx | supplylink-nginx | Reverse proxy (portas 80/443) |
| API | supplylink-api | Back-end NestJS |
| Web | supplylink-web | Front-end Next.js |
| ML | supplylink-ml | Serviço de ML (FastAPI) |
| PostgreSQL | supplylink-postgres | Banco de dados |
| Redis | supplylink-redis | Cache e filas |

### Como Subir (Produção)

```bash
# Configurar variáveis de ambiente
cp .env.example .env
cp .env.postgres.example .env.postgres

# Subir com build
docker compose -f docker-compose.prod.yml up -d --build
```

### Nginx

O Nginx atua como reverse proxy com SSL:

- `api.supplylink.com.br` -> API (porta 3000)
- `app.supplylink.com.br` -> Web (porta 3001)

Os certificados SSL são esperados em `/etc/letsencrypt/` (Let's Encrypt). O HTTP (porta 80) redireciona automaticamente para HTTPS.

### SSL com Let's Encrypt

```bash
# Instalar certbot
sudo apt install certbot

# Gerar certificados
sudo certbot certonly --standalone -d api.supplylink.com.br
sudo certbot certonly --standalone -d app.supplylink.com.br
```

## Health Checks

Ambos os serviços de banco de dados possuem health checks configurados:

- **PostgreSQL:** `pg_isready -U supplylink -d supplylink` (intervalo: 10s)
- **Redis:** `redis-cli ping` (intervalo: 10s)

Os serviços da aplicação (API, ML) só iniciam após os bancos estarem saudáveis (`condition: service_healthy`).
