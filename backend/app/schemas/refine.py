from pydantic import BaseModel


class RefinementOptions(BaseModel):
    tone: str


class RefineRequest(BaseModel):
    text: str
    options: RefinementOptions


class RefineResponse(BaseModel):
    refined_text: str

