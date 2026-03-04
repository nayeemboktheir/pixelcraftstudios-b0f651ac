import { Provider } from 'react-redux';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { store } from '@/store/store';
import { AuthProvider } from '@/hooks/useAuth';
import { FacebookPixelTracker } from '@/components/tracking/FacebookPixelTracker';
import GoogleAnalyticsTracker from '@/components/tracking/GoogleAnalyticsTracker';
import { TikTokPixelTracker } from '@/components/tracking/TikTokPixelTracker';
import FaviconLoader from '@/components/FaviconLoader';

import HomePage from '@/pages/HomePage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import WishlistPage from '@/pages/WishlistPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import MyAccountPage from '@/pages/MyAccountPage';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import OrderConfirmationPage from '@/pages/OrderConfirmationPage';
import NotFound from '@/pages/NotFound';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import SocialChatWidget from '@/components/SocialChatWidget';

import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminIncompleteOrders from '@/pages/admin/AdminIncompleteOrders';
import AdminOrderProtection from '@/pages/admin/AdminOrderProtection';
import AdminCourierHistory from '@/pages/admin/AdminCourierHistory';
import AdminCourierSettings from '@/pages/admin/AdminCourierSettings';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminInventory from '@/pages/admin/AdminInventory';
import AdminBanners from '@/pages/admin/AdminBanners';
import AdminShopSettings from '@/pages/admin/AdminShopSettings';
import AdminMarketing from '@/pages/admin/AdminMarketing';
import AdminSMS from '@/pages/admin/AdminSMS';
import AdminLandingPages from '@/pages/admin/AdminLandingPages';
import AdminLandingPageEditor from '@/pages/admin/AdminLandingPageEditor';
import AdminContactSubmissions from '@/pages/admin/AdminContactSubmissions';
import AdminSiteSettings from '@/pages/admin/AdminSiteSettings';
import AdminSocialMedia from '@/pages/admin/AdminSocialMedia';
import AdminReports from '@/pages/admin/AdminReports';
import AdminHomePageEdit from '@/pages/admin/AdminHomePageEdit';
import AdminLandingVideoSettings from '@/pages/admin/AdminLandingVideoSettings';
import AdminBotBhai from '@/pages/admin/AdminBotBhai';

const queryClient = new QueryClient();

const StoreLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Header />
    <CartDrawer />
    {children}
    <Footer />
    <SocialChatWidget />
  </>
);

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <FaviconLoader />
            <FacebookPixelTracker />
            <GoogleAnalyticsTracker />
            <TikTokPixelTracker />
            <Routes>
              {/* Store Routes */}
              <Route path="/" element={<StoreLayout><HomePage /></StoreLayout>} />
              <Route path="/products" element={<StoreLayout><ProductsPage /></StoreLayout>} />
              <Route path="/products/:slug" element={<StoreLayout><ProductDetailPage /></StoreLayout>} />
              <Route path="/cart" element={<StoreLayout><CartPage /></StoreLayout>} />
              <Route path="/checkout" element={<StoreLayout><CheckoutPage /></StoreLayout>} />
              <Route path="/wishlist" element={<StoreLayout><WishlistPage /></StoreLayout>} />
              <Route path="/about" element={<StoreLayout><AboutPage /></StoreLayout>} />
              <Route path="/contact" element={<StoreLayout><ContactPage /></StoreLayout>} />
              <Route path="/my-account" element={<StoreLayout><MyAccountPage /></StoreLayout>} />
              <Route path="/order-confirmation" element={<StoreLayout><OrderConfirmationPage /></StoreLayout>} />
              <Route path="/auth" element={<AuthPage />} />

              {/* Landing Pages */}
              <Route path="/lp/:slug" element={<LandingPage />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
              <Route path="/admin/reports" element={<AdminLayout><AdminReports /></AdminLayout>} />
              <Route path="/admin/products" element={<AdminLayout><AdminProducts /></AdminLayout>} />
              <Route path="/admin/categories" element={<AdminLayout><AdminCategories /></AdminLayout>} />
              <Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} />
              <Route path="/admin/incomplete-orders" element={<AdminLayout><AdminIncompleteOrders /></AdminLayout>} />
              <Route path="/admin/order-protection" element={<AdminOrderProtection />} />
              <Route path="/admin/contact-submissions" element={<AdminLayout><AdminContactSubmissions /></AdminLayout>} />
              <Route path="/admin/landing-pages" element={<AdminLayout><AdminLandingPages /></AdminLayout>} />
              <Route path="/admin/landing-pages/:id" element={<AdminLayout><AdminLandingPageEditor /></AdminLayout>} />
              <Route path="/admin/courier-history" element={<AdminLayout><AdminCourierHistory /></AdminLayout>} />
              <Route path="/admin/courier-settings" element={<AdminLayout><AdminCourierSettings /></AdminLayout>} />
              <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
              <Route path="/admin/inventory" element={<AdminLayout><AdminInventory /></AdminLayout>} />
              <Route path="/admin/banners" element={<AdminLayout><AdminBanners /></AdminLayout>} />
              <Route path="/admin/marketing" element={<AdminLayout><AdminMarketing /></AdminLayout>} />
              <Route path="/admin/sms" element={<AdminLayout><AdminSMS /></AdminLayout>} />
              <Route path="/admin/social-media" element={<AdminLayout><AdminSocialMedia /></AdminLayout>} />
              <Route path="/admin/shop-settings" element={<AdminLayout><AdminShopSettings /></AdminLayout>} />
              <Route path="/admin/site-settings" element={<AdminLayout><AdminSiteSettings /></AdminLayout>} />
              <Route path="/admin/home-page-edit" element={<AdminLayout><AdminHomePageEdit /></AdminLayout>} />
              <Route path="/admin/landing-video-settings" element={<AdminLandingVideoSettings />} />
              <Route path="/admin/botbhai" element={<AdminLayout><AdminBotBhai /></AdminLayout>} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
