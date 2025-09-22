# E-Commerce Platform

A full-stack e-commerce platform with role-based authentication and product management.

## Tech Stack
- **Frontend**: React with TypeScript
- **Backend**: C# .NET Core 8 Web API
- **Database**: MongoDB
- **Authentication**: JWT with bcrypt password hashing

## Features

### Authentication System
- User registration and login
- Password encryption using bcrypt
- JWT token-based authentication
- Role-based access control (OwnerShop/User)

### OwnerShop Role Features
1. View own shop's available products
2. Manage shop products (Create, Read, Update, Delete)
3. View sales reports and analytics

### User Role Features
1. Browse available products (in stock items only)
2. Shopping cart management (Add/Remove items)
3. Purchase products with order tracking

## Project Structure
```
├── frontend/          # React frontend application
├── backend/           # .NET Core Web API
├── database/          # MongoDB scripts and configurations
└── docs/             # Documentation
```

## Getting Started

### Prerequisites
- Node.js 18+
- .NET 8 SDK
- MongoDB

**⚠️ Important**: Please see [SETUP.md](./SETUP.md) for detailed installation instructions and prerequisites.

### Quick Start

1. **Install Prerequisites** (see SETUP.md for details)
   - Install .NET 8 SDK
   - Install Node.js 18+
   - Install MongoDB or set up MongoDB Atlas

2. **Backend Setup**
   ```bash
   cd backend/ECommerceAPI
   dotnet restore
   dotnet run
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Database Setup**
   - Update MongoDB connection string in `backend/ECommerceAPI/appsettings.json`

## Environment Configuration

### Backend (.NET Core)
- Update `appsettings.json` with your MongoDB connection string
- Configure JWT secret key

### Frontend (React)
- Update API base URL in environment variables

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Products (OwnerShop)
- `GET /api/products/shop` - Get shop products
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Products (User)
- `GET /api/products` - Get available products
- `GET /api/products/{id}` - Get product details

### Cart & Orders
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `DELETE /api/cart/remove/{id}` - Remove item from cart
- `POST /api/orders` - Create order

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
