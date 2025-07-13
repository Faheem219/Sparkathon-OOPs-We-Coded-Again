from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from ..models.models import Purchase, PurchaseCreate, User
from ..services.database import get_database
from .auth import get_current_user

router = APIRouter(prefix="/purchases", tags=["purchases"])

@router.post("/", response_model=Purchase)
async def place_order(
    purchase_data: PurchaseCreate,
    current_user: User = Depends(get_current_user)
):
    """Place a new order"""
    db = await get_database()
    
    # Calculate total amount
    total_amount = 0
    for item in purchase_data.items:
        # Get product details to calculate price
        product = await db.products.find_one({"_id": ObjectId(item.product_id)})
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {item.product_id} not found"
            )
        total_amount += product["price"] * item.quantity
    
    # Create purchase document
    purchase_doc = {
        "user_id": str(current_user.id),
        "items": [item.dict() for item in purchase_data.items],
        "total_amount": total_amount,
        "shipping_address": purchase_data.shipping_address.dict(),
        "payment_method": purchase_data.payment_method,
        "status": "pending",
        "order_date": datetime.utcnow(),
        "estimated_delivery": purchase_data.estimated_delivery or datetime.utcnow()
    }
    
    # Insert purchase
    result = await db.purchases.insert_one(purchase_doc)
    
    # Clear user's cart after successful order
    await db.cart.delete_many({"user_id": str(current_user.id)})
    
    # Get the created purchase
    created_purchase = await db.purchases.find_one({"_id": result.inserted_id})
    created_purchase["id"] = str(created_purchase["_id"])
    del created_purchase["_id"]
    
    return Purchase(**created_purchase)

@router.get("/", response_model=List[Purchase])
async def get_purchase_history(
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 20
):
    """Get user's purchase history"""
    db = await get_database()
    
    cursor = db.purchases.find(
        {"user_id": str(current_user.id)}
    ).sort("order_date", -1).skip(skip).limit(limit)
    
    purchases = []
    async for purchase in cursor:
        purchase["id"] = str(purchase["_id"])
        del purchase["_id"]
        purchases.append(Purchase(**purchase))
    
    return purchases

@router.get("/{purchase_id}", response_model=Purchase)
async def get_purchase_details(
    purchase_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get details of a specific purchase"""
    db = await get_database()
    
    try:
        purchase = await db.purchases.find_one({
            "_id": ObjectId(purchase_id),
            "user_id": str(current_user.id)
        })
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase not found"
        )
    
    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase not found"
        )
    
    purchase["id"] = str(purchase["_id"])
    del purchase["_id"]
    
    return Purchase(**purchase)

@router.put("/{purchase_id}/status")
async def update_purchase_status(
    purchase_id: str,
    status: str,
    current_user: User = Depends(get_current_user)
):
    """Update purchase status (for admin/testing purposes)"""
    db = await get_database()
    
    valid_statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )
    
    try:
        result = await db.purchases.update_one(
            {
                "_id": ObjectId(purchase_id),
                "user_id": str(current_user.id)
            },
            {"$set": {"status": status}}
        )
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase not found"
        )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase not found"
        )
    
    return {"message": "Purchase status updated successfully"}

@router.post("/{purchase_id}/reorder")
async def reorder_purchase(
    purchase_id: str,
    current_user: User = Depends(get_current_user)
):
    """Reorder items from a previous purchase"""
    db = await get_database()
    
    # Get the original purchase
    try:
        original_purchase = await db.purchases.find_one({
            "_id": ObjectId(purchase_id),
            "user_id": str(current_user.id)
        })
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase not found"
        )
    
    if not original_purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase not found"
        )
    
    # Add items to cart
    for item in original_purchase["items"]:
        # Check if product still exists
        product = await db.products.find_one({"_id": ObjectId(item["product_id"])})
        if product:
            # Check if item already in cart
            existing_cart_item = await db.cart.find_one({
                "user_id": str(current_user.id),
                "product_id": item["product_id"]
            })
            
            if existing_cart_item:
                # Update quantity
                await db.cart.update_one(
                    {
                        "user_id": str(current_user.id),
                        "product_id": item["product_id"]
                    },
                    {"$inc": {"quantity": item["quantity"]}}
                )
            else:
                # Add new cart item
                await db.cart.insert_one({
                    "user_id": str(current_user.id),
                    "product_id": item["product_id"],
                    "quantity": item["quantity"],
                    "added_at": datetime.utcnow()
                })
    
    return {"message": "Items added to cart successfully"}
