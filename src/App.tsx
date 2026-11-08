import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CatalogProvider, useCatalog } from './context/CatalogContext';
import { ToastContainer } from './components/common/ToastContainer';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { CatalogPage } from './pages/public/CatalogPage';
import { ProductDetailPage } from './pages/public/ProductDetailPage';
import { CategoriesPage } from './pages/public/CategoriesPage';
import { AboutPage } from './pages/public/AboutPage';

// Admin Pages & Layout
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Modals
import { ProductFormModal } from './components/admin/ProductFormModal';
import { CategoryModal } from './components/admin/CategoryModal';
import type { Product, Category } from './types';
import { api } from './services/api';
import { RefreshCw } from 'lucide-react';

function MainApp() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { categories, refreshData, addToast } = useCatalog();

  // Navigation State
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [navParams, setNavParams] = useState<any>({});

  // Public initial data cache
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalCategories: 0, totalUnits: 0 });
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Global Admin Modals State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash || hash === 'home') {
        setCurrentPage('home');
        setNavParams({});
      } else if (hash.startsWith('catalog')) {
        const queryPart = hash.includes('?') ? hash.split('?')[1] : '';
        const params = new URLSearchParams(queryPart);
        setCurrentPage('catalog');
        setNavParams({
          q: params.get('q') || '',
          category: params.get('category') || '',
          featured: params.get('featured') === '1'
        });
      } else if (hash.startsWith('produk/')) {
        const slug = hash.replace('produk/', '');
        setCurrentPage('product-detail');
        setNavParams({ slug });
      } else if (hash === 'categories') {
        setCurrentPage('categories');
        setNavParams({});
      } else if (hash === 'about') {
        setCurrentPage('about');
        setNavParams({});
      } else if (hash === 'admin-login') {
        setCurrentPage('admin-login');
        setNavParams({});
      } else if (hash.startsWith('admin/')) {
        const sub = hash.replace('admin/', '');
        if (sub === 'products') setCurrentPage('admin-products');
        else if (sub === 'categories') setCurrentPage('admin-categories');
        else if (sub === 'settings') setCurrentPage('admin-settings');
        else setCurrentPage('admin-dashboard');
        setNavParams({});
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch initial home data
  const loadHomeData = async () => {
    try {
      const res = await api.getInitialData();
      setFeaturedProducts(res.featuredProducts || []);
      setLatestProducts(res.latestProducts || []);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      console.error('Error loading initial home data:', err);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  // Unified Navigate Helper
  const navigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setNavParams(params);

    // Update URL hash cleanly
    if (page === 'home') {
      window.location.hash = '#/';
    } else if (page === 'catalog') {
      const query = new URLSearchParams();
      if (params.q) query.set('q', params.q);
      if (params.category) query.set('category', params.category);
      if (params.featured) query.set('featured', '1');
      const qStr = query.toString();
      window.location.hash = `#/catalog${qStr ? '?' + qStr : ''}`;
    } else if (page === 'product-detail') {
      window.location.hash = `#/produk/${params.slug}`;
    } else if (page === 'categories') {
      window.location.hash = '#/categories';
    } else if (page === 'about') {
      window.location.hash = '#/about';
    } else if (page === 'admin-login') {
      window.location.hash = '#/admin-login';
    } else if (page.startsWith('admin-')) {
      const sub = page.replace('admin-', '');
      window.location.hash = `#/admin/${sub}`;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Protected Admin Area Check
  const isAdminRoute = currentPage.startsWith('admin-');
  if (isAdminRoute && !authLoading && !isAuthenticated && currentPage !== 'admin-login') {
    return (
      <AdminLoginPage
        onNavigatePublic={navigate}
        onLoginSuccess={() => navigate('admin-dashboard')}
      />
    );
  }

  // Admin View
  if (isAdminRoute && currentPage !== 'admin-login') {
    const adminActiveTab = (
      currentPage === 'admin-products'
        ? 'products'
        : currentPage === 'admin-categories'
        ? 'categories'
        : currentPage === 'admin-settings'
        ? 'settings'
        : 'dashboard'
    ) as 'dashboard' | 'products' | 'categories' | 'settings';

    return (
      <AdminLayout
        activeTab={adminActiveTab}
        onTabChange={(tab) => navigate(`admin-${tab}`)}
        onNavigatePublic={navigate}
      >
        <ToastContainer />

        {adminActiveTab === 'dashboard' && (
          <AdminDashboardPage
            onNavigateTab={(tab) => navigate(`admin-${tab}`)}
            onOpenAddProduct={() => {
              setProductToEdit(null);
              setIsProductModalOpen(true);
            }}
            onOpenAddCategory={() => {
              setCategoryToEdit(null);
              setIsCategoryModalOpen(true);
            }}
          />
        )}

        {adminActiveTab === 'products' && (
          <AdminProductsPage
            categories={categories}
            onOpenAddModal={() => {
              setProductToEdit(null);
              setIsProductModalOpen(true);
            }}
            onOpenEditModal={(product) => {
              setProductToEdit(product);
              setIsProductModalOpen(true);
            }}
            onNavigatePublicProduct={(slug) => navigate('product-detail', { slug })}
          />
        )}

        {adminActiveTab === 'categories' && (
          <AdminCategoriesPage
            onOpenProductsForCategory={(catId) => {
              navigate('admin-products');
            }}
          />
        )}

        {adminActiveTab === 'settings' && <AdminSettingsPage />}

        {/* Global Product Modal */}
        <ProductFormModal
          isOpen={isProductModalOpen}
          productToEdit={productToEdit}
          categories={categories}
          onClose={() => setIsProductModalOpen(false)}
          onSuccess={() => {
            refreshData();
            loadHomeData();
          }}
        />

        {/* Global Category Modal */}
        <CategoryModal
          isOpen={isCategoryModalOpen}
          categoryToEdit={categoryToEdit}
          onClose={() => setIsCategoryModalOpen(false)}
          onSuccess={() => {
            refreshData();
          }}
        />
      </AdminLayout>
    );
  }

  // Admin Login View
  if (currentPage === 'admin-login') {
    return (
      <>
        <ToastContainer />
        <AdminLoginPage
          onNavigatePublic={navigate}
          onLoginSuccess={() => navigate('admin-dashboard')}
        />
      </>
    );
  }

  // Public Layout & Pages View
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-slate-800">
      <ToastContainer />
      <Navbar onNavigate={navigate} currentPage={currentPage} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 w-full">
        {isInitialLoading && currentPage === 'home' ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-emerald-700 animate-spin" />
            <span className="text-xs font-semibold text-slate-500">
              Menyiapkan etalase Katalog Pondok...
            </span>
          </div>
        ) : (
          <>
            {currentPage === 'home' && (
              <HomePage
                onNavigate={navigate}
                featuredProducts={featuredProducts}
                latestProducts={latestProducts}
                stats={stats}
              />
            )}

            {currentPage === 'catalog' && (
              <CatalogPage
                onNavigate={navigate}
                initialQuery={navParams.q || ''}
                initialCategory={navParams.category || ''}
                initialFeatured={navParams.featured || false}
              />
            )}

            {currentPage === 'product-detail' && (
              <ProductDetailPage slug={navParams.slug || ''} onNavigate={navigate} />
            )}

            {currentPage === 'categories' && <CategoriesPage onNavigate={navigate} />}

            {currentPage === 'about' && <AboutPage onNavigate={navigate} />}
          </>
        )}
      </main>

      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CatalogProvider>
        <MainApp />
      </CatalogProvider>
    </AuthProvider>
  );
}
