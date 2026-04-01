'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Users, 
  History, 
  TrendingUp, 
  Settings,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Billing', href: '/billing', icon: Receipt },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Sales History', href: '/sales', icon: History },
  { name: 'Reports', href: '/reports', icon: TrendingUp },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
          <Receipt className="w-6 h-6" />
          Raza Traders
        </h1>
      </div>
      <nav className="p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                isActive 
                  ? "bg-indigo-50 text-indigo-700" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-indigo-600" : "text-gray-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          System Online
        </div>
      </div>
    </aside>
  );
}
