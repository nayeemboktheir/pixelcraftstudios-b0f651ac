import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  LogOut,
  Home,
  Package,
  Info,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCartCount, toggleCart } from '@/store/slices/cartSlice';
import { selectWishlistItems } from '@/store/slices/wishlistSlice';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import defaultLogo from '@/assets/site-logo.png';

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

const menu: MenuItem[] = [
  { title: 'Home', url: '/' },
  { title: 'Products', url: '/products' },
  { title: 'About Us', url: '/about' },
  { title: 'Contact', url: '/contact' },
];

const Header = () => {
  const [openSearch, setOpenSearch] = useState(false);
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
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const siteName = headerSettings?.site_name || 'Sheikhul Fashions';
  const siteLogo = headerSettings?.site_logo || headerSettings?.shop_logo_url || defaultLogo;

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSearchSelect = (value: string) => {
    navigate(`/products?search=${encodeURIComponent(value)}`);
    setOpenSearch(false);
  };

  const renderMenuItem = (item: MenuItem) => {
    if (item.items) {
      return (
        <NavigationMenuItem key={item.title}>
          <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="w-80 p-3">
              <li className="grid gap-1">
                {item.items.map((subItem) => (
                  <NavigationMenuLink key={subItem.title} asChild>
                    <Link
                      to={subItem.url}
                      className="flex select-none gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {subItem.icon}
                      <div>
                        <div className="text-sm font-semibold">{subItem.title}</div>
                        {subItem.description && (
                          <p className="text-sm leading-snug text-muted-foreground">
                            {subItem.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  </NavigationMenuLink>
                ))}
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      );
    }

    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
          <Link to={item.url}>{item.title}</Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
    );
  };

  const renderMobileMenuItem = (item: MenuItem) => {
    if (item.items) {
      return (
        <AccordionItem key={item.title} value={item.title} className="border-b-0">
          <AccordionTrigger className="py-0 font-semibold hover:no-underline">
            {item.title}
          </AccordionTrigger>
          <AccordionContent>
            {item.items.map((subItem) => (
              <Link
                key={subItem.title}
                to={subItem.url}
                className="flex select-none gap-4 rounded-md p-3 leading-none outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {subItem.icon}
                <div>
                  <div className="text-sm font-semibold">{subItem.title}</div>
                  {subItem.description && (
                    <p className="text-sm leading-snug text-muted-foreground">
                      {subItem.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </AccordionContent>
        </AccordionItem>
      );
    }

    return (
      <Link
        key={item.title}
        to={item.url}
        className="font-semibold py-2 block"
      >
        {item.title}
      </Link>
    );
  };

  return (
    <section className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <div className="container-custom">
        {/* Desktop Navbar */}
        <nav className="hidden justify-between lg:flex py-3">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={siteLogo}
                alt={siteName || 'Site Logo'}
                className="h-9 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== defaultLogo) {
                    target.src = defaultLogo;
                  }
                }}
              />
            </Link>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {menu.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setOpenSearch(true)}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Wishlist */}
            <Link to="/wishlist">
              <Button variant="outline" size="icon" className="relative">
                <Heart className="h-4 w-4" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                    {wishlistItems.length}
                  </span>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Button
              variant="outline"
              size="icon"
              className="relative"
              onClick={() => dispatch(toggleCart())}
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Button>

            {/* Auth */}
            {user ? (
              <div className="relative group">
                <Button variant="outline" size="icon">
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
                <Button variant="ghost">Sign in</Button>
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile Navbar */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between py-3">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={siteLogo}
                alt={siteName || 'Site Logo'}
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== defaultLogo) {
                    target.src = defaultLogo;
                  }
                }}
              />
            </Link>

            <div className="flex items-center gap-2">
              {/* Search mobile */}
              <Button variant="outline" size="icon" onClick={() => setOpenSearch(true)}>
                <Search className="h-4 w-4" />
              </Button>

              {/* Cart mobile */}
              <Button
                variant="outline"
                size="icon"
                className="relative"
                onClick={() => dispatch(toggleCart())}
              >
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Button>

              {/* Menu Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>
                      <Link to="/" className="flex items-center gap-2">
                        <img
                          src={siteLogo}
                          alt={siteName || 'Site Logo'}
                          className="h-8 w-auto object-contain"
                        />
                      </Link>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="my-8 flex flex-col gap-4">
                    <Accordion type="single" collapsible className="flex w-full flex-col gap-4">
                      {menu.map((item) => renderMobileMenuItem(item))}
                    </Accordion>

                    <div className="border-t pt-4">
                      <div className="flex flex-col gap-2">
                        <Link to="/wishlist" className="flex items-center gap-2 py-2 text-sm font-medium">
                          <Heart className="h-4 w-4" />
                          Wishlist
                          {wishlistItems.length > 0 && (
                            <span className="ml-auto h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
                              {wishlistItems.length}
                            </span>
                          )}
                        </Link>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      {user ? (
                        <div className="flex flex-col gap-2">
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                          {isAdmin && (
                            <Link to="/admin" className="text-sm font-medium py-1">
                              অ্যাডমিন প্যানেল
                            </Link>
                          )}
                          <Link to="/my-account" className="text-sm font-medium py-1">
                            আমার অর্ডার
                          </Link>
                          <button onClick={handleSignOut} className="flex items-center gap-2 text-sm text-destructive py-1">
                            <LogOut className="h-4 w-4" />
                            লগআউট
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <Link to="/auth">
                            <Button variant="outline" className="w-full">Sign in</Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Search Dialog */}
      <CommandDialog open={openSearch} onOpenChange={setOpenSearch}>
        <CommandInput placeholder="পণ্য খুঁজুন..." />
        <CommandList>
          <CommandEmpty>কোন ফলাফল পাওয়া যায়নি।</CommandEmpty>
          <CommandGroup heading="Quick Links">
            <CommandItem onSelect={() => handleSearchSelect('')}>
              <Home className="mr-2 h-4 w-4" />
              Home
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/products'); setOpenSearch(false); }}>
              <Package className="mr-2 h-4 w-4" />
              All Products
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/contact'); setOpenSearch(false); }}>
              <Phone className="mr-2 h-4 w-4" />
              Contact
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </section>
  );
};

export default Header;
