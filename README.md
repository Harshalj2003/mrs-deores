# Mrs. Deore's Platform 🥞

[![Backend](https://img.shields.io/badge/Backend-Java_17_|_Spring_Boot-orange.svg)]()
[![Database](https://img.shields.io/badge/Database-PostgreSQL-blue.svg)]()
[![Security](https://img.shields.io/badge/Security-JWT_|_Spring_Security-green.svg)]()
[![AI-Frontend](https://img.shields.io/badge/Frontend-Antigravity_AI_|_React-cyan.svg)]()

A production-grade E-commerce platform engineered for **Mrs. Deore's Premix**, focusing on security, architectural integrity, and professional backend engineering.

---

## 🏗️ Backend Engineering & Architecture

This project serves as a demonstration of high-level backend engineering principles applied to a real-world business case. While the frontend provides a premium user interface, the core value lies in the **robust, secure, and scalable Java/Spring Boot API.**

### Key Backend Technicalities:
- **Secure Admin Protocol**: A custom, tiered invitation system where only the System Owner can bootstrap new admins using thread-safe expiring tokens.
- **JWT Authentication**: Stateless authentication with custom claims, strict token validation, and IP-based rate limiting for sensitive endpoints.
- **Data Modeling & Integrity**: Complex PostgreSQL schema managed with **Flyway Migrations**, ensuring database consistency across development and production.
- **Transactional Integrity**: Implemented `@Transactional` logic for critical flows like Payment Processing and Admin Enrollment.
- **Externalized Configuration**: Configured with strict zero-secret policy using **Spring Profiles** (`dev`, `prod`) and dynamic environment variable injection via `dotenv`.

---

## 🤖 Frontend Collaboration (Powered by Antigravity)

**Developer Note:** As a dedicated **Backend Engineer**, I focused my primary expertise on the system architecture, security layers, and data logic. To achieve a modern, premium UI without detracting from backend development time, I leveraged **Antigravity AI** to build the frontend.

- **Backend Focused**: 100% of Java controllers, service logic, security filters, and data models were hand-engineered.
- **AI-Enhanced Frontend**: The React + Tailwind CSS 4 UI was developed using Antigravity's agentic capabilities to match the visual quality of top-tier platforms.

---

## 🛠️ Tech Stack

### Backend
- **Core**: Java 17, Spring Boot 3.4.2
- **Security**: Spring Security, JWT (io.jsonwebtoken)
- **Database**: PostgreSQL, Spring Data JPA, Flyway
- **Services**: Java Mail Sender, Razorpay Java SDK
- **Build**: Maven

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS 4, Framer Motion
- **State**: Zustand

---

## 🚀 Deployment & Dev-Ops

The project is designed for seamless deployment to platforms like **Render** or **AWS**:
- **Port Management**: Dynamic port binding using `${PORT:8080}`.
- **Environment Isolation**: Strictly segregated `.env` management with comprehensive `.gitignore` coverage.
- **Production Hardening**: Production profile disables SQL logging and enables strict schema validation.

---

## 📂 Project Structure

```bash
├── backend/                # Spring Boot API
│   ├── src/main/java/      # Domain logic, Controllers, Security
│   └── src/main/resources/ # application-dev/prod.yml, Migrations
├── frontend/               # React + TypeScript App
└── .gsd/                   # GSD Methodology (Planning & Tasks)
```

---

## 📜 Setup Instructions

1.  **Clone the Repo**
2.  **Backend Setup**:
    - Navigate to `/backend`
    - Create a `.env` file based on the provided template.
    - Run `./mvnw spring-boot:run`
3.  **Frontend Setup**:
    - Navigate to `/frontend`
    - Run `npm install`
    - Run `npm run dev`

---
*Created by [Your Name] | Specialized in Backend Engineering.*
