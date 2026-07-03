# Enterprise Migration Tasks

## Goal
Rescope the project into an HRMS / payroll / compliance marketplace with enterprise-grade security, governance, and production readiness.

## Tasks

1. Secure Firebase configuration
   - move Firebase config to environment variables
   - add .env.example
   - validate required env vars at startup

2. Harden Firestore security rules
   - enforce authenticated access
   - restrict profile documents to owners
   - lock down service requests and lead assignments
   - admin-only access for sensitive templates

3. Enable strict build-time checks
   - remove Next.js ignore build settings
   - enforce type and lint errors during CI/build

4. Add environment documentation
   - create .env.example
   - document required variables and deployment secrets

5. Add CI workflow for lint/build/test
   - install dependencies
   - run `npm run lint`, `npm run typecheck`, `npm run build`
   - fail on errors

6. Add lint/prettier configuration
   - ESLint config
   - Prettier config
   - consistent formatting and code standards

7. Sync package files and remove stray deps
   - audit package.json vs package-lock.json
   - remove unused dependencies
   - keep production deps aligned

8. Re-scope product domain to HRMS/payroll/compliance
   - update copy and categories
   - focus on regulatory and payroll service workflows
   - remove unrelated marketplace language

9. Update marketplace categories and copy
   - define compliance-specific service categories
   - update request forms and UI content

10. Implement provider verification workflow
    - vendor approval
    - credentials and compliance status
    - admin vetting

11. Add audit trail and compliance controls
    - record actions and request history
    - add review/approval flags
    - enforce access rules for sensitive data

## Progress
- [x] Secure Firebase configuration
- [ ] Harden Firestore security rules
- [ ] Enable strict build-time checks
- [ ] Add environment documentation
- [ ] Add CI workflow for lint/build/test
- [ ] Add lint/prettier configuration
- [ ] Sync package files and remove stray deps
- [ ] Re-scope product domain to HRMS/payroll/compliance
- [ ] Update marketplace categories and copy
- [ ] Implement provider verification workflow
- [ ] Add audit trail and compliance controls
