const pool = require('../config/database');

// Mock data
const mockProducts = [
  { id: 1, product_name: 'Dell XPS 13', stock_quantity: 15 },
  { id: 2, product_name: 'HP Pavilion', stock_quantity: 8 },
  { id: 3, product_name: 'ThinkPad X1', stock_quantity: 3 },
  { id: 4, product_name: 'MacBook Air', stock_quantity: 12 },
  { id: 5, product_name: 'ASUS VivoBook', stock_quantity: 20 }
];

let mockSales = [
  { id: 1, product_id: 1, product_name: 'Dell XPS 13', quantity_sold: 2, selling_price: 999.99, total_amount: 1999.98, sale_date: new Date(Date.now() - 2*24*60*60*1000) },
  { id: 2, product_id: 2, product_name: 'HP Pavilion', quantity_sold: 1, selling_price: 699.99, total_amount: 699.99, sale_date: new Date(Date.now() - 1*24*60*60*1000) },
  { id: 3, product_id: 4, product_name: 'MacBook Air', quantity_sold: 1, selling_price: 1299.99, total_amount: 1299.99, sale_date: new Date() },
  { id: 4, product_id: 5, product_name: 'ASUS VivoBook', quantity_sold: 3, selling_price: 799.99, total_amount: 2399.97, sale_date: new Date() }
];

// Record a sale
exports.recordSale = async (req, res) => {
  try {
    const { product_id, quantity_sold, selling_price } = req.body;
    
    if (!product_id || !quantity_sold || !selling_price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Get product
        const productResult = await client.query('SELECT * FROM products WHERE id = $1', [product_id]);
        if (productResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: 'Product not found' });
        }
        
        const product = productResult.rows[0];
        
        // Check stock availability
        if (product.stock_quantity < quantity_sold) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Insufficient stock' });
        }
        
        // Update stock
        await client.query(
          'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
          [quantity_sold, product_id]
        );
        
        // Record sale
        const total_amount = selling_price * quantity_sold;
        const saleResult = await client.query(
          `INSERT INTO sales (product_id, product_name, quantity_sold, selling_price, total_amount, sale_date)
           VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
           RETURNING *`,
          [product_id, product.product_name, quantity_sold, selling_price, total_amount]
        );
        
        await client.query('COMMIT');
        res.status(201).json(saleResult.rows[0]);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (dbError) {
      // Database unavailable, use mock data
      const product = mockProducts.find(p => p.id === product_id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      if (product.stock_quantity < quantity_sold) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }
      
      // Update mock stock
      product.stock_quantity -= quantity_sold;
      
      // Create new mock sale
      const newId = Math.max(...mockSales.map(s => s.id)) + 1;
      const total_amount = selling_price * quantity_sold;
      const newSale = {
        id: newId,
        product_id,
        product_name: product.product_name,
        quantity_sold,
        selling_price: parseFloat(selling_price),
        total_amount,
        sale_date: new Date()
      };
      
      mockSales.push(newSale);
      res.status(201).json(newSale);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to record sale' });
  }
};

// Get all sales
exports.getSales = async (req, res) => {
  try {
    const { startDate, endDate, limit = 50, offset = 0 } = req.query;
    
    try {
      let query = 'SELECT * FROM sales WHERE 1=1';
      const params = [];
      
      if (startDate) {
        query += ` AND sale_date >= $${params.length + 1}`;
        params.push(startDate);
      }
      
      if (endDate) {
        query += ` AND sale_date <= $${params.length + 1}`;
        params.push(endDate);
      }
      
      query += ` ORDER BY sale_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (dbError) {
      // Database unavailable, use mock data
      let filtered = mockSales;
      
      if (startDate) {
        const start = new Date(startDate);
        filtered = filtered.filter(s => new Date(s.sale_date) >= start);
      }
      
      if (endDate) {
        const end = new Date(endDate);
        filtered = filtered.filter(s => new Date(s.sale_date) <= end);
      }
      
      const paginated = filtered.sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date)).slice(offset, offset + limit);
      res.json(paginated);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
};

// Get sales by date range
exports.getSalesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    
    try {
      const result = await pool.query(
        `SELECT * FROM sales 
         WHERE sale_date BETWEEN $1 AND $2
         ORDER BY sale_date DESC`,
        [startDate, endDate]
      );
      
      res.json(result.rows);
    } catch (dbError) {
      // Use mock data
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const filtered = mockSales.filter(s => {
        const saleDate = new Date(s.sale_date);
        return saleDate >= start && saleDate <= end;
      }).sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date));
      
      res.json(filtered);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
};
