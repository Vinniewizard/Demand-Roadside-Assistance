# 🚀 Kericho Roadside Deployment Guide

Follow these steps to host your system live on **Render**.

---

## Part 1: Prepare for Production

### Option A: SQLite (Quick Setup - Data resets on Restart)
Keep `prisma/schema.prisma` as is. Data will be lost every time the server sleeps or redeploys.

### Option B: PostgreSQL (Recommended for Production)
1. In `prisma/schema.prisma`, change the provider to `postgresql`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Commit and push this change to GitHub.

---

## Part 2: Hosting on Render

1.  **Create a Database** (if using Option B):
    *   Log in to [Render.com](https://render.com).
    *   Click **New +** > **PostgreSQL**.
    *   Name it `roadside-db`, then click **Create Database**.
    *   Copy the **Internal Database URL** (for the web service) or **External Database URL** (for local testing).

2.  **Create the Web Service**:
    *   Click **New +** > **Web Service**.
    *   Connect your GitHub repository.
    *   **Settings**:
        *   **Name**: `kericho-roadside`
        *   **Build Command**: `npm install && npx prisma generate && npm run build`
        *   **Start Command**: `npm start`
    *   **Environment Variables**:
        *   `DATABASE_URL`: Add your Database URL here. 
            * If SQLite: `file:./dev.db`
            * If PostgreSQL: The URL you copied from the Render DB page.
        *   `NEXTAUTH_SECRET`: (If using auth) Generate a random string.

3.  **Run Migrations**:
    *   If using PostgreSQL, you may need to run `npx prisma db push` or `npx prisma migrate deploy` in the Render dashboard's "Shell" tab after the first build, or add it to your Build Command:
    *   **Updated Build Command**: `npm install && npx prisma generate && npx prisma db push && npm run build`

---

## Part 3: Verify & Troubleshooting

- **Build Logs**: Watch the "Logs" tab on Render to ensure the build finishes.
- **URL**: Your app will be at `https://your-app-name.onrender.com`.
- **Error 500?**: Check if `DATABASE_URL` is correct.
- **Data missing?**: If using SQLite, this is expected behavior on Render. Switch to PostgreSQL for persistence.
