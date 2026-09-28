# CampusOS

A zero-cost-dependency college management system.

## Stack
- **Web**: Next.js, Tailwind CSS, shadcn/ui
- **Mobile**: React Native, Expo, NativeWind
- **Backend**: FastAPI, PostgreSQL, WebSockets
- **Monorepo**: pnpm workspaces + Turborepo

## Running Locally

1. Start the database:
   ```bash
   docker compose up -d
   ```

2. Start the monorepo (web and mobile):
   ```bash
   pnpm install
   pnpm dev
   ```

3. Start the backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```
