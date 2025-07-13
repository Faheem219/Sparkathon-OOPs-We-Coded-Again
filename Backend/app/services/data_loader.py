import csv
import json
import asyncio
from typing import List, Dict, Any
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
import os

class DataLoader:
    def __init__(self):
        # Base path three levels up
        self.base_path = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        self.datasets_path = os.path.join(self.base_path, "datasets")

    async def load_products_from_csv(self, db: AsyncIOMotorDatabase, file_path: str = None):
        """Load products from CSV file using updated Walmart schema"""
        # Check if products already exist in the database
        existing_count = await db.products.count_documents({})
        if existing_count > 0:
            print(f"Products already exist in database ({existing_count} products). Skipping data load.")
            return

        if file_path is None:
            file_path = os.path.join(self.datasets_path, "walmart-products.csv")

        if not os.path.exists(file_path):
            print(f"CSV file not found: {file_path}")
            await self.load_sample_products(db)
            return

        try:
            products = []
            with open(file_path, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    product = self._process_csv_row(row)
                    if product:
                        products.append(product)

            if products:
                result = await db.products.insert_many(products)
                print(f"Loaded {len(result.inserted_ids)} products from CSV")
            else:
                print("No valid products found in CSV, loading samples.")
                await self.load_sample_products(db)

        except Exception as e:
            print(f"Error loading CSV: {e}")
            await self.load_sample_products(db)

    def _process_csv_row(self, row: Dict[str, str]) -> Dict[str, Any]:
        """Map new CSV schema into product document"""
        try:
            # Parse JSON-encoded list fields safely
            def parse_json_list(field: str) -> List[Any]:
                try:
                    parsed = json.loads(row.get(field, '[]') or '[]')
                    # Clean up any extra quotes in URLs
                    if field in ['image_urls']:
                        return [url.strip('"') for url in parsed if url]
                    return parsed
                except json.JSONDecodeError:
                    return []

            # Clean image URL function
            def clean_image_url(url: str) -> str:
                if url:
                    return url.strip().strip('"')
                return ""

            # Main fields
            product = {
                "_id": row.get("product_id"),
                "name": row.get("product_name", "").strip(),
                "description": row.get("description", "").strip(),
                "price": float(row.get("final_price", 0)),
                "currency": row.get("currency", "").strip(),
                "category": row.get("category_name", "").strip(),
                "root_category_name": row.get("root_category_name", "").strip(),
                "brand": row.get("brand", "").strip(),
                "rating": float(row.get("rating", 0)),
                "review_count": int(row.get("review_count", 0)),
                # Set default stock quantity to 100 if not specified or 0
                "stock_quantity": int(row.get("stock_quantity", 100)) or 100,
                # JSON fields
                "specifications": parse_json_list("specifications"),
                "image_urls": parse_json_list("image_urls"),
                "main_image": clean_image_url(row.get("main_image", "")),
                "tags": parse_json_list("tags"),
                "free_returns": row.get("free_returns", "").strip(),
                "sizes": parse_json_list("sizes"),
                "colors": parse_json_list("colors"),
                "ingredients": parse_json_list("ingredients"),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }

            # Validate
            if not product["name"] or product["price"] <= 0:
                return None

            return product

        except Exception as e:
            print(f"Error processing row for product_id={row.get('product_id')}: {e}")
            return None

    async def load_sample_products(self, db: AsyncIOMotorDatabase):
        """Load hardcoded sample products if CSV missing or invalid"""
        # Check if products already exist in the database
        existing_count = await db.products.count_documents({})
        if existing_count > 0:
            print(f"Products already exist in database ({existing_count} products). Skipping sample data load.")
            return

        sample_products = [
            {
                "_id": "sample_1",
                "name": "iPhone 14 Pro",
                "description": "Latest iPhone with A16 Bionic chip...",
                "price": 999.99,
                "currency": "USD",
                "category": "Electronics",
                "brand": "Apple",
                "rating": 4.8,
                "review_count": 1500,
                "stock_quantity": 50,
                "image_urls": ["/api/placeholder/300/300"],
                "main_image": "/api/placeholder/300/300",
                "tags": ["smartphone", "apple", "electronics"],
                "free_returns": "90-day",
                "sizes": [],
                "colors": [],
                "ingredients": [],
                "specifications": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            # add more samples if needed
        ]
        result = await db.products.insert_many(sample_products)
        print(f"Loaded {len(result.inserted_ids)} sample products")

    async def create_indexes(self, db: AsyncIOMotorDatabase):
        """Ensure indexes for optimized queries"""
        try:
            # Text search index
            await db.products.create_index([("name", "text"), ("description", "text"), ("tags", "text")])
            # Single-field indexes
            for field in ["category", "brand", "price", "rating"]:
                await db.products.create_index(field)
            # _id index is created automatically, don't need to specify unique
            print("Indexes created successfully")
        except Exception as e:
            print(f"Error creating indexes: {e}")

# Instantiate global loader
data_loader = DataLoader()