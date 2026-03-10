

## Restore Storefront Routes

All storefront page components still exist in `src/pages/` — they were just removed from routing in `App.tsx`. The fix is to re-add all the storefront routes and wrap them with the shared layout (Header, Footer, CartDrawer, SocialChatWidget).

### Pages to restore

| Route | Component |
|-------|-----------|
| `/` | HomePage |
| `/products` | ProductsPage |
| `/products/:slug` | ProductDetailPage |
| `/cart` | CartPage |
| `/about` | AboutPage |
| `/contact` | ContactPage |
| `/wishlist` | WishlistPage |
| `/my-account` | MyAccountPage |
| `/reset-password` | ResetPasswordPage |

### Changes

**1. `src/App.tsx`**
- Import all storefront page components (HomePage, ProductsPage, ProductDetailPage, CartPage, AboutPage, ContactPage, WishlistPage, MyAccountPage, ResetPasswordPage)
- Import CartDrawer and SocialChatWidget
- Create a `StorefrontLayout` wrapper that includes Header, Footer, CartDrawer, and SocialChatWidget
- Add routes for all storefront pages listed above
- Change the default `/` route from redirecting to `/admin` to rendering HomePage
- Change the `*` catch-all to render NotFound instead of redirecting to admin

**2. Create `src/components/layout/StorefrontLayout.tsx`**
- Wraps children with Header at top, Footer at bottom, CartDrawer overlay, and SocialChatWidget
- Reusable layout for all public-facing storefront pages

