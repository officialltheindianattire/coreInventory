'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { receiptService, deliveryService } from '@/services/operations';
import { Search, List, KanbanSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface MoveRow {
  id: string;
  referenceId: string;
  date: string;
  contact: string;
  from: string;
  to: string;
  quantity: number;
  status: string;
  type: 'IN' | 'OUT';
  parentId: string;
  productName: string;
  productSku: string;
}

type ViewMode = 'list' | 'kanban';

export default function MoveHistoryPage() {
  const router = useRouter();
  const [moves, setMoves] = useState<MoveRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [receipts, deliveries] = await Promise.all([
        receiptService.getAll(),
        deliveryService.getAll()
      ]);

      const rows: MoveRow[] = [];

      // Receipts => IN moves (green)
      receipts.forEach((r: any) => {
        if (r.items && r.items.length > 0) {
          r.items.forEach((item: any) => {
            rows.push({
              id: `r-${r.id}-${item.id}`,
              referenceId: r.referenceId || r.id.substring(0, 8).toUpperCase(),
              date: r.scheduleDate || r.createdAt,
              contact: r.contact || r.supplierName || '-',
              from: r.supplierName || 'Vendor',
              to: r.location?.name 
                ? `${r.warehouse?.name || 'Warehouse'}/${r.location.name}` 
                : (r.warehouse?.name || 'Warehouse'),
              quantity: item.quantity,
              status: r.status,
              type: 'IN',
              parentId: r.id,
              productName: item.product?.name || 'Unknown',
              productSku: item.product?.sku || '',
            });
          });
        } else {
          // Receipt with no items — show as a single entry
          rows.push({
            id: `r-${r.id}`,
            referenceId: r.referenceId || r.id.substring(0, 8).toUpperCase(),
            date: r.scheduleDate || r.createdAt,
            contact: r.contact || r.supplierName || '-',
            from: r.supplierName || 'Vendor',
            to: r.location?.name 
              ? `${r.warehouse?.name || 'Warehouse'}/${r.location.name}` 
              : (r.warehouse?.name || 'Warehouse'),
            quantity: 0,
            status: r.status,
            type: 'IN',
            parentId: r.id,
            productName: '-',
            productSku: '',
          });
        }
      });

      // Deliveries => OUT moves (red)
      deliveries.forEach((d: any) => {
        if (d.items && d.items.length > 0) {
          d.items.forEach((item: any) => {
            rows.push({
              id: `d-${d.id}-${item.id}`,
              referenceId: d.referenceId || d.id.substring(0, 8).toUpperCase(),
              date: d.scheduleDate || d.createdAt,
              contact: d.contact || d.customerName || '-',
              from: d.location?.name 
                ? `${d.warehouse?.name || 'Warehouse'}/${d.location.name}` 
                : (d.warehouse?.name || 'Warehouse'),
              to: d.customerName || 'Customer',
              quantity: item.quantity,
              status: d.status,
              type: 'OUT',
              parentId: d.id,
              productName: item.product?.name || 'Unknown',
              productSku: item.product?.sku || '',
            });
          });
        } else {
          rows.push({
            id: `d-${d.id}`,
            referenceId: d.referenceId || d.id.substring(0, 8).toUpperCase(),
            date: d.scheduleDate || d.createdAt,
            contact: d.contact || d.customerName || '-',
            from: d.location?.name 
              ? `${d.warehouse?.name || 'Warehouse'}/${d.location.name}` 
              : (d.warehouse?.name || 'Warehouse'),
            to: d.customerName || 'Customer',
            quantity: 0,
            status: d.status,
            type: 'OUT',
            parentId: d.id,
            productName: '-',
            productSku: '',
          });
        }
      });

      // Sort by date descending
      rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setMoves(rows);
    } catch (e) { console.error('Failed to fetch move history:', e); } finally { setIsLoading(false); }
  };

  // Filter by reference or contact
  const filteredMoves = useMemo(() => {
    if (!searchTerm) return moves;
    const lower = searchTerm.toLowerCase();
    return moves.filter(m => 
      m.referenceId.toLowerCase().includes(lower) ||
      m.contact.toLowerCase().includes(lower) ||
      m.from.toLowerCase().includes(lower) ||
      m.to.toLowerCase().includes(lower) ||
      m.productName.toLowerCase().includes(lower)
    );
  }, [moves, searchTerm]);

  // Group by status for Kanban view
  const kanbanColumns = useMemo(() => {
    const cols: Record<string, MoveRow[]> = {
      'DRAFT': [],
      'READY': [],
      'DONE': [],
    };
    filteredMoves.forEach(m => {
      if (cols[m.status]) cols[m.status].push(m);
      else cols['DRAFT'].push(m);
    });
    return cols;
  }, [filteredMoves]);

  const statusColor = (s: string) => {
    const m: Record<string, string> = { DRAFT: 'bg-gray-100 text-gray-700', WAITING: 'bg-yellow-100 text-yellow-800', READY: 'bg-blue-100 text-blue-800', DONE: 'bg-green-100 text-green-800', CANCELED: 'bg-red-100 text-red-800' };
    return m[s] || 'bg-gray-100 text-gray-700';
  };

  const handleRowClick = (move: MoveRow) => {
    if (move.type === 'IN') {
      router.push(`/receipts/${move.parentId}`);
    } else {
      router.push(`/deliveries/${move.parentId}`);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 -m-8 p-8 min-h-screen">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 sticky top-0 bg-gray-50 z-20 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-semibold text-gray-800">Move History</span>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search reference or contacts..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 placeholder:text-gray-500 text-gray-900 placeholder:text-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* View Toggles */}
          <div className="flex bg-gray-200 p-1 rounded-lg border border-gray-300 shadow-inner">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-shadow ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md transition-shadow ${viewMode === 'kanban' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="Kanban View"
            >
              <KanbanSquare className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
      ) : (
        <div className="flex-1 overflow-auto">
          {viewMode === 'list' ? (
            /* LIST VIEW */
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reference</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">From</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">To</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMoves.map((move) => {
                    const isIn = move.type === 'IN';
                    const rowColor = isIn ? 'hover:bg-green-50/50' : 'hover:bg-red-50/50';
                    const textAccent = isIn ? 'text-green-700' : 'text-red-700';

                    return (
                      <tr 
                        key={move.id}
                        className={`cursor-pointer transition-colors ${rowColor}`}
                        onClick={() => handleRowClick(move)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <span className={`inline-block w-2 h-2 rounded-full ${isIn ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span className={`font-bold ${textAccent}`}>{move.referenceId}</span>
                          </div>
                          {move.productSku && (
                            <div className="text-xs text-gray-400 ml-4 mt-0.5">[{move.productSku}] {move.productName}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {move.date ? format(new Date(move.date), 'MMM d, yyyy') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {move.contact}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isIn ? 'text-gray-600' : textAccent}`}>
                          {move.from}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isIn ? textAccent : 'text-gray-600'}`}>
                          {move.to}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`font-bold font-mono ${textAccent}`}>
                            {move.quantity > 0 ? move.quantity : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold leading-5 ${statusColor(move.status)}`}>
                            {move.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredMoves.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        {searchTerm ? 'No moves found matching your search.' : 'No move history yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* KANBAN VIEW */
            <div className="flex gap-6 h-full p-2 overflow-x-auto items-start pb-8">
              {Object.entries(kanbanColumns).map(([status, group]) => (
                <div key={status} className="flex-none w-80 bg-gray-100/80 border border-gray-200 rounded-xl shadow-sm flex flex-col max-h-full">
                  <div className={`px-4 py-3 border-b flex items-center justify-between bg-white rounded-t-xl
                    ${status === 'DRAFT' ? 'border-gray-200' : 
                      status === 'READY' ? 'border-blue-200' : 'border-green-200'}`}
                  >
                    <h3 className="font-bold text-gray-700 tracking-wide text-sm flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${status === 'DRAFT' ? 'bg-gray-400' : status === 'READY' ? 'bg-blue-400' : 'bg-green-400'}`}></div>
                      {status}
                    </h3>
                    <span className="bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-xs font-bold">{group.length}</span>
                  </div>
                  <div className="p-3 overflow-y-auto flex-1 space-y-3">
                    {group.map(move => {
                      const isIn = move.type === 'IN';
                      return (
                        <div key={move.id} 
                          className={`bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-all cursor-pointer ${isIn ? 'border-green-200 hover:border-green-400' : 'border-red-200 hover:border-red-400'}`}
                          onClick={() => handleRowClick(move)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-sm font-extrabold ${isIn ? 'text-green-700' : 'text-red-700'}`}>
                              {move.referenceId}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isIn ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {isIn ? 'IN' : 'OUT'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            {move.productSku && (
                              <p className="font-medium text-gray-700">[{move.productSku}] {move.productName} × {move.quantity}</p>
                            )}
                            <p><span className="font-medium text-gray-700">From:</span> {move.from}</p>
                            <p><span className="font-medium text-gray-700">To:</span> {move.to}</p>
                            {move.date && <p className="text-gray-400 mt-1">{format(new Date(move.date), 'MMM d, yyyy')}</p>}
                          </div>
                        </div>
                      );
                    })}
                    {group.length === 0 && <div className="text-center py-6 text-sm text-gray-400 font-medium border-2 border-dashed border-gray-200 rounded-lg">No moves</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
