'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productService } from '@/services/product';
import { warehouseService } from '@/services/warehouse';
import { Category } from '@/types/product';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<{id: string, name: string, warehouseName: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [form, setForm] = useState({ 
    name: '', sku: '', categoryId: '', unitOfMeasure: 'pcs', initialQuantity: 0, locationId: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      productService.getCategories(),
      warehouseService.getAllWarehouses()
    ])
      .then(([cats, warehouses]) => {
        setCategories(cats);
        
        const locs = warehouses.flatMap(w => 
          (w.locations || []).map(l => ({ id: l.id, name: l.name, warehouseName: w.name }))
        );
        setLocations(locs);

        setForm(f => ({ 
           ...f, 
           categoryId: cats.length > 0 ? cats[0].id : '',
           locationId: locs.length > 0 ? locs[0].id : ''
        }));
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (categories.length === 0) {
      setError('You must create a category first.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    try {
      // Clean up optional fields if zero
      const submitData = { ...form };
      if (!submitData.initialQuantity || submitData.initialQuantity <= 0) {
         delete (submitData as any).initialQuantity;
         delete (submitData as any).locationId;
      }

      await productService.createProduct(submitData);
      router.push('/products');
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to create product');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/products" className="text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Add New Product</h1>
          <p className="text-sm text-gray-500 mt-1">Add a new item to your catalog</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
             <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
             <h3 className="text-lg font-medium text-gray-900 mb-2">Category Required</h3>
             <p className="text-sm max-w-sm mb-6">You must create at least one category before you can add products.</p>
             <Link href="/categories/new" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
               Create a Category First
             </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}
              
              <div className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    placeholder="e.g. Ergonomic Office Chair"
                  />
                </div>

                <div>
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                    SKU (Stock Keeping Unit)
                  </label>
                  <input
                    type="text"
                    id="sku"
                    required
                    value={form.sku}
                    onChange={e => setForm({...form, sku: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors uppercase"
                    placeholder="e.g. FURN-CHR-001"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      id="category"
                      required
                      value={form.categoryId}
                      onChange={e => setForm({...form, categoryId: e.target.value})}
                      className="w-full bg-white rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="uom" className="block text-sm font-medium text-gray-700 mb-1">
                      Unit of Measure
                    </label>
                    <input
                      type="text"
                      id="uom"
                      required
                      value={form.unitOfMeasure}
                      onChange={e => setForm({...form, unitOfMeasure: e.target.value})}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      placeholder="e.g. pcs, kg, box"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Initial Stock (Optional)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="initialQty" className="block text-sm font-medium text-gray-700 mb-1">
                        Starting Quantity
                      </label>
                      <input
                        type="number"
                        id="initialQty"
                        min="0"
                        value={form.initialQuantity}
                        onChange={e => setForm({...form, initialQuantity: parseInt(e.target.value) || 0})}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="locationId" className="block text-sm font-medium text-gray-700 mb-1">
                        Initial Storage Location
                      </label>
                      <select
                        id="locationId"
                        disabled={form.initialQuantity <= 0 || locations.length === 0}
                        value={form.locationId}
                        onChange={e => setForm({...form, locationId: e.target.value})}
                        className="w-full bg-white rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        {locations.length === 0 ? (
                          <option value="">No locations available</option>
                        ) : (
                          locations.map((loc) => (
                            <option key={loc.id} value={loc.id}>{loc.name} ({loc.warehouseName})</option>
                          ))
                        )}
                      </select>
                      {form.initialQuantity > 0 && locations.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">You need to create a Warehouse Location first to hold initial stock.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
              <Link
                href="/products"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
