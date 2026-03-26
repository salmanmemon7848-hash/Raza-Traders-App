# Raza Traders Frontend - Setup Instructions

## Debug Instructions

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm start
```

The app will open at http://localhost:3000

### 3. Configure API Connection
Ensure `.env` file in frontend folder has:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Features
- Dashboard with charts
- Product management (CRUD)
- Sales recording
- Reports and analytics
- Dark mode support
- Mobile responsive

## Available Pages
- `/` - Dashboard
- `/products` - Product Management
- `/sales` - Sales Recording
- `/reports` - Reports & Analytics
- `/settings` - Application Settings

## Build for Production
```bash
npm run build
```

## Troubleshooting

### API Not Responding
- Check if backend is running on port 5000
- Verify REACT_APP_API_URL in .env
- Check browser console for CORS errors

### Slow Loading
- Clear node_modules and reinstall
- Check network tab in DevTools
- Verify database query performance
