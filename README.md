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

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch rules, workflow, and PR guidelines.
