'use client';

import React, { useEffect, useState } from 'react';
import { inventoryService } from '@/services/operations';
import { Package, TrendingUp, TrendingDown, BarChart3, MapPin, Layers } from 'lucide-react';

interface StockItem {
  id: string;
  name: string;
  sku: string;
  unitOfMeasure: string;
  category: { name: string };
  totalStock: number;
  totalIn: number;
  totalOut: number;
}

interface LocationStock {
  id: string;
  name: string;
  type: string;
  warehouse: { name: string };
  items: { product: { name: string; sku: string; unitOfMeasure: string }; quantity: number }[];
}

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'product' | 'location'>('product');
  const [stock, setStock] = useState<StockItem[]>([]);
  const [locationStock, setLocationStock] = useState<LocationStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      setIsLoading(true);
      const [productData, locationData] = await Promise.all([
        inventoryService.getStockLevels(),
        inventoryService.getStockByLocation()
      ]);
      setStock(productData);
      setLocationStock(locationData);
    } catch (error) {
      console.error('Failed to load stock', error);
      setStock([]);
      setLocationStock([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time stock levels and location mapping</p>
        </div>
        <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('product')}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'product' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            <Layers className="w-4 h-4 mr-2" /> By Product
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'location' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            <MapPin className="w-4 h-4 mr-2" /> By Location
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {activeTab === 'product' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total In</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Out</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stock.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center mr-3">
                            <Package className="w-4 h-4 text-indigo-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">{item.sku}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm text-green-600 font-medium flex items-center justify-end">
                          <TrendingUp className="w-3 h-3 mr-1" />{item.totalIn}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm text-red-500 font-medium flex items-center justify-end">
                          <TrendingDown className="w-3 h-3 mr-1" />{item.totalOut}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`text-lg font-bold ${item.totalStock > 0 ? 'text-gray-900' : item.totalStock === 0 ? 'text-gray-400' : 'text-red-600'}`}>
                          {item.totalStock} <span className="text-xs font-normal text-gray-400">{item.unitOfMeasure}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                  {stock.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <BarChart3 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      No products in the system yet. Add products and create receipts to see stock levels.
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {locationStock.map((loc) => (
                <div key={loc.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mr-4">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{loc.name} <span className="text-sm font-normal text-gray-500 ml-2 py-0.5 px-2 bg-gray-100 rounded-full">{loc.type}</span></h3>
                      <p className="text-sm text-gray-500">{loc.warehouse?.name}</p>
                    </div>
                  </div>
                  <div className="ml-14 bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Quantity Stored</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {loc.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900 mr-2">{item.product.name}</span>
                              <span className="text-xs font-mono text-gray-500">{item.product.sku}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <span className="text-sm font-bold text-gray-900">{item.quantity}</span>
                              <span className="text-xs text-gray-500 ml-1">{item.product.unitOfMeasure}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              {locationStock.length === 0 && (
                <div className="px-6 py-12 text-center text-gray-500">
                  <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  No stock mapped to any locations yet. Receive items or transfer them into specific locations.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
