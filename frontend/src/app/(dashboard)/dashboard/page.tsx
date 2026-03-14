'use client';

import React, { useEffect, useState } from 'react';
import { dashboardService } from '@/services/operations';
import { Package, Building2, MapPin, TrendingUp, FileInput, FileOutput, ArrowRightLeft, AlertTriangle, Activity } from 'lucide-react';

interface KPIs {
  totalProducts: number;
  totalWarehouses: number;
  totalLocations: number;
  totalStock: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  pendingTransfers: number;
}

interface ActivityItem {
  id: string;
  movementType: string;
  quantity: number;
  createdAt: string;
  product: { name: string; sku: string };
  fromLocation?: { name: string; warehouse: { name: string } } | null;
  toLocation?: { name: string; warehouse: { name: string } } | null;
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const [kpiData, activityData] = await Promise.all([
        dashboardService.getKPIs(),
        dashboardService.getRecentActivity(15),
      ]);
      setKpis(kpiData);
      setActivity(activityData);
    } catch (error) {
      console.error('Failed to load dashboard', error);
      setKpis({ totalProducts: 0, totalWarehouses: 0, totalLocations: 0, totalStock: 0, pendingReceipts: 0, pendingDeliveries: 0, pendingTransfers: 0 });
      setActivity([]);
    } finally {
      setIsLoading(false);
    }
  };

  const kpiCards = kpis ? [
    { label: 'Total Stock', value: kpis.totalStock, icon: TrendingUp, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50' },
    { label: 'Products', value: kpis.totalProducts, icon: Package, color: 'from-indigo-500 to-purple-600', bg: 'bg-indigo-50' },
    { label: 'Warehouses', value: kpis.totalWarehouses, icon: Building2, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50' },
    { label: 'Locations', value: kpis.totalLocations, icon: MapPin, color: 'from-sky-500 to-blue-600', bg: 'bg-sky-50' },
  ] : [];

  const pendingCards = kpis ? [
    { label: 'Pending Receipts', value: kpis.pendingReceipts, icon: FileInput, color: 'text-green-600' },
    { label: 'Pending Deliveries', value: kpis.pendingDeliveries, icon: FileOutput, color: 'text-red-500' },
    { label: 'Pending Transfers', value: kpis.pendingTransfers, icon: ArrowRightLeft, color: 'text-blue-500' },
  ] : [];

  const movementTypeLabel = (type: string) => {
    const map: Record<string, { label: string; color: string }> = {
      RECEIPT: { label: 'Receipt', color: 'bg-green-100 text-green-800' },
      DELIVERY: { label: 'Delivery', color: 'bg-red-100 text-red-800' },
      TRANSFER: { label: 'Transfer', color: 'bg-blue-100 text-blue-800' },
      ADJUSTMENT: { label: 'Adjustment', color: 'bg-yellow-100 text-yellow-800' },
    };
    return map[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your inventory operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value.toLocaleString()}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-sm`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Documents */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {pendingCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center">
          <Activity className="w-5 h-5 text-indigo-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        {activity.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activity.map((item) => {
                  const mt = movementTypeLabel(item.movementType);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${mt.color}`}>{mt.label}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.product?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.fromLocation ? `${item.fromLocation.name} (${item.fromLocation.warehouse.name})` : '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.toLocation ? `${item.toLocation.name} (${item.toLocation.warehouse.name})` : '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(item.createdAt).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <Activity className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>No stock movements yet. Create a receipt and validate it to see activity here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
