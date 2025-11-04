// Application constants

export const APP_NAME = 'E-Commerce Admin Panel';
export const APP_DESCRIPTION = 'Admin dashboard for managing e-commerce store';

export const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

export const PRODUCT_STATUSES = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  inactive: { label: 'Inactive', color: 'bg-red-100 text-red-800' },
};

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY'];
export const LANGUAGES = ['en', 'es', 'fr', 'de', 'ar'];
export const TIMEZONES = ['UTC', 'EST', 'PST', 'GMT', 'CET'];

export const DEMO_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'demo',
};