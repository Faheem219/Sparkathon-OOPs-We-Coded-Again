from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import os
from dotenv import load_dotenv

from app.routers import auth, products, cart, purchases, chatbot
from app.services.database import connect_to_mongo, close_mongo_connection, get_database
from app.services.data_loader import data_loader
from app.services.chatbot import chatbot_service

# Load environment variables
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    
    # Load initial data
    db = await get_database()
    await data_loader.create_indexes(db)
    await data_loader.load_products_from_csv(db)
    
    # Initialize chatbot RAG system
    try:
        await chatbot_service.initialize_rag_system(db)
        print("Chatbot RAG system initialized successfully")
    except Exception as e:
        print(f"Warning: Failed to initialize chatbot RAG system: {e}")
    
    yield
    # Shutdown
    await close_mongo_connection()

# Create FastAPI app
app = FastAPI(
    title="Walmart Sparkathon API",
    description="E-commerce platform with AI-powered features",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(products.router, prefix="/api/items", tags=["Products"])
app.include_router(cart.router, prefix="/api/user", tags=["Cart"])
app.include_router(purchases.router, prefix="/api/user", tags=["Purchases"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["Chatbot"])

@app.get("/")
async def root():
    return {
        "message": "Walmart Sparkathon API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 3001)),
    )
