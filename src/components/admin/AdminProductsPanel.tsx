import React, { useState } from 'react';
import { Package, Trash2, Search, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/seo';

export const AdminProductsPanel: React.FC = () => {
  const { products, deleteProduct, categories } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredProducts = products
    .filter((p) => {
      if (selectedCategory === 'all') return true;
      return p.categoryId === selectedCategory;
    })
    .filter((p) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sellerName.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
      );
    });

  return (
    <div id="admin-products-panel" className="space-y-4 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
        <div>
          <h2 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-700" />
            Katalog Produk & Komoditas Desa ({products.length})
          </h2>
          <p className="text-xs text-emerald-800 mt-0.5">
            Semua produk yang dijual oleh pedagang dan UMKM di Pasar Desa Sukamaju.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            Semua Kategori
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                selectedCategory === c.id
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama produk, penjual..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl w-full sm:w-64 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden text-xs"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-bold">
              <tr>
                <th className="p-3">Produk</th>
                <th className="p-3">Lapak / Penjual</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Harga</th>
                <th className="p-3">Stok</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50/50">
                  <td className="p-3 flex items-center gap-2.5">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-10 h-10 rounded-xl object-cover bg-neutral-100 border border-neutral-200 shrink-0"
                    />
                    <span className="font-bold text-neutral-900 max-w-xs truncate">{p.name}</span>
                  </td>
                  <td className="p-3 text-neutral-600">{p.sellerName}</td>
                  <td className="p-3">
                    <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md font-semibold">
                      {p.categoryName}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-emerald-800">{formatRupiah(p.price)}</td>
                  <td className="p-3">
                    <span
                      className={`font-semibold ${
                        p.stock <= 5 ? 'text-amber-600 font-bold' : 'text-neutral-700'
                      }`}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Hapus produk "${p.name}" dari sistem pasar desa?`)) deleteProduct(p.id);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-red-600 transition"
                      title="Hapus Produk"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
