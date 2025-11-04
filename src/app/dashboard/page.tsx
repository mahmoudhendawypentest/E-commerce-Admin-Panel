'use client';

import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import Chart from '@/components/Chart';
import { mockDashboardStats, mockChartData, mockOrders, mockSalesAnalytics, mockRevenueChartData, mockProducts } from '@/services/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { formatCurrency } from '@/utils/formatters';
import { ShoppingCart, Package, Users, DollarSign } from 'lucide-react';

export default function Dashboard() {
   const [isDark, setIsDark] = useState(false);

   useEffect(() => {
     // Check if dark mode is enabled
     const checkDarkMode = () => {
       setIsDark(document.documentElement.classList.contains('dark'));
     };
     checkDarkMode();
     // Watch for changes to the dark class
     const observer = new MutationObserver(checkDarkMode);
     observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
     return () => observer.disconnect();
   }, []);

   const exportData = () => {
     // Prepare sales overview data
     const salesData = [
       ['Month', 'Revenue', 'Target', 'Growth %', 'Avg Order Value', 'Conversion Rate'],
       ...mockRevenueChartData.map((item, index) => [
         item.name,
         item.revenue,
         item.target,
         index > 0 ? ((item.revenue - mockRevenueChartData[index - 1].revenue) / mockRevenueChartData[index - 1].revenue * 100).toFixed(2) : 'N/A',
         mockSalesAnalytics.averageOrderValue.toFixed(2),
         mockSalesAnalytics.conversionRate
       ])
     ];

     // Prepare products data
     const productsData = [
       ['Product ID', 'Name', 'Description', 'Price', 'Category', 'Stock', 'Status', 'Created At', 'Updated At'],
       ...mockProducts.map(product => [
         product.id,
         product.name,
         product.description,
         product.price,
         product.category,
         product.stock,
         product.status,
         product.createdAt.toISOString().split('T')[0],
         product.updatedAt.toISOString().split('T')[0]
       ])
     ];

     // Prepare orders data
     const ordersData = [
       ['Order ID', 'Customer Name', 'Items (Product Name - Quantity - Price)', 'Total', 'Status', 'Created At', 'Updated At'],
       ...mockOrders.map(order => [
         order.id,
         order.customerName,
         order.items.map(item => `${item.productName} (${item.quantity}x $${item.price})`).join('; '),
         order.total,
         order.status,
         order.createdAt.toISOString().split('T')[0],
         order.updatedAt.toISOString().split('T')[0]
       ])
     ];

     // Combine all data with section headers
     const combinedData = [
       ['=== SALES OVERVIEW ==='],
       ...salesData,
       [''],
       ['=== PRODUCTS INVENTORY ==='],
       ...productsData,
       [''],
       ['=== ORDERS HISTORY ==='],
       ...ordersData
     ];

     // Convert to CSV
     const csvContent = combinedData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

     // Create blob and download
     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
     const link = document.createElement('a');
     const url = URL.createObjectURL(blob);
     link.setAttribute('href', url);
     link.setAttribute('download', 'sales_overview_complete.csv');
     link.style.visibility = 'hidden';
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
   };

  const chartData = mockChartData.labels.map((label, index) => ({
    name: label,
    value: mockChartData.data[index],
  }));

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Orders"
            value={mockDashboardStats.totalOrders}
            icon={ShoppingCart}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Total Products"
            value={mockDashboardStats.totalProducts}
            icon={Package}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Total Customers"
            value={mockDashboardStats.totalCustomers}
            icon={Users}
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(mockDashboardStats.totalRevenue)}
            icon={DollarSign}
            trend={{ value: 23, isPositive: true }}
          />
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Today's Performance
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Orders Today</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {mockDashboardStats.todayOrders}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Revenue Today</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(mockDashboardStats.todayRevenue)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  New order received
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Product added to inventory
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Customer registered
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Overview - Enhanced & Realistic */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Sales Overview
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Revenue trends and performance analytics
              </p>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
              <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
                <option>Last year</option>
              </select>
              <button
                onClick={exportData}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Export Data
              </button>
            </div>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Monthly Growth</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">+{mockSalesAnalytics.monthlyGrowth}%</p>
                </div>
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">📈</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Avg Order Value</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">${mockSalesAnalytics.averageOrderValue.toFixed(2)}</p>
                </div>
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Conversion Rate</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{mockSalesAnalytics.conversionRate}%</p>
                </div>
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">🎯</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Top Product</p>
                  <p className="text-lg font-bold text-orange-900 dark:text-orange-100">{mockSalesAnalytics.topProduct}</p>
                </div>
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">🏆</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Chart Section */}
          <div className="mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Revenue Trends
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Monthly sales performance and growth analysis
                  </p>
                </div>
                <div className="flex gap-3 mt-4 sm:mt-0">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Target</span>
                  </div>
                </div>
              </div>

              {/* Chart Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">$45,800</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">+24.5%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">vs Last Month</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">$412,000</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Annual Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">$38,000</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Target</p>
                </div>
              </div>

              {/* Enhanced Chart with Dual Lines */}
              <div style={{ width: '100%', height: '350px' }}>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={mockRevenueChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                    <XAxis
                      dataKey="name"
                      stroke={isDark ? '#6B7280' : '#9CA3AF'}
                      fontSize={12}
                      tick={{ fill: isDark ? '#6B7280' : '#9CA3AF' }}
                    />
                    <YAxis
                      stroke={isDark ? '#6B7280' : '#9CA3AF'}
                      fontSize={12}
                      tick={{ fill: isDark ? '#6B7280' : '#9CA3AF' }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                        border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                        borderRadius: '8px',
                        color: isDark ? '#F9FAFB' : '#111827',
                      }}
                      formatter={(value: number, name: string) => [
                        `$${value.toLocaleString()}`,
                        name === 'revenue' ? 'Revenue' : 'Target'
                      ]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#10B981"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                      name="target"
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#FFFFFF' }}
                      name="revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sales Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales by Category */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Sales by Category</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Electronics</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: `${mockSalesAnalytics.salesByCategory.electronics}%`}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{mockSalesAnalytics.salesByCategory.electronics}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Gaming</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: `${mockSalesAnalytics.salesByCategory.gaming}%`}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{mockSalesAnalytics.salesByCategory.gaming}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Accessories</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: `${mockSalesAnalytics.salesByCategory.accessories}%`}}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{mockSalesAnalytics.salesByCategory.accessories}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Sales */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Recent Sales</h4>
              <div className="space-y-3">
                {mockOrders.slice(0, 4).map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-2 bg-white dark:bg-gray-600 rounded">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{order.customerName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{order.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">${order.total.toFixed(2)}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
            <h4 className="text-md font-semibold text-indigo-900 dark:text-indigo-100 mb-2">💡 Performance Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-indigo-700 dark:text-indigo-300">
                  <span className="font-medium">Peak Hours:</span> Sales peak between {mockSalesAnalytics.peakHours} with 35% of daily revenue
                </p>
              </div>
              <div>
                <p className="text-indigo-700 dark:text-indigo-300">
                  <span className="font-medium">Top Channel:</span> {mockSalesAnalytics.topChannel} drives 45% of conversions
                </p>
              </div>
              <div>
                <p className="text-indigo-700 dark:text-indigo-300">
                  <span className="font-medium">Customer Retention:</span> {mockSalesAnalytics.customerRetention}% repeat purchase rate this month
                </p>
              </div>
              <div>
                <p className="text-indigo-700 dark:text-indigo-300">
                  <span className="font-medium">Growth Trend:</span> +{mockSalesAnalytics.growthTrend}% MoM growth in high-value orders
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}