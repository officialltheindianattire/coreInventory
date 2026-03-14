'use client';

import React from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { PackageSearch, Package, Building2, LayoutDashboard, BarChart3, FileInput, FileOutput, ArrowRightLeft, AlertTriangle, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col print:hidden">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <PackageSearch className="w-6 h-6 text-indigo-600 mr-2" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            CoreInventory
          </span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link href="/dashboard" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 group">
            <LayoutDashboard className="w-5 h-5 mr-3 text-gray-400 group-hover:text-amber-500 transition-colors" />
            Dashboard
          </Link>

          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Master Data
          </div>
          <Link href="/warehouses" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 group">
            <Building2 className="w-5 h-5 mr-3 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            Warehouses
          </Link>
          <Link href="/products" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 group">
            <Package className="w-5 h-5 mr-3 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            Products
          </Link>

          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Operations
          </div>
          <Link href="/inventory" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 group">
            <BarChart3 className="w-5 h-5 mr-3 text-gray-400 group-hover:text-emerald-500 transition-colors" />
            Stock Levels
          </Link>
          <Link href="/receipts" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 group">
            <FileInput className="w-5 h-5 mr-3 text-gray-400 group-hover:text-green-500 transition-colors" />
            Receipts
          </Link>
          <Link href="/deliveries" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 group">
            <FileOutput className="w-5 h-5 mr-3 text-gray-400 group-hover:text-red-500 transition-colors" />
            Deliveries
          </Link>
          <Link href="/transfers" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 group">
            <ArrowRightLeft className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
            Transfers
          </Link>
          <Link href="/adjustments" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 group">
            <AlertTriangle className="w-5 h-5 mr-3 text-gray-400 group-hover:text-amber-500 transition-colors" />
            Adjustments
          </Link>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="ml-3 truncate">
                <p className="text-sm font-medium text-gray-700 truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.role || 'Staff'}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="ml-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8 print:hidden">
          <h1 className="text-lg font-semibold text-gray-900">Workspace</h1>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-gray-50 p-6 lg:p-8 print:p-0 print:bg-white print:overflow-visible">
          {children}
        </div>
      </main>
    </div>
  );
}
