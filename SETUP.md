# Setup Instructions

## Prerequisites

### Required Software
1. **Node.js 18+** - For React frontend
2. **.NET 8 SDK** - For C# backend API
3. **MongoDB** - For database (local installation or MongoDB Atlas)

### Installation Links
- [Node.js](https://nodejs.org/) - Download and install Node.js 18 or later
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) - Download and install .NET 8 SDK
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) - For local installation
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - For cloud database (free tier available)

## Getting Started

### 1. Install Dependencies

#### Backend (.NET API)
```bash
cd backend/ECommerceAPI
dotnet restore
```

#### Frontend (React)
```bash
cd frontend
npm install
```

### 2. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Server
2. Start MongoDB service
3. The API will connect to `mongodb://localhost:27017` by default

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `appsettings.json` in the backend with your connection string

### 3. Configuration

#### Backend Configuration
Update `backend/ECommerceAPI/appsettings.json`:
```json
{
  "MongoDbSettings": {
    "ConnectionString": "your-mongodb-connection-string",
    "DatabaseName": "ECommerceDB"
  },
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!",
    "ExpiryDays": 7
  }
}
```

### 4. Running the Application

#### Start Backend API
```bash
cd backend/ECommerceAPI
dotnet run
```
The API will be available at `http://localhost:5000`

#### Start Frontend
```bash
cd frontend
npm start
```
The React app will be available at `http://localhost:3000`

## Features Overview

### Authentication System
- ✅ User registration with username/password
- ✅ Password encryption using bcrypt
- ✅ JWT token-based authentication
- ✅ Role-based access control (User/OwnerShop)

### User Features (Customer Role)
- ✅ Browse available products
- ✅ Add/remove items from cart
- ✅ Place orders
- ✅ View order history

### OwnerShop Features (Shop Owner Role)
- ✅ Manage shop products (CRUD)
- ✅ View shop-specific orders
- ✅ Sales analytics and reports

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - Get all available products
- `GET /api/products/{id}` - Get specific product
- `GET /api/products/shop` - Get shop owner's products (OwnerShop only)
- `POST /api/products` - Create new product (OwnerShop only)
- `PUT /api/products/{id}` - Update product (OwnerShop only)
- `DELETE /api/products/{id}` - Delete product (OwnerShop only)

### Cart & Orders
- `GET /api/cart` - Get user's cart (User only)
- `POST /api/cart/add` - Add item to cart (User only)
- `DELETE /api/cart/remove/{productId}` - Remove from cart (User only)
- `POST /api/orders` - Create order (User only)
- `GET /api/orders/user` - Get user orders (User only)
- `GET /api/orders/shop` - Get shop orders (OwnerShop only)
- `GET /api/orders/sales` - Get sales data (OwnerShop only)

## Development Notes

- The backend uses Entity Framework Core with MongoDB driver
- Frontend uses React with TypeScript and Tailwind CSS
- Authentication uses JWT tokens stored in localStorage
- All passwords are hashed using bcrypt before storage
- Role-based routing and API access control implemented
- Error handling with user-friendly messages

## Troubleshooting

### Common Issues
1. **"dotnet command not found"** - Install .NET 8 SDK
2. **MongoDB connection errors** - Ensure MongoDB is running or check Atlas connection string
3. **CORS errors** - Backend is configured to allow requests from `http://localhost:3000`
4. **Port conflicts** - Backend uses port 5000, frontend uses port 3000

### Support
- Check console logs for detailed error messages
- Ensure all prerequisites are installed
- Verify MongoDB connection and database permissions
