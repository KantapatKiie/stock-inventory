'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Order, OrderStatus, UserRole } from '../../types'
import { apiService } from '../../services/api'
import { Package, Clock, Truck, CheckCircle, XCircle, Eye } from 'lucide-react'
import Navbar from '../../components/Navbar'

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      let data: Order[]
      
      if (user?.role === UserRole.User) {
        data = await apiService.getUserOrders()
      } else if (user?.role === UserRole.OwnerShop) {
        data = await apiService.getShopOrders()
      } else {
        throw new Error('Invalid user role')
      }
      
      setOrders(data)
    } catch (err: any) {
      setError('Failed to load orders')
      console.error('Orders fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (user?.role !== UserRole.OwnerShop) return

    setUpdatingOrders(prev => new Set(prev).add(orderId))
    try {
      await apiService.updateOrderStatus(orderId, newStatus)
      await fetchOrders() // Refresh orders
      alert('Order status updated successfully!')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status')
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return <Clock className="h-5 w-5 text-yellow-500" />
      case OrderStatus.Processing:
        return <Package className="h-5 w-5 text-blue-500" />
      case OrderStatus.Shipped:
        return <Truck className="h-5 w-5 text-purple-500" />
      case OrderStatus.Delivered:
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case OrderStatus.Cancelled:
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return 'bg-yellow-100 text-yellow-800'
      case OrderStatus.Processing:
        return 'bg-blue-100 text-blue-800'
      case OrderStatus.Shipped:
        return 'bg-purple-100 text-purple-800'
      case OrderStatus.Delivered:
        return 'bg-green-100 text-green-800'
      case OrderStatus.Cancelled:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderStatusButtons = (order: Order) => {
    if (user?.role !== UserRole.OwnerShop) return null

    const currentStatus = order.status
    const isUpdating = updatingOrders.has(order.id)

    return (
      <div className="mt-4 flex flex-wrap gap-2">
        {currentStatus === OrderStatus.Pending && (
          <>
            <button
              onClick={() => updateOrderStatus(order.id, OrderStatus.Processing)}
              disabled={isUpdating}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 disabled:opacity-50"
            >
              Mark Processing
            </button>
            <button
              onClick={() => updateOrderStatus(order.id, OrderStatus.Cancelled)}
              disabled={isUpdating}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        )}
        {currentStatus === OrderStatus.Processing && (
          <button
            onClick={() => updateOrderStatus(order.id, OrderStatus.Shipped)}
            disabled={isUpdating}
            className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 disabled:opacity-50"
          >
            Mark Shipped
          </button>
        )}
        {currentStatus === OrderStatus.Shipped && (
          <button
            onClick={() => updateOrderStatus(order.id, OrderStatus.Delivered)}
            disabled={isUpdating}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 disabled:opacity-50"
          >
            Mark Delivered
          </button>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center space-x-3 mb-8">
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user?.role === UserRole.OwnerShop ? 'Shop Orders' : 'My Orders'}
              </h1>
              <p className="text-gray-600">
                {user?.role === UserRole.OwnerShop 
                  ? 'Manage orders for your shop'
                  : 'View your order history and track deliveries'
                }
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {user?.role === UserRole.OwnerShop 
                  ? 'No orders have been placed for your products yet.'
                  : 'You haven\'t placed any orders yet.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Order #{order.id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-semibold text-gray-900">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                        <button
                          onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="h-4 w-4" />
                          <span>{selectedOrder?.id === order.id ? 'Hide' : 'View'} Details</span>
                        </button>
                      </div>
                    </div>
                    {renderStatusButtons(order)}
                  </div>

                  {selectedOrder?.id === order.id && (
                    <div className="px-6 py-4 bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                              <p className="text-xs text-gray-500">
                                Shop: {item.shopName} • Quantity: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">
                                ${item.price.toFixed(2)} each
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {order.shippingAddress && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Shipping Address</h5>
                          <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}