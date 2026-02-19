# PLAN.md — Phase 3: Shopping Experience

> **Status**: `PLANNED`
> **Objective**: Implement full e-commerce shopping flow: Cart, Wishlist, and Bulk Pricing Engine.

## Context
Phase 2 provided the "Showroom". Phase 3 builds the "Engine" for commerce. This phase introduces stateful user interactions and complex pricing logic.

## Architecture Decisions
- **Cart Storage**: Hybrid. LocalStorage for guests, Database for authenticated users. Merges on login.
- **UI UX**: Sliding Drawer for Cart to maintain browsing context.
- **Pricing**: Dynamic calculation in Backend. Frontend displays "Strike-through" price when `qty >= 50`.

## Steps

### Step 1: Backend Domain Modeling
- **Entities**: `Cart`, `CartItem`, `Wishlist`, `WishlistItem`.
- **Relationships**: One-to-One (User <-> Cart), One-to-Many (Cart <-> Items).
- **Migration**: Flyway `V3__Add_Shopping_Schema.sql`.

### Step 2: efficient Bulk & Cart Logic (Service Layer)
- **Bulk Logic**: `calculateItemPrice(product, qty)` returns standard or bulk price.
- **Cart Service**: Methods to `addItem`, `removeItem`, `updateQty`, `mergeCarts`.
- **Wishlist Service**: Simple toggle logic.

### Step 3: Shopping APIs
- `GET /api/cart`: Get current user's cart (with calculated totals).
- `POST /api/cart/items`: Add/Update item.
- `DELETE /api/cart/items/{id}`: Remove item.
- `GET /api/wishlist`: Get wishlist.
- `POST /api/wishlist/toggle/{productId}`: Add/Remove.

### Step 4: Frontend State Management (Zustand)
- Create `useCartStore`: Handles local/remote sync, optimistic updates, and open/close drawer state.
- Create `useWishlistStore`.

### Step 5: UI Implementation
- **Cart Drawer**: Sliding side panel with:
    - List of items (Image, Name, Qty Selector, Price).
    - Real-time Subtotal.
    - "Proceed to Checkout" button.
- **Bulk Indicator**: Visual cue in Cart Item when bulk price is active.
- **Wishlist Page**: Grid view of saved items.
- **"Add to Cart" Integration**: Wire up existing `ProductCard` and `ProductDetail` buttons.

## Verification
- Guest adds item -> LocalStorage updated -> Drawer opens.
- User logs in -> Local items merged into DB -> Drawer reflects total.
- Add 50 items -> Price drops to bulk rate automatically.
