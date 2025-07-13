from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
from bson import ObjectId

from app.models.models import CartItem, CartResponse, User, ShippingAddress, PurchaseItem, OrderRequest
from app.services.database import get_database
from app.routers.auth import get_current_user

router = APIRouter()

@router.get("/cart", response_model=dict)
async def get_cart(
    current_user: User = Depends(get_current_user),
    db=Depends(get_database)
):
    """Get user's cart"""
    
    # Find all cart items for user
    cursor = db.cart.find({"user_id": current_user.id})
    cart_items = {}
    total_items = 0
    
    async for item in cursor:
        cart_items[item["product_id"]] = item["quantity"]
        total_items += item["quantity"]
    
    return {
        "items": cart_items,
        "total_items": total_items,
        "updated_at": datetime.utcnow()
    }

@router.post("/cart/add", response_model=dict)
async def add_to_cart(
    cart_item: CartItem,
    current_user: User = Depends(get_current_user),
    db=Depends(get_database)
):
    """Add item to cart or update quantity"""
    
    print(f"DEBUG: Trying to add product with ID: {cart_item.product_id}")
    print(f"DEBUG: Product ID type: {type(cart_item.product_id)}")
    print(f"DEBUG: Product ID length: {len(cart_item.product_id)}")
    
    # Check if product exists
    product = None
    try:
        # First try to find by the _id field (which contains the product_id from CSV)
        product = await db.products.find_one({"_id": cart_item.product_id})
        print(f"DEBUG: Found product by _id: {product is not None}")
    except Exception as e:
        print(f"DEBUG: Error searching by _id: {e}")
        pass
    
    # If not found, try as ObjectId (in case it's a MongoDB ObjectId)
    if not product:
        try:
            if len(cart_item.product_id) == 24:  # ObjectId length
                product = await db.products.find_one({"_id": ObjectId(cart_item.product_id)})
                print(f"DEBUG: Found product by ObjectId: {product is not None}")
        except Exception as e:
            print(f"DEBUG: Error searching by ObjectId: {e}")
            pass
    
    # Let's also try to see what products exist in the database
    if not product:
        sample_products = await db.products.find().limit(3).to_list(3)
        print(f"DEBUG: Sample products in database:")
        for prod in sample_products:
            print(f"  - _id: {prod.get('_id')}, type: {type(prod.get('_id'))}")
    
    if not product:
        print(f"DEBUG: Product not found anywhere with ID: {cart_item.product_id}")
        raise HTTPException(status_code=404, detail=f"Product not found with ID: {cart_item.product_id}")
    
    # Use the actual _id from the found product for cart operations
    product_id_for_cart = str(product["_id"])
    
    # Check if item already in cart
    existing_item = await db.cart.find_one({
        "user_id": current_user.id,
        "product_id": product_id_for_cart
    })
    
    if existing_item:
        # Update quantity
        new_quantity = existing_item["quantity"] + cart_item.quantity
        await db.cart.update_one(
            {
                "user_id": current_user.id,
                "product_id": product_id_for_cart
            },
            {
                "$set": {
                    "quantity": new_quantity,
                    "added_at": datetime.utcnow()
                }
            }
        )
    else:
        # Add new item
        await db.cart.insert_one({
            "user_id": current_user.id,
            "product_id": product_id_for_cart,
            "quantity": cart_item.quantity,
            "added_at": datetime.utcnow()
        })
    
    return {"message": "Item added to cart successfully"}

