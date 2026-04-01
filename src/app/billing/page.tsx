'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  User, 
  Receipt, 
  Printer, 
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  Package,
  PlusCircle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface Product {
  id: string;
  name: string;
  companyName: string;
  sellingPrice: number;
  purchasePrice: number;
  quantity: number;
}

interface BillItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  maxQuantity: number;
}

export default function Billing() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [gstPercent, setGstPercent] = useState(0);
  const [status, setStatus] = useState('PAID'); // PAID, UNPAID
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Product Modal State
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    companyName: 'General',
    sellingPrice: '',
    purchasePrice: '',
    quantity: '100' // Default stock for newly added items
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      // Ensure data is an array
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addItem = (product: Product) => {
    const existingItem = billItems.find(item => item.productId === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        alert('Insufficient stock!');
        return;
      }
      setBillItems(billItems.map(item => 
        item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      if (product.quantity <= 0) {
        alert('Product out of stock!');
        return;
      }
      setBillItems([...billItems, { 
        productId: product.id, 
        name: product.name, 
        price: product.sellingPrice, 
        quantity: 1,
        maxQuantity: product.quantity
      }]);
    }
    setSearchQuery('');
  };

  const removeItem = (productId: string) => {
    setBillItems(billItems.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, qty: number) => {
    const item = billItems.find(i => i.productId === productId);
    if (!item) return;
    if (qty > item.maxQuantity) {
      alert(`Only ${item.maxQuantity} units available!`);
      return;
    }
    if (qty < 1) return removeItem(productId);
    setBillItems(billItems.map(i => i.productId === productId ? { ...i, quantity: qty } : i));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      if (res.ok) {
        const addedProduct = await res.json();
        setProducts([...products, addedProduct]);
        addItem(addedProduct); // Automatically select it
        setIsAddProductModalOpen(false);
        setNewProduct({ name: '', companyName: 'General', sellingPrice: '', purchasePrice: '', quantity: '100' });
      } else {
        alert('Failed to add product');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding product');
    }
  };

  const subtotal = billItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const gstAmount = (subtotal * gstPercent) / 100;
  const finalAmount = subtotal + gstAmount - discount;

  const handleSaveBill = async () => {
    if (billItems.length === 0) return alert('Add some items first!');
    setIsSaving(true);
    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName || 'Cash Sale',
          items: billItems,
          total: subtotal,
          discount,
          gst: gstAmount,
          finalAmount,
          paidAmount: status === 'PAID' ? finalAmount : 0,
          status,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        fetchProducts(); // Refresh stock
        setTimeout(() => {
          setSaveSuccess(false);
          setBillItems([]);
          setDiscount(0);
          setGstPercent(0);
          setCustomerName('');
        }, 2000);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save bill');
      }
    } catch (err) {
      console.error(err);
      alert('Network error, try again');
    } finally {
      setIsSaving(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF() as any;
    const name = customerName || 'Cash Sale';

    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.text('RAZA TRADERS', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128); // Gray-500
    doc.text('Professional Billing & Inventory System', 105, 28, { align: 'center' });
    
    doc.setDrawColor(229, 231, 235); // Gray-200
    doc.line(10, 35, 200, 35);
    
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39); // Gray-900
    doc.text(`Customer: ${name}`, 10, 45);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 45);
    doc.text(`Status: ${status}`, 150, 52);
    
    const tableData = billItems.map((item, idx) => [
      idx + 1,
      item.name,
      item.quantity,
      `₹${item.price.toLocaleString()}`,
      `₹${(item.price * item.quantity).toLocaleString()}`
    ]);

    doc.autoTable({
      startY: 60,
      head: [['#', 'Item Name', 'Qty', 'Price', 'Subtotal']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Subtotal: ₹${subtotal.toLocaleString()}`, 150, finalY);
    doc.text(`GST (${gstPercent}%): ₹${gstAmount.toLocaleString()}`, 150, finalY + 7);
    doc.text(`Discount: ₹${discount.toLocaleString()}`, 150, finalY + 14);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Grand Total: ₹${finalAmount.toLocaleString()}`, 150, finalY + 24);

    doc.save(`bill-${name}-${Date.now()}.pdf`);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900">🧾 Create Bill</h2>
          <p className="text-gray-500 font-medium">Fast, simple, and reliable billing</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsAddProductModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95"
          >
            <PlusCircle className="w-5 h-5" />
            + Add Product
          </button>
          <button onClick={generatePDF} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm">
            <FileText className="w-5 h-5 text-indigo-500" />
            PDF
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm">
            <Printer className="w-5 h-5 text-indigo-500" />
            Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Product Selection & Cart */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search products to add..."
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:outline-none transition-all font-bold text-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {searchQuery && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 max-h-60 overflow-y-auto pr-2">
                {filteredProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addItem(p)}
                    className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-50 hover:border-indigo-200 hover:bg-indigo-50 transition-all group text-left"
                  >
                    <div>
                      <p className="font-black text-gray-900 group-hover:text-indigo-700">{p.name}</p>
                      <p className="text-xs text-gray-500 font-bold">{p.companyName} • {p.quantity} in stock</p>
                    </div>
                    <p className="text-xl font-black text-indigo-600">₹{p.sellingPrice}</p>
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-black text-gray-900 flex items-center gap-2 text-xl">
                <Receipt className="w-6 h-6 text-indigo-500" />
                Current Bill Items
              </h3>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {billItems.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold italic">Your bill is empty. Select products above to begin.</td></tr>
                    ) : (
                      billItems.map(item => (
                        <tr key={item.productId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-black text-gray-900">{item.name}</td>
                          <td className="px-6 py-4 font-bold text-gray-700">₹{item.price}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-8 h-8 rounded-lg border-2 border-gray-100 flex items-center justify-center hover:bg-white hover:border-indigo-500 font-black">-</button>
                              <span className="text-lg font-black w-6 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-8 h-8 rounded-lg border-2 border-gray-100 flex items-center justify-center hover:bg-white hover:border-indigo-500 font-black">+</button>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-black text-indigo-600 text-lg">₹{item.price * item.quantity}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600 transition-colors">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Summary & Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl space-y-6">
            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">Customer Name (Optional)</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter name..."
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:outline-none font-bold text-black"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-50">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-500 uppercase tracking-widest text-xs">Subtotal</span>
                <span className="font-black text-gray-900">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-500 uppercase tracking-widest text-xs">GST (%)</span>
                <input
                  type="number"
                  className="w-20 px-3 py-2 border-2 border-gray-100 rounded-lg text-right font-black focus:border-indigo-500 focus:outline-none"
                  value={gstPercent}
                  onChange={(e) => setGstPercent(Number(e.target.value))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-500 uppercase tracking-widest text-xs">Discount (₹)</span>
                <input
                  type="number"
                  className="w-24 px-3 py-2 border-2 border-gray-100 rounded-lg text-right font-black focus:border-indigo-500 focus:outline-none"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
              <div className="pt-4 border-t-4 border-double border-gray-100 flex justify-between items-end">
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Final Amount</p>
                  <p className="text-4xl font-black text-indigo-600">₹{finalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <label className="block text-sm font-black text-gray-900 mb-3">Payment Status</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStatus('PAID')}
                  className={`py-4 rounded-xl text-sm font-black border-2 transition-all shadow-sm ${
                    status === 'PAID' 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-100' 
                    : 'bg-white border-gray-100 text-gray-500 hover:border-indigo-200'
                  }`}
                >
                  FULL PAID
                </button>
                <button
                  onClick={() => setStatus('UNPAID')}
                  className={`py-4 rounded-xl text-sm font-black border-2 transition-all shadow-sm ${
                    status === 'UNPAID' 
                    ? 'bg-red-600 border-red-600 text-white shadow-red-100' 
                    : 'bg-white border-gray-100 text-gray-500 hover:border-red-200'
                  }`}
                >
                  UNPAID (Udhaar)
                </button>
              </div>
            </div>

            <button
              onClick={handleSaveBill}
              disabled={isSaving || billItems.length === 0}
              className={`w-full py-5 rounded-2xl text-white font-black text-xl flex items-center justify-center gap-3 shadow-2xl transition-all transform active:scale-[0.98] ${
                saveSuccess ? 'bg-green-500 shadow-green-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 disabled:opacity-50'
              }`}
            >
              {isSaving ? 'Saving...' : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-8 h-8" />
                  Saved!
                </>
              ) : (
                <>
                  <Receipt className="w-8 h-8" />
                  Finalize Bill
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-indigo-600 text-white flex items-center justify-between">
              <h3 className="text-xl font-black flex items-center gap-2">
                <Package className="w-6 h-6" />
                Quick Add Product
              </h3>
              <button onClick={() => setIsAddProductModalOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X className="w-8 h-8" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Product Name</label>
                <input
                  required
                  autoFocus
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl font-bold focus:border-indigo-500 focus:outline-none text-black"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Selling Price</label>
                  <input
                    required
                    type="number"
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl font-bold focus:border-indigo-500 focus:outline-none text-black"
                    value={newProduct.sellingPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Purchase Price</label>
                  <input
                    required
                    type="number"
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl font-bold focus:border-indigo-500 focus:outline-none text-black"
                    value={newProduct.purchasePrice}
                    onChange={(e) => setNewProduct({ ...newProduct, purchasePrice: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Initial Stock</label>
                <input
                  required
                  type="number"
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl font-bold focus:border-indigo-500 focus:outline-none text-black"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                />
              </div>
              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="flex-1 px-6 py-4 border-2 border-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                  Save & Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
