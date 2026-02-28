from fastapi import APIRouter, HTTPException
from app.schemas.forecast import ForecastRequest, ForecastResponse
from app.services.prediction_service import PredictionService

router = APIRouter()
prediction_service = PredictionService()


@router.post("/", response_model=ForecastResponse)
async def generate_forecast(request: ForecastRequest):
    try:
        predictions = prediction_service.predict(
            product_id=request.product_id,
            factory_id=request.factory_id,
            horizon_days=request.horizon_days,
        )
        return ForecastResponse(
            product_id=request.product_id,
            predictions=predictions,
            model_version=prediction_service.get_model_version(),
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="Modelo não encontrado. Execute o treinamento primeiro.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
