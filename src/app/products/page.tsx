'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProductDetailsModal from '@/components/ProductDetailsModal';
import { mockProducts } from '@/services/mockData';
import { Product } from '@/interfaces';
import { Plus, Search, Edit, Trash2, Eye, X, CheckCircle, AlertCircle, Save, Upload } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [deleteMessage, setDeleteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: '',
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load products from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      try {
        const parsedProducts = JSON.parse(savedProducts);
        // Convert date strings back to Date objects
        const productsWithDates = parsedProducts.map((product: any) => ({
          ...product,
          createdAt: new Date(product.createdAt),
          updatedAt: new Date(product.updatedAt),
        }));
        setProducts(productsWithDates);
      } catch (e) {
        console.error('Failed to load products from localStorage', e);
      }
    }
  }, []);

  // Handle search from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, []);

  // Save products to localStorage whenever they change
  useEffect(() => {
    // Convert Date objects to ISO strings for localStorage
    const productsForStorage = products.map(product => ({
      ...product,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));
    localStorage.setItem('products', JSON.stringify(productsForStorage));
  }, [products]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(products.map(product => product.category)))];

  // Generate intelligent search suggestions
  const generateSuggestions = (query: string): string[] => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase().trim();
    const termScores: { term: string; score: number }[] = [];

    products.forEach(product => {
      const terms = [product.name, product.description, product.category];
      terms.forEach(term => {
        if (!term) return;

        let score = 0;
        const lowerTerm = term.toLowerCase();

        // Exact match
        if (lowerTerm === searchTerm) score += 100;

        // Starts with search term
        if (lowerTerm.startsWith(searchTerm)) score += 80;

        // Contains search term
        if (lowerTerm.includes(searchTerm)) score += 50;

        // Word boundary matches
        const words = searchTerm.split(' ');
        words.forEach(word => {
          if (lowerTerm.includes(word)) score += 20;
        });

        // Boost for active products
        if (product.status === 'active') score += 5;

        if (score > 0) {
          termScores.push({ term, score });
        }
      });
    });

    // Remove duplicates and sort by score
    const uniqueTerms = termScores.reduce((acc, curr) => {
      const existing = acc.find(item => item.term === curr.term);
      if (existing) {
        existing.score = Math.max(existing.score, curr.score);
      } else {
        acc.push(curr);
      }
      return acc;
    }, [] as { term: string; score: number }[]);

    return uniqueTerms
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.term);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      const newSuggestions = generateSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  // Filter products based on search term and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const deleteProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
    setDeleteMessage({ type: 'success', text: 'Product deleted successfully!' });
    setTimeout(() => setDeleteMessage(null), 3000);
  };

  const toggleProductStatus = (id: string) => {
    setProducts(products.map(product =>
      product.id === id
        ? { ...product, status: product.status === 'active' ? 'inactive' : 'active' }
        : product
    ));
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errors.price = 'Please enter a valid price greater than 0';
    }

    if (!formData.category.trim()) {
      errors.category = 'Category is required';
    }

    if (!formData.stock || isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      errors.stock = 'Please enter a valid stock quantity';
    }

    if (!formData.image.trim()) {
      errors.image = 'Image URL is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddProduct = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      image: '',
    });
    setFormErrors({});
    setEditingProduct(null);
    setShowAddModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      image: product.image,
    });
    setFormErrors({});
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category.trim(),
        stock: Number(formData.stock),
        image: formData.image.trim(),
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (editingProduct) {
        // Update existing product
        setProducts(products.map(product =>
          product.id === editingProduct.id
            ? { ...product, ...productData, updatedAt: new Date() }
            : product
        ));
        setDeleteMessage({ type: 'success', text: 'Product updated successfully!' });
      } else {
        // Add new product
        const newProduct: Product = {
          id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...productData,
        };
        setProducts([...products, newProduct]);
        setDeleteMessage({ type: 'success', text: 'Product added successfully!' });
      }

      setShowAddModal(false);
      setTimeout(() => setDeleteMessage(null), 3000);
    } catch (err) {
      setDeleteMessage({ type: 'error', text: 'Failed to save product. Please try again.' });
      setTimeout(() => setDeleteMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setFormErrors({ ...formErrors, image: 'Please select an image file' });
        return;
      }

      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors({ ...formErrors, image: 'Image size must be less than 5MB' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setFormData({ ...formData, image: imageData });
        setFormErrors({ ...formErrors, image: '' });
      };
      reader.onerror = () => {
        setFormErrors({ ...formErrors, image: 'Failed to read the image file' });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Layout title="Products">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your product inventory</p>
          </div>
          <button
            onClick={handleAddProduct}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </button>
        </div>

        {/* Delete Message */}
        {deleteMessage && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            deleteMessage.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
          }`}>
            {deleteMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{deleteMessage.text}</span>
            <button
              onClick={() => setDeleteMessage(null)}
              className="ml-auto text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search by product name or description..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (searchTerm.trim() && suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay hiding suggestions to allow click on them
                  setTimeout(() => setShowSuggestions(false), 150);
                }}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setShowSuggestions(false);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      <div className="flex items-center">
                        <Search className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                        <span className="truncate">{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? '📦 All Categories' : `🏷️ ${category}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            )}
          </div>

          {/* Search Results Info */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>
                Showing {filteredProducts.length} of {products.length} products
              </span>
              {searchTerm && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  Search: "{searchTerm}"
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  Category: {selectedCategory}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={product.image}
                            alt={product.name}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/40x40?text=No+Image';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.stock > 10
                          ? 'bg-green-100 text-green-800'
                          : product.stock > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleProductStatus(product.id)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowProductModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          title="View Product Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-yellow-600 hover:text-yellow-900 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No products found matching your criteria.</p>
          </div>
        )}

        {/* Add/Edit Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmitProduct} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent ${
                        formErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                      }`}
                      placeholder="Enter product name"
                    />
                    {formErrors.name && (
                      <p className="text-xs text-red-600 mt-1">❌ {formErrors.name}</p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent ${
                        formErrors.category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                      }`}
                    >
                      <option value="">Select category</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Books">Books</option>
                      <option value="Home & Garden">Home & Garden</option>
                      <option value="Sports">Sports</option>
                      <option value="Beauty">Beauty</option>
                      <option value="Toys">Toys</option>
                      <option value="Other">Other</option>
                    </select>
                    {formErrors.category && (
                      <p className="text-xs text-red-600 mt-1">❌ {formErrors.category}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent ${
                        formErrors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                      }`}
                      placeholder="0.00"
                    />
                    {formErrors.price && (
                      <p className="text-xs text-red-600 mt-1">❌ {formErrors.price}</p>
                    )}
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent ${
                        formErrors.stock ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                      }`}
                      placeholder="0"
                    />
                    {formErrors.stock && (
                      <p className="text-xs text-red-600 mt-1">❌ {formErrors.stock}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent ${
                      formErrors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    }`}
                    placeholder="Enter product description"
                  />
                  {formErrors.description && (
                    <p className="text-xs text-red-600 mt-1">❌ {formErrors.description}</p>
                  )}
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Image *
                  </label>
                  <div className="space-y-3">
                    {formData.image && (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                        <img
                          src={formData.image}
                          alt="Product preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer"
                      >
                        <Upload size={16} />
                        {formData.image ? 'Change Image' : 'Upload Image'}
                      </label>
                      {formData.image && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: '' })}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      value={formData.image.startsWith('data:') ? '' : formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent ${
                        formErrors.image ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                      }`}
                      placeholder="Or enter image URL"
                    />
                    {formErrors.image && (
                      <p className="text-xs text-red-600 mt-1">❌ {formErrors.image}</p>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Save size={16} />
                    {isSubmitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Product Details Modal */}
        <ProductDetailsModal
          product={selectedProduct!}
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
        />
      </div>
    </Layout>
  );
}