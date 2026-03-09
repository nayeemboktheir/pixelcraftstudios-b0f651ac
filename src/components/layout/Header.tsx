import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCartCount, toggleCart } from '@/store/slices/cartSlice';
import { selectWishlistItems } from '@/store/slices/wishlistSlice';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { categories } from '@/data/mockData';
import defaultLogo from '@/assets/site-logo.png';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  const cartCount = useAppSelector(selectCartCount);
  const wishlistItems = useAppSelector(selectWishlistItems);
  const dispatch = useAppDispatch();
  const { user, signOut, isAdmin } = useAuth();

  // Fetch header settings
  const { data: headerSettings } = useQuery({
    queryKey: ['header-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value')
        .in('key', ['site_name', 'site_logo', 'shop_logo_url']);

      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data?.forEach(item => {
        settingsMap[item.key] = item.value;
      });

      return settingsMap;
    },
    // Don't keep stale for minutes — we want header to reflect admin changes quickly
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const siteName = headerSettings?.site_name || 'Sheikhul Fashions';
  const siteLogo = headerSettings?.site_logo || headerSettings?.shop_logo_url || defaultLogo;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-4">
      <div className="container-custom">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            {siteLogo ? (
              <img
                src={siteLogo}
                alt={siteName || 'Site Logo'}
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== defaultLogo) {
                    target.src = defaultLogo;
                  }
                }}
              />
            ) : (
              <span className="text-base md:text-lg font-semibold text-primary-foreground leading-none">
                {siteName}
              </span>
            )}
          </Link>

          {/* Center Nav Pill - Desktop */}
          <nav className="hidden md:block">
            <ul className={`flex items-center gap-1 rounded-full px-2 py-1.5 transition-all duration-300 ${
              isScrolled 
                ? 'bg-primary/90 backdrop-blur-md shadow-lg' 
                : 'bg-primary/60 backdrop-blur-sm'
            }`}>
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'Products' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
              ].map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="block px-4 py-1.5 rounded-full text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden md:flex">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-40 lg:w-52 h-9 rounded-full bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 text-sm pr-9"
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-9 w-9 text-primary-foreground/70 hover:text-primary-foreground hover:bg-transparent"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Wishlist */}
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="relative h-9 w-9 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-full">
                <Heart className="h-4 w-4" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                    {wishlistItems.length}
                  </span>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-full"
              onClick={() => dispatch(toggleCart())}
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Button>

            {/* Account */}
            {user ? (
              <div className="relative group">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
                <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-card rounded-lg shadow-xl border border-border p-3 min-w-[160px]">
                    <p className="text-sm text-muted-foreground mb-2 px-2 truncate">
                      {user.email}
                    </p>
                    {isAdmin && (
                      <Link to="/admin" className="block px-2 py-1.5 text-sm text-foreground hover:text-primary hover:bg-muted rounded transition-colors">
                        অ্যাডমিন প্যানেল
                      </Link>
                    )}
                    <Link to="/my-account" className="block px-2 py-1.5 text-sm text-foreground hover:text-primary hover:bg-muted rounded transition-colors">
                      আমার অর্ডার
                    </Link>
                    <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-destructive hover:bg-muted rounded transition-colors">
                      <LogOut className="h-4 w-4" />
                      লগআউট
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 text-primary-foreground hover:bg-primary-foreground/10 rounded-full"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4"
            >
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="পণ্য খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-12 rounded-full"
                />
                <Button type="submit" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2">
                  <Search className="h-5 w-5" />
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-2 mx-4"
          >
            <nav className="bg-primary/90 backdrop-blur-md rounded-2xl p-4 shadow-lg">
              <ul className="space-y-1">
                {[
                  { to: '/', label: 'Home' },
                  { to: '/products', label: 'Products' },
                  { to: '/about', label: 'About Us' },
                  { to: '/contact', label: 'Contact' },
                ].map(link => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="block py-2.5 px-4 rounded-xl text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 font-medium transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
