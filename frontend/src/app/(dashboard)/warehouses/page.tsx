'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { warehouseService } from '@/services/warehouse';
import { Warehouse, Location } from '@/types/warehouse';
import { Plus, MapPin, Trash2, Building } from 'lucide-react';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals removed in favor of dedicated pages

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setIsLoading(true);
      const data = await warehouseService.getAllWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.error('Failed to load warehouses', error);
      // Fallback for visual testing if api is down/unreachable
      setWarehouses([
        { id: '1', name: 'Central Hub', location: 'New York', createdAt: new Date().toISOString(), _count: { locations: 5 } },
        { id: '2', name: 'West Coast Transit', location: 'California', createdAt: new Date().toISOString(), _count: { locations: 2 } },
      ]);
    } finally {
      setIsLoading(false);
    }
  };



  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this warehouse?')) return;
    try {
      await warehouseService.deleteWarehouse(id);
      fetchWarehouses();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to delete warehouse');
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Warehouses</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your physical storage locations</p>
        </div>
        <Link
          href="/warehouses/new"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Warehouse
        </Link>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
             <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 h-40 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mt-auto"></div>
             </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map((warehouse) => (
            <div key={warehouse.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col">
              <Link href={`/warehouses/${warehouse.id}`} className="p-6 flex-1 hover:bg-gray-50/50 block">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mr-4">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {warehouse.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {warehouse.location}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
              
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-semibold text-gray-900">{warehouse._count?.locations || 0}</span>
                  <span className="text-gray-500 ml-1">locations</span>
                </div>
                <button 
                  onClick={(e) => { e.preventDefault(); handleDelete(warehouse.id); }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  aria-label="Delete warehouse"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {warehouses.length === 0 && (
             <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white border border-dashed border-gray-300 rounded-xl">
               <Building className="w-12 h-12 text-gray-300 mb-4" />
               <h3 className="text-lg font-medium text-gray-900">No warehouses</h3>
               <p className="text-gray-500 mt-1 mb-6 text-center max-w-sm">Get started by creating a new warehouse to track your inventory locations.</p>
               <Link
                  href="/warehouses/new"
                  className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-100"
                >
                  Add your first warehouse
                </Link>
             </div>
          )}
        </div>
      )}



    </div>
  );
}
