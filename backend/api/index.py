from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
import logging
import time

from .auth import router as auth_router
from .expenses import router as expenses_router
from .recurring import router as recurring_router
from .budget import router as budget_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Budgify API", version="1.0.0")


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    # Log incoming request
    logger.info(f"Incoming request: {request.method} {request.url.path}")
    logger.info(f"Headers: {dict(request.headers)}")
    logger.info(f"Query params: {dict(request.query_params)}")

    # Process request
    response = await call_next(request)

    # Log response
    process_time = time.time() - start_time
    logger.info(f"Response status: {response.status_code}")
    logger.info(f"Process time: {process_time:.3f}s")

    return response


# Exception handler to convert 'detail' to 'error' for frontend compatibility
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.error(f"HTTPException: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
    )


# Catch-all exception handler
@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )


# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("=" * 50)
    logger.info("Budgify API Starting Up")
    logger.info("All routes loaded successfully")
    logger.info("=" * 50)


# Include routers
logger.info("Registering routers...")
app.include_router(auth_router)
logger.info(f"Auth router registered: {auth_router.prefix}")
app.include_router(expenses_router)
logger.info(f"Expenses router registered: {expenses_router.prefix}")
app.include_router(recurring_router)
logger.info(f"Recurring router registered: {recurring_router.prefix}")
app.include_router(budget_router)
logger.info(f"Budget router registered: {budget_router.prefix}")
logger.info("All routers registered successfully")


@app.get("/")
async def root():
    """Root endpoint"""
    logger.info("Root endpoint accessed")
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
    logger.info("Health check endpoint accessed")
    return {"status": "ok", "message": "Budgify API is running"}
