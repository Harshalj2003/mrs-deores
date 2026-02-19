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

### Phase 7: Production Optimization & Analytics
**Status**: ⬜ Not Started
**Objective**: Prepare the platform for real-world traffic, SEO visibility, and data-driven insights.
**Depends on**: Phase 6

**Tasks**:
- [ ] TBD (run /plan 7 to create)

**Verification**:
- TBD


