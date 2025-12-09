from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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


# Exception handler to convert 'detail' to 'error' for frontend compatibility
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
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
