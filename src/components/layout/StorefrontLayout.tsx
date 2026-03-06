import Header from './Header';
import Footer from './Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import SocialChatWidget from '@/components/SocialChatWidget';

const StorefrontLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-grow">{children}</main>
    <Footer />
    <CartDrawer />
    <SocialChatWidget />
  </div>
);

export default StorefrontLayout;
