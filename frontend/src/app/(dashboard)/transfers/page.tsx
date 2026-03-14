'use client';

import React, { useEffect, useState } from 'react';
import { transferService } from '@/services/operations';
import { warehouseService } from '@/services/warehouse';
import { productService } from '@/services/product';
import { Plus, ArrowRightLeft, Trash2, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface Transfer {
  id: string;
  status: string;
  createdAt: string;
  fromLocation: { id: string; name: string; warehouse: { name: string } };
  toLocation: { id: string; name: string; warehouse: { name: string } };
  items: { id: string; quantity: number; product: { id: string; name: string; sku: string } }[];
}

interface LocationOption {
  id: string;
  name: string;
  warehouseName: string;
}

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newTransfer, setNewTransfer] = useState({ fromLocationId: '', toLocationId: '' });
  const [newItem, setNewItem] = useState({ productId: '', quantity: 1 });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [tData, wData, pData] = await Promise.all([
        transferService.getAll(), warehouseService.getAllWarehouses(), productService.getProducts()
      ]);
      setTransfers(tData);
      setProducts(pData);
      // Flatten warehouse locations
      const locs: LocationOption[] = [];
      for (const w of wData) {
        if (w.locations) {
          for (const loc of w.locations) { locs.push({ id: loc.id, name: loc.name, warehouseName: w.name }); }
        }
      }
      setLocations(locs);
      if (locs.length >= 2) {
        if (!newTransfer.fromLocationId) setNewTransfer({ fromLocationId: locs[0].id, toLocationId: locs[1].id });
      }
      if (pData.length > 0 && !newItem.productId) setNewItem(p => ({ ...p, productId: pData[0].id }));
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTransfer.fromLocationId === newTransfer.toLocationId) { alert('Source and destination must be different'); return; }
    try { await transferService.create(newTransfer); setIsModalOpen(false); fetchAll(); }
    catch (err: any) { alert(err?.message || 'Failed'); }
  };

  const handleAddItem = async (transferId: string) => {
    try { await transferService.addItem(transferId, { productId: newItem.productId, quantity: newItem.quantity }); fetchAll(); }
    catch (err: any) { alert(err?.message || 'Failed'); }
  };

  const handleValidate = async (id: string) => {
    if (!confirm('Validate this transfer? Stock will be moved between locations.')) return;
    try { await transferService.validate(id); fetchAll(); } catch (err: any) { alert(err?.message || 'Validation failed'); }
  };

  const handleCancel = async (id: string) => { if (confirm('Cancel?')) { try { await transferService.cancel(id); fetchAll(); } catch (err: any) { alert(err?.message || 'Failed'); } } };
  const handleDelete = async (id: string) => { if (confirm('Delete?')) { try { await transferService.delete(id); fetchAll(); } catch (err: any) { alert(err?.message || 'Failed'); } } };

  const statusColor = (s: string) => {
    const m: Record<string, string> = { DRAFT: 'bg-gray-100 text-gray-700', DONE: 'bg-green-100 text-green-800', CANCELED: 'bg-red-100 text-red-800' };
    return m[s] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Transfers</h1>
          <p className="text-sm text-gray-500 mt-1">Move stock between locations</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> New Transfer
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
      ) : (
        <div className="space-y-4">
          {transfers.map((transfer) => (
            <div key={transfer.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === transfer.id ? null : transfer.id)}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"><ArrowRightLeft className="w-5 h-5 text-blue-600" /></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{transfer.fromLocation.name} → {transfer.toLocation.name}</p>
                    <p className="text-xs text-gray-500">{transfer.fromLocation.warehouse.name} → {transfer.toLocation.warehouse.name} • {new Date(transfer.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(transfer.status)}`}>{transfer.status}</span>
                  <span className="text-xs text-gray-400">{transfer.items.length} items</span>
                  {transfer.status === 'DRAFT' && (
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); handleValidate(transfer.id); }} className="p-1.5 text-green-600 hover:bg-green-50 rounded"><CheckCircle className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleCancel(transfer.id); }} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded"><XCircle className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(transfer.id); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                  {expandedId === transfer.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              {expandedId === transfer.id && (
                <div className="border-t border-gray-100 p-5 bg-gray-50">
                  <table className="min-w-full text-sm mb-4">
                    <thead><tr className="text-gray-500 text-xs uppercase"><th className="text-left py-2">Product</th><th className="text-left py-2">SKU</th><th className="text-right py-2">Qty</th>{transfer.status === 'DRAFT' && <th></th>}</tr></thead>
                    <tbody>
                      {transfer.items.map((item) => (
                        <tr key={item.id} className="border-t border-gray-200">
                          <td className="py-2 font-medium text-gray-900">{item.product.name}</td><td className="py-2 text-gray-500">{item.product.sku}</td><td className="py-2 text-right font-semibold">{item.quantity}</td>
                          {transfer.status === 'DRAFT' && <td className="py-2 text-right"><button onClick={() => { transferService.removeItem(transfer.id, item.id).then(fetchAll); }} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button></td>}
                        </tr>
                      ))}
                      {transfer.items.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-gray-400">No items yet</td></tr>}
                    </tbody>
                  </table>
                  {transfer.status === 'DRAFT' && (
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                      <select value={newItem.productId} onChange={e => setNewItem({ ...newItem, productId: e.target.value })} className="bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm flex-1">
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                      </select>
                      <input type="number" min={1} value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-24" />
                      <button onClick={() => handleAddItem(transfer.id)} className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">Add</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {transfers.length === 0 && (
            <div className="py-12 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
              <ArrowRightLeft className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No transfers yet.</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">New Transfer</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Location</label>
                <select required value={newTransfer.fromLocationId} onChange={e => setNewTransfer({ ...newTransfer, fromLocationId: e.target.value })} className="w-full bg-white border border-gray-300 rounded-md p-2 text-sm">
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.warehouseName})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Location</label>
                <select required value={newTransfer.toLocationId} onChange={e => setNewTransfer({ ...newTransfer, toLocationId: e.target.value })} className="w-full bg-white border border-gray-300 rounded-md p-2 text-sm">
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.warehouseName})</option>)}
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
