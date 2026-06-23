# Donation-and-Exchange-Platform

This web-based platform lets users donate books or complete collections to earn reward points and bonuses. Staff verify and curate donations, while users can trade paper crafts using points. Featuring gamification, a community forum, and delivery tracking, the system optimizes engagement for all users, administrators, and logistics personnel.

## Technology we use

- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Hosted on Neon Tech Cloud Server)
- **Frontend Deployment:** Netlify
- **Backend Deployment:** Render.com

---

## Prerequisites

Before running the project locally, ensure you have the following installed:
- Node.js (v16.x or higher)
- npm or yarn
- A Neon Tech PostgreSQL database account

---

## Getting Started

### 1. Clone the Repository
```bash
git clone <github link>
cd Donation-and-Exchange-Platform
```

### 2. Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `backend` directory and add your Neon Tech connection string along with other environment variables:
   ```env
   PORT=5000
   DATABASE_URL=postgres://<user>:<password>@<neon_host>/<db_name>?sslmode=require
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the backend development server:
   ```bash
   node index.js
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `frontend` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
   *(Note: Use `REACT_APP_` instead of `VITE_` if using Create React App)*
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

---

## Deployment Configuration

### Frontend (Netlify)
- **Build Command:** `npm run build`
- **Publish Directory:** `dist` (or `build`)
- **Environment Variables:** Set `VITE_API_BASE_URL` to your live Render backend URL.

### Backend (Render.com)
- **Build Command:** `npm install`
- **Start Command:** `node server.js` (or `npm start`)
- **Environment Variables:** Remember to add `DATABASE_URL` and `JWT_SECRET` in your Render dashboard environment settings.
