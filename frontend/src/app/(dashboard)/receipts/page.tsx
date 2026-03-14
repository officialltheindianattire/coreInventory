'use client';

import React, { useEffect, useState } from 'react';
import { receiptService } from '@/services/operations';
import { warehouseService } from '@/services/warehouse';
import { productService } from '@/services/product';
import { Plus, FileInput, Trash2, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface Receipt {
  id: string;
  supplierName: string;
  status: string;
  createdAt: string;
  warehouse: { id: string; name: string };
  items: { id: string; quantity: number; product: { id: string; name: string; sku: string } }[];
}

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newReceipt, setNewReceipt] = useState({ supplierName: '', warehouseId: '' });
  const [newItem, setNewItem] = useState({ productId: '', quantity: 1 });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [rData, wData, pData] = await Promise.all([
        receiptService.getAll(), warehouseService.getAllWarehouses(), productService.getProducts()
      ]);
      setReceipts(rData);
      setWarehouses(wData);
      setProducts(pData);
      if (wData.length > 0 && !newReceipt.warehouseId) setNewReceipt(p => ({ ...p, warehouseId: wData[0].id }));
      if (pData.length > 0 && !newItem.productId) setNewItem(p => ({ ...p, productId: pData[0].id }));
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await receiptService.create(newReceipt); setIsModalOpen(false); setNewReceipt({ supplierName: '', warehouseId: warehouses[0]?.id || '' }); fetchAll(); }
    catch (err: any) { alert(err?.message || 'Failed'); }
  };

  const handleAddItem = async (receiptId: string) => {
    try { await receiptService.addItem(receiptId, { productId: newItem.productId, quantity: newItem.quantity }); fetchAll(); }
    catch (err: any) { alert(err?.message || 'Failed'); }
  };

  const handleValidate = async (id: string) => {
    if (!confirm('Validate this receipt? This will add items to inventory.')) return;
    try { await receiptService.validate(id); fetchAll(); } catch (err: any) { alert(err?.message || 'Validation failed'); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this receipt?')) return;
    try { await receiptService.cancel(id); fetchAll(); } catch (err: any) { alert(err?.message || 'Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this receipt?')) return;
    try { await receiptService.delete(id); fetchAll(); } catch (err: any) { alert(err?.message || 'Failed'); }
  };

  const statusColor = (s: string) => {
    const m: Record<string, string> = { DRAFT: 'bg-gray-100 text-gray-700', WAITING: 'bg-yellow-100 text-yellow-800', READY: 'bg-blue-100 text-blue-800', DONE: 'bg-green-100 text-green-800', CANCELED: 'bg-red-100 text-red-800' };
    return m[s] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Receipts</h1>
          <p className="text-sm text-gray-500 mt-1">Incoming goods from suppliers</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> New Receipt
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
      ) : (
        <div className="space-y-4">
          {receipts.map((receipt) => (
            <div key={receipt.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === receipt.id ? null : receipt.id)}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center"><FileInput className="w-5 h-5 text-green-600" /></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{receipt.supplierName}</p>
                    <p className="text-xs text-gray-500">{receipt.warehouse.name} • {new Date(receipt.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(receipt.status)}`}>{receipt.status}</span>
                  <span className="text-xs text-gray-400">{receipt.items.length} items</span>
                  {receipt.status === 'DRAFT' && (
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); handleValidate(receipt.id); }} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Validate"><CheckCircle className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleCancel(receipt.id); }} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded" title="Cancel"><XCircle className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(receipt.id); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                  {expandedId === receipt.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              {expandedId === receipt.id && (
                <div className="border-t border-gray-100 p-5 bg-gray-50">
                  <table className="min-w-full text-sm mb-4">
                    <thead><tr className="text-gray-500 text-xs uppercase">
                      <th className="text-left py-2">Product</th><th className="text-left py-2">SKU</th><th className="text-right py-2">Qty</th>
                      {receipt.status === 'DRAFT' && <th></th>}
                    </tr></thead>
                    <tbody>
                      {receipt.items.map((item) => (
                        <tr key={item.id} className="border-t border-gray-200">
                          <td className="py-2 font-medium text-gray-900">{item.product.name}</td>
                          <td className="py-2 text-gray-500">{item.product.sku}</td>
                          <td className="py-2 text-right font-semibold">{item.quantity}</td>
                          {receipt.status === 'DRAFT' && (
                            <td className="py-2 text-right"><button onClick={() => { receiptService.removeItem(receipt.id, item.id).then(fetchAll); }} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button></td>
                          )}
                        </tr>
                      ))}
                      {receipt.items.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-gray-400">No items yet</td></tr>}
                    </tbody>
                  </table>
                  {receipt.status === 'DRAFT' && (
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                      <select value={newItem.productId} onChange={e => setNewItem({ ...newItem, productId: e.target.value })} className="bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm flex-1">
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                      </select>
                      <input type="number" min={1} value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-24" />
                      <button onClick={() => handleAddItem(receipt.id)} className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">Add</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {receipts.length === 0 && (
            <div className="py-12 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
              <FileInput className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No receipts yet.</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">New Receipt</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                <input required value={newReceipt.supplierName} onChange={e => setNewReceipt({ ...newReceipt, supplierName: e.target.value })} className="w-full border border-gray-300 rounded-md p-2 text-sm" placeholder="Acme Corp" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
                <select required value={newReceipt.warehouseId} onChange={e => setNewReceipt({ ...newReceipt, warehouseId: e.target.value })} className="w-full bg-white border border-gray-300 rounded-md p-2 text-sm">
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
