# Integration of Dynamic Visuals Data

This document outlines the final steps taken to integrate dynamically managed visual data (Categories, Platforms, Genres) into the frontend, replacing hardcoded static data.

## 1. Overview
The goal was to remove the reliance on static data files (`src/lib/data.ts`) and hardcoded dictionaries (`PLATFORM_NAMES`, `GENRE_NAMES`) in favor of fetching this Reference Data directly from the backend API. This ensures that when an admin adds a new Platform or Genre, it immediately appears in the Storefront and Admin interfaces without requiring a code deployment.

## 2. Key Changes

### A. Frontend Data Fetching (`src/components/game/game-catalog.tsx`)
- **Old Behavior:** Imported `platforms` and `genres` from `@/lib/data`.
- **New Behavior:** 
    - Fetches `ApiClient.getPlatforms()` and `ApiClient.getGenres()` inside a `useEffect` on component mount.
    - Stores these lists in local state (`platforms`, `genres`).
    - Renders the Filter Dropdowns using this dynamic data.

### B. Admin Product Forms (`src/app/admin/products/new/page.tsx` & `[id]/page.tsx`)
- **Old Behavior:** Imported static lists for the Platform and Genre Select inputs.
- **New Behavior:**
    - Similarly fetches the lists on mount using `ApiClient`.
    - Populates the Select options dynamically.
    - This ensures that admins can categorize products under newly created platforms/genres immediately.

### C. Homepage Integration (`src/app/page.tsx`)
- **Old Behavior:** "Hydrated" a hardcoded list of names (`PLATFORM_NAMES`) with backend data. This meant new platforms would never show up unless added to the hardcoded list.
- **New Behavior:**
    - Fetches the raw lists from the backend.
    - Maps the backend data directly to the UI format required by `CategoryCard`.
    - Handles image fallbacks if the backend doesn't provide an image.

### D. Schema & Data Cleanup (`src/lib/schemas.ts`)
- **Removed:** `PLATFORM_NAMES` and `GENRE_NAMES` dictionaries.
- **Updated:** `ProductSchema` transformation logic. It no longer looks up names in a dictionary. Instead, it expects the backend to provide the name in the relationship object (`platform: { id, name }`), which is the standard behavior of the updated API.

## 3. Verification
- **Type Safety:** `npx tsc --noEmit` checks passed, confirming that the new dynamic types match the expected interfaces.
- **Functional Check:** 
    - **Storefront:** Filters and Homepage Categories should now reflect exactly what is in the database.
    - **Admin:** Product creation/editing flows now use the live list of Categories/Platforms.

## 4. Next Steps
- **Manual QA:** Verify that creating a new Platform in the `VisualsManager` immediately makes it available in the "New Product" form.
- **Performance:** Consider implementing a global cache or React Query/SWR for these "Reference Data" lists to avoid fetching them on every page navigation, as they change infrequently.
