---
phase: 7
name: Production UI Hardening + Error Elimination + Brand Completion
wave: 1
---

# Phase 7 Plan: Production UI Hardening & Brand Completion

## Objective
Transform the platform from a functional prototype into a stable, brand-consistent, and error-free production environment ready for manual QA. Implement the exact visual identity from the provided brand assets and reference layouts.

## Brand Identity System
- **Name**: MRS. DEORE PREMIX
- **Tagline**: प्रत्येक घासात, आनंदाचा स्वाद..! (Taste of joy in every bite..!)
- **Colors**:
  - Primary: Saffron (#C2410C)
  - Accent: Turmeric (#EAB308)
  - Secondary: Maroon (#7F1D1D)
  - Background: Cream (#FFF8ED)
- **Aesthetic**: Traditional warmth meets modern clean eCommerce.

## Waves of Execution

### Wave 1: Layout Core & Global Stability
- [ ] Create `MainLayout`, `AuthLayout`, and `CheckoutLayout` to resolve double-navbar issues.
- [ ] Implement `ErrorBoundary` at the top level and for major feature blocks.
- [ ] Define the new Brand Color Palette in `index.css` (Tailwind config update or CSS variables).
- [ ] Implement a global `Image` component with fallback and loading shimmer (Targeting image 5's clean grid).

### Wave 2: Branding & Navigation (Image 1, 2, 3)
- [ ] Update `Navbar` with the new Logo (Circular) and Name (MRS. DEORE PREMIX).
- [ ] Implement the "Free Delivery" banner (Image 3).
- [ ] Redesign the `Hero` section to include the search bar and tagline (Image 3).
- [ ] Revamp the `Footer` to match the heavy production structure (Image 4).

### Wave 3: Profile & Stability (Orders, Address)
- [ ] **Orders Page**: Fix stability with defensive rendering (optional chaining) and empty states.
- [ ] **Profile Page**: Implement full user profile, address listing, and address CRUD modals.
- [ ] Implement `EmptyOrders`, `EmptyCart`, and `EmptyWishlist` components.

### Wave 4: UI/UX Hardening & Feature Completion
- [ ] **Product Cards**: Update styling to match Image 5 (Image layout, badges, price comparison).
- [ ] **Bulk Pricing**: Finish UI for quantity >= 50 (Badges, savings display).
- [ ] **Wishlist**: Ensure full functionality and persistence (Heart toggle animation).
- [ ] **Accessibility (ARIA)**: Full audit of buttons, labels, and keyboard navigation.

## Verification Criteria
- [ ] No runtime "undefined" crashes on the Orders or Detail pages.
- [ ] Brand colors (#C2410C, #EAB308, #7F1D1D) applied everywhere.
- [ ] Single header/navbar rendering across all routes.
- [ ] All empty states handled with custom components.
- [ ] Images have fallbacks and shimmers.
