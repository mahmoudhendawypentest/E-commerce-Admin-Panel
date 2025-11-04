'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import OrderDetailsModal from '@/components/OrderDetailsModal';
import { mockOrders } from '@/services/mockData';
import { Order } from '@/interfaces';
import { Search, Eye, MoreVertical } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const statuses = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <Layout title="Orders">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Orders Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Track and manage customer orders</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-700 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-600 dark:border-gray-600 rounded-lg bg-gray-700 dark:bg-gray-700 text-white dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 dark:border-gray-600 rounded-lg bg-gray-700 dark:bg-gray-700 text-white dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-gray-800 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-700 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 dark:text-gray-300 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 dark:text-gray-300 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 dark:bg-gray-800 divide-y divide-gray-700 dark:divide-gray-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-700 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-white dark:text-white">
                        {order.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-white dark:text-white">
                        {order.customerName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-white dark:text-white">
                        {order.items.length} items
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-white dark:text-white">
                        ${order.total.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(order.status)}`}
                      >
                        {statuses.filter(s => s !== 'all').map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-white dark:text-white">
                        {formatDate(order.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderModal(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        title="View Order Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300 dark:text-gray-300">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border border-gray-600 dark:border-gray-600 rounded text-sm hover:bg-gray-700 dark:hover:bg-gray-700 text-gray-300 dark:text-gray-300">
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-gray-600 dark:border-gray-600 rounded text-sm hover:bg-gray-700 dark:hover:bg-gray-700 text-gray-300 dark:text-gray-300">
              Next
            </button>
          </div>
        </div>

        {/* Order Details Modal */}
        <OrderDetailsModal
          order={selectedOrder!}
          isOpen={showOrderModal}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
        />
      </div>
    </Layout>
  );
}
