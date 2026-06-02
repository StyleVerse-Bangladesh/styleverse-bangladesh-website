# BMS Admin Auth Flow

This document describes the backend authentication foundation for future StyleVerse BMS/Admin login.

## Flow

```text
Login
  |
  v
Verify password
  |
  v
Load role
  |
  v
Load permissions
  |
  v
Create session
  |
  v
Authorize request
```

## Login

Admin login should accept an email and password.

The backend should:

- Find an active admin user by email.
- Reject inactive users.
- Verify the submitted password against `admin_users.password_hash`.
- Update `admin_users.last_login_at` after successful login.

## Password Verification

Passwords must never be stored in plain text.

Use `hashPassword()` when creating or resetting an admin password, and `verifyPassword()` when checking login credentials.

## Role and Permissions

After password verification, load:

- The admin user's role.
- Permissions assigned to that role through `role_permissions`.

Authorization checks should use:

- `hasRole()`
- `hasPermission()`
- `hasAnyPermission()`

## Session

The session system is not implemented yet.

Future session payload should include:

- Admin user ID.
- Email.
- Role slug.
- Permission slugs.
- Session expiry.

## Request Authorization

Every protected BMS route or API handler should authorize using role and permission checks before executing business logic.

Do not trust client-side checks for admin authorization.
