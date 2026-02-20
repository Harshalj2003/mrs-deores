# Phase 3 Decisions

**Date:** 2026-02-18

### Scope & Architecture
- **Guest Cart Strategy**: `Option A (Standard)` - Guests can add items to a local cart. When they log in, the local cart merges with the server cart. This maximizes conversion.
- **Cart UI Experience**: `Option A (Drawer)` - Implement a sliding "Drawer" that opens from the right side. This maintains context and feels more "Premium" and modern.
- **Bulk Pricing Visibility**: `Option B (Dynamic Strike-through)` - Clearly show the retail price struck through and the new bulk unit price when quantity >= 50.
- **Wishlist & Save for Later**: **INCLUDED** in this phase. Users can move items from Cart to "Save for Later" and vice-versa.

### Next Actions
- Update ROADMAP to reflect Wishlist inclusion in Phase 3.
- Create execution plan for Cart + Wishlist + Bulk Logic.

## Phase 6 Decisions

**Date:** 2026-02-19

### Animation & Polish Strategy
- **Hero & General Entrances**: Staggered entrance animations for Hero sections, Checkout flows, and Admin transitions to create a "loading-in" premium feel.
- **Implementation Mix**: 
    - **Seamless Page Transitions**: Using `AnimatePresence` and `layoutId` where appropriate to blur the lines between pages.
    - **Micro-interaction Focus**: Enhanced focus on high-fidelity hover states, elastic button clicks, and tactile feedback.
- **Branding & Motion**:
    - **Signature**: A blend of Snappy/Modern (for feedback) and Smooth/Luxury (for page flow).
    - **Color Feedback**: Dynamic color feedback (Gold/Maroon accents) on interaction.
- **Constraints**: Maintain high performance (Lighthouse > 90) by optimizing motion and ensuring "Reduced Motion" accessibility support.

### Next Steps
- Implement `framer-motion`.
- Refactor `App.tsx` for layout transitions.
- Polish key user flows (AddToCart, Heart animation, Success page).

## Phase 8: Admin Fulfillment & Order Management Evolution

**Date:** 2026-02-19

### Scope
- **Custom Order Conversion**: Admins will have the ability to review a `CustomOrder` request, set a final price, and convert it into a payable `Order` record.
- **Visual Timeline**: Customers will see a visual status timeline (e.g., Requested -> Approved -> Paid -> Processing -> Shipped -> Delivered) with dates.

### Approach
- **Selected**: Option A (Lean)
- **Rationale**: Prioritize stability for v1.1. Automated notifications (SMS/Email) are deferred to Phase 9 to keep the current scope focused on logic and UI. Users will check "My Orders" for updates.
- **Data Structure**: `CustomOrder` entities will be linked to the core `Order` table to facilitate standard checkout processing once approved.

### Constraints & Risks
- **Notification Gap**: Users won't receive push alerts for approvals in this phase. This is a known limitation accepted for v1.1.
