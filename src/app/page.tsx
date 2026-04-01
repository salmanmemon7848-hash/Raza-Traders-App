'use client';

import { useEffect, useState } from 'react';
import { 
  Package, 
  Receipt, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  AlertTriangle,
  Clock,
  ChevronRight,
  Trash2,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalProducts: number;
  totalStockValue: number;
  totalSales: number;
  totalProfit: number;
  totalPendingAmount: number;
  todaySales: number;
  todayBillCount: number;
  todayProfit: number;
  monthlySales: number;
  lowStockItems: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        // Validate data structure
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          setStats(data);
        } else {
          console.error('Invalid dashboard data format');
          setStats(null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleReset = async () => {
    setResetting(true);
    setResetError(null);
    
    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmReset: true }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset data');
      }

      setResetSuccess(true);
      
      // Refresh dashboard data
      setTimeout(async () => {
        const dashboardRes = await fetch('/api/dashboard');
        const dashboardData = await dashboardRes.json();
        if (dashboardData && typeof dashboardData === 'object') {
          setStats(dashboardData);
        }
        setShowResetModal(false);
        setResetSuccess(false);
        setResetting(false);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setResetError(err.message || 'Failed to reset data. Please try again.');
      setResetting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;
  if (!stats) return <div>Error loading dashboard</div>;

  const cards = [
    { name: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Stock Value', value: `₹${stats.totalStockValue.toLocaleString()}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    { name: 'Total Sales', value: `₹${stats.totalSales.toLocaleString()}`, icon: Receipt, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'Total Profit', value: `₹${stats.totalProfit.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Pending Amount', value: `₹${stats.totalPendingAmount.toLocaleString()}`, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome to Raza Traders</h2>
          <p className="text-gray-500">Here's what's happening today</p>
        </div>
        <button
          onClick={() => setShowResetModal(true)}
          className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {cards.map((card) => (
          <div key={card.name} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`${card.bg} p-3 rounded-lg`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{card.name}</p>
                <p className="text-xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                Today's Overview
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Sales</p>
                <p className="text-2xl font-bold text-indigo-600">₹{stats.todaySales.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Bills Generated</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.todayBillCount}</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Today's Profit</p>
                <p className="text-2xl font-bold text-emerald-600">₹{stats.todayProfit.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-gray-100">
              <Link href="/billing" className="p-6 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors">
                <div className="p-3 bg-blue-50 rounded-full text-blue-600"><Receipt /></div>
                <span className="text-sm font-medium">New Bill</span>
              </Link>
              <Link href="/inventory" className="p-6 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors">
                <div className="p-3 bg-purple-50 rounded-full text-purple-600"><Package /></div>
                <span className="text-sm font-medium">Add Stock</span>
              </Link>
              <Link href="/customers" className="p-6 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors">
                <div className="p-3 bg-green-50 rounded-full text-green-600"><Users /></div>
                <span className="text-sm font-medium">Customers</span>
              </Link>
              <Link href="/reports" className="p-6 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors">
                <div className="p-3 bg-orange-50 rounded-full text-orange-600"><TrendingUp /></div>
                <span className="text-sm font-medium">Reports</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Low Stock Alerts
              </h3>
              <Link href="/inventory" className="text-xs text-indigo-600 hover:underline font-medium">View All</Link>
            </div>
            <div className="space-y-4">
              {stats.lowStockItems.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">All items are in stock!</p>
              ) : (
                stats.lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.companyName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">{item.quantity} left</p>
                      <p className="text-[10px] text-gray-400">Qty &lt; 5</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Reset All Data</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Error Message */}
              {resetError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{resetError}</span>
                </div>
              )}

              {/* Success Message */}
              {resetSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>All data has been reset successfully!</span>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-yellow-800 mb-2">This will delete:</p>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• All products and inventory</li>
                  <li>• All bills and sales records</li>
                  <li>• All customer information</li>
                </ul>
              </div>

              <p className="text-sm text-gray-600">
                Are you sure you want to continue? This will permanently erase all your data.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setResetError(null);
                    setResetSuccess(false);
                  }}
                  disabled={resetting}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={resetting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {resetting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Yes, Reset Everything
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
