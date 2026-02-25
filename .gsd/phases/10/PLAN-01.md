---
phase: 10
plan: 1
wave: 1
depends_on: []
files_modified: [".gitignore", "backend/.gitignore", "backend/.env", "frontend/.env"]
autonomous: true
---

# Plan 10.1: Infrastructure & Hardening

<objective>
Prepare the repository environment for secret externalization by ensuring git ignores are robust and environment templates are ready.

Purpose: Prevent accidental check-in of secrets once they are moved to .env files.
Output: Secure .gitignore structure and (.env) files.
</objective>

<context>
Load for context:
- .gsd/ROADMAP.md
- .gitignore
- frontend/.gitignore
</context>

<tasks>

<task type="auto">
  <name>Harden .gitignore files</name>
  <files>[".gitignore", "backend/.gitignore"]</files>
  <action>
    Modify root `.gitignore` to include:
    - .env
    - *.env
    - application-local.yml
    - .idea/
    - .vscode/
    Create `backend/.gitignore` if it doesn't exist with Maven/Java specific ignores.
  </action>
  <verify>Run `git check-ignore backend/.env` to confirm it is ignored.</verify>
  <done>Env files are blocked from version control.</done>
</task>

<task type="auto">
  <name>Initialize environment templates</name>
  <files>["backend/.env", "frontend/.env"]</files>
  <action>
    Create `backend/.env` with placeholders for all secrets discovered in analysis (DB, JWT, Razorpay, Admin, AI keys).
    Create `frontend/.env` with `VITE_API_URL=http://localhost:8080/api/`.
  </action>
  <verify>Files exist in local filesystem.</verify>
  <done>Local environment templates are ready for population.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] `git status` does not show the new `.env` files.
- [ ] Root and backend gitignores are cohesive.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] No risk of accidental secret commit
</success_criteria>
