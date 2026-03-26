# Raza Traders Backend - Setup Instructions

## Debug Instructions

### 1. Start Backend Server
```bash
cd backend
npm install
npm start
```

### 2. Setup Database
Before running the server, create PostgreSQL database:
```bash
psql -U postgres
CREATE DATABASE raza_traders;
\c raza_traders
```

Then run schema:
```bash
psql -U postgres -d raza_traders -f db/schema.sql
```

### 3. Environment Variables
Ensure `.env` file in backend folder has:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=raza_traders
```

### 4. Test API
```bash
# Health check
curl http://localhost:5000/api/health

# Get all products
curl http://localhost:5000/api/products
```

## Development Mode
For automatic restart on file changes:
```bash
npm run dev
```

## API Base URL
http://localhost:5000/api
