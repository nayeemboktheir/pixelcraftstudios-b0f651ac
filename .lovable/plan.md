

## Plan: Set Sheikhul Fashions Logo as Site Logo

### Steps

1. **Copy the uploaded logo** to `src/assets/site-logo.png` (replacing the existing default logo) and `public/favicon.png` for favicon use.

2. **Update `index.html`** to use the new logo as favicon.

3. **Update site default name** in `Header.tsx` and `AdminSiteSettings.tsx` from "খেজুর বাজার" to "Sheikhul Fashions".

4. **Update `public/robots.txt`** and `index.html` title if they reference the old brand name.

### Files to modify
- Copy `user-uploads://Sheikhul.png` → `src/assets/site-logo.png` and `public/favicon.png`
- `index.html` — update favicon and title
- `src/components/layout/Header.tsx` — update default site name fallback
- `src/pages/admin/AdminSiteSettings.tsx` — update default site name fallback

