'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import Navbar from '../../components/Navbar';
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  ShoppingBag, 
  Store,
  User
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Please log in</h2>
          <Link href="/login" className="text-blue-600 hover:text-blue-800">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const userCards = [
    {
      title: 'Browse Products',
      description: 'Explore available products from various shops',
      icon: Package,
      link: '/products',
      color: 'bg-blue-500'
    },
    {
      title: 'Shopping Cart',
      description: 'Manage items in your cart',
      icon: ShoppingCart,
      link: '/cart',
      color: 'bg-green-500'
    },
    {
      title: 'My Orders',
      description: 'View your order history and track shipments',
      icon: ShoppingBag,
      link: '/orders',
      color: 'bg-purple-500'
    }
  ];

  const shopOwnerCards = [
    {
      title: 'My Products',
      description: 'Manage your shop inventory and products',
      icon: Package,
      link: '/shop/products',
      color: 'bg-blue-500'
    },
    {
      title: 'Sales Reports',
      description: 'View sales analytics and revenue',
      icon: BarChart3,
      link: '/shop/sales',
      color: 'bg-green-500'
    },
    {
      title: 'Orders',
      description: 'Manage customer orders for your products',
      icon: ShoppingBag,
      link: '/orders',
      color: 'bg-purple-500'
    }
  ];

  const cards = user?.role === UserRole.OwnerShop ? shopOwnerCards : userCards;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              {user?.role === UserRole.OwnerShop ? (
                <Store className="h-8 w-8 text-blue-600" />
              ) : (
                <User className="h-8 w-8 text-blue-600" />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {user?.username}!
                </h1>
                <p className="text-gray-600">
                  {user?.role === UserRole.OwnerShop 
                    ? `Manage your shop: ${user.shopName}`
                    : 'Discover and shop amazing products'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => (
              <Link
                key={index}
                href={card.link}
                className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${card.color}`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {card.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {user?.role === UserRole.OwnerShop && (
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  href="/shop/products"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 mr-4"
                >
                  Add New Product
                </Link>
                <Link
                  href="/shop/sales"
                  className="inline-block bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                >
                  View Sales Report
                </Link>
              </div>
            </div>
          )}

          {user?.role === UserRole.User && (
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Start Shopping
              </h3>
              <p className="text-gray-600 mb-4">
                Discover amazing products from various shops and add them to your cart.
              </p>
              <Link
                href="/products"
                className="inline-block bg-green-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-green-700"
              >
                Browse Products
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}