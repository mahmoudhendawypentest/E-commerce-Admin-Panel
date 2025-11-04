import { Order } from '@/interfaces';
import { X } from 'lucide-react';

interface OrderDetailsModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Order Details - {order.id}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Order Info */}
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Order Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{order.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Date:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{order.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Items:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{order.items.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Customer Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Name:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{order.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Customer ID:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{order.customerId}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Order Items</h4>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{item.productName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">${item.price.toFixed(2)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Order Total:</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 transition-colors"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}