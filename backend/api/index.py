from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from .auth import router as auth_router
from .expenses import router as expenses_router
from .recurring import router as recurring_router
from .budget import router as budget_router

app = FastAPI(title="Budgify API", version="1.0.0")

# CORS configuration
allowed_origins = os.getenv('CORS_ORIGIN', '*').split(',')
allowed_origins = [origin.strip() for origin in allowed_origins]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(expenses_router)
app.include_router(recurring_router)
app.include_router(budget_router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Budgify API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "auth": "/auth",
            "expenses": "/expenses",
            "recurring": "/recurring",
            "budget": "/budget"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Budgify API is running"}
