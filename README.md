# Book-Donation-and-Exchange-Platform

A web platform for donating, exchanging, and managing books with role-based access for users, admins, community admins, staff, and delivery personnel.

## Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js / Express
- **Database:** PostgreSQL

## Roles & Branches

| Owner | Branch | Area |
|---|---|---|
| Akarsha | `admin-akarsha` | Admin dashboard, user management, auth |
| Roshean | `user-roshean` | User dashboard & features |
| Kavindu | `community-admin-kavindu` | Community features |
| Savinthi | `staff-savinthi` | Staff operations |
| Pasindu | `delivery-pasindu` | Delivery features |

## Getting Started

```bash
git clone <repo-url>
cd Book-Donation-and-Exchange-Platform
cd client && npm install && cd ../server && npm install
```

Set up `.env` in `server/` (see `.env.example` if available).

## Donor Leaderboard

The home page ranks the top book donors, served by:

```
GET /api/stats/leaderboard?limit=10
```

Public, no auth. Returns active `END_USER` accounts with at least one donated
book, ordered by `User.booksDonated` (ties broken by points, then join date).
`limit` is clamped to 1–50.

The ranking reads `User.booksDonated`, the counter that donation verification
increments, so a newly verified donation appears on the next page load — there
is no caching layer. Levels come from the `Level` table, which is keyed off
book count rather than points.

`booksDonated` can drift above what donation history accounts for on seeded
accounts. To inspect and correct it:

```bash
node server/reconcileBooksDonated.js          # dry run
node server/reconcileBooksDonated.js --apply  # write corrections
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch rules, workflow, and PR guidelines.
