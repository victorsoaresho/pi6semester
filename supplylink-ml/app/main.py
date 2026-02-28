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
