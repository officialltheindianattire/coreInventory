'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { warehouseService } from '@/services/warehouse';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewLocationPage() {
  const params = useParams();
  const router = useRouter();
  const warehouseId = params.id as string;

  const [form, setForm] = useState({ name: '', type: 'Aisle' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await warehouseService.createLocation(warehouseId, form);
      router.push(`/warehouses/${warehouseId}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to create location');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/warehouses/${warehouseId}`} className="text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Add New Location</h1>
          <p className="text-sm text-gray-500 mt-1">Create a mapped storage area within the warehouse</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-100">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Location Identifier
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="e.g. Aisle 5, Bin B, Zone Charlie"
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Location Type
                </label>
                <select
                  id="type"
                  required
                  value={form.type}
                  onChange={e => setForm({...form, type: e.target.value})}
                  className="w-full bg-white rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                >
                  <option value="Aisle">Aisle</option>
                  <option value="Bin">Bin / Shelf</option>
                  <option value="Dock">Loading Dock</option>
                  <option value="Zone">Zone</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
            <Link
               href={`/warehouses/${warehouseId}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
