# Security and Dependencies Guide

## Regular Maintenance
1. Check for updates weekly:
   ```bash
   npm run security-check
   ```

2. Update dependencies:
   ```bash
   npm run update
   ```

3. Fix security vulnerabilities:
   ```bash
   npm run audit:fix
   ```

## Critical Dependencies
- express: Web framework
- mongoose: MongoDB ODM
- jsonwebtoken: Authentication
- bcrypt: Password hashing
- express-rate-limit: Rate limiting
- xss: XSS protection

## Version Policy
- Major version updates: Test thoroughly in staging
- Security patches: Apply immediately
- Dependencies: Review monthly
- Audit: Run weekly

## Security Contacts
- Team Lead: [contact]
- Security Team: [contact] 