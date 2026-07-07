# Contributing Guidelines

## Branch Ownership

| Branch | Owner | Role |
|---|---|---|
| `admin-akarsha` | Akarsha | Admin / Team Lead |
| `user-roshean` | Roshean | User features |
| `community-admin-kavindu` | Kavindu | Community features |
| `staff-savinthi` | Savinthi | Staff features |
| `delivery-pasindu` | Pasindu | Delivery features |

## Workflow

### 1. Develop on your role branch

```bash
git checkout user-roshean
# make changes...
git add .
git commit -m "feat(user): description of change"
git push origin user-roshean
```

### 2. Keep your branch up to date

```bash
git checkout main
git pull origin main
git checkout user-roshean
```

### 3. Open a Pull Request

Push your role branch and open a PR **into `main`** on GitHub.  
Add the team lead (Akarsha) as reviewer.

### 4. Lead reviews and merges

Only the team lead merges PRs into `main`. Merges use `--no-ff` to preserve history.

## Rules

- **Only the team lead may merge to `main`** — no direct pushes or self-merges.
- **Only the team lead may force push** — never use `git push --force` on shared branches.
- **Never commit to `main` directly** — always work through your role branch.
- **Write meaningful commit messages** — use conventional prefixes (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`).
- **Always merge `main` into your branch before opening a PR** — resolve conflicts in your branch, not on main.
- **Keep `node_modules/`, `package-lock.json`, `.env` out of git** — `.gitignore` handles this globally.
