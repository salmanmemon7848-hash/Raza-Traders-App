import React, { useState, useEffect } from 'react';
import { productApi } from '../services/api';

function Products() {
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    product_name: '',
    company_name: '',
    model_number: '',
    purchase_price: '',
    selling_price: '',
    stock_quantity: '',
    low_stock_limit: 10,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productApi.getAll({ search: searchTerm });
      setProducts(res.data);

      const lowStockRes = await productApi.getLowStock();
      setLowStockProducts(lowStockRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await productApi.update(editingId, formData);
      } else {
        await productApi.create(formData);
      }
      setFormData({
        product_name: '',
        company_name: '',
        model_number: '',
        purchase_price: '',
        selling_price: '',
        stock_quantity: '',
        low_stock_limit: 10,
      });
      setShowForm(false);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await productApi.delete(id);
        fetchProducts();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleEdit = (product) => {
    setFormData(product);
    setEditingId(product.id);
    setShowForm(true);
  };

  // Live search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCompany = !companyFilter || product.company_name === companyFilter;
    const matchesStock = 
      !stockFilter || 
      (stockFilter === 'low' && product.stock_quantity <= product.low_stock_limit) ||
      (stockFilter === 'ok' && product.stock_quantity > product.low_stock_limit);
    const matchesSearch = !searchTerm || 
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCompany && matchesStock && matchesSearch;
  });

  const uniqueCompanies = [...new Set(products.map(p => p.company_name))];
  const profitPerProduct = (product) => parseFloat(product.selling_price) - parseFloat(product.purchase_price);

  if (loading) return <div className="card"><p>Loading products...</p></div>;

  return (
    <div>
      <h2>Products Management</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {lowStockProducts.length > 0 && (
        <div className="alert alert-warning">
          ⚠️ {lowStockProducts.length} product(s) have low stock!
        </div>
      )}

      <div className="card">
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: '180px' }}
            className="form-control"
          />
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="form-control"
            style={{ minWidth: '130px' }}
          >
            <option value="">All Companies</option>
            {uniqueCompanies.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="form-control"
            style={{ minWidth: '130px' }}
          >
            <option value="">All Stock</option>
            <option value="ok">In Stock</option>
            <option value="low">Low Stock</option>
          </select>
          <button className="btn btn-success" onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              product_name: '',
              company_name: '',
              model_number: '',
              purchase_price: '',
              selling_price: '',
              stock_quantity: '',
              low_stock_limit: 10,
            });
          }} style={{ whiteSpace: 'nowrap' }}>
            {showForm ? '✕ Cancel' : '➕ Add'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }} className="form-section">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Model Number</label>
                <input
                  type="text"
                  value={formData.model_number}
                  onChange={(e) => setFormData({ ...formData, model_number: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Purchase Price *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Selling Price *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Stock Quantity</label>
                <input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Low Stock Limit</label>
                <input
                  type="number"
                  value={formData.low_stock_limit}
                  onChange={(e) => setFormData({ ...formData, low_stock_limit: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Save'}</button>
          </form>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table className="table-hover">
            <thead>
              <tr>
                <th>Product</th>
                <th>Company</th>
                <th>Model</th>
                <th>Purchase Price</th>
                <th>Selling Price</th>
                <th>Profit/Unit</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const profit = profitPerProduct(product);
                return (
                  <tr key={product.id} className="table-row">
                    <td>{product.product_name}</td>
                    <td>{product.company_name}</td>
                    <td>{product.model_number || '-'}</td>
                    <td>₹{product.purchase_price}</td>
                    <td>₹{product.selling_price}</td>
                    <td style={{ color: '#27ae60', fontWeight: 'bold' }}>₹{profit.toFixed(2)}</td>
                    <td>{product.stock_quantity}</td>
                    <td>
                      {product.stock_quantity <= product.low_stock_limit ? (
                        <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>🔴 Low</span>
                      ) : (
                        <span style={{ color: '#27ae60', fontWeight: 'bold' }}>🟢 OK</span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-warning btn-sm" onClick={() => handleEdit(product)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(product.id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>No products found</p>
        )}
      </div>
    </div>
  );
}

export default Products;
