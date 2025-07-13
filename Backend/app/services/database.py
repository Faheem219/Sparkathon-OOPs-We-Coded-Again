from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import IndexModel
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    client: AsyncIOMotorClient = None
    database = None

db = Database()

async def get_database():
    return db.database

async def connect_to_mongo():
    """Create database connection"""
    db.client = AsyncIOMotorClient(os.getenv("MONGODB_URL", "mongodb://localhost:27017"))
    db.database = db.client[os.getenv("DATABASE_NAME", "walmart_sparkathon")]
    
    # Create indexes for better performance
    await create_indexes()
    print("Connected to MongoDB")

async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()
        print("Disconnected from MongoDB")

async def create_indexes():
    """Create database indexes for optimal performance"""
    database = db.database
    
    # User collection indexes
    await database.users.create_index("email", unique=True)
    await database.users.create_index("username", unique=True)
    
    # Product collection indexes
    await database.items.create_index("product_id", unique=True)
    await database.items.create_index("category_name")
    await database.items.create_index("brand")
    await database.items.create_index([("product_name", "text"), ("description", "text")])
    
    # Cart collection indexes
    await database.carts.create_index("user_id", unique=True)
    
    # Purchase collection indexes
    await database.purchases.create_index("user_id")
    await database.purchases.create_index([("user_id", 1), ("date", -1)])
    
    print("Database indexes created")
