# SupplyLink ML Service

Serviço de Machine Learning da plataforma SupplyLink, construído com **FastAPI** e **scikit-learn**, responsável pela previsão de demanda de matéria-prima.

## Overview

O ML Service recebe dados históricos de pedidos do banco de dados, treina modelos de regressão e fornece previsões de demanda futura para auxiliar fábricas no planejamento de compras. É consumido pela API NestJS internamente.

## Stack

- **Framework:** FastAPI 0.111
- **ML:** scikit-learn 1.5, XGBoost 2.0
- **Dados:** Pandas 2, NumPy 1.26
- **Serialização de modelos:** joblib 1.4
- **Banco de dados:** SQLAlchemy 2 + psycopg2 (PostgreSQL)
- **Testes:** pytest + httpx

## Estrutura

```
supplylink-ml/
├── app/
│   ├── main.py              # FastAPI app + middleware + routers
│   ├── config.py            # Configurações (pydantic BaseSettings)
│   ├── models/
│   │   └── forecast_model.py # Classe DemandForecaster (LinearRegression)
│   ├── routes/
│   │   ├── health.py        # GET /health
│   │   ├── train.py         # POST /train
│   │   └── forecast.py      # POST /forecast
│   ├── services/
│   │   ├── training_service.py   # Pipeline de treinamento
│   │   └── prediction_service.py # Pipeline de predição
│   ├── schemas/
│   │   └── forecast.py      # Schemas Pydantic (request/response)
│   └── database/
│       └── connection.py    # SQLAlchemy engine + session
├── models/                  # Modelos .pkl/.joblib serializados
├── tests/
│   └── test_forecast.py     # Testes dos endpoints
├── requirements.txt
├── Dockerfile
└── .env.example
```

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Health check do serviço |
| POST | `/train/` | Disparar treinamento do modelo |
| POST | `/forecast/` | Gerar previsão de demanda |

### POST /forecast/

**Request:**
```json
{
  "product_id": "uuid-do-produto",
  "factory_id": "uuid-da-fabrica",
  "horizon_days": 30
}
```

**Response:**
```json
{
  "product_id": "uuid-do-produto",
  "predictions": [
    { "date": "2026-03-01", "quantity": 150.5 },
    { "date": "2026-03-02", "quantity": 155.2 }
  ],
  "model_version": "v1.0.0"
}
```

## Como Rodar

### Pré-requisitos

- Python >= 3.11
- PostgreSQL 15 rodando (para treinamento com dados reais)

### Passos

```bash
# 1. Criar e ativar virtualenv
python -m venv venv
source venv/bin/activate       # Linux/macOS
# venv\Scripts\activate        # Windows

# 2. Instalar dependências
pip install -r requirements.txt

# 3. Configurar variáveis de ambiente
cp .env.example .env

# 4. Iniciar o servidor
uvicorn app.main:app --reload --port 8000
```

O serviço estará disponível em http://localhost:8000.

A documentação interativa (Swagger) estará em http://localhost:8000/docs.

### Rodar Testes

```bash
pytest tests/ -v
```

## Variáveis de Ambiente

| Variável | Descrição | Default |
|----------|-----------|---------|
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgresql://supplylink:supplylink_dev@localhost:5432/supplylink` |
| `MODEL_PATH` | Diretório para salvar modelos serializados | `/app/models/` |

## Modelo de ML

O modelo atual utiliza **LinearRegression** do scikit-learn como baseline. O fluxo é:

1. **Treinamento:** Carrega dados históricos de `order_histories` do PostgreSQL, extrai features temporais, treina o modelo e salva com joblib
2. **Predição:** Carrega o modelo salvo, gera previsões para o horizonte solicitado (30, 60 ou 90 dias)

O modelo pode ser substituído por algoritmos mais sofisticados (XGBoost, Prophet, etc.) sem alterar a interface da API.

## Docker

```bash
docker build -t supplylink-ml .
docker run -p 8000:8000 --env-file .env supplylink-ml
```
