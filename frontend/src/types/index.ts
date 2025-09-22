export interface User {
  id: string;
  username: string;
  role: UserRole;
  shopName?: string;
}

export enum UserRole {
  User = 'User',
  OwnerShop = 'OwnerShop'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  shopName: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  totalPrice: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  totalAmount: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  shippingAddress?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  shopName: string;
  ownerId: string;
}

export enum OrderStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled'
}

// API DTOs
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role: UserRole;
  shopName?: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  username: string;
  role: UserRole;
  shopName?: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  imageUrl?: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface ApiError {
  message: string;
  error?: string;
}