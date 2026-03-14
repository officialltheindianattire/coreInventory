'use client';

import React, { useEffect, useState } from 'react';
import { adjustmentService } from '@/services/operations';
import { warehouseService } from '@/services/warehouse';
import { productService } from '@/services/product';
import { Plus, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface Adjustment {
  id: string;
  quantityChange: number;
  reason: string;
  createdAt: string;
  product: { name: string; sku: string };
  location: { name: string; warehouse: { name: string } };
}

interface LocationOption { id: string; name: string; warehouseName: string; }

export default function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ productId: '', locationId: '', quantityChange: 0, reason: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [aData, wData, pData] = await Promise.all([
        adjustmentService.getAll(), warehouseService.getAllWarehouses(), productService.getProducts()
      ]);
      setAdjustments(aData);
      setProducts(pData);
      const locs: LocationOption[] = [];
      for (const w of wData) {
        if (w.locations) {
          for (const loc of w.locations) { locs.push({ id: loc.id, name: loc.name, warehouseName: w.name }); }
        }
      }
      setLocations(locs);
      if (pData.length > 0 && !form.productId) setForm(f => ({ ...f, productId: pData[0].id }));
      if (locs.length > 0 && !form.locationId) setForm(f => ({ ...f, locationId: locs[0].id }));
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.quantityChange === 0) { alert('Quantity change cannot be zero'); return; }
    try {
      await adjustmentService.create(form);
      setIsModalOpen(false);
      setForm({ productId: products[0]?.id || '', locationId: locations[0]?.id || '', quantityChange: 0, reason: '' });
      fetchAll();
    } catch (err: any) { alert(err?.message || 'Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Adjustments</h1>
          <p className="text-sm text-gray-500 mt-1">Stock corrections and manual adjustments</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> New Adjustment
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Change</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {adjustments.map((adj) => (
                  <tr key={adj.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{adj.product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{adj.location.name} ({adj.location.warehouse.name})</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`inline-flex items-center text-sm font-bold ${adj.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {adj.quantityChange > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {adj.quantityChange > 0 ? '+' : ''}{adj.quantityChange}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{adj.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(adj.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {adjustments.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <AlertTriangle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    No adjustments recorded yet.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">New Adjustment</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <select required value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })} className="w-full bg-white border border-gray-300 rounded-md p-2 text-sm">
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select required value={form.locationId} onChange={e => setForm({ ...form, locationId: e.target.value })} className="w-full bg-white border border-gray-300 rounded-md p-2 text-sm">
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.warehouseName})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Change (+/-)</label>
                <input type="number" required value={form.quantityChange} onChange={e => setForm({ ...form, quantityChange: parseInt(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-md p-2 text-sm" placeholder="e.g. +10 or -5" />
                <p className="text-xs text-gray-400 mt-1">Positive = add stock, Negative = remove stock</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <input type="text" required value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="w-full border border-gray-300 rounded-md p-2 text-sm" placeholder="Physical count correction" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm text-white bg-amber-500 rounded-md hover:bg-amber-600">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
