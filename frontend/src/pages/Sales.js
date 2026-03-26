import React, { useState, useEffect } from 'react';
import { salesApi } from '../services/api';

function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [showManualSaleForm, setShowManualSaleForm] = useState(false);
  const [manualSale, setManualSale] = useState({
    productName: '',
    quantity: '',
    price: '',
    discount: '',
  });

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const salesRes = await salesApi.getAll({ limit: 500 });
      setSales(salesRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = filterDate 
    ? sales.filter(sale => new Date(sale.sale_date).toLocaleDateString() === filterDate)
    : sales;

  const calculateStats = () => {
    const totalSales = filteredSales.length;
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);
    const totalProfit = filteredSales.reduce((sum, sale) => {
      const profitPerUnit = parseFloat(sale.selling_price) - (sale.purchase_price || 0);
      return sum + (profitPerUnit * sale.quantity_sold);
    }, 0);

    return { totalSales, totalRevenue, totalProfit };
  };

  const { totalSales, totalRevenue, totalProfit } = calculateStats();

  const handleManualSaleSubmit = async (e) => {
    e.preventDefault();
    
    if (!manualSale.productName || !manualSale.quantity || !manualSale.price) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const quantity = parseInt(manualSale.quantity);
      const price = parseFloat(manualSale.price);
      const discount = parseFloat(manualSale.discount || 0);
      const finalPrice = price - discount;

      await salesApi.record({
        product_name: manualSale.productName,
        product_id: 0, // Manual entry doesn't have product ID
        quantity_sold: quantity,
        selling_price: finalPrice,
      });

      // Reset form
      setManualSale({ productName: '', quantity: '', price: '', discount: '' });
      setShowManualSaleForm(false);
      fetchSales();
      alert('Sale added successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const calculateFinalPrice = () => {
    const price = parseFloat(manualSale.price || 0);
    const discount = parseFloat(manualSale.discount || 0);
    return price - discount;
  };

  if (loading) return <div className="card"><p>Loading sales history...</p></div>;

  return (
    <div>
      <h2>Sales History</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Sales Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Sales</div>
          <div className="stat-value">{totalSales}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Profit</div>
          <div className="stat-value" style={{ color: '#27ae60' }}>₹{totalProfit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="card">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button 
            className="btn btn-success"
            onClick={() => setShowManualSaleForm(!showManualSaleForm)}
            style={{ whiteSpace: 'nowrap' }}
          >
            {showManualSaleForm ? '✗ Cancel' : '➕ Add Sale'}
          </button>
          <label style={{ marginRight: '8px', whiteSpace: 'nowrap' }}>Filter:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{ maxWidth: '150px', marginBottom: '0' }}
          />
          {filterDate && (
            <button 
              className="btn btn-sm btn-danger"
              onClick={() => setFilterDate('')}
              style={{ marginLeft: '8px' }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Manual Sale Form */}
        {showManualSaleForm && (
          <div className="form-section" style={{ marginBottom: '20px' }}>
            <h3>➕ Add Manual Sale</h3>
            <form onSubmit={handleManualSaleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    placeholder="Enter product name"
                    value={manualSale.productName}
                    onChange={(e) => setManualSale({ ...manualSale, productName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter quantity"
                    value={manualSale.quantity}
                    onChange={(e) => setManualSale({ ...manualSale, quantity: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Enter price"
                    value={manualSale.price}
                    onChange={(e) => setManualSale({ ...manualSale, price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Discount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Discount amount (optional)"
                    value={manualSale.discount}
                    onChange={(e) => setManualSale({ ...manualSale, discount: e.target.value })}
                  />
                </div>
              </div>

              {/* Final Price Display */}
              <div style={{ 
                backgroundColor: '#ecf0f1', 
                padding: '20px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '15px'
              }}>
                <div>
                  <strong>Price:</strong>
                  <div style={{ fontSize: '18px' }}>₹{parseFloat(manualSale.price || 0).toFixed(2)}</div>
                </div>
                <div>
                  <strong>Discount:</strong>
                  <div style={{ fontSize: '18px', color: '#e74c3c' }}>-₹{parseFloat(manualSale.discount || 0).toFixed(2)}</div>
                </div>
                <div>
                  <strong>Final Price:</strong>
                  <div style={{ fontSize: '20px', color: '#27ae60', fontWeight: 'bold' }}>₹{calculateFinalPrice().toFixed(2)}</div>
                </div>
              </div>

              <button type="submit" className="btn btn-success" style={{ width: '100%' }}>
                ✓ Add Sale
              </button>
            </form>
          </div>
        )}

        {/* Sales Table */}
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Amount</th>
                <th>Profit/Unit</th>
                <th>Total Profit</th>
                <th>Sale Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length > 0 ? (
                filteredSales.map(sale => {
                  const profitPerUnit = parseFloat(sale.selling_price) - (sale.purchase_price || 0);
                  const totalProfit = profitPerUnit * sale.quantity_sold;
                  
                  return (
                    <tr key={sale.id}>
                      <td>{sale.product_name}</td>
                      <td>{sale.quantity_sold}</td>
                      <td>₹{parseFloat(sale.selling_price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td>₹{parseFloat(sale.total_amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td style={{ color: '#27ae60', fontWeight: 'bold' }}>
                        ₹{profitPerUnit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ color: '#27ae60', fontWeight: 'bold' }}>
                        ₹{totalProfit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td>{new Date(sale.sale_date).toLocaleString()}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                    No sales records {filterDate ? 'on this date' : 'found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {sales.length === 0 && (
          <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>No sales records available</p>
        )}
      </div>
    </div>
  );
}

export default Sales;
