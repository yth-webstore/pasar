import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { CategoriesView } from './components/CategoriesView';
import { OrdersView } from './components/OrdersView';
import { SellerDashboard } from './components/SellerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ProfileView } from './components/ProfileView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartModal } from './components/CartModal';
import { CheckoutModal } from './components/CheckoutModal';
import { VillageNewsModal } from './components/VillageNewsModal';
import { AuthModal } from './components/AuthModal';
import { SEOAndPerformanceModal } from './components/SEOAndPerformanceModal';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      {activeTab === 'beranda' && <HomeView />}
      {activeTab === 'kategori' && <CategoriesView />}
      {activeTab === 'pesanan' && <OrdersView />}
      {(activeTab === 'toko' || activeTab === 'seller') && <SellerDashboard />}
      {activeTab === 'admin' && <AdminDashboard />}
      {activeTab === 'profil' && <ProfileView />}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div id="app-root" className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans">
        {/* Universal Top Header */}
        <Header />

        {/* Dynamic Screen Content */}
        <div className="flex-1">
          <MainContent />
        </div>

        {/* Global Modals */}
        <ProductDetailModal />
        <CartModal />
        <CheckoutModal />
        <VillageNewsModal />
        <AuthModal />
        <SEOAndPerformanceModal />

        {/* Mobile-First Sticky Bottom Navigation */}
        <BottomNav />
      </div>
    </AppProvider>
  );
}
