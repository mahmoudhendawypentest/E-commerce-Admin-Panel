'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import { mockCustomers } from '@/services/mockData';
import { Customer } from '@/interfaces';
import { Search, Mail, Phone, MapPin, Eye, Calendar, DollarSign, Users } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface CustomerWithProfilePicture extends Customer {
  profilePicture?: string;
}

export default function Customers() {
  const [customers] = useState<CustomerWithProfilePicture[]>(
    mockCustomers.map((c) => ({ ...c, profilePicture: undefined }))
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithProfilePicture | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.phone.includes(searchTerm) ||
      customer.address.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const openCustomerDetails = (customer: CustomerWithProfilePicture) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  return (
    <Layout title="Customers">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">👥 Customer Management</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and view customer information</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mt-4">
            <span>
              Found <span className="font-semibold text-gray-900 dark:text-white">{filteredCustomers.length}</span> customer{filteredCustomers.length !== 1 ? 's' : ''}
            </span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Clear search
              </button>
            )}
          </div>
        </div>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 transform hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {customer.profilePicture ? (
                      <img
                        src={customer.profilePicture}
                        alt={customer.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {customer.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Since {formatDate(customer.createdAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => openCustomerDetails(customer)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                  >
                    <Eye size={20} />
                  </button>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-2">
                    <Mail size={16} className="flex-shrink-0 text-blue-500" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-2">
                    <Phone size={16} className="flex-shrink-0 text-green-500" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-start text-sm text-gray-600 dark:text-gray-400 gap-2">
                    <MapPin size={16} className="flex-shrink-0 mt-0.5 text-red-500" />
                    <span className="line-clamp-2">{customer.address}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {customer.totalOrders}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Orders</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(customer.totalSpent)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Spent</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {Math.ceil(customer.totalSpent / (customer.totalOrders || 1))}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Avg</p>
                    </div>
                  </div>
                </div>

                {/* Last Order */}
                <div className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar size={14} />
                    <span>Last order</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(customer.lastOrderDate)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                No customers found matching "{searchTerm}"
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Customer Details Modal */}
        {isModalOpen && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Customer Profile - {selectedCustomer.name}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Profile Header */}
                <div className="flex items-center gap-4">
                  {selectedCustomer.profilePicture ? (
                    <img
                      src={selectedCustomer.profilePicture}
                      alt={selectedCustomer.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center border-4 border-white">
                      <span className="text-white font-semibold text-2xl">
                        {selectedCustomer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedCustomer.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">ID: {selectedCustomer.id}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h5>
                    <div className="space-y-3">
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Email</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedCustomer.email}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Phone</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedCustomer.phone}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Address</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedCustomer.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-white">Statistics</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total Orders</p>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">{selectedCustomer.totalOrders}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">Total Spent</p>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-300">{formatCurrency(selectedCustomer.totalSpent)}</p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Customer Since</p>
                        <p className="text-lg font-bold text-purple-900 dark:text-purple-300">{formatDate(selectedCustomer.createdAt)}</p>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Last Order</p>
                        <p className="text-lg font-bold text-amber-900 dark:text-amber-300">{formatDate(selectedCustomer.lastOrderDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}