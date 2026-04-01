'use client';

import { useState } from 'react';
import { 
  Settings, 
  Database, 
  Download, 
  Upload, 
  Shield, 
  Bell, 
  User, 
  Receipt,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // In a real app, this would fetch all data from API
      const products = await fetch('/api/products').then(res => res.json());
      const customers = await fetch('/api/customers').then(res => res.json());
      const bills = await fetch('/api/bills').then(res => res.json());
      
      const data = { products, customers, bills, exportedAt: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `raza-traders-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      setMessage({ text: 'Backup exported successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: 'Failed to export backup.', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsRestoring(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        console.log('Restoring data:', data);
        // In a real app, you would send this to an API to overwrite the DB
        alert('Data restore functionality requires server-side implementation. Data parsed successfully!');
        setMessage({ text: 'Data parsed successfully! (Server update pending)', type: 'success' });
      } catch (err) {
        setMessage({ text: 'Invalid backup file.', type: 'error' });
      } finally {
        setIsRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
        <p className="text-gray-500">Manage your application and data</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-500" />
              Data Backup & Restore
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-800">Export All Data</p>
                  <p className="text-xs text-gray-500">Download a JSON backup of your data</p>
                </div>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-800">Restore from Backup</p>
                  <p className="text-xs text-gray-500">Upload a previous backup file</p>
                </div>
                <label className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
                  <Upload className="w-5 h-5" />
                  <input type="file" className="hidden" accept=".json" onChange={handleRestore} disabled={isRestoring} />
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-500" />
              Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 font-medium">Low Stock Alerts</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-indigo-600 rounded cursor-pointer" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 font-medium">Daily Sales Summary</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-indigo-600 rounded cursor-pointer" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 font-medium">Pending Payment Reminders</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-indigo-600 rounded cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-500" />
              Shop Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Shop Name</label>
                <input
                  type="text"
                  defaultValue="Raza Traders"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tax Percentage (GST %)</label>
                <input
                  type="number"
                  defaultValue="18"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Default Currency</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                  <option>INR (₹)</option>
                  <option>USD ($)</option>
                  <option>PKR (Rs.)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" />
              Account Settings
            </h3>
            <div className="space-y-4">
              <button className="w-full px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                Change Password
              </button>
              <button className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-bold">
                Logout System
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-100 text-center">
        <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">
          Raza Traders v1.0 • Made By <span className="text-indigo-600">Salman Memon</span>
        </p>
      </div>
    </div>
  );
}
