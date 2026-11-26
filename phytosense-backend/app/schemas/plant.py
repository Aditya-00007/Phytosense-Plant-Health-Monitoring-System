from pydantic import BaseModel, Field


class DiagnosisResponse(BaseModel):
    disease: str
    crop: str
    confidence: float = Field(ge=0.0, le=1.0)
    explanation: str
    causes: list[str]
    treatment: list[str]
    prevention: list[str]
    irrigation: list[str]
