---
phase: 9
level: 2
researched_at: 2026-02-22
---

# Phase 9 Research: Initial Admin Registration & Invite Flow

## Questions Investigated
1. How does the system owner generate the very first admin invitation without manually opening the database (pgAdmin)?
2. How do we securely add pre-approved emails, phones, and tokens to the `admin_invitations` table?

## Findings

### The Current Architecture Problem
Right now, the `AdminAuthService` expects a valid row in `admin_invitations` beforehand. This is called a "Whitelist" approach. It is extremely secure, BUT it leaves a bootstrapping problem: who invites the first admin?

### Option A: The CLI / Script approach
We built a Spring Boot shell script or Java runner that the developer executes on the server console.
- **Pros:** Most secure. No web endpoints exposed.
- **Cons:** Not user-friendly for a non-technical system owner. Requires SSH access to the server.

### Option B: The Master Secret API (Recommended)
We create a hidden REST endpoint (e.g., `/api/admin/generate-invite`). This endpoint is NOT protected by a normal login, but instead requires a strong, long Master Secret Key passed in the headers. This key is defined in the backend `application.properties` (e.g., `app.admin.master-key=super_secret_value`).
- **Pros:** The System Owner can use an API tool or a hidden frontend page to generate invite tokens securely.
- **Cons:** Exposes an endpoint. (Mitigated by making the Master Key 64+ characters long).

## Decisions Made
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Bootstrapping Admins | Option B: Master Secret API | Balances security with usability for the platform owner to expand their team without needing database access. |

## Patterns to Follow
- Use `@Value` in Spring Boot to load the Master Secret.
- Do NOT return the token in clear text over non-HTTPS.
- The endpoint should accept `email` and `phone`, generate a random 16-char `invite_token`, and insert it into `admin_invitations`.

## Ready for Planning
- [x] Questions answered
- [x] Approach selected
- [x] Dependencies identified
