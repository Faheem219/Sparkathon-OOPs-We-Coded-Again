from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
import re

from app.models.models import ProductResponse
from app.services.database import get_database

router = APIRouter()

def map_product_to_response(product: dict) -> dict:
    """Map database product fields to API response format"""
    # Handle ingredients field - could be list, string, or None
    ingredients = product.get("ingredients", "")
    if isinstance(ingredients, list):
        ingredients = ", ".join(str(i) for i in ingredients) if ingredients else ""
    elif ingredients is None:
        ingredients = ""
    
    return {
        "product_id": product.get("_id", str(product["_id"])),
        "name": product.get("name", ""),
        "brand": product.get("brand", ""),
        "description": product.get("description", ""),
        "price": product.get("price", 0),
        "currency": product.get("currency", "USD"),
        "specifications": product.get("specifications", []),
        "image_urls": product.get("image_urls", []),
        "image_url": product.get("main_image", ""),
        "review_count": product.get("review_count", 0),
        "category": product.get("category", "") or product.get("root_category_name", ""),
        "root_category_name": product.get("root_category_name", ""),
        "tags": product.get("tags") or [],  # Handle None case
        "rating": product.get("rating", 0.0),
        "free_returns": product.get("free_returns", "") != "",
        "sizes": product.get("sizes", []),
        "colors": product.get("colors", []),
        "ingredients": ingredients,
        "in_stock": product.get("stock_quantity", 0) > 0,
        "stock_quantity": product.get("stock_quantity", 0)
    }

@router.get("/", response_model=dict)
async def get_products(
    category: Optional[str] = Query(None, description="Filter by category"),
    brand: Optional[str] = Query(None, description="Filter by brand"),
    min_price: Optional[float] = Query(None, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, description="Maximum price filter"),
    search: Optional[str] = Query(None, description="Search in product name and description"),
    sort_by: Optional[str] = Query("name", description="Sort by: name, price, rating"),
    sort_order: Optional[str] = Query("asc", description="Sort order: asc, desc"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: Optional[int] = Query(None, ge=1, description="Items per page (optional, no limit if not provided)"),
    db=Depends(get_database)
):
    """Get products with filtering, sorting, and pagination"""
    
    # Build filter query
    filter_query = {}
    
    if category:
        filter_query["$or"] = [
            {"category": {"$regex": category, "$options": "i"}},
            {"root_category_name": {"$regex": category, "$options": "i"}}
        ]
    
    if brand:
        filter_query["brand"] = {"$regex": brand, "$options": "i"}
    
    if min_price is not None or max_price is not None:
        price_filter = {}
        if min_price is not None:
            price_filter["$gte"] = min_price
        if max_price is not None:
            price_filter["$lte"] = max_price
        filter_query["price"] = price_filter
    
    if search:
        # For search, we'll use a simpler approach and override category filter if both exist
        filter_query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"brand": {"$regex": search, "$options": "i"}}
        ]
    
    # Build sort query
    sort_field = "name"
    if sort_by == "price":
        sort_field = "price"
    elif sort_by == "rating":
        sort_field = "rating"
    
    sort_direction = 1 if sort_order == "asc" else -1
    sort_query = [(sort_field, sort_direction)]
    
    # Calculate skip value for pagination
    skip = (page - 1) * (limit or 0) if limit else 0
    
    # Get total count
    total_count = await db.products.count_documents(filter_query)
    
    # Get products
    if limit:
        cursor = db.products.find(filter_query).sort(sort_query).skip(skip).limit(limit)
    else:
        # No limit - return all products
        cursor = db.products.find(filter_query).sort(sort_query)
    
    products = []
    
    async for product in cursor:
        mapped_product = map_product_to_response(product)
        products.append(ProductResponse(**mapped_product))

    # Calculate pagination info
    if limit:
        total_pages = (total_count + limit - 1) // limit
        has_next = page < total_pages
        has_prev = page > 1
    else:
        # No pagination when no limit
        total_pages = 1
        has_next = False
        has_prev = False

    return {
        "products": products,
        "pagination": {
            "current_page": page,
            "total_pages": total_pages,
            "total_count": total_count,
            "has_next": has_next,
            "has_prev": has_prev,
            "limit": limit
        },
        "filters_applied": {
            "category": category,
            "brand": brand,
            "min_price": min_price,
            "max_price": max_price,
            "search": search
        }
    }

