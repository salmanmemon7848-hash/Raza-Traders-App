import React, { useState, useEffect } from 'react';
import { dashboardApi, productApi } from '../services/api';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [dailySales, setDailySales] = useState(null);
  const [monthlyProfit, setMonthlyProfit] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, dailyRes, monthlyRes, lowStockRes] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getDailySales(7),
          dashboardApi.getMonthlyProfit(),
          productApi.getLowStock(),
        ]);

        setStats(statsRes.data);
        setDailySales(dailyRes.data);
        setMonthlyProfit(monthlyRes.data);
        setLowStockItems(lowStockRes.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="card"><p>Loading dashboard...</p></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const dailyChartData = {
    labels: dailySales?.map(d => new Date(d.date).toLocaleDateString()) || [],
    datasets: [
      {
        label: 'Daily Revenue',
        data: dailySales?.map(d => d.revenue) || [],
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const monthlyChartData = {
    labels: monthlyProfit?.map(m => new Date(m.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })) || [],
    datasets: [
      {
        label: 'Monthly Profit',
        data: monthlyProfit?.map(m => m.profit) || [],
        backgroundColor: '#27ae60',
        borderColor: '#229954',
        borderWidth: 1,
      },
    ],
  };

  const bestSellingChartData = {
    labels: stats?.bestSelling?.map(p => p.product_name) || [],
    datasets: [
      {
        label: 'Sales Revenue',
        data: stats?.bestSelling?.map(p => p.revenue) || [],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
        ],
      },
    ],
  };

  return (
    <div>
      <h2>Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Sales</div>
          <div className="stat-value">{stats?.totalSales || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">₹{stats?.totalRevenue?.toLocaleString() || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Profit</div>
          <div className="stat-value" style={{ color: '#27ae60' }}>₹{stats?.totalProfit?.toLocaleString() || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Today's Sales</div>
          <div className="stat-value">{stats?.todaySales || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Inventory Value</div>
          <div className="stat-value">₹{stats?.inventoryValue?.toLocaleString() || 0}</div>
        </div>
      </div>

      {/* Low Stock Items Section */}
      {lowStockItems.length > 0 && (
        <div className="card" style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #ffc107' }}>
          <h3 style={{ color: '#e74c3c', marginBottom: '15px' }}>⚠️ Low Stock Alert ({lowStockItems.length} items)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
            {lowStockItems.map(item => (
              <div 
                key={item.id} 
                style={{
                  backgroundColor: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '2px solid #e74c3c',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, color: '#333' }}>{item.product_name}</h4>
                  <p style={{ margin: '5px 0', color: '#666', fontSize: '12px' }}>{item.company_name}</p>
                </div>
                <div style={{ marginBottom: '10px', fontSize: '14px' }}>
                  <div><strong>Current Stock:</strong> <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>{item.stock_quantity}</span></div>
                  <div><strong>Min. Level:</strong> {item.low_stock_limit}</div>
                </div>
                <button 
                  className="btn btn-warning"
                  style={{ width: '100%' }}
                  onClick={() => alert(`Restock for ${item.product_name} - Feature coming soon`)}
                >
                  🔄 Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3>Daily Sales (Last 7 Days)</h3>
        <Line data={dailyChartData} />
      </div>

      <div className="card">
        <h3>Monthly Profit</h3>
        <Bar data={monthlyChartData} />
      </div>

      <div className="card">
        <h3>Top Selling Products</h3>
        <Pie data={bestSellingChartData} />
      </div>
    </div>
  );
}

export default Dashboard;
