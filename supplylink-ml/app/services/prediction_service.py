import numpy as np
from app.models.forecast_model import DemandForecaster


class PredictionService:
    def __init__(self):
        self.forecaster = DemandForecaster()

    def predict(self, product_id: str, factory_id: str, horizon_days: int) -> list[float]:
        self.forecaster.load()

        X = np.array([[i % 7, (i // 30) % 12 + 1, 0] for i in range(horizon_days)])
        predictions = self.forecaster.predict(X)

        return [round(float(p), 2) for p in predictions]

    def get_model_version(self) -> str:
        return self.forecaster.version
