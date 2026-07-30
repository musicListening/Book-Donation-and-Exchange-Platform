<div align="center">

# 📚 Book Donation & Exchange Platform

**A community-powered platform for donating, exchanging, and managing books with role-based access for users, admins, community admins, staff, and delivery personnel.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

</div>

---

## ✨ Features

- **Book Donation** — Donate books and earn points for your contributions
- **Book Exchange** — Swap books with other community members
- **Donor Leaderboard** — Ranked list of top donors in the community
- **Role-Based Access** — Dedicated dashboards for Admin, User, Community Admin, Staff, and Delivery roles
- **Point System** — Earn and spend points through donations and exchanges
- **Community Events** — Participate in community-driven book events

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 8, React Router 7 |
| **Backend** | Node.js, Express 5 |
| **Database** | PostgreSQL + Prisma ORM |
| **Styling** | Tailwind CSS, Lucide Icons |
| **Charts** | Recharts |
| **Auth** | JWT (jsonwebtoken) |
| **File Storage** | Cloudinary |

---

## 👥 Team & Roles

| Member | Branch | Responsibility |
|--------|--------|----------------|
| **Akarsha** | `admin-akarsha` | Admin dashboard, user management, auth |
| **Roshean** | `user-roshean` | User dashboard & features |
| **Kavindu** | `community-admin-kavindu` | Community features |
| **Savinthi** | `staff-savinthi` | Staff operations |
| **Pasindu** | `delivery-pasindu` | Delivery features |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- Cloudinary account (for file uploads)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd Book-Donation-and-Exchange-Platform

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your database and API credentials

# Run database migrations
cd server && npx prisma migrate dev

# Seed the database (optional)
node seed.js

# Start the development servers
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

---

## 📁 Project Structure

```
Book-Donation-and-Exchange-Platform/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   └── ...
│   └── package.json
├── server/                  # Express backend
│   ├── config/              # Configuration files
│   ├── middleware/           # Auth & other middleware
│   ├── prisma/              # Database schema & migrations
│   ├── routes/              # API route handlers
│   ├── utils/               # Utility functions
│   └── package.json
└── CONTRIBUTING.md
```

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch rules, workflow, and PR guidelines.

**Quick Summary:**
1. Work on your assigned role branch
2. Keep your branch up to date with `main`
3. Open a PR into `main` for review
4. Only the team lead merges PRs

---

<div align="center">

**Built with ❤️ for book lovers everywhere**

</div>
