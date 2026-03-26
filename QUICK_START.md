# Quick Start Guide for Raza Traders Stock Management System

## 📦 Installation (First Time Setup)

### Step 1: Setup Backend

```bash
cd backend
npm install
```

### Step 2: Setup PostgreSQL Database

1. Ensure PostgreSQL is installed and running
2. Create database:
   ```bash
   psql -U postgres
   CREATE DATABASE raza_traders;
   \c raza_traders
   ```
3. Import schema:
   ```bash
   psql -U postgres -d raza_traders -f ..\db\schema.sql
   ```

### Step 3: Start Backend Server

In a terminal, from `backend` folder:
```bash
npm start
```
✅ Backend runs on http://localhost:5000

### Step 4: Setup Frontend

In a new terminal, go to `frontend` folder:
```bash
npm install
npm start
```
✅ Frontend opens at http://localhost:3000

## 🎯 What You Can Do

### Dashboard
- View total sales, revenue, profit
- See daily sales trends
- Track top-selling products
- Monitor inventory value

### Products
- Add new products
- Set purchase & selling prices
- Manage stock levels
- Get low stock alerts

### Sales
- Record sales transactions
- Auto-update inventory
- View sales history

### Reports
- Generate daily sales reports
- Analyze monthly performance
- Check profit margins
- Review stock inventory
- Track product performance

## 🔧 Environment Setup

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

## 🚀 Running the Application

Open 2 terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Then open browser to http://localhost:3000

## 📊 Sample Data

The system comes with sample products:
- Samsung Washing Machine
- LG Refrigerator  
- Sony Television

You can edit, delete, or add more products from the Products page.

## ⚡ Tips

- 🌙 Use the moon icon in top-right to toggle dark mode
- 🔍 Search products by name or company
- ⚠️ Set low stock limits for alerts
- 📈 Charts update automatically as you add sales

---

**Need Help?** Check the main README.md for detailed documentation.
