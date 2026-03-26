const pool = require('../config/database');

// Mock products data
const mockProducts = [
  { id: 1, product_name: 'Dell XPS 13', company_name: 'Dell', model_number: 'XPS13-9310', purchase_price: 800, selling_price: 999.99, stock_quantity: 15, low_stock_limit: 5, created_at: new Date(), updated_at: new Date() },
  { id: 2, product_name: 'HP Pavilion', company_name: 'HP', model_number: 'PAV15-EG', purchase_price: 500, selling_price: 699.99, stock_quantity: 8, low_stock_limit: 5, created_at: new Date(), updated_at: new Date() },
  { id: 3, product_name: 'ThinkPad X1', company_name: 'Lenovo', model_number: 'X1C-GEN9', purchase_price: 1200, selling_price: 1599.99, stock_quantity: 3, low_stock_limit: 5, created_at: new Date(), updated_at: new Date() },
  { id: 4, product_name: 'MacBook Air', company_name: 'Apple', model_number: 'MBA-M1', purchase_price: 1000, selling_price: 1299.99, stock_quantity: 12, low_stock_limit: 3, created_at: new Date(), updated_at: new Date() },
  { id: 5, product_name: 'ASUS VivoBook', company_name: 'ASUS', model_number: 'VB15K', purchase_price: 600, selling_price: 799.99, stock_quantity: 20, low_stock_limit: 5, created_at: new Date(), updated_at: new Date() }
];

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { search, sortBy = 'product_name', order = 'ASC', limit = 50, offset = 0 } = req.query;
    
    try {
      const { search, sortBy = 'product_name', order = 'ASC', limit = 50, offset = 0 } = req.query;
      
      let query = 'SELECT * FROM products WHERE 1=1';
      const params = [];
      
      if (search) {
        query += ` AND (product_name ILIKE $${params.length + 1} OR company_name ILIKE $${params.length + 1})`;
        params.push(`%${search}%`);
      }
      
      query += ` ORDER BY ${sortBy} ${order} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (dbError) {
      // Database unavailable, use mock data
      let filtered = mockProducts;
      
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(p => 
          p.product_name.toLowerCase().includes(searchLower) || 
          p.company_name.toLowerCase().includes(searchLower)
        );
      }
      
      const sorted = filtered.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        return order === 'ASC' 
          ? (aVal > bVal ? 1 : -1)
          : (aVal < bVal ? 1 : -1);
      });
      
      const paginated = sorted.slice(offset, offset + limit);
      res.json(paginated);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    try {
      const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json(result.rows[0]);
    } catch (dbError) {
      // Database unavailable, use mock data
      const product = mockProducts.find(p => p.id === parseInt(id));
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// Add product
exports.addProduct = async (req, res) => {
  try {
    const { product_name, company_name, model_number, purchase_price, selling_price, stock_quantity, low_stock_limit } = req.body;
    
    if (!product_name || !company_name || !purchase_price || !selling_price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
      const query = `
        INSERT INTO products (product_name, company_name, model_number, purchase_price, selling_price, stock_quantity, low_stock_limit)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        product_name,
        company_name,
        model_number || null,
        purchase_price,
        selling_price,
        stock_quantity || 0,
        low_stock_limit || 10
      ]);
      
      res.status(201).json(result.rows[0]);
    } catch (dbError) {
      // Database unavailable, use mock data
      const newId = Math.max(...mockProducts.map(p => p.id)) + 1;
      const newProduct = {
        id: newId,
        product_name,
        company_name,
        model_number: model_number || null,
        purchase_price: parseFloat(purchase_price),
        selling_price: parseFloat(selling_price),
        stock_quantity: stock_quantity || 0,
        low_stock_limit: low_stock_limit || 10,
        created_at: new Date(),
        updated_at: new Date()
      };
      mockProducts.push(newProduct);
      res.status(201).json(newProduct);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add product' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, company_name, model_number, purchase_price, selling_price, stock_quantity, low_stock_limit } = req.body;
    
    try {
      const query = `
        UPDATE products
        SET product_name = $1, company_name = $2, model_number = $3, purchase_price = $4, 
            selling_price = $5, stock_quantity = $6, low_stock_limit = $7, updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        product_name,
        company_name,
        model_number || null,
        purchase_price,
        selling_price,
        stock_quantity,
        low_stock_limit,
        id
      ]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json(result.rows[0]);
    } catch (dbError) {
      // Use mock data
      const product = mockProducts.find(p => p.id === parseInt(id));
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      product.product_name = product_name || product.product_name;
      product.company_name = company_name || product.company_name;
      product.model_number = model_number !== undefined ? model_number : product.model_number;
      product.purchase_price = purchase_price || product.purchase_price;
      product.selling_price = selling_price || product.selling_price;
      product.stock_quantity = stock_quantity !== undefined ? stock_quantity : product.stock_quantity;
      product.low_stock_limit = low_stock_limit || product.low_stock_limit;
      product.updated_at = new Date();
      
      res.json(product);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    try {
      const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json({ message: 'Product deleted successfully' });
    } catch (dbError) {
      // Use mock data
      const index = mockProducts.findIndex(p => p.id === parseInt(id));
      if (index === -1) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      mockProducts.splice(index, 1);
      res.json({ message: 'Product deleted successfully' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

// Get low stock products
exports.getLowStockProducts = async (req, res) => {
  try {
    try {
      const query = `
        SELECT * FROM products 
        WHERE stock_quantity <= low_stock_limit 
        ORDER BY stock_quantity ASC
      `;
      
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (dbError) {
      // Use mock data
      const lowStock = mockProducts.filter(p => p.stock_quantity <= p.low_stock_limit)
        .sort((a, b) => a.stock_quantity - b.stock_quantity);
      res.json(lowStock);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch low stock products' });
  }
};
