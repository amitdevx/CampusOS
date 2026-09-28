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
   ./run-backend.sh
   ```

## Deployment
Please see the [Deployment & Setup Guide](DEPLOYMENT.md) for step-by-step instructions on hosting the backend, web app, and generating the mobile APK for free.
