from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes_health import router as health_router
from .api.routes_refine import router as refine_router

app = FastAPI(title="AI Text Refinement API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(refine_router, prefix="/api")

