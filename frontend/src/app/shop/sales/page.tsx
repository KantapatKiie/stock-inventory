'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { Order, UserRole, OrderStatus } from '../../../types'
import { apiService } from '../../../services/api'
import { 
  DollarSign, 
  TrendingUp, 
  Package, 
  Calendar,
  BarChart3,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react'
import Navbar from '../../../components/Navbar'

interface SalesData {
  totalSales: number
  period: {
    startDate: string | null
    endDate: string | null
  }
}

interface SalesSummary {
  totalRevenue: number
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  averageOrderValue: number
  recentOrders: Order[]
}

export default function ShopSales() {
  const { user } = useAuth()
  const [salesData, setSalesData] = useState<SalesData | null>(null)
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    if (user?.role === UserRole.OwnerShop) {
      fetchSalesData()
      fetchSalesSummary()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchSalesData = async (start?: string, end?: string) => {
    try {
      const data = await apiService.getSales(start, end)
      setSalesData(data)
    } catch (err: any) {
      console.error('Sales data fetch error:', err)
      setError('Failed to load sales data')
    }
  }

  const fetchSalesSummary = async () => {
    try {
      setLoading(true)
      const orders = await apiService.getShopOrders()
      
      const totalRevenue = orders
        .filter(o => o.status === OrderStatus.Delivered)
        .reduce((sum, order) => sum + order.totalAmount, 0)
      
      const pendingOrders = orders.filter(o => o.status === OrderStatus.Pending).length
      const completedOrders = orders.filter(o => o.status === OrderStatus.Delivered).length
      const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0
      
      // Get recent orders (last 5)
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)

      setSalesSummary({
        totalRevenue,
        totalOrders: orders.length,
        pendingOrders,
        completedOrders,
        averageOrderValue,
        recentOrders
      })
    } catch (err: any) {
      console.error('Sales summary fetch error:', err)
      setError('Failed to load sales summary')
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const applyDateFilter = () => {
    fetchSalesData(dateRange.startDate || undefined, dateRange.endDate || undefined)
  }

  const clearDateFilter = () => {
    setDateRange({ startDate: '', endDate: '' })
    fetchSalesData()
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

  if (user?.role !== UserRole.OwnerShop) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            Sales reports are only available for shop owners.
          </div>
        </div>
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
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Sales Analytics</h1>
                <p className="text-gray-600">Track your shop's performance and revenue</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Date Range Filter */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center space-x-4">
              <Calendar className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">Filter by Date Range</h3>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateRangeChange}
                  className="text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateRangeChange}
                  className="text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-2 mt-6">
                <button
                  onClick={applyDateFilter}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Apply Filter
                </button>
                <button
                  onClick={clearDateFilter}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Clear
                </button>
              </div>
            </div>
            
            {salesData && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <p className="text-sm text-gray-600">
                  Sales for period: {salesData.period.startDate || 'All time'} to {salesData.period.endDate || 'Now'}
                </p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  ${salesData.totalSales.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Sales Summary Cards */}
          {salesSummary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        ${salesSummary.totalRevenue.toFixed(2)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Package className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {salesSummary.totalOrders}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-yellow-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Orders</dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {salesSummary.pendingOrders}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Avg Order Value</dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        ${salesSummary.averageOrderValue.toFixed(2)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Orders */}
          {salesSummary && salesSummary.recentOrders.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6 text-blue-600" />
                  <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {salesSummary.recentOrders.map((order) => (
                  <div key={order.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Order #{order.id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <span className="text-lg font-semibold text-gray-900">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Summary */}
          {salesSummary && (
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h2 className="text-lg font-medium text-gray-900">Performance Summary</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {salesSummary.totalOrders > 0 
                      ? Math.round((salesSummary.completedOrders / salesSummary.totalOrders) * 100)
                      : 0}%
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Order Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {salesSummary.completedOrders}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Completed Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    ${salesSummary.totalRevenue > 1000 
                      ? (salesSummary.totalRevenue / 1000).toFixed(1) + 'K'
                      : salesSummary.totalRevenue.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Revenue Generated</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}