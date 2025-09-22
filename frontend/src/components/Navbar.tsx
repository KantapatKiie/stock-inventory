'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { LogOut, ShoppingCart, Package, BarChart3, Home, ShoppingBag } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              E-Commerce
            </Link>
            
            <div className="hidden md:flex space-x-4">
              <Link
                href="/dashboard"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/dashboard')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Home size={16} />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/products"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/products')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Package size={16} />
                <span>Products</span>
              </Link>

              {user?.role === UserRole.User && (
                <>
                  <Link
                    href="/cart"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/cart')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <ShoppingCart size={16} />
                    <span>Cart</span>
                  </Link>
                  
                  <Link
                    href="/orders"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/orders')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <ShoppingBag size={16} />
                    <span>Orders</span>
                  </Link>
                </>
              )}

              {user?.role === UserRole.OwnerShop && (
                <>
                  <Link
                    href="/shop/products"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/shop/products')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <Package size={16} />
                    <span>My Products</span>
                  </Link>
                  
                  <Link
                    href="/shop/sales"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/shop/sales')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <BarChart3 size={16} />
                    <span>Sales</span>
                  </Link>
                  
                  <Link
                    href="/orders"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/orders')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <ShoppingBag size={16} />
                    <span>Orders</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.username}
              {user?.shopName && (
                <span className="text-blue-600 font-medium"> ({user.shopName})</span>
              )}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-red-600"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;