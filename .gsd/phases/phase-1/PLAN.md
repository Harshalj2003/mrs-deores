# PLAN.md — Phase 1: Foundation & Authentication

> **Status**: `COMPLETED`
> **Objective**: Establish the core monolithic structure, database connection, and secure authentication flow.

## Context
This phase lays the groundwork for the entire application. We are setting up a maintainable Modular Monolith structure using Java 17 and React.

## Steps

### Step 1: Project Initialization
- [x] Create Root `pom.xml` (Aggregator/Parent)
- [x] Initialize `backend` module (Spring Boot 3.4.x)
- [x] Initialize `frontend` module (Vite + React + TS)
- [x] Configure TailwindCSS in Frontend

### Step 2: Database & Infrastructure
- [x] Create `docker-compose.yml` for PostgreSQL 16
- [x] Configure Flyway in Backend
- [x] Create `V1__init_schema.sql` (Users, Roles tables)

### Step 3: Security Implementation
- [x] Implement `JwtUtils` (Sign/Verify tokens)
- [x] Configure `SecurityFilterChain` (Stateless session)
- [x] Implement `AuthController` (Register/Login endpoints)
- [x] Create Login/Register UI pages
- [x] Connect Frontend Auth Context to Backend API

## Validation
- [ ] Backend starts successfully and connects to DB.
- [ ] User can register a new account via Postman.
- [ ] User can login and receive a valid JWT.
- [ ] Frontend can proxy requests to Backend.
