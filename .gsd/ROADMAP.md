# ROADMAP.md

> **Current Phase**: Not started
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
**Status**: 🏗️ In Progress
**Objective**: Enable users to save items and manage their cart with bulk logic.
**Deliverables**:
-   Cart and Wishlist database entities
-   Backend logic for Cart & Wishlist management
-   **Bulk Order Logic**: Auto-apply pricing for quantity >= 50
-   Frontend Cart Drawer (Sliding UI)
-   Wishlist / Save for Later functionality
-   Guest Cart merging on login

## Phase 4: Checkout & Orders
- [/] Step 1: Backend - Order & Address Entities <!-- id: 19 -->
- [ ] Step 2: Backend - Checkout Logic & Mock Payment <!-- id: 20 -->
- [ ] Step 3: Frontend - Address Management <!-- id: 21 -->
- [ ] Step 4: Frontend - Checkout Flow & Success Page <!-- id: 22 -->
- [ ] Step 5: Frontend - Order History <!-- id: 23 -->
- [ ] Step 6: Verify Phase 4 <!-- id: 24 -->

### Phase 5: Admin Panel
**Status**: ⬜ Not Started
**Objective**: Empower the owner to manage the platform.
**Deliverables**:
-   Admin Dashboard UI
-   CRUD operations for Products (Add, Edit, Delete, Stock)
-   Order management (View, Status updates)
-   Bulk order specific view

### Phase 6: Polish & Animations
**Status**: ⬜ Not Started
**Objective**: Elevate the user experience to "Premium" standards.
**Deliverables**:
-   Implementation of Framer Motion animations
-   Micro-interactions (hover, click effects)
-   Performance optimization (Lighthouse score > 90)
-   Final UI review and responsive adjustments
