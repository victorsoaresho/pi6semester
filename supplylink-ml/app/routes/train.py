from fastapi import APIRouter

router = APIRouter()


@router.post("/")
async def trigger_training():
    # TODO: implementar pipeline de treinamento
    return {"message": "Treinamento iniciado", "status": "queued"}
