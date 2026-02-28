from pydantic import BaseModel


class ForecastRequest(BaseModel):
    product_id: str
    factory_id: str
    horizon_days: int = 30


class ForecastResponse(BaseModel):
    product_id: str
    predictions: list[float]
    model_version: str
