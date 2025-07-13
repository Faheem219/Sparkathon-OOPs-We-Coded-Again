from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# User Models
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    username: str
    email: str
    phone: str
    created_at: datetime

class User(BaseModel):
    id: Optional[str] = None
    name: str
    username: str
    email: str
    phone: str
    password: str  # Plain text password as requested
    purchase_history: List[str] = Field(default_factory=list)
    chat_history: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Product(BaseModel):
    id: Optional[str] = None
    product_id: Optional[str] = None
    name: str
    brand: Optional[str] = None
    description: Optional[str] = None
    price: float
    currency: str = "USD"
    specifications: List[Dict[str, Any]] = Field(default_factory=list)
    image_urls: List[str] = Field(default_factory=list)
    image_url: Optional[str] = None
    review_count: int = 0
    category: str
    root_category_name: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    rating: float = 0.0
    free_returns: bool = False
    sizes: List[str] = Field(default_factory=list)
    colors: List[str] = Field(default_factory=list)
    ingredients: Optional[str] = None
    in_stock: bool = True
    stock_quantity: int = 100
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ProductResponse(BaseModel):
    product_id: str
    name: str
    brand: Optional[str] = None
    description: Optional[str] = None
    price: float
    currency: str = "USD"
    specifications: List[Dict[str, Any]] = Field(default_factory=list)
    image_urls: List[str] = Field(default_factory=list)
    image_url: Optional[str] = None
    review_count: int = 0
    category: str
    root_category_name: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    rating: float = 0.0
    free_returns: bool = False
    sizes: List[str] = Field(default_factory=list)
    colors: List[str] = Field(default_factory=list)
    ingredients: Optional[str] = None
    in_stock: bool = True
    stock_quantity: int = 100

# Cart Models
class CartItem(BaseModel):
    product_id: str
    quantity: int

class Cart(BaseModel):
    id: Optional[str] = None
    user_id: str
    product_id: str
    quantity: int
    added_at: datetime = Field(default_factory=datetime.utcnow)

class CartResponse(BaseModel):
    items: Dict[str, int]  # product_id -> quantity
    total_items: int
    updated_at: datetime

# Purchase Models
class ShippingAddress(BaseModel):
    street: str
    city: str
    state: str
    zip_code: str
    country: str = "USA"

class OrderRequest(BaseModel):
    shipping_address: ShippingAddress
    payment_method: str = "card"

class PurchaseItem(BaseModel):
    product_id: str
    quantity: int

class Purchase(BaseModel):
    id: Optional[str] = None
    user_id: str
    items: List[PurchaseItem]
    total_amount: float
    shipping_address: ShippingAddress
    payment_method: str
    status: str = "pending"
    order_date: datetime
    estimated_delivery: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PurchaseCreate(BaseModel):
    items: List[PurchaseItem]
    shipping_address: ShippingAddress
    payment_method: str
    estimated_delivery: Optional[datetime] = None

class PurchaseResponse(BaseModel):
    id: str
    user_id: str
    items: List[PurchaseItem]
    total_amount: float
    shipping_address: ShippingAddress
    payment_method: str
    status: str
    order_date: datetime
    estimated_delivery: Optional[datetime]

# Chatbot Models
class ChatMessage(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)

class ChatResponse(BaseModel):
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatHistory(BaseModel):
    sender: str  # 'user' or 'bot'
    message: str
    timestamp: datetime

# Token Models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
