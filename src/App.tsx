import { Provider } from "react-redux";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { store } from "@/store/store";
import { AuthProvider } from "@/hooks/useAuth";
import { FacebookPixelTracker } from "@/components/tracking/FacebookPixelTracker";
import GoogleAnalyticsTracker from "@/components/tracking/GoogleAnalyticsTracker";
import { TikTokPixelTracker } from "@/components/tracking/TikTokPixelTracker";
import FaviconLoader from "@/components/FaviconLoader";

import CheckoutPage from "@/pages/CheckoutPage";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import OrderConfirmationPage from "@/pages/OrderConfirmationPage";
import HomePage from "@/pages/HomePage";
import FashionHomePage from "@/pages/FashionHomePage";
// EbookLandingPage is now database-driven via /lp/ebook
import EbookLandingPage from "@/pages/EbookLandingPage";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CartPage from "@/pages/CartPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import WishlistPage from "@/pages/WishlistPage";
import MyAccountPage from "@/pages/MyAccountPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import NotFound from "@/pages/NotFound";
import StorefrontLayout from "@/components/layout/StorefrontLayout";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminIncompleteOrders from "@/pages/admin/AdminIncompleteOrders";
import AdminOrderProtection from "@/pages/admin/AdminOrderProtection";
import AdminCourierHistory from "@/pages/admin/AdminCourierHistory";
import AdminCourierSettings from "@/pages/admin/AdminCourierSettings";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminInventory from "@/pages/admin/AdminInventory";
import AdminBanners from "@/pages/admin/AdminBanners";
import AdminShopSettings from "@/pages/admin/AdminShopSettings";
import AdminMarketing from "@/pages/admin/AdminMarketing";
import AdminSMS from "@/pages/admin/AdminSMS";
import AdminLandingPages from "@/pages/admin/AdminLandingPages";
import AdminLandingPageEditor from "@/pages/admin/AdminLandingPageEditor";
import AdminContactSubmissions from "@/pages/admin/AdminContactSubmissions";
import AdminSiteSettings from "@/pages/admin/AdminSiteSettings";
import AdminSocialMedia from "@/pages/admin/AdminSocialMedia";
import AdminReports from "@/pages/admin/AdminReports";
import AdminHomePageEdit from "@/pages/admin/AdminHomePageEdit";

const queryClient = new QueryClient();

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
              {/* Storefront Routes */}
              <Route path="/" element={<EbookLandingPage />} />
              {/* /lp/ebook is now database-driven via /lp/:slug */}
              <Route
                path="/products"
                element={
                  <StorefrontLayout>
                    <ProductsPage />
                  </StorefrontLayout>
                }
              />
              <Route
                path="/products/:slug"
                element={
                  <StorefrontLayout>
                    <ProductDetailPage />
                  </StorefrontLayout>
                }
              />
              <Route
                path="/cart"
                element={
                  <StorefrontLayout>
                    <CartPage />
                  </StorefrontLayout>
                }
              />
              <Route
                path="/about"
                element={
                  <StorefrontLayout>
                    <AboutPage />
                  </StorefrontLayout>
                }
              />
              <Route
                path="/contact"
                element={
                  <StorefrontLayout>
                    <ContactPage />
                  </StorefrontLayout>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <StorefrontLayout>
                    <WishlistPage />
                  </StorefrontLayout>
                }
              />
              <Route
                path="/my-account"
                element={
                  <StorefrontLayout>
                    <MyAccountPage />
                  </StorefrontLayout>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <StorefrontLayout>
                    <ResetPasswordPage />
                  </StorefrontLayout>
                }
              />

              {/* Checkout & Auth */}
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
              <Route path="/auth" element={<AuthPage />} />

              {/* Landing Pages */}
              <Route path="/lp/:slug" element={<LandingPage />} />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <AdminLayout>
                    <AdminReports />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <AdminLayout>
                    <AdminProducts />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <AdminLayout>
                    <AdminCategories />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <AdminLayout>
                    <AdminOrders />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/incomplete-orders"
                element={
                  <AdminLayout>
                    <AdminIncompleteOrders />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/order-protection"
                element={
                  <AdminLayout>
                    <AdminOrderProtection />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/contact-submissions"
                element={
                  <AdminLayout>
                    <AdminContactSubmissions />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/landing-pages"
                element={
                  <AdminLayout>
                    <AdminLandingPages />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/landing-pages/:id"
                element={
                  <AdminLayout>
                    <AdminLandingPageEditor />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/courier-history"
                element={
                  <AdminLayout>
                    <AdminCourierHistory />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/courier-settings"
                element={
                  <AdminLayout>
                    <AdminCourierSettings />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminLayout>
                    <AdminUsers />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/inventory"
                element={
                  <AdminLayout>
                    <AdminInventory />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/banners"
                element={
                  <AdminLayout>
                    <AdminBanners />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/marketing"
                element={
                  <AdminLayout>
                    <AdminMarketing />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/sms"
                element={
                  <AdminLayout>
                    <AdminSMS />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/social-media"
                element={
                  <AdminLayout>
                    <AdminSocialMedia />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/shop-settings"
                element={
                  <AdminLayout>
                    <AdminShopSettings />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/site-settings"
                element={
                  <AdminLayout>
                    <AdminSiteSettings />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/home-page-edit"
                element={
                  <AdminLayout>
                    <AdminHomePageEdit />
                  </AdminLayout>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
