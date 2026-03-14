'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { productService } from '@/services/product';
import { Product, Category } from '@/types/product';
import { Plus, Package, Tags, Trash2, Edit2, Search } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals removed in favor of dedicated pages

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        productService.getProducts(),
        productService.getCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);

    } catch (error) {
      console.error('Failed to load products/categories', error);
      // Fallback data for testing UI when API is unavailable
      setCategories([{ id: 'c1', name: 'Electronics', _count: { products: 5 } }]);
      setProducts([
        { id: '1', name: 'Wireless Mouse', sku: 'WM-001', categoryId: 'c1', unitOfMeasure: 'pcs', createdAt: new Date().toISOString(), category: { id: 'c1', name: 'Electronics' } }
      ]);
    } finally {
      setIsLoading(false);
    }
  };



  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.deleteProduct(id);
      fetchData();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Ensure no products are attached.')) return;
    try {
      await productService.deleteCategory(id);
      fetchData();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to delete category');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Catalog</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your products and categories</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          {activeTab === 'products' ? (
             <Link
               href="/products/new"
               className="inline-flex flex-1 sm:flex-none justify-center items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
             >
               <Plus className="w-4 h-4 mr-2" /> Add Product
             </Link>
          ) : (
             <Link
               href="/categories/new"
               className="inline-flex flex-1 sm:flex-none justify-center items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
             >
               <Plus className="w-4 h-4 mr-2" /> Add Category
             </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('products')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
              ${activeTab === 'products'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
            aria-current={activeTab === 'products' ? 'page' : undefined}
          >
            <Package className="w-5 h-5 mr-2" />
            Products
            <span className="ml-3 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
              {products.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
              ${activeTab === 'categories'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
            aria-current={activeTab === 'categories' ? 'page' : undefined}
          >
            <Tags className="w-5 h-5 mr-2" />
            Categories
            <span className="ml-3 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
              {categories.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Layout Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
           <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : activeTab === 'products' ? (
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 flex items-center">
            <div className="relative max-w-sm w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 placeholder:text-gray-500 text-gray-900 placeholder:text-gray-500"
                placeholder="Search products by Name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {product.sku}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{product.category?.name || 'Uncategorized'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.unitOfMeasure}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleDeleteProduct(product.id)} className="text-red-500 hover:text-red-700 ml-4 p-2 rounded hover:bg-red-50 transition-colors">
                         <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                   <tr>
                     <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                       {searchQuery ? 'No products found matching your search.' : 'No products in the catalog yet.'}
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors group">
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center border border-indigo-100">
                      <Tags className="w-6 h-6 text-indigo-500" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{category.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                       <Package className="w-3 h-3 mr-1" />
                       {category._count?.products || 0} products
                    </p>
                  </div>
                </div>
                <div className="flex -space-x-1">
                   <button onClick={() => handleDeleteCategory(category.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors focus:outline-none">
                     <span className="sr-only">Delete</span>
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
             <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
               <Tags className="w-12 h-12 text-gray-400 mx-auto mb-3" />
               <p className="text-gray-500 font-medium">No categories found.</p>
               <Link href="/categories/new" className="mt-2 text-indigo-600 hover:underline text-sm font-medium block">Create your first category</Link>
             </div>
          )}
        </div>
      )}



    </div>
  );
}
