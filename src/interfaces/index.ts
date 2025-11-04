// TypeScript interfaces for data models

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  lastOrderDate: Date;
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
}

export interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
}

export interface ChartData {
  labels: string[];
  data: number[];
}

export interface StoreSettings {
  name: string;
  currency: string;
  language: string;
  timezone: string;
  email: string;
  phone: string;
}