@router.get("/{product_id}", response_model=dict)
async def get_product_by_id(product_id: str, db=Depends(get_database)):
    """Get a specific product by ID"""
    
    # Try to find by product_id field first, then by _id
    product = await db.products.find_one({"_id": product_id})
    
    if not product:
        # Try to find by _id if product_id doesn't work
        try:
            from bson import ObjectId
            if ObjectId.is_valid(product_id):
                product = await db.products.find_one({"_id": ObjectId(product_id)})
        except:
            pass
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    mapped_product = map_product_to_response(product)
    
    return {
        "product": ProductResponse(**mapped_product)
    }

@router.get("/search/{query}", response_model=dict)
async def search_products(
    query: str,
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: Optional[int] = Query(None, ge=1, description="Items per page (optional, no limit if not provided)"),
    db=Depends(get_database)
):
    """Search products using text search"""
    
    # Build search query
    search_query = {
        "$or": [
            {"name": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}},
            {"brand": {"$regex": query, "$options": "i"}},
            {"tags": {"$in": [re.compile(query, re.IGNORECASE)]}}
        ]
    }
    
    if category:
        search_query["$or"] = [
            {"category": {"$regex": category, "$options": "i"}},
            {"root_category_name": {"$regex": category, "$options": "i"}}
        ]
    
    # Get products
    if limit:
        cursor = db.products.find(search_query).limit(limit)
    else:
        # No limit - return all products
        cursor = db.products.find(search_query)
    
    products = []
    
    async for product in cursor:
        mapped_product = map_product_to_response(product)
        products.append(ProductResponse(**mapped_product))
    
    return {
        "products": products,
        "query": query,
        "count": len(products)
    }

@router.get("/categories/list", response_model=dict)
async def get_categories(db=Depends(get_database)):
    """Get all available categories"""
    
    categories_from_category = await db.products.distinct("category")
    categories_from_root = await db.products.distinct("root_category_name")
    categories = list(set(categories_from_category + categories_from_root))
    brands = await db.products.distinct("brand")
    
    # Get price range
    price_pipeline = [
        {
            "$group": {
                "_id": None,
                "min_price": {"$min": "$price"},
                "max_price": {"$max": "$price"}
            }
        }
    ]
    
    price_result = await db.products.aggregate(price_pipeline).to_list(1)
    price_range = price_result[0] if price_result else {"min_price": 0, "max_price": 1000}
    
    return {
        "categories": sorted([cat for cat in categories if cat]),
        "brands": sorted([brand for brand in brands if brand]),
        "price_range": {
            "min": price_range["min_price"],
            "max": price_range["max_price"]
        }
    }

@router.get("/category/{category_name}", response_model=dict)
async def get_products_by_category(
    category_name: str,
    limit: Optional[int] = Query(None, ge=1, description="Items per page (optional, no limit if not provided)"),
    page: int = Query(1, ge=1, description="Page number"),
    sort_by: Optional[str] = Query("name", description="Sort by: name, price, rating"),
    sort_order: Optional[str] = Query("asc", description="Sort order: asc, desc"),
    db=Depends(get_database)
):
    """Get products by category"""
    
    # Build filter query
    filter_query = {
        "$or": [
            {"category": {"$regex": category_name, "$options": "i"}},
            {"root_category_name": {"$regex": category_name, "$options": "i"}}
        ]
    }
    
    # Build sort query
    sort_field = "name"
    if sort_by == "price":
        sort_field = "price"
    elif sort_by == "rating":
        sort_field = "rating"
    
    sort_direction = 1 if sort_order == "asc" else -1
    sort_query = [(sort_field, sort_direction)]
    
    # Calculate skip value for pagination
    skip = (page - 1) * (limit or 0) if limit else 0
    
    # Get total count
    total_count = await db.products.count_documents(filter_query)
    
    # Get products
    if limit:
        cursor = db.products.find(filter_query).sort(sort_query).skip(skip).limit(limit)
    else:
        # No limit - return all products
        cursor = db.products.find(filter_query).sort(sort_query)
    
    products = []
    
    async for product in cursor:
        mapped_product = map_product_to_response(product)
        products.append(ProductResponse(**mapped_product))
    
    # Calculate pagination info
    if limit:
        total_pages = (total_count + limit - 1) // limit
    else:
        # No pagination when no limit
        total_pages = 1
    
    return {
        "products": products,
        "category": category_name,
        "pagination": {
            "current_page": page,
            "total_pages": total_pages,
            "total_count": total_count,
            "limit": limit
        }
    }
