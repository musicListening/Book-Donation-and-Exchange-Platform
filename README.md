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

## Community UI

The community screens share one set of tokens and primitives. Use them rather
than styling inline, so the pages stay consistent.

| File | Contains |
|---|---|
| `client/src/components/communityTokens.js` | Palette, spacing, radius, elevation, motion, z-index. Values only — no components |
| `client/src/components/CommunityAdminUI.jsx` | `Button`, `Chip`, `Alert`, `Skeleton`, `SkeletonCard`, `EmptyState`, `CommunityConfirm`, sidebar, header |

Conventions:

- **Colours come from `colors`.** Do not add hex values to a community page.
- **Layout that must respond goes in a CSS class**, not an inline `style`.
  Inline styles beat media queries, so a breakpoint cannot override them.
- **Hover effects use the `lift-card` class**, not React state — tracking hover
  in state re-renders the card on every mouse move.
- **Lists need three states**: `SkeletonCard` while loading, `EmptyState` when
  there is nothing, and a separate empty state when a *search* matches nothing.
- **Use `CommunityConfirm`, never `window.confirm`.** The shared
  `ConfirmDialog` depends on modal CSS these pages do not import.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch rules, workflow, and PR guidelines.
