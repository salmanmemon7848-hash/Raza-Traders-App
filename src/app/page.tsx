'use client';

import { useEffect, useState } from 'react';
import { 
  Package, 
  Receipt, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Clock,
  ChevronRight
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

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

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
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Welcome to Raza Traders</h2>
        <p className="text-gray-500">Here's what's happening today</p>
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
    </div>
  );
}
