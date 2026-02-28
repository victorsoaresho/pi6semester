import numpy as np
import pandas as pd
from sqlalchemy import text
from app.database.connection import get_session
from app.models.forecast_model import DemandForecaster


class TrainingService:
    def __init__(self):
        self.forecaster = DemandForecaster()

    def train_model(self) -> dict:
        data = self._load_data()

        X = data[["day_of_week", "month", "quantity_lag_7"]].values
        y = data["quantity"].values

        metrics = self.forecaster.train(X, y)
        self.forecaster.save()

        return metrics

    def _load_data(self) -> pd.DataFrame:
        session = get_session()
        try:
            result = session.execute(
                text("""
                    SELECT
                        product_id,
                        quantity,
                        EXTRACT(DOW FROM created_at) AS day_of_week,
                        EXTRACT(MONTH FROM created_at) AS month,
                        LAG(quantity, 7) OVER (
                            PARTITION BY product_id ORDER BY created_at
                        ) AS quantity_lag_7
                    FROM demand_records
                    ORDER BY created_at
                """)
            )
            df = pd.DataFrame(result.fetchall(), columns=result.keys())
            df = df.dropna()
            return df
        finally:
            session.close()
