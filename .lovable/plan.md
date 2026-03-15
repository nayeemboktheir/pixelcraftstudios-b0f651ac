

## Plan: Add Landing Page (Digital Product) Source Filter to Admin Orders

### Problem
Ebook/digital product orders are placed with `order_source: 'landing_page'`, but the admin orders panel only has "Web Orders" and "Manual Orders" source filter tabs. Landing page orders show up but can't be filtered separately.

### Changes

**File: `src/pages/admin/AdminOrders.tsx`**

1. **Add `landing_page` to `sourceOptions` array** (line ~101-104):
   - Add `{ value: 'landing_page', label: 'Landing Page', icon: BookOpen }` (import `BookOpen` from lucide-react)
   
2. **Update `getSourceBadge` function** — this already handles unknown sources with a fallback, so adding the option to `sourceOptions` will automatically give it a proper badge.

That's it — the existing filter logic (`matchesSource`, `getSourceCount`, tab rendering via `sourceOptions.map`) already supports any source value dynamically. Adding the entry to `sourceOptions` will make landing page orders filterable and display with a proper icon/label.

