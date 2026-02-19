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
