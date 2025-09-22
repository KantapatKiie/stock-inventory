import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  Cart,
  AddToCartRequest,
  Order,
  OrderStatus
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include token
    this.api.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', data);
    return response.data;
  }

  // Product endpoints
  async getProducts(): Promise<Product[]> {
    const response: AxiosResponse<Product[]> = await this.api.get('/products');
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response: AxiosResponse<Product> = await this.api.get(`/products/${id}`);
    return response.data;
  }

  async getShopProducts(): Promise<Product[]> {
    const response: AxiosResponse<Product[]> = await this.api.get('/products/shop');
    return response.data;
  }

  async createProduct(data: CreateProductRequest): Promise<Product> {
    const response: AxiosResponse<Product> = await this.api.post('/products', data);
    return response.data;
  }

  async updateProduct(id: string, data: UpdateProductRequest): Promise<void> {
    await this.api.put(`/products/${id}`, data);
  }

  async deleteProduct(id: string): Promise<void> {
    await this.api.delete(`/products/${id}`);
  }

  // Cart endpoints
  async getCart(): Promise<Cart> {
    const response: AxiosResponse<Cart> = await this.api.get('/cart');
    return response.data;
  }

  async addToCart(data: AddToCartRequest): Promise<void> {
    await this.api.post('/cart/add', data);
  }

  async removeFromCart(productId: string): Promise<void> {
    await this.api.delete(`/cart/remove/${productId}`);
  }

  async updateCartItem(productId: string, quantity: number): Promise<void> {
    await this.api.put(`/cart/update/${productId}`, { quantity });
  }

  async clearCart(): Promise<void> {
    await this.api.delete('/cart/clear');
  }

  // Order endpoints
  async getUserOrders(): Promise<Order[]> {
    const response: AxiosResponse<Order[]> = await this.api.get('/orders/user');
    return response.data;
  }

  async getShopOrders(): Promise<Order[]> {
    const response: AxiosResponse<Order[]> = await this.api.get('/orders/shop');
    return response.data;
  }

  async getOrder(id: string): Promise<Order> {
    const response: AxiosResponse<Order> = await this.api.get(`/orders/${id}`);
    return response.data;
  }

  async createOrder(): Promise<Order> {
    const response: AxiosResponse<Order> = await this.api.post('/orders');
    return response.data;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
    await this.api.put(`/orders/${id}/status`, status, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async getSales(startDate?: string, endDate?: string): Promise<{ totalSales: number; period: any }> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await this.api.get(`/orders/sales?${params.toString()}`);
    return response.data;
  }
}

export const apiService = new ApiService();