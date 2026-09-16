import React from 'react';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Store as StoreIcon,
  Bike,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/seo';

export const AdminStatsPanel: React.FC = () => {
  const { orders, products, users, stores } = useApp();

  const totalOmset = orders
    .filter((o) => o.status === 'selesai')
    .reduce((acc, o) => acc + o.total, 0);

  const totalSellers = users.filter((u) => u.role === 'seller').length;
  const totalBuyers = users.filter((u) => u.role === 'buyer').length;
  const totalCouriers = users.filter((u) => u.role === 'courier').length;

  return (
    <div id="admin-stats-panel" className="space-y-5 animate-in fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex justify-between items-center text-xs text-neutral-500 font-bold">
            <span>Omset Transaksi Desa</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-900 mt-2">
            {formatRupiah(totalOmset)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Total perputaran uang di desa</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex justify-between items-center text-xs text-neutral-500 font-bold">
            <span>Total Pesanan Warga</span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900 mt-2">{orders.length}</div>
          <div className="text-[11px] text-neutral-400 mt-1">Transaksi tercatat</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex justify-between items-center text-xs text-neutral-500 font-bold">
            <span>UMKM & Lapak Aktif</span>
            <StoreIcon className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900 mt-2">{stores.length || totalSellers}</div>
          <div className="text-[11px] text-neutral-400 mt-1">Unit usaha binaan BUMDes</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex justify-between items-center text-xs text-neutral-500 font-bold">
            <span>Produk Terdaftar</span>
            <Package className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900 mt-2">{products.length}</div>
          <div className="text-[11px] text-neutral-400 mt-1">Komoditas & olahan desa</div>
        </div>
      </div>

      {/* Ekosistem Peran Desa */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 text-center">
          <div className="text-[11px] font-bold text-neutral-500">Warga Pembeli</div>
          <div className="text-xl font-extrabold text-neutral-900 mt-1">{totalBuyers}</div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 text-center">
          <div className="text-[11px] font-bold text-amber-700">Lapak & UMKM</div>
          <div className="text-xl font-extrabold text-amber-800 mt-1">{stores.length}</div>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 text-center">
          <div className="text-[11px] font-bold text-blue-700">Kurir Desa Aktif</div>
          <div className="text-xl font-extrabold text-blue-800 mt-1">{totalCouriers}</div>
        </div>
      </div>

      {/* Transaksi Terkini Table */}
      <div className="bg-white rounded-3xl border border-neutral-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-neutral-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            Transaksi Terkini Seluruh Desa
          </h3>
          <span className="text-xs text-neutral-400 font-medium">8 transaksi terakhir</span>
        </div>
        {orders.length === 0 ? (
          <p className="text-xs text-neutral-500 py-6 text-center">Belum ada transaksi di pasar desa.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 font-bold">
                  <th className="py-2.5">No. Invoice</th>
                  <th>Pembeli</th>
                  <th>Lapak / Penjual</th>
                  <th>Total</th>
                  <th>Metode</th>
                  <th>Pengiriman</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.slice(0, 8).map((ord) => (
                  <tr key={ord.id} className="py-2.5">
                    <td className="py-2.5 font-bold text-neutral-900">{ord.invoiceNumber}</td>
                    <td>{ord.buyerName}</td>
                    <td className="font-medium text-neutral-700">{ord.storeName || ord.sellerName}</td>
                    <td className="font-bold text-emerald-800">{formatRupiah(ord.total)}</td>
                    <td className="uppercase font-semibold">{ord.paymentMethod}</td>
                    <td>
                      <span className="capitalize text-neutral-600">
                        {ord.deliveryMethod === 'antar_desa' ? 'Antar Desa' : 'Ambil Toko'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          ord.status === 'selesai'
                            ? 'bg-emerald-100 text-emerald-900'
                            : ord.status === 'diproses'
                            ? 'bg-blue-100 text-blue-900'
                            : ord.status === 'dikirim'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-neutral-100 text-neutral-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
