# Phase 9 Plan: Initial Admin Registration & Invite Flow

## Objective
Implement a secure, hidden API endpoint protected by a Master Secret Key that allows the platform owner to generate the very first `admin_invitations` record (bootstrap admin) without needing direct database access.

## Architecture & Approach
We will use the **Master Secret API** pattern. A long, secure secret key will be defined in the backend environment. A specific, undocumented endpoint will require this key in the HTTP headers to authorize the creation of an admin invitation.

## Step-by-Step Implementation Tasks

### 1. Configuration Setup
- Add `app.admin.master-key=super_secret_master_key_change_in_production` to `application.properties`.
- Inject this value into a variable in the backend service or controller.

### 2. Service Layer Updates (`AdminAuthService.java`)
- Create a new method: `public String createBootstrapInvite(String email, String phone)`.
- **Logic:** 
  - Check if the email/phone already exists to prevent duplicates.
  - Generate a secure, random token (e.g., `UUID.randomUUID().toString()`).
  - Create a new `AdminInvitation` object.
  - Set `used = false`, `isFullyEnrolled = false`, and an appropriate `expiresAt` (e.g., 24 hours).
  - Save to `AdminInvitationRepository`.
  - Return the plain-text token.

### 3. Controller Layer Updates (`AuthController.java` or `AdminController.java`)
- Create a new endpoint: `POST /api/auth/admin/bootstrap-invite` (or similar).
- Protect it strictly: 
  - Read header `X-Master-Key`.
  - Compare the header value against the `app.admin.master-key` property.
  - If it does not match, return `401 Unauthorized`.
  - If it matches, accept a payload containing `{ "email": "...", "phone": "..." }`.
  - Call `AdminAuthService.createBootstrapInvite(...)`.
  - Return the generated token and a success message in a JSON response.

### 4. Security Configuration (`WebSecurityConfig.java`)
- Ensure the newly created `/api/auth/admin/bootstrap-invite` endpoint is accessible publicly (since the master key serves as the authentication mechanism, standard JWT auth should explicitly IGNORE this path, or it should be added to `permitAll()`).

### 5. Verification & Testing
- Use an API client (like cURL or Postman) to send a POST request with the correct `X-Master-Key` header.
- Verify the response contains a valid token.
- Take that token, email, and phone, navigate to the frontend Admin Enrollment tab, and successfully register as an admin.

## Edge Cases Handled
- Re-using emails: The system must block creating an invite if an admin with that email already exists or if an unused invite already exists for that email.
- Brute forcing: A sufficiently long master key mitigates brute force attacks against the hidden endpoint.
