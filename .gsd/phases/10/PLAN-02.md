---
phase: 10
plan: 2
wave: 1
depends_on: []
files_modified: ["backend/src/main/resources/application.yml", "backend/src/main/resources/application-dev.yml", "backend/src/main/resources/application-prod.yml", "backend/src/main/java/com/mrsdeores/services/AdminAuthService.java"]
autonomous: true
---

# Plan 10.2: Backend Refactor

<objective>
Refactor backend services and configuration to use strictly externalized environment variables without fallbacks.

Purpose: Ensure the backend is production-ready and secure.
Output: Refactored YAML profiles and hardened Java services.
</objective>

<context>
Load for context:
- backend/src/main/resources/application.yml
- backend/src/main/java/com/mrsdeores/services/AdminAuthService.java
</context>

<tasks>

<task type="auto">
  <name>Externalize application.yml and create profiles</name>
  <files>["backend/src/main/resources/application.yml", "backend/src/main/resources/application-dev.yml", "backend/src/main/resources/application-prod.yml"]</files>
  <action>
    1. Update `application.yml` to remove hardcoded values and fallbacks for:
       - Datasource (URL, user, pass)
       - JWT Secret
       - Admin Keys (secret, master)
       - Razorpay keys
       - Mail credentials
    2. Use `${VARIABLE}` syntax ONLY (no defaults like `${VAR:default}`).
    3. Split environment-specific logic into `application-dev.yml` (localhost, show-sql) and `application-prod.yml` (harden validation, info logs).
  </action>
  <verify>Run `./mvnw spring-boot:run -Dspring-boot.run.arguments=--spring.profiles.active=dev` (after populating .env).</verify>
  <done>Backend fails to start without variables, starts correctly with them.</done>
</task>

<task type="auto">
  <name>Hardening AdminAuthService</name>
  <files>["backend/src/main/java/com/mrsdeores/services/AdminAuthService.java"]</files>
  <action>
    Remove the hardcoded default value for `adminMasterKey` in the `@Value` annotation.
    AVOID: Keeping the fallback `mrspremix_master_secure_key_12345` because it allows unauthorized access if the variable is missing.
  </action>
  <verify>Verify code Item definition has no default value.</verify>
  <done>Master key is strictly mandatory from environment.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Backend starts with dev profile and .env.
- [ ] Backend fails to start if `JWT_SECRET` is removed from .env.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Zero hardcoded secrets in backend source
</success_criteria>
