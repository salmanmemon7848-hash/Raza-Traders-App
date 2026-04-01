'use client';

import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Download, 
  Share2, 
  Calendar, 
  Filter, 
  FileText,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface DashboardStats {
  totalSales: number;
  totalProfit: number;
  totalPendingAmount: number;
  todaySales: number;
  todayProfit: number;
  monthlySales: number;
}

export default function Reports() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  const downloadReport = (type: string) => {
    const doc = new jsPDF() as any;
    doc.setFontSize(22);
    doc.text('RAZA TRADERS', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`${type} Report`, 105, 30, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 38, { align: 'center' });
    
    doc.line(10, 45, 200, 45);

    if (type === 'Sales Summary') {
      doc.autoTable({
        startY: 55,
        head: [['Metric', 'Value']],
        body: [
          ['Total Sales', `₹${stats?.totalSales.toLocaleString()}`],
          ['Total Profit', `₹${stats?.totalProfit.toLocaleString()}`],
          ['Total Pending', `₹${stats?.totalPendingAmount.toLocaleString()}`],
          ['Today\'s Sales', `₹${stats?.todaySales.toLocaleString()}`],
          ['Today\'s Profit', `₹${stats?.todayProfit.toLocaleString()}`],
          ['This Month Sales', `₹${stats?.monthlySales.toLocaleString()}`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
      });
    }

    doc.save(`${type.toLowerCase()}-report-${Date.now()}.pdf`);
  };

  const chartData = [
    { name: 'Mon', sales: 4000, profit: 2400 },
    { name: 'Tue', sales: 3000, profit: 1398 },
    { name: 'Wed', sales: 2000, profit: 9800 },
    { name: 'Thu', sales: 2780, profit: 3908 },
    { name: 'Fri', sales: 1890, profit: 4800 },
    { name: 'Sat', sales: 2390, profit: 3800 },
    { name: 'Sun', sales: 3490, profit: 4300 },
  ];

  const pieData = [
    { name: 'Electronics', value: 400 },
    { name: 'Clothing', value: 300 },
    { name: 'Groceries', value: 300 },
    { name: 'Others', value: 200 },
  ];

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) return <div>Loading reports...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Business Reports</h2>
          <p className="text-gray-500">Analyze your shop performance</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => downloadReport('Sales Summary')} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Download Summary
          </button>
          <button className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Share2 className="w-4 h-4" />
            Share via WhatsApp
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 font-medium">Monthly Sales</p>
            <ArrowUpRight className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{stats?.monthlySales.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1 font-bold">+12.5% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 font-medium">Monthly Profit</p>
            <ArrowUpRight className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">₹{((stats?.totalProfit || 0) * 0.4).toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1 font-bold">+8.2% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 font-medium">Average Bill Value</p>
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">₹2,450</p>
          <p className="text-xs text-red-600 mt-1 font-bold">-2.1% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 font-medium">Return Rate</p>
            <ArrowDownRight className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">1.2%</p>
          <p className="text-xs text-green-600 mt-1 font-bold">-0.5% from last month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              Sales & Profit Trend
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded bg-indigo-500" />
                Sales
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                Profit
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sales" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-8 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-indigo-500" />
            Top Categories
          </h3>
          <div className="h-[300px] w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-1/3 space-y-4">
              {pieData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                    <span className="text-xs text-gray-500 font-medium">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900">{((item.value / 1200) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
