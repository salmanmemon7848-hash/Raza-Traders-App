# Raza Traders Stock Management System

A professional, full-featured stock management web application for retail shops. Built with React, Node.js/Express, and PostgreSQL to handle large inventories efficiently.

## 🎯 Features

### Product Management
- ✅ Add, edit, delete, and search products
- ✅ Manage product details: name, company, model, purchase price, selling price
- ✅ Real-time stock tracking
- ✅ Low stock alerts and warnings
- ✅ Automatic duplicate prevention

### Stock Management
- ✅ Automatic stock updates on sales
- ✅ Prevent negative stock
- ✅ Low stock warnings (configurable threshold)
- ✅ Inventory value tracking

### Sales Management
- ✅ Quick sale recording
- ✅ Automatic stock deduction
- ✅ Sales history with filters
- ✅ Transaction tracking

### Business Dashboard
- 📊 Real-time statistics
  - Total sales count
  - Total revenue
  - Total profit
  - Today's sales
  - Inventory value
- 📈 Interactive charts
  - Daily sales trends (last 7 days)
  - Monthly profit analysis
  - Top selling products (pie chart)

### Reports & Analytics
- 📋 Daily Sales Report
- 📋 Monthly Sales Report
- 📊 Profit Analysis Report
- 📦 Current Stock Report
- 🏆 Product Performance Report

### User Interface
- 📱 Fully responsive design
- 🌙 Dark mode support
- ⚡ Fast loading times
- 🎨 Clean and intuitive UI

## 🛠️ Tech Stack

- **Frontend**: React 18, Chart.js, React Router
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (handles 50,000+ products efficiently)
- **Styling**: CSS3 with responsive design
- **API Communication**: Axios

## 📋 Prerequisites

- Node.js v14+ and npm
- PostgreSQL v12+
- Git

## 🚀 Installation

### 1. Clone/Setup Project
```bash
cd "Raza Traders App"
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure database (create .env file if not exists)
# Edit .env with your PostgreSQL credentials
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=raza_traders

# Create database and tables
psql -U postgres -d raza_traders -f ../db/schema.sql

# Start backend server
npm start
# Server runs on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm start
# App opens at http://localhost:3000
```

## 📖 Usage

### Access the Application
- Frontend: http://localhost:3000
- API: http://localhost:5000/api

### Dashboard
- View real-time statistics
- Monitor daily and monthly trends
- Track top-selling products

### Product Management
- Add new products with purchase and selling prices
- Set low stock thresholds
- Search and edit products
- Receive alerts for low stock

### Record Sales
- Select product and quantity
- Sales automatically update inventory
- View complete sales history

### Generate Reports
- Daily sales breakdown
- Monthly performance analysis
- Profit calculations
- Stock valuations
- Product performance metrics

### Settings
- Configure application preferences
- Manage shop details
- Set notification preferences

## 📊 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/low-stock` - Get low stock products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Sales
- `POST /api/sales` - Record a sale
- `GET /api/sales` - Get all sales
- `GET /api/sales/:startDate/:endDate` - Get sales by date range

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/daily-sales` - Get daily sales data
- `GET /api/dashboard/monthly-profit` - Get monthly profit data

### Reports
- `GET /api/reports/daily-sales` - Daily sales report
- `GET /api/reports/monthly-sales` - Monthly sales report
- `GET /api/reports/profit` - Profit report
- `GET /api/reports/stock` - Stock inventory report
- `GET /api/reports/product-performance` - Product performance report

## 🔧 Configuration

### Backend (.env)
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=raza_traders
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 📁 Project Structure

```
Raza Traders App/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── products.js
│   │   ├── sales.js
│   │   ├── dashboard.js
│   │   └── reports.js
│   ├── routes/
│   │   ├── products.js
│   │   ├── sales.js
│   │   ├── dashboard.js
│   │   └── reports.js
│   ├── db/
│   │   └── schema.sql
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Products.js
│   │   │   ├── Sales.js
│   │   │   ├── Reports.js
│   │   │   └── Settings.js
│   │   ├── components/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   └── App.css
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── .env
└── db/
    └── schema.sql
```

## 🎨 Features Highlights

### Performance Optimization
- ✅ Indexed database queries for 50,000+ products
- ✅ Pagination for large datasets
- ✅ Efficient SQL queries
- ✅ Lazy loading of data

### Security
- ✅ Input validation
- ✅ Error handling
- ✅ Transaction support for sales consistency
- ✅ CORS enabled for API

### User Experience
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode toggle
- ✅ Real-time notifications
- ✅ Quick search functionality
- ✅ Bulk operations

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check connection credentials in .env
- Verify database exists: Run schema.sql

### Frontend Not Loading
- Clear browser cache
- Ensure backend is running on port 5000
- Check REACT_APP_API_URL in .env

### API Timeouts
- Check database query performance
- Increase pagination limits if needed
- Monitor server logs

## 📝 License

This project is proprietary to Raza Traders.

## 👨‍💻 Support

For issues and questions, contact the development team.

## 🎓 Sample Data

The database comes with sample products:
- Samsung Washing Machine
- LG Refrigerator
- Sony Television

Modify or delete these entries as needed.

---

**Version**: 1.0.0  
**Last Updated**: March 2026
