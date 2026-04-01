'use client';

import { useEffect, useState } from 'react';
import { 
  History, 
  Search, 
  Calendar, 
  Filter, 
  Trash2, 
  Eye, 
  FileText,
  X,
  Printer,
  Receipt
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface Bill {
  id: string;
  customerName: string | null;
  customer: { name: string; phone: string | null } | null;
  total: number;
  discount: number;
  gst: number;
  finalAmount: number;
  paidAmount: number;
  status: string;
  createdAt: string;
  items: {
    id: string;
    product: { name: string };
    quantity: number;
    price: number;
  }[];
}

export default function SalesHistory() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const fetchBills = async () => {
    try {
      const res = await fetch(`/api/bills?search=${search}&fromDate=${fromDate}&toDate=${toDate}`);
      const data = await res.json();
      setBills(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [search, fromDate, toDate]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bill? This will not restore stock.')) return;
    try {
      const res = await fetch(`/api/bills/${id}`, { method: 'DELETE' });
      if (res.ok) fetchBills();
    } catch (err) {
      console.error(err);
    }
  };

  const generatePDF = (bill: Bill) => {
    const doc = new jsPDF() as any;
    const customerName = bill.customer?.name || bill.customerName || 'Cash Sale';

    doc.setFontSize(20);
    doc.text('RAZA TRADERS', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Sales Invoice', 105, 28, { align: 'center' });
    
    doc.line(10, 35, 200, 35);
    
    doc.setFontSize(12);
    doc.text(`Bill ID: ${bill.id.slice(-8).toUpperCase()}`, 10, 45);
    doc.text(`Customer: ${customerName}`, 10, 52);
    doc.text(`Date: ${new Date(bill.createdAt).toLocaleDateString()}`, 150, 45);
    doc.text(`Status: ${bill.status}`, 150, 52);
    
    const tableData = bill.items.map((item, idx) => [
      idx + 1,
      item.product.name,
      item.quantity,
      `₹${item.price.toLocaleString()}`,
      `₹${(item.price * item.quantity).toLocaleString()}`
    ]);

    doc.autoTable({
      startY: 65,
      head: [['#', 'Item Name', 'Qty', 'Price', 'Subtotal']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Subtotal: ₹${bill.total.toLocaleString()}`, 150, finalY);
    doc.text(`GST: ₹${bill.gst.toLocaleString()}`, 150, finalY + 7);
    doc.text(`Discount: ₹${bill.discount.toLocaleString()}`, 150, finalY + 14);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Grand Total: ₹${bill.finalAmount.toLocaleString()}`, 150, finalY + 24);

    doc.save(`invoice-${customerName}-${bill.id.slice(-6)}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Sales History</h2>
          <p className="text-gray-500">View and manage all your past bills</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Bill ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Total Items</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading bills...</td></tr>
              ) : bills.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No bills found.</td></tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(bill.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-400 uppercase">
                      #{bill.id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {bill.customer?.name || bill.customerName || 'Cash Sale'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {bill.items.reduce((acc, i) => acc + i.quantity, 0)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      ₹{bill.finalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        bill.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => setSelectedBill(bill)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => generatePDF(bill)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                        <FileText className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(bill.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Receipt className="w-6 h-6 text-indigo-500" />
                Bill Details - #{selectedBill.id.slice(-6).toUpperCase()}
              </h3>
              <button onClick={() => setSelectedBill(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Customer Info</p>
                  <p className="font-bold text-gray-900">{selectedBill.customer?.name || selectedBill.customerName || 'Cash Sale'}</p>
                  {selectedBill.customer?.phone && <p className="text-sm text-gray-500">{selectedBill.customer.phone}</p>}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Bill Summary</p>
                  <p className="text-sm text-gray-600">Date: {new Date(selectedBill.createdAt).toLocaleString()}</p>
                  <p className={`text-sm font-bold ${selectedBill.status === 'PAID' ? 'text-green-600' : 'text-red-600'}`}>{selectedBill.status}</p>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Item</th>
                      <th className="px-4 py-2 font-semibold">Price</th>
                      <th className="px-4 py-2 font-semibold">Qty</th>
                      <th className="px-4 py-2 font-semibold text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedBill.items.map(item => (
                      <tr key={item.id}>
                        <td className="px-4 py-2">{item.product.name}</td>
                        <td className="px-4 py-2">₹{item.price.toLocaleString()}</td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        <td className="px-4 py-2 text-right font-medium">₹{(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t font-bold">
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right">Total</td>
                      <td className="px-4 py-2 text-right">₹{selectedBill.total.toLocaleString()}</td>
                    </tr>
                    {selectedBill.gst > 0 && (
                      <tr className="text-gray-600">
                        <td colSpan={3} className="px-4 py-1 text-right text-xs">GST</td>
                        <td className="px-4 py-1 text-right text-xs">₹{selectedBill.gst.toLocaleString()}</td>
                      </tr>
                    )}
                    {selectedBill.discount > 0 && (
                      <tr className="text-red-600">
                        <td colSpan={3} className="px-4 py-1 text-right text-xs">Discount</td>
                        <td className="px-4 py-1 text-right text-xs">- ₹{selectedBill.discount.toLocaleString()}</td>
                      </tr>
                    )}
                    <tr className="text-lg text-indigo-600">
                      <td colSpan={3} className="px-4 py-2 text-right">Final Amount</td>
                      <td className="px-4 py-2 text-right">₹{selectedBill.finalAmount.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex gap-4">
                <button onClick={() => generatePDF(selectedBill)} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  <FileText className="w-4 h-4" />
                  Download PDF
                </button>
                <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Printer className="w-4 h-4" />
                  Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
