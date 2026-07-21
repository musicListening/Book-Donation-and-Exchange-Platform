# Database Security Plan

## Current Risk

The `server/.env` file contains:
- `DATABASE_URL` — Full PostgreSQL credentials (username + password)
- `JWT_SECRET` — Authentication secret key

These credentials should **never** be shared directly with other developers.

---

## Neon Role-Based Access Control (RBAC)

### Step 1: Create Developer Roles

Log into [Neon Console](https://console.neon.tech) → SQL Editor and run:

```sql
-- Read-only role (for testing, junior devs)
CREATE ROLE dev_readonly WITH LOGIN PASSWORD 'generate_a_strong_password_here';
GRANT USAGE ON SCHEMA public TO dev_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO dev_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO dev_readonly;

-- Read-write role (for trusted devs)
CREATE ROLE dev_readwrite WITH LOGIN PASSWORD 'generate_a_strong_password_here';
GRANT USAGE ON SCHEMA public TO dev_readwrite;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO dev_readwrite;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO dev_readwrite;
```

### Step 2: Connection Strings

Create separate connection strings in Neon Dashboard → Connection Details for each role:

| Role               | Purpose              | Connection String                                                                 |
| ------------------ | -------------------- | --------------------------------------------------------------------------------- |
| `neondb_owner`     | You (admin)          | `postgresql://neondb_owner:YOUR_PASS@ep-xxx.neon.tech/neondb?sslmode=require`     |
| `dev_readwrite`    | Trusted developers   | `postgresql://dev_readwrite:THEIR_PASS@ep-xxx.neon.tech/neondb?sslmode=require`   |
| `dev_readonly`     | Testing / junior devs | `postgresql://dev_readonly:THEIR_PASS@ep-xxx.neon.tech/neondb?sslmode=require`   |

### Step 3: Share With Developers

Give each developer a `.env` file with their role-specific credentials:

```
DATABASE_URL="postgresql://dev_readonly:<their_password>@ep-lucky-heart-aoi5gqz5-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET=your_shared_jwt_secret_here
```

---

## Permission Summary

| Capability              | `neondb_owner` (You) | `dev_readwrite` | `dev_readonly` |
| ----------------------- | -------------------- | --------------- | -------------- |
| Read data               | ✅ Yes               | ✅ Yes          | ✅ Yes         |
| Insert / Update / Delete| ✅ Yes               | ✅ Yes          | ❌ No          |
| Create / Drop tables    | ✅ Yes               | ❌ No           | ❌ No          |
| Run migrations          | ✅ Yes               | ❌ No           | ❌ No          |
| Alter schema            | ✅ Yes               | ❌ No           | ❌ No          |

---

## Production Security (Render)

- Keep `neondb_owner` credentials **only** in Render Environment Variables
- Never commit production credentials to Git
- Never share `neondb_owner` connection string with other developers

---

## .env File Structure

### server/.env (Admin only — do NOT share)
```
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-xxx.neon.tech/neondb?sslmode=require"
JWT_SECRET=your_super_secret_key_here
```

### .env.example (safe to commit — template for developers)
```
DATABASE_URL="postgresql://<role>:<password>@<host>/<dbname>?sslmode=require"
JWT_SECRET=your_jwt_secret_here
```

---

## .gitignore

Ensure `.env` is listed in `.gitignore` to prevent accidental commits:

```
node_modules/
package-lock.json
.env
```

---

## Checklist

- [ ] Create `dev_readonly` role in Neon
- [ ] Create `dev_readwrite` role in Neon
- [ ] Generate connection strings for each role
- [ ] Create `server/.env.example` with template
- [ ] Share role-specific `.env` files with each developer
- [ ] Rotate `neondb_owner` password (since it was previously shared)
- [ ] Rotate `JWT_SECRET` (since it was previously shared)
- [ ] Verify `.env` is in `.gitignore`
