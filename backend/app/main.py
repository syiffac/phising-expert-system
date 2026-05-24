from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes_features import router as features_router
from app.api.routes_rules import router as rules_router
from app.api.routes_detection import router as detection_router
from app.api.routes_history import router as history_router 
from app.api.routes_evaluation import router as evaluation_router

app = FastAPI(
    title="PhishGuard Expert System API",
    description="Backend API untuk sistem pakar deteksi website phishing berbasis rule-based system, forward chaining, Random Forest, dan XGBoost.",
    version="0.1.0",
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(features_router)
app.include_router(rules_router)
app.include_router(detection_router)
app.include_router(history_router)
app.include_router(evaluation_router)

@app.get("/")
def root():
    return {
        "message": "PhishGuard Expert System API is running",
        "status": "ok",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "backend-fastapi",
    }