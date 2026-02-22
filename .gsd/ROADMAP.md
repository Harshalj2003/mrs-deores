# ROADMAP.md

> **Current Phase**: Phase 5: Admin Panel
> **Milestone**: v1.0 (MVP)

## Phases

### Phase 1: Foundation & Authentication
**Status**: ✅ Completed
**Objective**: Set up the project structure, database schema, and secure authentication flow.
**Deliverables**:
-   Full Monolith project initialization (Spring Boot + React/Vite)
-   Database schema migration (Flyway) for Users, Auth
-   JWT Authentication implementation
-   Frontend setup with TailwindCSS and theming

### Phase 2: Products & Core UI
**Status**: ✅ Completed
**Objective**: Build the core browsing experience with categories and products.
**Deliverables**:
-   Database schema for Categories, Products, Inventory
-   Backend APIs for product management (Read-only for public)
-   Frontend "Shop by Category" and Product Listing pages
-   Product Detail Page with image gallery and pricing logic

### Phase 3: Shopping Experience
**Status**: ✅ Completed
**Objective**: Enable users to save items and manage their cart with bulk logic.
**Deliverables**:
-   Cart and Wishlist database entities
-   Backend logic for Cart & Wishlist management
-   **Bulk Order Logic**: Auto-apply pricing for quantity >= 50
-   Frontend Cart Drawer (Sliding UI)
-   Wishlist / Save for Later functionality
-   Guest Cart merging on login

### Phase 4: Checkout & Orders
**Status**: ✅ Completed
**Objective**: Finalize the purchasing flow from address selection to order history.
**Deliverables**:
-   Order & Address database entities
-   Checkout API with Mock Payment integration
-   Frontend Checkout flow (Stepper UI)
-   Address Management (Add/Select/Delete)
-   Order History view for customers

### Phase 5: Admin Panel
**Status**: ✅ Completed
**Objective**: Empower the owner to manage the platform.
**Deliverables**:
-   Admin Dashboard UI
-   CRUD operations for Products (Add, Edit, Delete, Stock)
-   Order management (View, Status updates)
-   Bulk order specific view

### Phase 6: Polish & Animations
**Status**: ✅ Completed
**Objective**: Elevate the user experience to "Premium" standards.
**Deliverables**:
-   Implementation of Framer Motion animations
-   Micro-interactions (hover, click effects)
-   Performance optimization (Lighthouse score > 90)
-   Final UI review and responsive adjustments

---

### Phase 7: Brand Enforcement, Auth Upgrade & Production Readiness (STRICT)
**Status**: 🔄 In Progress
**Objective**: Enforce strict global brand theme (Saffron/Turmeric/Maroon/Cream), upgrade authentication (OTP/Tabs), implement Custom Orders, and ensure visual consistency.
**Depends on**: Phase 6

**Tasks**:
- [ ] **Global Theme Correction**:
    - [ ] Apply Brand Palette (Saffron #C2410C, Turmeric #EAB308, Maroon #7F1D1D, Cream #FFF8ED) globally.
    - [ ] Remove all "SaaS-blue" styles.
    - [ ] Update Buttons, Backgrounds, and Active States.
- [ ] **Navigation & Logo**:
    - [ ] Add "Custom Order" link.
    - [ ] Increase Logo & Web Name size (1.5x, exact SVG match).
- [ ] **Authentication Upgrade**:
    - [ ] Separate User/Admin tabs.
    - [ ] Add Phone OTP Login mode.
    - [ ] Expand Register form (Name, Email, Phone, Pass, Confirm).
    - [ ] Add Form Validation (Inline, Branded).
- [ ] **Custom Order Feature**:
    - [ ] Frontend: Request Form (Item, Desc, Qty, Budget, Image ref).
    - [ ] Backend: `custom_orders` table & API.
    - [ ] Admin: Notification & Management.
- [ ] **Visual Consistency**:
    - [ ] Standardize typography, radius, shadows, animations.

**Verification**:
- [ ] ZERO blue elements remaining.
- [ ] Auth flow works (Tab separation, OTP logic).
- [ ] Custom Order submitted & visible in db.
- [ ] Design matches "Premium" traditional aesthetic.

---

### Phase 8: Admin Fulfillment & Order Management Evolution
**Status**: 🔄 In Progress
**Objective**: Empower admins to manage Custom Orders and provide transparent tracking for customers.
**Depends on**: Phase 7

**Tasks**:
- [ ] **Admin Custom Order Management**:
    - [ ] UI to View/Approve/Reject Custom Requests.
    - [ ] "Convert to Order" logic (Set Price -> Create Order -> Key).
- [ ] **Customer Order Tracking**:
    - [ ] Visual Timeline Component (Requested -> Approved -> Paid -> Shipped).
    - [ ] Link `CustomOrder` to `Order` for payment flow.
- [ ] **Order Status Logic**:
    - [ ] Backend state machine for Custom Order lifecycle.
    - [ ] Integration with existing Checkout for payment of "Approved" orders.

**Verification**:
- [ ] Admin can convert a request to a payable order.
- [ ] User sees "Pay Now" for approved custom orders.
- [ ] Timeline updates correctly as status changes.



---

### Phase 9: Initial Admin Registration & Invite Flow
**Status**:  Not Started
**Objective**: Build a secure mechanism to generate initial admin invitations (\dmin_invitations\ rows) without manual database insertion.
**Depends on**: Phase 8

**Tasks**:
- [ ] Add `app.admin.master-key` to properties & service.
- [ ] Create `createBootstrapInvite` logic in `AdminAuthService`.
- [ ] Build `POST /api/auth/admin/bootstrap` protected by `X-Master-Key`.
- [ ] Add public access in `WebSecurityConfig` for the bootstrap endpoint.

**Verification**:
- [ ] System Owner can securely generate an invite link or token.
- [ ] New admin data safely populated in DB.
