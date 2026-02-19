# SPEC.md — MRS.DEORE’s Project Specification

> **Status**: `FINALIZED`

## Vision
To build **MRS.DEORE’s**, a modern, premium, scalable eCommerce web application for selling homemade food premixes and traditional products. The platform will deliver a high-end, smooth, and alive user experience that far surpasses traditional eCommerce sites in aesthetics while maintaining robust, enterprise-grade business logic. It bridges the gap between traditional homemade quality and modern digital convenience.

## Goals
1.  **Premium User Experience**: Deliver a visually stunning, responsive, and animated UI/UX inspired by Material 3 and premium brand aesthetics (Gold/Maroon/Cream palette).
2.  **Robust eCommerce Functionality**: Implement complete retail and bulk order management, including dynamic pricing, cart logic, and checking out.
3.  **Scalable & Modular Architecture**: Build a modular monolith using Java 21/Spring Boot 3 and React/Vite that is production-ready and easy to maintain.

## Non-Goals (Out of Scope)
-   **Microservices**: Keeping it as a modular monolith initially to avoid overengineering.
-   **Mobile App**: Focus is strictly on a responsive web application (PWA ready, but not native).
-   **Legacy Browser Support**: Targeting modern browsers for best animation performance.

## Users
-   **Retail Customers**: Individuals buying premixes for home cooking.
-   **Bulk Buyers**: Caterers or small businesses ordering large quantities (50+ units).
-   **Admin (Owner)**: MRS.DEORE’s management team handling products, stock, and orders.

## Constraints
-   **Tech Stack**: Java 17, Spring Boot 3, React, TypeScript, TailwindCSS.
-   **Performance**: Lighthouse score > 90, SEO optimized.
-   **Design**: Strict adherence to specific brand colors and animation guidelines.

## Success Criteria
-   [ ] **Business Logic Parity**: Matches all specified flows from the reference site (chhayakart.com).
-   [ ] **Visual Excellence**: User confirms the UI feels "premium" and "smooth" (micro-interactions, transitions).
-   [ ] **Performance**: Page loads are fast, and animations are 60fps.
-   [ ] **Bulk Logic**: System automatically handles bulk pricing tiers correctly.
