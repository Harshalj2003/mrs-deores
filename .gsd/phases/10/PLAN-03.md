---
phase: 10
plan: 3
wave: 2
depends_on: ["10.1"]
files_modified: ["frontend/src/services/api.ts"]
autonomous: true
---

# Plan 10.3: Frontend Refactor

<objective>
Refactor the frontend to use environment-based API URLs, enabling seamless transitions between dev and production environments.

Purpose: Decouple the frontend from a specific backend URL.
Output: Dynamic API service configuration.
</objective>

<context>
Load for context:
- frontend/src/services/api.ts
- frontend/package.json
</context>

<tasks>

<task type="auto">
  <name>Externalize API URL in React</name>
  <files>["frontend/src/services/api.ts"]</files>
  <action>
    Replace `const API_URL = "/api/";` with `const API_URL = import.meta.env.VITE_API_URL || "/api/";`.
    Ensure the frontend respects the `VITE_API_URL` variable from `.env`.
  </action>
  <verify>Run `npm run dev` and check network logs to ensure requests hit the correct base URL.</verify>
  <done>Frontend uses environment-driven API routing.</done>
</task>

<task type="auto">
  <name>Validate overall environment hardening</name>
  <files>[]</files>
  <action>
    Perform a final check of the codebase for any missed `http://localhost` strings or hardcoded common secret patterns.
  </action>
  <verify>Search for `localhost:8080` in frontend components.</verify>
  <done>No leakage of dev-only URLs in source files.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Frontend builds and runs.
- [ ] API calls are routed correctly via the environment variable.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Frontend is fully decoupled from backend location
</success_criteria>
