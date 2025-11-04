import { Product } from '@/interfaces';
import { X } from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailsModal({ product, isOpen, onClose }: ProductDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Product Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                }}
              />
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h4>
                <p className="text-2xl font-bold text-blue-600">${product.price.toFixed(2)}</p>
              </div>
              <div>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {product.category}
                </span>
                <span className={`inline-flex ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                  product.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Stock: <span className="font-medium">{product.stock} units</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Created: {product.createdAt.toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Updated: {product.updatedAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <h5 className="text-md font-semibold text-gray-900 dark:text-white mb-2">Description</h5>
            <p className="text-gray-700 dark:text-gray-300">{product.description}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}