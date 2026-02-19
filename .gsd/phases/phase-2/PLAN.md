# PLAN.md — Phase 2: Products & Core UI

> **Status**: `COMPLETED`
> **Objective**: Build the core product catalog and browsing experience.

## Context
Phase 2 focuses on the "Showroom". Users need to see what MRS.DEORE’s sells in a way that feels premium and appetizing.

## Steps

### Step 1: Catalog Data Modeling
- [ ] Create `V2__Add_Catalog_Schema.sql`
- [ ] Implement `Category`, `Product`, `ProductImage` entities
- [ ] Setup Repositories and basic DTOs

### Step 2: Catalog APIs
- [ ] Implement `CategoryController` (GET all)
- [ ] Implement `ProductController` (GET list by category, GET by ID)
- [ ] Add filtering and sorting logic to Product service

### Step 3: Global UI & Navigation
- [ ] Refine sticky Navbar with glassmorphism
- [ ] Implement Category Navigation Grid (Home Page)

### Step 4: Product Discovery UI
- [ ] Create `ProductCard` with premium animations
- [ ] Implement Product List Page (PLP) with responsive grid
- [ ] Build Product Detail Page (PDP) with image gallery

## Validation
- [ ] API successfully returns seeded product data.
- [ ] Navigation flows smoothly between Home -> Category -> Product.
- [ ] Visual lift and hover effects match "Premium" spec.
