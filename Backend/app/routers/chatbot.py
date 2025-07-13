from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from bson import ObjectId
from ..models.models import ChatMessage, ChatResponse, User
from ..services.database import get_database
from ..services.chatbot import chatbot_service
from .auth import get_current_user

router = APIRouter(tags=["chatbot"])

@router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(
    message: ChatMessage,
    current_user: User = Depends(get_current_user)
):
    """Send a message to the chatbot and get a response"""
    db = await get_database()
    
    try:
        # Initialize RAG system if not already done
        if not chatbot_service.products:
            await chatbot_service.initialize_rag_system(db)
        
        # Process message using the new service
        bot_response = await chatbot_service.process_message(
            db=db,
            user_id=str(current_user.id),
            message=message.message
        )
        
        return ChatResponse(
            message=bot_response,
            timestamp=datetime.utcnow()
        )
        
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process chat message"
        )

@router.get("/history", response_model=List[dict])
async def get_chat_history(
    current_user: User = Depends(get_current_user),
    limit: int = 50
):
    """Get user's chat history"""
    db = await get_database()
    
    try:
        chat_history = await chatbot_service.get_chat_history(db, str(current_user.id))
        return chat_history[-limit:] if len(chat_history) > limit else chat_history
    except Exception as e:
        print(f"Error getting chat history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve chat history"
        )

@router.delete("/history")
async def clear_chat_history(current_user: User = Depends(get_current_user)):
    """Clear user's chat history"""
    db = await get_database()
    
    try:
        success = await chatbot_service.clear_chat_history(db, str(current_user.id))
        if success:
            return {"message": "Chat history cleared successfully"}
        else:
            return {"message": "No chat history to clear"}
    except Exception as e:
        print(f"Error clearing chat history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to clear chat history"
        )

@router.post("/initialize")
async def initialize_chatbot():
    """Initialize chatbot with product data and documents (admin endpoint)"""
    db = await get_database()
    
    try:
        await chatbot_service.initialize_rag_system(db)
        return {
            "message": "Chatbot initialized successfully",
            "documents_loaded": len(chatbot_service.documents),
            "products_loaded": len(chatbot_service.products)
        }
    except Exception as e:
        print(f"Error initializing chatbot: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize chatbot: {str(e)}"
        )

@router.post("/reorder")
async def reorder_products(current_user: User = Depends(get_current_user)):
    """Get reorder recommendations and add them to cart"""
    db = await get_database()
    
    try:
        # Initialize RAG system if not already done
        if not chatbot_service.products:
            await chatbot_service.initialize_rag_system(db)
        
        # Get reorder recommendations
        recommendations = await chatbot_service.get_reorder_recommendations(
            db=db,
            user_id=str(current_user.id)
        )
        
        if not recommendations:
            return {
                "message": "No recommendations available",
                "items_added": 0,
                "recommendations": []
            }
        
        # Add recommended products to cart
        items_added = 0
        cart_updates = []
        
        for rec in recommendations:
            product_id = rec["product_id"]
            quantity = rec["quantity"]
            
            try:
                # Check if item already in cart
                existing_item = await db.cart.find_one({
                    "user_id": current_user.id,
                    "product_id": product_id
                })
                
                if existing_item:
                    # Update quantity (add to existing)
                    new_quantity = existing_item["quantity"] + quantity
                    await db.cart.update_one(
                        {
                            "user_id": current_user.id,
                            "product_id": product_id
                        },
                        {
                            "$set": {
                                "quantity": new_quantity,
                                "added_at": datetime.utcnow()
                            }
                        }
                    )
                    cart_updates.append({
                        "product_id": product_id,
                        "action": "updated",
                        "quantity": new_quantity
                    })
                else:
                    # Add new item
                    await db.cart.insert_one({
                        "user_id": current_user.id,
                        "product_id": product_id,
                        "quantity": quantity,
                        "added_at": datetime.utcnow()
                    })
                    cart_updates.append({
                        "product_id": product_id,
                        "action": "added",
                        "quantity": quantity
                    })
                
                items_added += 1
                
            except Exception as e:
                print(f"Error adding product {product_id} to cart: {e}")
                continue
        
        return {
            "message": f"Successfully added {items_added} recommended products to cart",
            "items_added": items_added,
            "cart_updates": cart_updates,
            "recommendations": recommendations
        }
        
    except Exception as e:
        print(f"Reorder error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process reorder request"
        )

@router.get("/status")
async def get_chatbot_status():
    """Get chatbot service status"""
    return {
        "status": "active",
        "documents_loaded": len(chatbot_service.documents),
        "products_loaded": len(chatbot_service.products),
        "rag_enabled": chatbot_service.initialized,
        "initialized": chatbot_service.initialized
    }
