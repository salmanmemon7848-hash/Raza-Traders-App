const pool = require('../config/database');

// Mock sales data
const mockSales = [
  { id: 1, product_id: 1, product_name: 'Dell XPS 13', quantity_sold: 2, selling_price: 999.99, total_amount: 1999.98, sale_date: new Date(Date.now() - 2*24*60*60*1000) },
  { id: 2, product_id: 2, product_name: 'HP Pavilion', quantity_sold: 1, selling_price: 699.99, total_amount: 699.99, sale_date: new Date(Date.now() - 1*24*60*60*1000) },
  { id: 3, product_id: 4, product_name: 'MacBook Air', quantity_sold: 1, selling_price: 1299.99, total_amount: 1299.99, sale_date: new Date() },
  { id: 4, product_id: 5, product_name: 'ASUS VivoBook', quantity_sold: 3, selling_price: 799.99, total_amount: 2399.97, sale_date: new Date() }
];

const mockProducts = [
  { id: 1, product_name: 'Dell XPS 13', company_name: 'Dell', purchase_price: 800, selling_price: 999.99, stock_quantity: 15 },
  { id: 2, product_name: 'HP Pavilion', company_name: 'HP', purchase_price: 500, selling_price: 699.99, stock_quantity: 8 },
  { id: 3, product_name: 'ThinkPad X1', company_name: 'Lenovo', purchase_price: 1200, selling_price: 1599.99, stock_quantity: 3 },
  { id: 4, product_name: 'MacBook Air', company_name: 'Apple', purchase_price: 1000, selling_price: 1299.99, stock_quantity: 12 },
  { id: 5, product_name: 'ASUS VivoBook', company_name: 'ASUS', purchase_price: 600, selling_price: 799.99, stock_quantity: 20 }
];

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    try {
      // Try to get stats from database
      // Total Sales Count
      const totalSalesResult = await pool.query('SELECT COUNT(*) as total FROM sales');
      const totalSales = parseInt(totalSalesResult.rows[0].total);
      
      // Total Revenue
      const totalRevenueResult = await pool.query('SELECT SUM(total_amount) as total FROM sales');
      const totalRevenue = parseFloat(totalRevenueResult.rows[0].total) || 0;
      
      // Total Profit
      const profitResult = await pool.query(`
        SELECT SUM((s.selling_price - p.purchase_price) * s.quantity_sold) as total_profit
        FROM sales s
        JOIN products p ON s.product_id = p.id
      `);
      const totalProfit = parseFloat(profitResult.rows[0].total_profit) || 0;
      
      // Today's Sales
      const todayResult = await pool.query(`
        SELECT COUNT(*) as count FROM sales WHERE DATE(sale_date) = CURRENT_DATE
      `);
      const todaySales = parseInt(todayResult.rows[0].count);
      
      // Best Selling Products
      const bestSellingResult = await pool.query(`
        SELECT product_name, SUM(quantity_sold) as total_quantity, SUM(total_amount) as revenue
        FROM sales
        GROUP BY product_name
        ORDER BY total_quantity DESC
        LIMIT 5
      `);
      
      // Inventory Value
      const inventoryResult = await pool.query(`
        SELECT SUM(purchase_price * stock_quantity) as total_value
        FROM products
      `);
      
      res.json({
        totalSales,
        totalRevenue: totalRevenue.toFixed(2),
        totalProfit: totalProfit.toFixed(2),
        todaySales,
        bestSelling: bestSellingResult.rows,
        inventoryValue: parseFloat(inventoryResult.rows[0].total_value || 0).toFixed(2)
      });
    } catch (dbError) {
      // Database unavailable, use mock data
      const totalSales = mockSales.length;
      const totalRevenue = mockSales.reduce((sum, s) => sum + s.total_amount, 0);
      const totalProfit = mockSales.reduce((sum, s) => {
        const product = mockProducts.find(p => p.id === s.product_id);
        return sum + ((s.selling_price - (product?.purchase_price || 0)) * s.quantity_sold);
      }, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaySales = mockSales.filter(s => new Date(s.sale_date) >= today).length;
      
      const bestSelling = mockSales.reduce((acc, s) => {
        const existing = acc.find(item => item.product_name === s.product_name);
        if (existing) {
          existing.total_quantity += s.quantity_sold;
          existing.revenue += s.total_amount;
        } else {
          acc.push({
            product_name: s.product_name,
            total_quantity: s.quantity_sold,
            revenue: s.total_amount
          });
        }
        return acc;
      }, []).sort((a, b) => b.total_quantity - a.total_quantity).slice(0, 5);
      
      const inventoryValue = mockProducts.reduce((sum, p) => sum + (p.purchase_price * p.stock_quantity), 0);
      
      res.json({
        totalSales,
        totalRevenue: totalRevenue.toFixed(2),
        totalProfit: totalProfit.toFixed(2),
        todaySales,
        bestSelling,
        inventoryValue: inventoryValue.toFixed(2)
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

// Get daily sales data
exports.getDailySales = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    try {
      const result = await pool.query(`
        SELECT DATE(sale_date) as date, COUNT(*) as sales_count, SUM(total_amount) as revenue
        FROM sales
        WHERE sale_date >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY DATE(sale_date)
        ORDER BY date DESC
      `);
      
      res.json(result.rows);
    } catch (dbError) {
      // Use mock data
      const daysNum = parseInt(days) || 30;
      const mockData = [];
      
      for (let i = 0; i < daysNum; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const daySales = mockSales.filter(s => new Date(s.sale_date).toISOString().split('T')[0] === dateStr);
        if (daySales.length > 0) {
          mockData.push({
            date: dateStr,
            sales_count: daySales.length,
            revenue: daySales.reduce((sum, s) => sum + s.total_amount, 0).toFixed(2)
          });
        }
      }
      
      res.json(mockData);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch daily sales' });
  }
};

// Get monthly profit
exports.getMonthlyProfit = async (req, res) => {
  try {
    try {
      const result = await pool.query(`
        SELECT 
          DATE_TRUNC('month', s.sale_date)::DATE as month,
          SUM((s.selling_price - p.purchase_price) * s.quantity_sold) as profit
        FROM sales s
        JOIN products p ON s.product_id = p.id
        GROUP BY DATE_TRUNC('month', s.sale_date)
        ORDER BY month DESC
        LIMIT 12
      `);
      
      res.json(result.rows);
    } catch (dbError) {
      // Use mock data
      const mockData = [];
      const currentDate = new Date();
      
      for (let i = 0; i < 12; i++) {
        const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthStr = month.toISOString().split('T')[0].slice(0, 7) + '-01';
        
        const monthSales = mockSales.filter(s => new Date(s.sale_date).toISOString().split('T')[0].slice(0, 7) === monthStr.slice(0, 7));
        const profit = monthSales.reduce((sum, s) => {
          const product = mockProducts.find(p => p.id === s.product_id);
          return sum + ((s.selling_price - (product?.purchase_price || 0)) * s.quantity_sold);
        }, 0);
        
        if (profit > 0) {
          mockData.push({
            month: monthStr,
            profit: profit.toFixed(2)
          });
        }
      }
      
      res.json(mockData);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch monthly profit' });
  }
};
