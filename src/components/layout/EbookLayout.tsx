import { Link } from 'react-router-dom';
import pcsLogo from '@/assets/pcs-logo.png';

const EbookLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container-custom py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={pcsLogo} alt="Pixelcraft Studio" className="h-10 w-auto rounded-lg" />
              <span className="font-display font-bold text-foreground hidden sm:inline">Pixelcraft Studio</span>
            </Link>

            <nav className="flex items-center gap-6">
              <Link
                to="/about"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                আমাদের সম্পর্কে
              </Link>
              <Link
                to="/contact"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                যোগাযোগ
              </Link>
              <a href="/#faq" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                FAQ
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-secondary/30">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={pcsLogo} alt="Pixelcraft Studio" className="h-8 w-auto rounded-lg" />
              <span className="font-display font-bold text-foreground">Pixelcraft Studio</span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                আমাদের সম্পর্কে
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                যোগাযোগ
              </Link>
              <a href="/#faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                FAQ
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Pixelcraft Studio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EbookLayout;