@router.put("/cart/update", response_model=dict)
async def update_cart_item(
    cart_item: CartItem,
    current_user: User = Depends(get_current_user),
    db=Depends(get_database)
):
    """Update cart item quantity"""
    
    # Find the correct product_id format
    product = None
    try:
        # First try to find by the _id field (which contains the product_id from CSV)
        product = await db.products.find_one({"_id": cart_item.product_id})
    except Exception:
        pass
    
    # If not found, try as ObjectId (in case it's a MongoDB ObjectId)
    if not product:
        try:
            if len(cart_item.product_id) == 24:  # ObjectId length
                product = await db.products.find_one({"_id": ObjectId(cart_item.product_id)})
        except Exception:
            pass
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product_id_for_cart = str(product["_id"])
    
    if cart_item.quantity <= 0:
        # Remove item if quantity is 0 or negative
        await db.cart.delete_one({
            "user_id": current_user.id,
            "product_id": product_id_for_cart
        })
        return {"message": "Item removed from cart"}
    else:
        # Update quantity
        result = await db.cart.update_one(
            {
                "user_id": current_user.id,
                "product_id": product_id_for_cart
            },
            {
                "$set": {
                    "quantity": cart_item.quantity,
                    "added_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Item not found in cart")
        
        return {"message": "Cart item updated successfully"}

@router.delete("/cart/remove/{product_id}", response_model=dict)
async def remove_from_cart(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db=Depends(get_database)
):
    """Remove item from cart"""
    
    # Find the correct product_id format
    product = None
    try:
        # First try to find by the _id field (which contains the product_id from CSV)
        product = await db.products.find_one({"_id": product_id})
    except Exception:
        pass
    
    # If not found, try as ObjectId (in case it's a MongoDB ObjectId)
    if not product:
        try:
            if len(product_id) == 24:  # ObjectId length
                product = await db.products.find_one({"_id": ObjectId(product_id)})
        except Exception:
            pass
    
    if product:
        product_id_for_cart = str(product["_id"])
    else:
        # If product not found, still try to remove by the provided ID
        product_id_for_cart = product_id
    
    result = await db.cart.delete_one({
        "user_id": current_user.id,
        "product_id": product_id_for_cart
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    
    return {"message": "Item removed from cart"}

@router.delete("/cart/clear", response_model=dict)
async def clear_cart(
    current_user: User = Depends(get_current_user),
    db=Depends(get_database)
):
    """Clear entire cart"""
    
    result = await db.cart.delete_many({"user_id": current_user.id})
    
    return {
        "message": f"Cart cleared. {result.deleted_count} items removed"
    }

@router.get("/cart/count", response_model=dict)
async def get_cart_count(
    current_user: User = Depends(get_current_user),
    db=Depends(get_database)
):
    """Get total number of items in cart"""
    
    pipeline = [
        {"$match": {"user_id": current_user.id}},
        {"$group": {"_id": None, "total": {"$sum": "$quantity"}}}
    ]
    
    result = await db.cart.aggregate(pipeline).to_list(1)
    total_items = result[0]["total"] if result else 0
    
    return {"total_items": total_items}

@router.post("/cart/place-order", response_model=dict)
async def place_order_from_cart(
    order_request: OrderRequest,
    current_user: User = Depends(get_current_user),
    db=Depends(get_database)
):
    """Place order from current cart items and save to purchase history"""
    
    # Get all cart items for the user
    cart_cursor = db.cart.find({"user_id": current_user.id})
    cart_items = []
    
    async for item in cart_cursor:
        cart_items.append(item)
    
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate total amount and prepare purchase items
    total_amount = 0
    purchase_items = []
    
    for cart_item in cart_items:
        # Get product details to calculate price
        product = await db.products.find_one({"_id": cart_item["product_id"]})
        if not product:
            # Try with ObjectId if string search fails
            try:
                product = await db.products.find_one({"_id": ObjectId(cart_item["product_id"])})
            except:
                continue
        
        if product:
            item_total = product["price"] * cart_item["quantity"]
            total_amount += item_total
            
            purchase_items.append({
                "product_id": cart_item["product_id"],
                "quantity": cart_item["quantity"],
                "product_name": product.get("name", "Unknown Product"),
                "unit_price": product["price"],
                "total_price": item_total
            })
    
    if not purchase_items:
        raise HTTPException(status_code=400, detail="No valid products found in cart")
    
    # Create purchase record for history
    purchase_doc = {
        "user_id": current_user.id,
        "items": purchase_items,
        "total_amount": total_amount,
        "shipping_address": order_request.shipping_address.dict(),
        "payment_method": order_request.payment_method,
        "status": "confirmed",
        "order_date": datetime.utcnow(),
        "estimated_delivery": datetime.utcnow() + timedelta(days=7),  # 7 days from now
        "created_at": datetime.utcnow()
    }
    
    # Save to purchase history
    result = await db.purchases.insert_one(purchase_doc)
    
    # Clear the cart after successful order
    await db.cart.delete_many({"user_id": current_user.id})
    
    return {
        "message": "Order placed successfully",
        "order_id": str(result.inserted_id),
        "total_amount": total_amount,
        "items_count": len(purchase_items),
        "status": "confirmed"
    }

@router.get("/orders/history", response_model=dict)
async def get_order_history(
    current_user: User = Depends(get_current_user),
    db=Depends(get_database),
    skip: int = 0,
    limit: int = 10
):
    """Get user's order/purchase history"""
    
    cursor = db.purchases.find(
        {"user_id": current_user.id}
    ).sort("order_date", -1).skip(skip).limit(limit)
    
    orders = []
    async for purchase in cursor:
        order = {
            "order_id": str(purchase["_id"]),
            "items": purchase["items"],
            "total_amount": purchase["total_amount"],
            "shipping_address": purchase["shipping_address"],
            "payment_method": purchase["payment_method"],
            "status": purchase["status"],
            "order_date": purchase["order_date"],
            "estimated_delivery": purchase.get("estimated_delivery"),
        }
        orders.append(order)
    
    # Get total count of orders
    total_orders = await db.purchases.count_documents({"user_id": current_user.id})
    
    return {
        "orders": orders,
        "total_orders": total_orders,
        "page": skip // limit + 1,
        "limit": limit
    }
