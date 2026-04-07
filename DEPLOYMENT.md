# 🚀 Kericho Roadside Deployment Guide

Follow these exact steps to push your project to **GitHub** and host it live on **Render**.

---

## Part 1: Push to GitHub

1.  **Create a New Repository** on [GitHub.com](https://github.com/new).
    *   Name it `roadside-assistance`.
    *   Keep it **Public** (or Private if you prefer).
    *   **Do NOT** initialize with a README, license, or gitignore.

2.  **Run these commands** in your terminal (`/home/wizard/Desktop/Project/Proj`):
    ```bash
    git add .
    git commit -m "Initialize Kericho Roadside Production"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/roadside-assistance.git
    git push -u origin main
    ```
    *(Replace `YOUR_USERNAME` with your actual GitHub username)*

---

## Part 2: Host on Render

1.  **Log in** to [Render.com](https://render.com).
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository.
4.  **Configure the Service**:
    *   **Name**: `kericho-roadside`
    *   **Region**: `Frankfurt` (or any near you)
    *   **Branch**: `main`
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install && npx prisma generate && npm run build`
    *   **Start Command**: `npm start`
5.  **Environment Variables**:
    *   Go to the **Environment** tab on Render.
    *   Add: `DATABASE_URL` = `file:./dev.db`
    *   *Note: Since you are using SQLite, the data will reset every time you redeploy. This is okay for testing/demo purposes!*

---

## Part 3: Verify Deployment

Once Render finishes building (it will take ~3-5 minutes), you will receive a URL like `https://kericho-roadside.onrender.com`.

### 🚨 Troubleshooting
If you see a "Prisma Client not initialized" error, ensure you have `npx prisma generate` in your build command on Render.
