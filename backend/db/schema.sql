-- Create Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  model_number VARCHAR(100),
  purchase_price DECIMAL(10, 2) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_limit INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_name, company_name, model_number)
);

-- Create Sales table
CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  quantity_sold INTEGER NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products(product_name);
CREATE INDEX IF NOT EXISTS idx_products_company ON products(company_name);
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);

-- Insert sample data
INSERT INTO products (product_name, company_name, model_number, purchase_price, selling_price, stock_quantity, low_stock_limit)
VALUES 
  ('Washing Machine', 'Samsung', 'WM-2024', 15000, 18000, 25, 5),
  ('Refrigerator', 'LG', 'RF-100', 22000, 26000, 12, 3),
  ('Television', 'Sony', 'TV-55', 35000, 42000, 8, 2)
ON CONFLICT DO NOTHING;
