import React from 'react';
import {
  Home,
  LayoutGrid,
  ShoppingCart,
  ClipboardList,
  User as UserIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, cart, orders, currentUser, setIsCartOpen } = useApp();

  const cartCount = cart.reduce((acc, it) => acc + it.quantity, 0);
  const activeOrdersCount = orders.filter(
    (o) => o.buyerId === currentUser?.id && o.status !== 'selesai' && o.status !== 'dibatalkan'
  ).length;

  const navItems = [
    {
      id: 'beranda' as const,
      label: 'Beranda',
      icon: Home,
      badge: null,
      onClick: () => setActiveTab('beranda'),
    },
    {
      id: 'kategori' as const,
      label: 'Kategori',
      icon: LayoutGrid,
      badge: null,
      onClick: () => setActiveTab('kategori'),
    },
    {
      id: 'keranjang' as const,
      label: 'Keranjang',
      icon: ShoppingCart,
      badge: cartCount > 0 ? cartCount : null,
      onClick: () => {
        setIsCartOpen(true);
      },
    },
    {
      id: 'pesanan' as const,
      label: 'Pesanan',
      icon: ClipboardList,
      badge: activeOrdersCount > 0 ? activeOrdersCount : null,
      onClick: () => setActiveTab('pesanan'),
    },
    {
      id: 'profil' as const,
      label: 'Profil',
      icon: UserIcon,
      badge: null,
      onClick: () => setActiveTab('profil'),
    },
  ];

  return (
    <nav
      id="bottom-navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 py-1.5 px-3 max-w-md mx-auto sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-full"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={item.onClick}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-700 font-bold scale-105'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {item.badge !== null && (
                  <span className="absolute -top-1.5 -right-2.5 bg-emerald-600 text-white text-[10px] font-extrabold px-1 rounded-full min-w-4 h-4 flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
              {isActive && (
                <div className="w-4 h-1 bg-emerald-700 rounded-full mt-0.5 animate-in fade-in zoom-in" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
