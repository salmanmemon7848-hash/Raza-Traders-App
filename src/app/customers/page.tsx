'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  MapPin, 
  History, 
  DollarSign,
  AlertCircle,
  X,
  UserPlus
} from 'lucide-react';

interface Bill {
  id: string;
  finalAmount: number;
  paidAmount: number;
  status: string;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  dues: number;
  totalSpent: number;
  bills: Bill[];
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`/api/customers?search=${search}`);
      const data = await res.json();
      setCustomers(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: '', phone: '', address: '' });
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalPendingDues = customers.reduce((acc, c) => acc + c.dues, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Customer Management</h2>
          <p className="text-gray-500">Track purchase history and pending dues</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <UserPlus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1 font-medium">Total Customers</p>
          <p className="text-3xl font-bold text-gray-900">{customers.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1 font-medium">Total Dues (Udhaar)</p>
          <p className="text-3xl font-bold text-red-600">₹{totalPendingDues.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1 font-medium">High Dues Customers</p>
          <p className="text-3xl font-bold text-orange-600">{customers.filter(c => c.dues > 0).length}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">No customers found.</div>
        ) : (
          customers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{customer.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Phone className="w-3 h-3" />
                        {customer.phone || 'N/A'}
                      </div>
                    </div>
                  </div>
                  {customer.dues > 0 && (
                    <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse">
                      <AlertCircle className="w-3 h-3" />
                      Udhaar
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{customer.address || 'No address provided'}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Total Spent</p>
                    <p className="text-sm font-bold text-gray-800">₹{customer.totalSpent.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Pending Dues</p>
                    <p className={`text-sm font-bold ${customer.dues > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₹{customer.dues.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                    <History className="w-3 h-3" />
                    History
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <DollarSign className="w-3 h-3" />
                    Payments
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Add New Customer</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  required
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
