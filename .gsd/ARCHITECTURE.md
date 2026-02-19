# ARCHITECTURE.md — System Design

> **Status**: APPROVED

## Core Architecture
**Style**: Modular Monolith
**Rationale**: 
-   Avoids distributed system complexity (network, data consistency) for initial speed.
-   Keeps boundaries clear via Java packages/modules to allow future microservices extraction if needed.
-   Single deployment unit simplifies operations for a small team/single owner.

## Tech Stack

### Backend
-   **Language**: Java 17
-   **Framework**: Spring Boot 3
-   **Database**: PostgreSQL
-   **ORM**: JPA / Hibernate
-   **Migration**: Flyway
-   **Messaging**: Kafka (for decoupling heavily used flows like Inventory/Notifications)
-   **Build Tool**: Maven

### Frontend
-   **Framework**: React (Vite)
-   **Language**: TypeScript
-   **Styling**: TailwindCSS
-   **State Management**: Zustand (+ TanStack Query for server state)
-   **Animations**: Framer Motion
-   **Design System**: Material 3 inspired, custom "Premium" theme

## Data Flow
1.  **Client (React)** sends HTTP request to **Backend (Spring Boot)**.
2.  **Controller** validates input and calls **Service**.
3.  **Service** executes business logic, interacts with **Repository** (Database).
4.  **Domain Events** (e.g., `OrderPlaced`) are published to **Kafka** for side effects (e.g., Send Email, Update Analytics).

## Module Boundaries
The monolith will be structured by domain modules:
-   `com.mrsdeores.auth` (Users, Roles, JWT)
-   `com.mrsdeores.catalog` (Products, Categories, Inventory)
-   `com.mrsdeores.cart` (Cart, Wishlist)
-   `com.mrsdeores.sales` (Orders, Payments, Checkout)
-   `com.mrsdeores.admin` (Back-office management)

## Key Entities
-   **Product**: Contains `retailPrice`, `bulkPrice`, `minBulkQty`.
-   **Order**: Flags `isBulkOrder` based on quantity logic.
