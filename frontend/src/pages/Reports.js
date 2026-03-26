import React, { useState, useEffect } from 'react';
import { reportsApi } from '../services/api';
import jsPDF from 'jspdf';

function Reports() {
  const [activeReport, setActiveReport] = useState('daily');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().split('T')[0].slice(0, 7));

  const fetchDailySalesReport = async () => {
    try {
      setLoading(true);
      const res = await reportsApi.getDailySalesReport(selectedDate);
      setReportData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlySalesReport = async () => {
    try {
      setLoading(true);
      const res = await reportsApi.getMonthlySalesReport(selectedMonth);
      setReportData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfitReport = async () => {
    try {
      setLoading(true);
      const res = await reportsApi.getProfitReport();
      setReportData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockReport = async () => {
    try {
      setLoading(true);
      const res = await reportsApi.getStockReport();
      setReportData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductPerformanceReport = async () => {
    try {
      setLoading(true);
      const res = await reportsApi.getProductPerformance();
      setReportData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadReportAsPDF = () => {
    if (!reportData) {
      alert('No report data to download');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('RAZA TRADERS - REPORT', 20, 20);
    doc.setFontSize(10);
    doc.text(`Report Type: ${activeReport.toUpperCase()}`, 20, 30);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 40);

    let yPosition = 55;

    if (activeReport === 'daily' || activeReport === 'monthly') {
      doc.setFontSize(12);
      doc.text('Sales Data:', 20, yPosition);
      yPosition += 15;

      doc.setFontSize(10);
      doc.text('Product', 20, yPosition);
      doc.text('Qty', 80, yPosition);
      doc.text('Price', 120, yPosition);
      doc.text('Total', 160, yPosition);
      yPosition += 8;

      reportData.sales?.forEach(sale => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(sale.product_name.substring(0, 25), 20, yPosition);
        doc.text(sale.quantity_sold.toString(), 80, yPosition);
        doc.text(`₹${sale.selling_price}`, 120, yPosition);
        doc.text(`₹${sale.total_amount}`, 160, yPosition);
        yPosition += 7;
      });

      yPosition += 10;
      doc.setFontSize(11);
      if (reportData.totalRevenue) {
        doc.text(`Total Revenue: ₹${reportData.totalRevenue}`, 20, yPosition);
        yPosition += 10;
      }
    }

    doc.save(`report_${activeReport}_${new Date().getTime()}.pdf`);
    alert('Report downloaded successfully!');
  };

  const shareReportViaWhatsApp = () => {
    if (!reportData) {
      alert('No report data to share');
      return;
    }

    let reportText = `🏪 *RAZA TRADERS - REPORT*\n\n`;
    reportText += `📊 *Report Type*: ${activeReport.toUpperCase()}\n`;
    reportText += `📅 *Generated*: ${new Date().toLocaleString()}\n\n`;

    if (activeReport === 'daily' || activeReport === 'monthly') {
      reportText += `💰 *Total Revenue*: ₹${reportData.totalRevenue}\n`;
      reportText += `📦 *Total Transactions*: ${reportData.totalTransactions}\n\n`;
      reportText += `*Top Products*:\n`;
      reportData.sales?.slice(0, 5).forEach(sale => {
        reportText += `• ${sale.product_name}: ${sale.quantity_sold} units - ₹${sale.total_amount}\n`;
      });
    }

    reportText += `\n✉️ Generated from Stock Management System`;

    // Encode for WhatsApp URL
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(reportText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareReportViaOtherApps = () => {
    if (!reportData) {
      alert('No report data to share');
      return;
    }

    let reportText = `RAZA TRADERS - REPORT\n\n`;
    reportText += `Report Type: ${activeReport.toUpperCase()}\n`;
    reportText += `Generated: ${new Date().toLocaleString()}\n\n`;

    if (activeReport === 'daily' || activeReport === 'monthly') {
      reportText += `Total Revenue: ₹${reportData.totalRevenue}\n`;
      reportText += `Total Transactions: ${reportData.totalTransactions}\n\n`;
      reportText += `Top Products:\n`;
      reportData.sales?.slice(0, 5).forEach(sale => {
        reportText += `• ${sale.product_name}: ${sale.quantity_sold} units - ₹${sale.total_amount}\n`;
      });
    }

    // Use native share if available
    if (navigator.share) {
      navigator.share({
        title: 'Stock Management Report',
        text: reportText,
      }).catch(err => console.log('Share failed:', err));
    } else {
      alert('Sharing is not supported on this device. Please copy the report manually.');
      // Copy to clipboard as fallback
      navigator.clipboard.writeText(reportText);
      alert('Report copied to clipboard!');
    }
  };

  useEffect(() => {
    if (activeReport === 'daily') {
      fetchDailySalesReport();
    } else if (activeReport === 'monthly') {
      fetchMonthlySalesReport();
    } else if (activeReport === 'profit') {
      fetchProfitReport();
    } else if (activeReport === 'stock') {
      fetchStockReport();
    } else if (activeReport === 'performance') {
      fetchProductPerformanceReport();
    }
  }, [activeReport, selectedDate, selectedMonth]);

  return (
    <div>
      <h2>Reports</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${activeReport === 'daily' ? 'btn-primary' : 'btn-warning'}`}
            onClick={() => setActiveReport('daily')}
          >
            Daily Sales
          </button>
          <button 
            className={`btn ${activeReport === 'monthly' ? 'btn-primary' : 'btn-warning'}`}
            onClick={() => setActiveReport('monthly')}
          >
            Monthly Sales
          </button>
          <button 
            className={`btn ${activeReport === 'profit' ? 'btn-primary' : 'btn-warning'}`}
            onClick={() => setActiveReport('profit')}
          >
            Profit Report
          </button>
          <button 
            className={`btn ${activeReport === 'stock' ? 'btn-primary' : 'btn-warning'}`}
            onClick={() => setActiveReport('stock')}
          >
            Stock Report
          </button>
          <button 
            className={`btn ${activeReport === 'performance' ? 'btn-primary' : 'btn-warning'}`}
            onClick={() => setActiveReport('performance')}
          >
            Product Performance
          </button>
        </div>

        {/* Download and Share Buttons */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-success"
            onClick={downloadReportAsPDF}
            disabled={!reportData}
          >
            📥 Download Report
          </button>
          <button 
            className="btn btn-primary"
            onClick={shareReportViaWhatsApp}
            disabled={!reportData}
          >
            💬 Share via WhatsApp
          </button>
          <button 
            className="btn btn-warning"
            onClick={shareReportViaOtherApps}
            disabled={!reportData}
          >
            🔗 Share via Other Apps
          </button>
        </div>

        {activeReport === 'daily' && (
          <div style={{ marginBottom: '20px' }}>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ marginBottom: '10px' }}
            />
            {reportData && (
              <div>
                <h3>Daily Sales Report - {reportData.date}</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-label">Total Revenue</div>
                    <div className="stat-value">₹{reportData.totalRevenue?.toLocaleString()}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Total Transactions</div>
                    <div className="stat-value">{reportData.totalTransactions}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeReport === 'monthly' && (
          <div style={{ marginBottom: '20px' }}>
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ marginBottom: '10px' }}
            />
            {reportData && (
              <div>
                <h3>Monthly Sales Report - {reportData.month}</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-label">Total Revenue</div>
                    <div className="stat-value">₹{reportData.totalRevenue?.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {(activeReport === 'daily' || activeReport === 'monthly') && reportData?.sales && (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reportData.sales?.map((sale, idx) => (
                <tr key={idx}>
                  <td>{sale.product_name}</td>
                  <td>{sale.quantity_sold}</td>
                  <td>₹{sale.selling_price}</td>
                  <td>₹{sale.total_amount}</td>
                  <td>{new Date(sale.sale_date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeReport === 'profit' && reportData && (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Units Sold</th>
                <th>Revenue</th>
                <th>Profit</th>
                <th>Margin %</th>
              </tr>
            </thead>
            <tbody>
              {reportData?.map((row, idx) => (
                <tr key={idx}>
                  <td>{new Date(row.date).toLocaleDateString()}</td>
                  <td>{row.total_units_sold}</td>
                  <td>₹{row.revenue?.toLocaleString()}</td>
                  <td>₹{row.profit?.toLocaleString()}</td>
                  <td>{row.profit_margin}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeReport === 'stock' && reportData && (
          <div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Stock Value</div>
                <div className="stat-value">₹{reportData.totalStockValue?.toLocaleString()}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Low Stock Items</div>
                <div className="stat-value">{reportData.lowStockCount}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Medium Stock Items</div>
                <div className="stat-value">{reportData.mediumStockCount}</div>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Company</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {reportData.products?.map((product, idx) => (
                  <tr key={idx}>
                    <td>{product.product_name}</td>
                    <td>{product.company_name}</td>
                    <td>{product.stock_quantity}</td>
                    <td>
                      <span style={{ 
                        color: product.stock_status === 'LOW' ? 'red' : 'green',
                        fontWeight: 'bold'
                      }}>
                        {product.stock_status}
                      </span>
                    </td>
                    <td>₹{product.stock_value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'performance' && reportData && (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Company</th>
                <th>Total Sales</th>
                <th>Quantity</th>
                <th>Revenue</th>
                <th>Profit</th>
              </tr>
            </thead>
            <tbody>
              {reportData?.map((product, idx) => (
                <tr key={idx}>
                  <td>{product.product_name}</td>
                  <td>{product.company_name}</td>
                  <td>{product.total_sales}</td>
                  <td>{product.total_quantity}</td>
                  <td>₹{product.total_revenue?.toLocaleString()}</td>
                  <td>₹{product.total_profit?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Reports;
