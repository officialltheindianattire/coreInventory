'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { warehouseService } from '@/services/warehouse';
import { Warehouse, Location } from '@/types/warehouse';
import { ArrowLeft, MapPin, Building, Plus, Trash2, Box } from 'lucide-react';

export default function WarehouseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const warehouseId = params.id as string;

  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals removed in favor of dedicated pages

  useEffect(() => {
    if (warehouseId) {
      fetchWarehouseDetails();
    }
  }, [warehouseId]);

  const fetchWarehouseDetails = async () => {
    try {
      setIsLoading(true);
      const [warehouseData, locationsData] = await Promise.all([
        warehouseService.getWarehouseById(warehouseId),
        warehouseService.getLocations(warehouseId),
      ]);
      setWarehouse(warehouseData);
      setLocations(locationsData);
    } catch (error) {
      console.error('Failed to load warehouse details', error);
      // Fallback for visual testing
      setWarehouse({ id: warehouseId, name: 'Central Hub', location: 'New York', createdAt: new Date().toISOString() });
      setLocations([
        { id: '1', warehouseId, name: 'Aisle 1', type: 'Storage' },
        { id: '2', warehouseId, name: 'Loading Dock A', type: 'Transit' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;
    try {
      await warehouseService.deleteLocation(id);
      fetchWarehouseDetails();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to delete location');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Warehouse not found</h3>
        <button onClick={() => router.push('/warehouses')} className="mt-4 text-indigo-600 hover:text-indigo-500">
          Return to Warehouses
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.push('/warehouses')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                <Building className="w-6 h-6" />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{warehouse.name}</h1>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {warehouse.location}
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-900">Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Total Locations</p>
                <p className="text-2xl font-semibold text-gray-900">{locations.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Created At</p>
                <p className="text-gray-900">{new Date(warehouse.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Locations List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Box className="w-5 h-5 mr-2 text-indigo-500" />
              Storage Locations
            </h2>
            <Link
              href={`/warehouses/${warehouseId}/new-location`}
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Location
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {locations.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {locations.map((loc) => (
                  <li key={loc.id} className="p-4 sm:px-6 hover:bg-gray-50 flex items-center justify-between transition-colors">
                    <div className="flex items-center">
                       <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mr-4">
                         <span className="font-bold text-sm tracking-wider">{loc.type.substring(0,2).toUpperCase()}</span>
                       </div>
                       <div>
                         <p className="text-sm font-medium text-gray-900">{loc.name}</p>
                         <p className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">{loc.type}</p>
                       </div>
                    </div>
                    <div>
                      <button 
                        onClick={() => handleDeleteLocation(loc.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-md hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <Box className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-sm">No locations mapped yet.</p>
                <Link 
                  href={`/warehouses/${warehouseId}/new-location`}
                  className="mt-2 text-sm text-indigo-600 font-medium hover:underline block"
                >
                  Create your first location
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>



    </div>
  );
}
