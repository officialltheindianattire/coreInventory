'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { deliveryService, inventoryService } from '@/services/operations';
import { productService } from '@/services/product';
import { ArrowLeft, CheckCircle, Clock, Trash2, Printer, XCircle, Plus, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Delivery {
  id: string;
  referenceId: string;
  customerName: string;
  contact?: string;
  scheduleDate?: string;
  status: string;
  createdAt: string;
  creator?: { name: string };
  warehouse: { id: string; name: string };
  location?: { id: string; name: string };
  fromLocationId?: string;
  items: { id: string; quantity: number; product: { id: string; name: string; sku: string } }[];
}

export default function DeliveryDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [locationStock, setLocationStock] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // New item form
  const [newItemProductId, setNewItemProductId] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [dData, pData, stockData] = await Promise.all([
        deliveryService.getById(id),
        productService.getProducts(),
        inventoryService.getStockByLocation()
      ]);
      const del: Delivery = dData.data || dData;
      setDelivery(del);
      setProducts(pData);
      if (pData.length > 0) setNewItemProductId(pData[0].id);

      // Extract stock for the specific source location (or default to warehouse's first location if we could fetch it)
      const locId = del.location?.id || del.fromLocationId;
      const stockMap: Record<string, number> = {};
      
      if (locId) {
        const locInfo = stockData.find((l: any) => l.id === locId);
        if (locInfo && locInfo.items) {
          locInfo.items.forEach((item: any) => {
            stockMap[item.product.id] = item.quantity;
          });
        }
      } else if (stockData.length > 0) {
        // Fallback: Just aggregate all stock if no specific location is bound yet
        stockData.forEach((loc: any) => {
          loc.items?.forEach((item: any) => {
            stockMap[item.product.id] = (stockMap[item.product.id] || 0) + item.quantity;
          });
        });
      }
      setLocationStock(stockMap);

    } catch (err: any) {
      console.error('Failed to load delivery:', err);
      setError('Failed to load delivery details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkReady = async () => {
    try {
      await deliveryService.markReady(id);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to mark as Ready');
    }
  };

  const handleValidate = async () => {
    try {
      await deliveryService.validate(id);
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to validate delivery');
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this delivery?')) return;
    try {
      await deliveryService.cancel(id);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to cancel delivery');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemProductId) return;
    try {
      await deliveryService.addItem(id, { productId: newItemProductId, quantity: newItemQuantity });
      setNewItemQuantity(1);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to add item');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await deliveryService.removeItem(id, itemId);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to remove item');
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>;
  if (error || !delivery) return <div className="p-8 text-red-500 bg-red-50 rounded-lg border border-red-200 m-8">{error || 'Delivery not found'}</div>;

  const steps = ['DRAFT', 'WAITING', 'READY', 'DONE'];
  
  // Decide if we should be in WAITING state: if any item is out of stock and we are not DONE or CANCELED
  const isOutofStock = delivery.items.some(item => (locationStock[item.product.id] || 0) < item.quantity);
  // Auto-visualize WAITING if draft/ready and out of stock (blueprint mentions Draft > Waiting > Ready > Done)
  let visualStatus = delivery.status;
  if ((delivery.status === 'DRAFT' || delivery.status === 'READY') && isOutofStock) {
    visualStatus = 'WAITING';
  }

  const currentStepIdx = steps.indexOf(visualStatus !== 'CANCELED' ? visualStatus : 'DRAFT');

  return (
    <div className="flex flex-col h-full bg-gray-50 text-gray-900 -m-8 min-h-screen">
      {/* Top action bar */}
      <div className="flex flex-col border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.push('/deliveries')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 shadow-sm text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded shadow-sm">Delivery</span>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">{delivery.referenceId || delivery.id.split('-')[0].toUpperCase()}</h1>
            </div>
          </div>
        </div>

        {/* Blueprint Actions & Status Bar Row */}
        <div className="flex items-center justify-between px-8 py-3 bg-gray-50/80 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            {delivery.status === 'DRAFT' && (
              <button
                onClick={handleMarkReady}
                className="px-5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-lg text-sm font-semibold shadow-sm transition-colors"
              >
                MARK AS TODO
              </button>
            )}
            {delivery.status === 'READY' && (
              <button
                onClick={handleValidate}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
                disabled={isOutofStock}
                title={isOutofStock ? "Cannot validate: Items out of stock" : "Validate Delivery"}
              >
                Validate
              </button>
            )}
            
            <button className="px-5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center">
              Print
            </button>
            {(delivery.status === 'DRAFT' || delivery.status === 'READY') && (
              <button onClick={handleCancel} className="px-5 py-2 bg-white border border-gray-300 hover:text-red-600 hover:bg-red-50 text-gray-800 rounded-lg text-sm font-semibold shadow-sm transition-colors">
                Cancel
              </button>
            )}
          </div>

          {/* Status Tracker */}
          <div className="flex items-center bg-white border border-gray-200 rounded-full px-1 shadow-sm h-10">
            {steps.map((step, idx) => {
              const isActive = idx === currentStepIdx;
              const isPast = idx < currentStepIdx && delivery.status !== 'CANCELED';
              
              let textColor = 'text-gray-400';
              if (isActive) {
                textColor = step === 'WAITING' ? 'text-yellow-600' : 'text-indigo-600';
              } else if (isPast) {
                textColor = 'text-gray-800';
              }

              return (
                <React.Fragment key={step}>
                  <div className={`flex items-center px-4 h-full text-xs font-bold tracking-wide ${textColor}`}>
                    {step}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="text-gray-300 font-bold mx-1">{'>'}</div>
                  )}
                </React.Fragment>
              );
            })}
            {delivery.status === 'CANCELED' && (
              <div className="flex items-center px-4 h-full text-xs font-bold tracking-wide text-red-600 border-l border-gray-200 ml-2">
                CANCELED
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Details Form Grid exactly matching Blueprint */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">{delivery.referenceId || delivery.id.split('-')[0].toUpperCase()}</h2>
            
            <div className="grid grid-cols-2 gap-x-16 gap-y-8">
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-2">
                  <label className="block text-sm font-bold text-gray-600 mb-1">Delivery Address</label>
                  <div className="text-base text-gray-900 font-medium">{delivery.customerName} {delivery.contact ? `\n${delivery.contact}` : ''}</div>
                </div>
                <div className="border-b border-gray-200 pb-2">
                  <label className="block text-sm font-bold text-gray-600 mb-1">Responsible</label>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                      {(delivery.creator?.name || 'U')[0].toUpperCase()}
                    </div>
                    <span className="text-base text-gray-900 font-medium">{delivery.creator?.name || 'System User'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-2">
                  <label className="block text-sm font-bold text-gray-600 mb-1">Schedule Date</label>
                  <div className="text-base text-gray-900 font-medium">
                    {delivery.scheduleDate ? format(new Date(delivery.scheduleDate), 'MMM d, yyyy HH:mm') : 'Not Set'}
                  </div>
                </div>
                <div className="border-b border-gray-200 pb-2">
                  <label className="block text-sm font-bold text-gray-600 mb-1">Operation type</label>
                  <div className="text-base text-gray-900 font-medium flex justify-between items-center">
                    <span>{delivery.warehouse.name}: Delivery Orders</span>
                    <span className="text-xs text-gray-400">▽</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Table matching Blueprint */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-12">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Products</h3>
            </div>
            <div className="p-0">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-white border-b-2 border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-bold text-gray-900 w-2/3">Product</th>
                    <th className="px-6 py-4 font-bold text-gray-900 text-center">Quantity</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {delivery.items.map((item) => {
                    const stockAvailable = locationStock[item.product.id] || 0;
                    const isItemOutofStock = stockAvailable < item.quantity && delivery.status !== 'DONE' && delivery.status !== 'CANCELED';
                    
                    return (
                      <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${isItemOutofStock ? 'bg-red-50/30' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className={`font-semibold ${isItemOutofStock ? 'text-red-700' : 'text-indigo-700'}`}>[{item.product.sku}] {item.product.name}</span>
                            {isItemOutofStock && (
                              <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                <AlertCircle className="w-3 h-3 mr-1" /> Out of stock (Avail: {stockAvailable})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-bold font-mono ${isItemOutofStock ? 'text-red-700' : 'text-gray-900'}`}>
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {delivery.status === 'DRAFT' && (
                            <button onClick={() => handleRemoveItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1 bg-white rounded-md shadow-sm border border-gray-200">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* Add New Item Row */}
                  {delivery.status === 'DRAFT' && (
                    <tr className="bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Product</label>
                          <select
                            value={newItemProductId}
                            onChange={(e) => setNewItemProductId(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium text-sm shadow-sm"
                          >
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} [{p.sku}]</option>)}
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-bottom">
                        <input
                          type="number" min="1"
                          value={newItemQuantity}
                          onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                          className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-center font-bold font-mono shadow-sm"
                        />
                      </td>
                      <td className="px-6 py-4 text-right align-bottom">
                        <button
                          onClick={handleAddItem}
                          className="inline-flex items-center px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold rounded-lg transition-colors border border-indigo-200"
                        >
                          <Plus className="w-4 h-4 mr-1" /> Add
                        </button>
                      </td>
                    </tr>
                  )}
                  {delivery.items.length === 0 && delivery.status !== 'DRAFT' && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500 font-medium">No products added.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
