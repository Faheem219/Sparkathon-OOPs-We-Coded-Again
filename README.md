# 🛒 Walmart Sparkathon E-Commerce Platform

A modern, AI-powered e-commerce platform built for the Walmart Sparkathon, featuring intelligent product recommendations, conversational shopping assistant, and a seamless user experience.

## 📚 Table of Contents

- [🎯 Project Overview](#-project-overview)
- [🌟 Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [🤖 AI Features](#-ai-features)
- [📁 Project Structure](#-project-structure)
- [📦 Deployment](#-deployment)
- [🔗 Links](#-links)

## 🎯 Project Overview

This full-stack e-commerce application combines traditional shopping functionality with cutting-edge AI features to create an enhanced customer experience. The platform includes intelligent reorder suggestions, a RAG-powered chatbot, and modern web technologies.

### 🌟 Key Features

- **🔐 User Authentication**: Secure JWT-based login/signup system
- **🛍️ Product Catalog**: Browse 1000+ products with search, filters, and categories
- **🛒 Shopping Cart**: Real-time cart management with quantity updates
- **📦 Order Management**: Complete order placement and purchase history
- **🤖 AI Chatbot**: RAG-powered conversational assistant for product queries
- **🔄 Smart Reorder**: GenAI frequency analysis for personalized recommendations
- **📱 Responsive Design**: Modern UI with Tailwind CSS

## 🏗️ Architecture

```
├── Backend/              # FastAPI backend server
│   ├── app/
│   │   ├── models/       # Pydantic data models
│   │   ├── routers/      # API endpoints
│   │   └── services/     # Business logic & AI services
│   ├── datasets/         # Product data (CSV)
│   └── requirements.txt  # Python dependencies
├── Frontend/             # React + Vite frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route components
│   │   ├── context/      # State management
│   │   └── services/     # API integration
```

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI ⚡
- **Database**: MongoDB 🍃
- **Authentication**: JWT with python-jose 🔐
- **AI/ML**: 
  - Google GenAI 🧠
  - LangChain for RAG implementation 🔗
  - ChromaDB for vector storage 📊
  - HuggingFace Embeddings 🤗
  - scikit-learn 📈
- **Data Processing**: Pandas, NumPy 🐼
- **Server**: Uvicorn 🦄

### Frontend
- **Framework**: React.js ⚛️
- **Build Tool**: Vite ⚡
- **Styling**: Tailwind CSS 🎨
- **HTTP Client**: Axios 📡

### Database
- **Primary**: MongoDB (products, users, orders, cart)
- **Vector Store**: ChromaDB (for RAG embeddings)

## 🤖 AI Features

### RAG-Powered Chatbot
- **Knowledge Base**: Product catalog + custom documentation
- **Vector Embeddings**: HuggingFace sentence-transformers
- **LLM**: Google GenAI (Gemini)
- **Context Window**: Retrieves relevant products for queries

### Smart Reorder System
- **Data Source**: User purchase history
- **Output**: Top recommended products based on buying patterns
- **Integration**: One-click add to cart functionality

## 📁 Project Structure

### Backend Architecture
```
Backend/
├── app/
│   ├── models/
│   │   └── models.py          # Pydantic models
│   ├── routers/
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── products.py        # Product endpoints
│   │   ├── cart.py            # Cart management
│   │   ├── purchases.py       # Order management
│   │   └── chatbot.py         # AI chatbot endpoints
│   └── services/
│       ├── database.py        # MongoDB connection
│       ├── chatbot.py         # RAG implementation
│       └── data_loader.py     # Data initialization
├── datasets/
│   └── walmart-products.csv   # Product data
└── main.py                    # FastAPI application
```

### Frontend Architecture
```
Frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx         # Navigation component
│   │   └── ProductCard.jsx    # Product display
│   ├── pages/
│   │   ├── HomePage.jsx       # Landing page
│   │   ├── SearchPage.jsx     # Search results
│   │   ├── CartPage.jsx       # Shopping cart
│   │   ├── ProfilePage.jsx    # User account
│   │   └── ChatbotPage.jsx    # AI chat interface
│   ├── context/
│   │   ├── AuthContext.jsx    # User authentication
│   │   └── CartContext.jsx    # Cart state management
│   └── services/
│       └── api.js             # API integration
└── public/                    # Static assets
```

## 📦 Deployment

### Backend Deployment
1. **Set production environment variables**
2. **Use production MongoDB instance**
3. **Deploy with Uvicorn**:
   ```bash
   uvicorn main:app --host 127.0.0.1 --port 8000
   ```
 *Deployed on Oracle-Cloud VM Instance*

### Frontend Deployment
1. **Build production bundle**:
   ```bash
   npm run build
   ```
2. **Deploy to static hosting** (Vercel)

## 🔗 Links

- **Frontend Demo**: [Your deployed frontend URL]
- **Backend API**: [Your deployed backend URL]

---
