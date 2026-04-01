'use client';

import { useEffect, useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Filter,
  X,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  companyName: string;
  modelNumber: string | null;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
}

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    modelNumber: '',
    purchasePrice: '',
    sellingPrice: '',
    quantity: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/products?search=${search}&company=${companyFilter}`);
      const data = await res.json();
      // Ensure data is an array
      setProducts(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setProducts([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, companyFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsSubmitting(true);

    // Client-side validation
    if (!formData.name.trim() || !formData.companyName.trim()) {
      setSubmitError('Product name and company name are required');
      setIsSubmitting(false);
      return;
    }

    const purchasePrice = parseFloat(formData.purchasePrice);
    const sellingPrice = parseFloat(formData.sellingPrice);
    const quantity = parseInt(formData.quantity);

    if (isNaN(purchasePrice) || isNaN(sellingPrice) || isNaN(quantity)) {
      setSubmitError('Please enter valid numbers for prices and quantity');
      setIsSubmitting(false);
      return;
    }

    if (purchasePrice < 0 || sellingPrice < 0 || quantity < 0) {
      setSubmitError('Prices and quantity cannot be negative');
      setIsSubmitting(false);
      return;
    }

    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || 'Failed to save product');
      }

      setSubmitSuccess(true);
      
      setTimeout(() => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setFormData({
          name: '',
          companyName: '',
          modelNumber: '',
          purchasePrice: '',
          sellingPrice: '',
          quantity: '',
        });
        setSubmitSuccess(false);
        fetchProducts();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      companyName: product.companyName,
      modelNumber: product.modelNumber || '',
      purchasePrice: product.purchasePrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      quantity: product.quantity.toString(),
    });
    setIsModalOpen(true);
  };

  const companies = Array.from(new Set(products.map(p => p.companyName)));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Inventory Management</h2>
          <p className="text-sm sm:text-base text-gray-500">Manage your products and stock levels</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({ name: '', companyName: '', modelNumber: '', purchasePrice: '', sellingPrice: '', quantity: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 sm:px-6 sm:py-3 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, company, or model..."
            className="w-full pl-10 pr-4 py-3 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            className="w-full pl-10 pr-4 py-3 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white text-sm sm:text-base"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
          >
            <option value="">All Companies</option>
            {companies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">Product Name</th>
                <th className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap hidden sm:table-cell">Company</th>
                <th className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap hidden md:table-cell">Purchase Price</th>
                <th className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap hidden lg:table-cell">Selling Price</th>
                <th className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap hidden xl:table-cell">Profit</th>
                <th className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">Stock</th>
                <th className="px-4 sm:px-6 py-4 text-xs sm:text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 sm:px-6 py-8 text-center text-gray-500 text-sm sm:text-base">Loading products...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="px-4 sm:px-6 py-8 text-center text-gray-500 text-sm sm:text-base">No products found.</td></tr>
              ) : (
                products.map((product) => {
                  const profit = product.sellingPrice - product.purchasePrice;
                  const isLowStock = product.quantity < 5;
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="font-medium text-gray-900 text-sm sm:text-base">{product.name}</div>
                        {product.modelNumber && <div className="text-xs text-gray-500 hidden sm:block">{product.modelNumber}</div>}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">{product.companyName}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 hidden md:table-cell">₹{product.purchasePrice.toLocaleString()}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 font-medium hidden lg:table-cell">₹{product.sellingPrice.toLocaleString()}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-emerald-600 font-medium hidden xl:table-cell">₹{profit.toLocaleString()}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isLowStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {isLowStock && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {product.quantity} units
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right space-x-2">
                        <button onClick={() => openEditModal(product)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {/* Error Message */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Success Message */}
              {submitSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>Product saved successfully!</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    required
                    type="text"
                    className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm sm:text-base"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    required
                    type="text"
                    className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm sm:text-base"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Model Number</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm sm:text-base"
                    value={formData.modelNumber}
                    onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm sm:text-base"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Selling Price</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm sm:text-base"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Initial Quantity</label>
                  <input
                    required
                    type="number"
                    className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm sm:text-base"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
              </div>
              <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>{editingProduct ? 'Update Product' : 'Add Product'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
