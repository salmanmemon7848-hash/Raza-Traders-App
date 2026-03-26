import React, { useState, useEffect } from 'react';
import { salesApi, productApi } from '../services/api';
import jsPDF from 'jspdf';

function Billing() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [billItems, setBillItems] = useState([]);
  const [customerData, setCustomerData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
  });
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('');
  const [showManualProduct, setShowManualProduct] = useState(false);
  const [manualProduct, setManualProduct] = useState({
    productName: '',
    productSize: '',
    price: '',
    quantity: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsRes = await productApi.getAll({ limit: 1000 });
      setProducts(productsRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addProductToBill = () => {
    if (!selectedProductId || !selectedQuantity) {
      alert('Please select product and quantity');
      return;
    }

    const product = products.find(p => p.id === parseInt(selectedProductId));
    if (!product) return;

    const quantity = parseInt(selectedQuantity);
    if (quantity > product.stock_quantity) {
      alert(`Only ${product.stock_quantity} items available`);
      return;
    }

    const itemProfit = (parseFloat(product.selling_price) - parseFloat(product.purchase_price)) * quantity;
    const itemTotal = parseFloat(product.selling_price) * quantity;

    const newItem = {
      id: Date.now(),
      product_id: product.id,
      product_name: product.product_name,
      company_name: product.company_name,
      quantity: quantity,
      unit_price: parseFloat(product.selling_price),
      total: itemTotal,
      profit: itemProfit,
      purchase_price: parseFloat(product.purchase_price),
    };

    setBillItems([...billItems, newItem]);
    setSelectedProductId('');
    setSelectedQuantity('');
  };

  const addManualProductToBill = () => {
    if (!manualProduct.productName || !manualProduct.quantity || !manualProduct.price) {
      alert('Please fill in all required fields');
      return;
    }

    const quantity = parseInt(manualProduct.quantity);
    const price = parseFloat(manualProduct.price);
    const itemTotal = price * quantity;

    const newItem = {
      id: Date.now(),
      product_id: 0,
      product_name: manualProduct.productName,
      product_size: manualProduct.productSize,
      company_name: 'Manual Entry',
      quantity: quantity,
      unit_price: price,
      total: itemTotal,
      profit: 0, // No profit calculation for manual entry
      purchase_price: 0,
    };

    setBillItems([...billItems, newItem]);
    setManualProduct({ productName: '', productSize: '', price: '', quantity: '' });
    setShowManualProduct(false);
  };

  const removeItemFromBill = (itemId) => {
    setBillItems(billItems.filter(item => item.id !== itemId));
  };

  const calculateTotals = () => {
    const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
    const totalProfit = billItems.reduce((sum, item) => sum + item.profit, 0);
    const tax = subtotal * 0.1; // 10% tax
    const grandTotal = subtotal + tax;

    return { subtotal, tax, grandTotal, totalProfit };
  };

  const generateBill = async () => {
    if (billItems.length === 0) {
      alert('Bill is empty');
      return;
    }

    try {
      // Record each item as a sale
      for (const item of billItems) {
        await salesApi.record({
          product_id: item.product_id,
          quantity_sold: item.quantity,
          selling_price: item.unit_price,
        });
      }

      // Reset form
      setBillItems([]);
      setCustomerData({ customerName: '', customerPhone: '', customerAddress: '' });
      alert('Bill generated successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const downloadBillAsPDF = () => {
    if (billItems.length === 0) {
      alert('Bill is empty');
      return;
    }

    const { subtotal, tax, grandTotal, totalProfit } = calculateTotals();
    const doc = new jsPDF();
    
    // Set font
    doc.setFontSize(16);
    doc.text('RAZA TRADERS', 20, 20);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleString()}`, 20, 30);

    // Customer Details
    doc.setFontSize(11);
    doc.text('Customer Details:', 20, 45);
    doc.setFontSize(10);
    doc.text(`Name: ${customerData.customerName || 'Walk-in Customer'}`, 20, 52);
    doc.text(`Phone: ${customerData.customerPhone || '-'}`, 20, 59);
    doc.text(`Address: ${customerData.customerAddress || '-'}`, 20, 66);

    // Bill Items Table
    doc.setFontSize(11);
    doc.text('Bill Items:', 20, 80);
    
    let yPosition = 90;
    doc.setFontSize(9);
    doc.text('Product', 20, yPosition);
    doc.text('Company', 50, yPosition);
    doc.text('Qty', 90, yPosition);
    doc.text('Unit Price', 110, yPosition);
    doc.text('Total', 145, yPosition);
    doc.text('Profit', 170, yPosition);
    
    yPosition += 8;
    doc.setDrawColor(200);
    doc.line(20, yPosition - 2, 200, yPosition - 2);

    billItems.forEach(item => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(item.product_name.substring(0, 20), 20, yPosition);
      doc.text(item.company_name.substring(0, 15), 50, yPosition);
      doc.text(item.quantity.toString(), 90, yPosition);
      doc.text(`₹${item.unit_price.toFixed(2)}`, 110, yPosition);
      doc.text(`₹${item.total.toFixed(2)}`, 145, yPosition);
      doc.text(`₹${item.profit.toFixed(2)}`, 170, yPosition);
      yPosition += 7;
    });

    yPosition += 5;
    doc.line(20, yPosition, 200, yPosition);
    yPosition += 8;

    // Totals
    doc.setFontSize(10);
    doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, 145, yPosition);
    yPosition += 7;
    doc.text(`Tax (10%): ₹${tax.toFixed(2)}`, 145, yPosition);
    yPosition += 7;
    doc.setFontSize(11);
    doc.text(`Grand Total: ₹${grandTotal.toFixed(2)}`, 145, yPosition);
    yPosition += 7;
    doc.setTextColor(39, 174, 96);
    doc.text(`Total Profit: ₹${totalProfit.toFixed(2)}`, 145, yPosition);

    // Footer
    doc.setTextColor(0);
    yPosition += 15;
    doc.setFontSize(9);
    doc.text('Thank you for your business!', 20, yPosition);

    // Download PDF
    doc.save(`bill_${new Date().getTime()}.pdf`);
  };

  const printBill = () => {
    const { subtotal, tax, grandTotal, totalProfit } = calculateTotals();
    const billContent = `
╔════════════════════════════════════════╗
║       RAZA TRADERS - BILL              ║
║   ${new Date().toLocaleString().padEnd(32)}║
╚════════════════════════════════════════╝

Customer Name: ${customerData.customerName || 'Walk-in Customer'}
Phone: ${customerData.customerPhone || '-'}
Address: ${customerData.customerAddress || '-'}

════════════════════════════════════════════════════════════════
                         BILL DETAILS
════════════════════════════════════════════════════════════════
${billItems.map(item => `
${item.product_name} (${item.company_name})
  Qty: ${item.quantity} × ₹${item.unit_price.toFixed(2)} = ₹${item.total.toFixed(2)}
  Profit per unit: ₹${(item.profit / item.quantity).toFixed(2)}
`).join('\n')}
════════════════════════════════════════════════════════════════

SUBTOTAL:               ₹${subtotal.toFixed(2)}
TAX (10%):              ₹${tax.toFixed(2)}
────────────────────────────────────────
GRAND TOTAL:            ₹${grandTotal.toFixed(2)}
TOTAL PROFIT:           ₹${totalProfit.toFixed(2)}

═══════════════════════════════════════════════════════════════════

                 Thank you for your business!

    `;

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>Bill Receipt</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; }
            pre { white-space: pre-wrap; word-wrap: break-word; }
          </style>
        </head>
        <body>
          <pre>${billContent}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const { subtotal, tax, grandTotal, totalProfit } = calculateTotals();

  if (loading) return <div className="card"><p>Loading products...</p></div>;

  return (
    <div>
      <h2>Billing Management</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="form-section" style={{ marginBottom: '20px' }}>
          <h3>Create New Bill</h3>
          
          {/* Customer Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            <div className="form-group">
              <label>Customer Name *</label>
              <input
                type="text"
                placeholder="Enter customer name"
                value={customerData.customerName}
                onChange={(e) => setCustomerData({ ...customerData, customerName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Customer Phone</label>
              <input
                type="text"
                placeholder="Enter phone number"
                value={customerData.customerPhone}
                onChange={(e) => setCustomerData({ ...customerData, customerPhone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Customer Address</label>
              <input
                type="text"
                placeholder="Enter address"
                value={customerData.customerAddress}
                onChange={(e) => setCustomerData({ ...customerData, customerAddress: e.target.value })}
              />
            </div>
          </div>

          {/* Product Selection */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => setShowManualProduct(false)}
                style={{ opacity: !showManualProduct ? 1 : 0.6 }}
              >
                📦 Select Existing Product
              </button>
              <button 
                type="button" 
                className="btn btn-success"
                onClick={() => setShowManualProduct(true)}
                style={{ opacity: showManualProduct ? 1 : 0.6 }}
              >
                ➕ Add Custom Product
              </button>
            </div>

            {!showManualProduct ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div className="form-group">
                  <label>Select Product *</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                  >
                    <option value="">Choose a product...</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.product_name} - ₹{product.selling_price.toFixed(2)} ({product.stock_quantity} available)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter quantity"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={addProductToBill}
                    style={{ width: '100%' }}
                  >
                    ➕ Add to Bill
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    placeholder="Enter product name"
                    value={manualProduct.productName}
                    onChange={(e) => setManualProduct({ ...manualProduct, productName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Product Size</label>
                  <input
                    type="text"
                    placeholder="e.g., M, L, XL, 5L"
                    value={manualProduct.productSize}
                    onChange={(e) => setManualProduct({ ...manualProduct, productSize: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Enter price"
                    value={manualProduct.price}
                    onChange={(e) => setManualProduct({ ...manualProduct, price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter quantity"
                    value={manualProduct.quantity}
                    onChange={(e) => setManualProduct({ ...manualProduct, quantity: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={addManualProductToBill}
                    style={{ flex: 1 }}
                  >
                    ✓ Add Product
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bill Items */}
          {billItems.length > 0 && (
            <div style={{ marginBottom: '20px', overflowX: 'auto' }}>
              <h4 style={{ marginBottom: '10px' }}>📋 Bill Items ({billItems.length})</h4>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Company</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                    <th>Profit/Unit</th>
                    <th>Total Profit</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {billItems.map(item => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td>{item.company_name}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.unit_price.toFixed(2)}</td>
                      <td>₹{item.total.toFixed(2)}</td>
                      <td style={{ color: '#27ae60', fontWeight: 'bold' }}>₹{((item.profit) / item.quantity).toFixed(2)}</td>
                      <td style={{ color: '#27ae60', fontWeight: 'bold' }}>₹{item.profit.toFixed(2)}</td>
                      <td>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => removeItemFromBill(item.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Bill Summary */}
          {billItems.length > 0 && (
            <div style={{ 
              backgroundColor: '#ecf0f1', 
              padding: '20px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              <div>
                <strong>Subtotal:</strong>
                <div style={{ fontSize: '18px', color: '#333' }}>₹{subtotal.toFixed(2)}</div>
              </div>
              <div>
                <strong>Tax (10%):</strong>
                <div style={{ fontSize: '18px', color: '#e67e22' }}>₹{tax.toFixed(2)}</div>
              </div>
              <div>
                <strong>Grand Total:</strong>
                <div style={{ fontSize: '20px', color: '#e74c3c', fontWeight: 'bold' }}>₹{grandTotal.toFixed(2)}</div>
              </div>
              <div>
                <strong>Total Profit:</strong>
                <div style={{ fontSize: '18px', color: '#27ae60', fontWeight: 'bold' }}>₹{totalProfit.toFixed(2)}</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-success"
              onClick={generateBill}
              disabled={billItems.length === 0}
              style={{ flex: 1, minWidth: '150px' }}
            >
              ✓ Generate Bill
            </button>
            <button 
              className="btn btn-primary"
              onClick={printBill}
              disabled={billItems.length === 0}
              style={{ flex: 1, minWidth: '150px' }}
            >
              🖨️ Print Bill
            </button>
            <button 
              className="btn btn-warning"
              onClick={downloadBillAsPDF}
              disabled={billItems.length === 0}
              style={{ flex: 1, minWidth: '150px' }}
            >
              📥 Download PDF
            </button>
            <button 
              className="btn btn-danger"
              onClick={() => {
                setBillItems([]);
                setCustomerData({ customerName: '', customerPhone: '', customerAddress: '' });
              }}
              disabled={billItems.length === 0}
              style={{ flex: 1, minWidth: '150px' }}
            >
              🗑️ Clear Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Billing;
