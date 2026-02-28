import numpy as np
import joblib
import os
from sklearn.linear_model import LinearRegression
from app.config import get_settings


class DemandForecaster:
    def __init__(self):
        self.model = LinearRegression()
        self.is_trained = False
        self.version = "1.0.0"

    def train(self, X: np.ndarray, y: np.ndarray) -> dict:
        self.model.fit(X, y)
        self.is_trained = True

        score = self.model.score(X, y)
        return {
            "r2_score": score,
            "samples": len(y),
            "version": self.version,
        }

    def predict(self, X: np.ndarray) -> np.ndarray:
        if not self.is_trained:
            raise ValueError("Modelo não treinado. Execute train() primeiro.")
        return self.model.predict(X)

    def save(self, filename: str = "demand_model.pkl"):
        settings = get_settings()
        path = os.path.join(settings.MODEL_PATH, filename)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump({"model": self.model, "version": self.version}, path)

    def load(self, filename: str = "demand_model.pkl"):
        settings = get_settings()
        path = os.path.join(settings.MODEL_PATH, filename)
        if not os.path.exists(path):
            raise FileNotFoundError(f"Modelo não encontrado em {path}")
        data = joblib.load(path)
        self.model = data["model"]
        self.version = data["version"]
        self.is_trained = True
