# 🚀 CampusOS — Deployment & Setup Guide

This guide provides a step-by-step walkthrough to deploy the ₹0 CampusOS architecture. This setup ensures you pay $0, use no credit cards, and have a fully automated system for your college project evaluation.

---

## 📱 1. Android APK (GitHub Actions)
*We use GitHub Actions to build your Android APK entirely for free, completely bypassing the need for a heavy local Android Studio setup.*

1. Push your code to the `main` branch on GitHub.
2. Go to your GitHub repository in the browser.
3. Click on the **Actions** tab.
4. You will see a workflow named **Build Android APK** running.
5. Wait for it to turn green (~5 to 10 minutes).
6. Click on the workflow run. Scroll to the bottom to the **Artifacts** section.
7. Click **campusos-android-apk** to download the `.apk` file to your computer.
8. Transfer the file to your Android device and install it!

---

## ⚙️ 2. Backend API (Render)
*We use Render's Free Tier to host the FastAPI Python backend and the PostgreSQL Database.*

### A. Create the Database
1. Go to [Render.com](https://render.com) and sign in.
2. Click **New +** -> **PostgreSQL**.
3. Name it `campusos-db` and select the **Free** instance type.
4. Once created, copy the **Internal Database URL** (if deploying API on Render) or **External Database URL**.

### B. Deploy the API
1. Click **New +** -> **Web Service**.
2. Connect your GitHub and select the `CampusOS` repository.
3. Use the following configuration:
   - **Name:** `campusos-api`
   - **Root Directory:** `backend`
   - **Environment:** `Python`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free
4. Scroll down to **Environment Variables** and add:
   - `DATABASE_URL`: *(Paste the PostgreSQL URL from step A)*
   - `JWT_SECRET_KEY`: *(Generate a secure random string and paste it here)*
   - `FRONTEND_URL`: `https://campusos-web.vercel.app` *(We will create this in the next step)*
5. Click **Deploy Web Service**.
6. Once deployed, copy your API URL (e.g., `https://campusos-api.onrender.com`).

---

## 🌐 3. Web Dashboard (Vercel)
*We use Vercel's Hobby Tier to host the Next.js Admin & Analytics dashboard.*

1. Go to [Vercel.com](https://vercel.com) and sign in.
2. Click **Add New -> Project**.
3. Import the `CampusOS` repository from GitHub.
4. Vercel will automatically detect the Next.js app in `apps/web`.
5. **Configuration:**
   - **Root Directory:** Select `apps/web`
6. Open the **Environment Variables** dropdown and add:
   - `NEXT_PUBLIC_API_URL`: *(Paste your Render API URL here, e.g., `https://campusos-api.onrender.com`)*
7. Click **Deploy**.

---

## 🔗 4. Syncing the Mobile App to the Cloud
*By default, your mobile app looks for a local API. We need to point it to your live Render backend.*

1. Open `apps/mobile/.env` (Create this file if it doesn't exist).
2. Add your Render API URL:
   ```env
   EXPO_PUBLIC_API_URL=https://campusos-api.onrender.com
   ```
3. Commit and push this change to GitHub:
   ```bash
   git add apps/mobile/.env
   git commit -m "chore: point mobile app to live production API"
   git push
   ```
4. The GitHub Action will automatically trigger again. Once finished, the newly generated APK will be permanently synced with your live cloud backend!

---

## 🔒 5. Safety & Security Checklist
Before your final college presentation, double-check these security measures that are built into this architecture:

- [ ] **No Hardcoded Secrets:** Never put your `DATABASE_URL` or `JWT_SECRET_KEY` directly in your Python files. They must only live in Render's Environment Variables dashboard.
- [ ] **CORS Configuration:** In `backend/app/main.py`, ensure `allow_origins=["https://campusos-web.vercel.app"]` is set so random websites cannot make requests to your API.
- [ ] **Password Hashing:** Passwords are never stored as plain text. The backend uses the `Argon2` algorithm to cryptographically hash them.
- [ ] **Token Expiry:** JWT Access Tokens expire automatically, limiting the window an attacker has if a token is compromised.
- [ ] **SQL Injection Protection:** The backend uses `SQLAlchemy` ORM, which inherently sanitizes all database inputs.
