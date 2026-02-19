---
phase: 6
plan: 1
wave: 1
gap_closure: false
---

# Plan 6.1: Premium Polish & Animations

## Objective
Transform the functional platform into a premium experience using Framer Motion staggered entrances and high-fidelity micro-interactions. This involves adding page transitions, staggered loading effects, and tactile feedback to all interactive elements.

## Context
Load these files for context:
- .gsd/SPEC.md
- .gsd/DECISIONS.md
- frontend/src/App.tsx
- frontend/src/components/ProductCard.tsx
- frontend/src/components/Navbar.tsx
- frontend/src/pages/Home.tsx
- frontend/src/pages/AdminDashboard.tsx

## Tasks

<task type="auto">
  <name>Install Framer Motion</name>
  <files>
    frontend/package.json
  </files>
  <action>
    Install the `framer-motion` library in the frontend directory.
    
    Steps:
    1. Run `npm install framer-motion --prefix frontend`
  </action>
  <verify>
    Check if `framer-motion` is in `package.json`.
  </verify>
  <done>
    Library installed successfully.
  </done>
</task>

<task type="auto">
  <name>Implement Seamless Page Transitions</name>
  <files>
    frontend/src/App.tsx
  </files>
  <action>
    Refactor `App.tsx` to use `AnimatePresence` from Framer Motion.
    Wrap the `Routes` component and use the `location` key for keying transitions.
    Implement a smooth fade and slide transition for page changes.
    
    USE: `location.pathname` as the key for `AnimatePresence`.
  </action>
  <verify>
    Verify code structure in `App.tsx`.
  </verify>
  <done>
    Pages transition smoothly when navigating.
  </done>
</task>

<task type="auto">
  <name>Staggered Entrances for Storefront</name>
  <files>
    frontend/src/pages/Home.tsx
    frontend/src/components/ProductCard.tsx
  </files>
  <action>
    Apply staggered entrance animations to the Home page hero section and category lists.
    Apply staggered entrance to the product grid in `ProductList` (via card component).
    
    USE: `motion.div` with `variants` and `staggerChildren` orchestration.
  </action>
  <verify>
    Verify variant definitions in components.
  </verify>
  <done>
    Home page elements load with a premium staggered sequence.
  </done>
</task>

<task type="auto">
  <name>High-Fidelity Micro-interactions</name>
  <files>
    frontend/src/components/ProductCard.tsx
    frontend/src/components/Navbar.tsx
    frontend/src/components/CartDrawer.tsx
  </files>
  <action>
    Add hover and tap animations to all primary buttons and links.
    Implement a "Heart" burst animation for the wishlist toggle.
    Add a scale effect to product cards on hover.
    Apply "Magnetic" hover effects to the Navbar links.
    
    USE: `whileHover`, `whileTap`, and `transition: { type: "spring", stiffness: 300, damping: 20 }`.
  </action>
  <verify>
    Verify interaction props in JSX.
  </verify>
  <done>
    Interactive elements feel tactile and alive.
  </done>
</task>

<task type="auto">
  <name>Checkout & Success Polish</name>
  <files>
    frontend/src/pages/CheckoutPage.tsx
  </files>
  <action>
    Add a celebratory "Success" animation to the order confirmation step.
    Use staggered entrances for the checkout form steps.
  </action>
  <verify>
    Check for animation logic in CheckoutPage.
  </verify>
  <done>
    Checkout process feels rewarding and smooth.
  </done>
</task>

<task type="auto">
  <name>Admin Panel Transitions</name>
  <files>
    frontend/src/components/AdminSidebar.tsx
    frontend/src/pages/AdminDashboard.tsx
  </files>
  <action>
    Add staggered entrances to the Admin Dashboard stat cards.
    Implement slide-in transitions for the Admin Sidebar items.
  </action>
  <verify>
    Verify motion props in Admin components.
  </verify>
  <done>
    Admin portal feels equally premium to the storefront.
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] Staggered entrances are present on Home, Store, and Admin.
- [ ] Page transitions are fluid via `AnimatePresence`.
- [ ] Hover/Tap effects are consistent across all primary buttons.
- [ ] Performance remains high (animations are hardware-accelerated).

## Success Criteria
- [ ] All tasks verified passing.
- [ ] Must-haves confirmed.
- [ ] User confirms the "Premium" feel is achieved.
