# Security Guide for Coursera Application

## Security Measures Implemented

### 1. Environment Configuration
- All sensitive data moved to environment variables
- Separate configurations for development and production
- Database credentials not hardcoded

### 2. File Upload Security
- Whitelist-based file extension validation
- Filename sanitization to prevent path traversal
- File size limits (50MB maximum)
- Detection of double extensions (e.g., file.txt.exe)
- Removal of dangerous file patterns

### 3. Authentication & Authorization
- JWT token-based authentication with proper expiration
- Role-based permission classes (Student, Instructor, Admin)
- Object-level permission checks
- Session security with HttpOnly cookies

### 4. Input Validation & Sanitization
- Search query sanitization to prevent injection
- XSS protection through input cleaning
- SQL injection prevention using Django ORM
- CSRF protection enabled

### 5. Security Headers
- Content Security Policy (CSP)
- X-Frame-Options to prevent clickjacking
- X-Content-Type-Options to prevent MIME sniffing
- XSS Protection headers
- HSTS for HTTPS enforcement

### 6. Rate Limiting
- Login endpoint: 5 attempts per 5 minutes
- Signup endpoint: 3 attempts per 5 minutes
- API endpoints: 100 requests per minute per IP

### 7. Error Handling
- No sensitive information in error messages
- Proper logging without exposing internal details
- Generic error responses for security-related failures

## Security Best Practices

### For Deployment

1. **Environment Variables**
   ```bash
   # Set secure values
   export SECRET_KEY="your-50-character-secret-key"
   export DEBUG="False"
   export ALLOWED_HOSTS="yourdomain.com"
   ```

2. **Database Security**
   - Use strong passwords
   - Enable SSL connections
   - Regular backups with encryption

3. **Web Server Configuration**
   ```nginx
   # Nginx security headers
   add_header X-Frame-Options "SAMEORIGIN" always;
   add_header X-Content-Type-Options "nosniff" always;
   add_header X-XSS-Protection "1; mode=block" always;
   ```

4. **File Permissions**
   ```bash
   # Set proper file permissions
   chmod 644 media/uploads/*
   chmod 755 media/uploads/
   ```

### Monitoring & Logging

1. **Security Monitoring**
   - Monitor failed login attempts
   - Track unusual file upload patterns
   - Alert on permission bypass attempts

2. **Log Security Events**
   ```python
   # Example security logging
   logger.warning(f"Failed login attempt from {ip}")
   logger.error(f"Permission denied for user {user} on object {obj}")
   ```

## Security Checklist

- [ ] Environment variables configured
- [ ] DEBUG=False in production
- [ ] Strong SECRET_KEY set
- [ ] HTTPS enabled with HSTS
- [ ] Database credentials secured
- [ ] File upload restrictions in place
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] Error handling sanitized
- [ ] Logging configured
- [ ] Regular security updates applied

## Vulnerability Response

If you discover a security vulnerability:

1. **Do NOT** create a public issue
2. Email security concerns to: security@yourdomain.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

## Regular Security Tasks

### Weekly
- Review access logs for suspicious activity
- Check for failed authentication attempts
- Monitor file upload patterns

### Monthly
- Update dependencies
- Review user permissions
- Audit admin access

### Quarterly
- Full security audit
- Penetration testing
- Update security policies

## Security Tools Integration

Consider integrating these tools:

1. **Static Code Analysis**: Bandit, SonarQube
2. **Dependency Scanning**: Safety, Snyk
3. **Web Application Firewall**: CloudFlare, AWS WAF
4. **Monitoring**: Sentry, DataDog
5. **Vulnerability Scanning**: OWASP ZAP, Nessus

## Contact

For security-related questions: security@yourdomain.com