# Getting Started - Quick Guide

Welcome! This is a **5-minute quick start** to get your Data Science App running.

## Prerequisites

- **Node.js 18+** ([Download here](https://nodejs.org))
- **Code editor** (Cursor AI, VS Code, etc.)
- **Terminal/Command line** access

## Quick Start (5 minutes)

### Step 1: Install Dependencies (2 min)

```bash
npm install
```

Wait for installation to complete (~2 minutes depending on internet speed).

### Step 2: Run the App (1 min)

```bash
npm run dev
```

You should see:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
```

### Step 3: Open in Browser (30 sec)

Visit: **http://localhost:5173**

You should see the **Sign-In screen** with a blue gradient background.

### Step 4: Test the App (1 min)

1. **Sign in** with any email/password (demo mode)
2. **Upload a CSV file** on the landing page
3. **Explore your data** in the Data App

✅ **Done!** Your frontend is working.

## What's Next?

### For Cursor AI Users

👉 **Read [CURSOR_SETUP.md](./CURSOR_SETUP.md)** for complete Cursor-specific setup.

### For Backend Developers

👉 **Read [API_INTEGRATION.md](./API_INTEGRATION.md)** to build your LLM backend.

### For Deployment

👉 **Read [DEPLOYMENT.md](./DEPLOYMENT.md)** to deploy to production.

## Project Documentation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **[GETTING_STARTED.md](./GETTING_STARTED.md)** | This file - quick start | 2 min |
| **[README.md](./README.md)** | Project overview & features | 5 min |
| **[CURSOR_SETUP.md](./CURSOR_SETUP.md)** | Cursor AI setup guide | 10 min |
| **[API_INTEGRATION.md](./API_INTEGRATION.md)** | Backend API specifications | 15 min |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | Deployment instructions | 10 min |
| **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** | High-level architecture | 5 min |
| **[TRANSFER_CHECKLIST.md](./TRANSFER_CHECKLIST.md)** | Transfer verification | 10 min |

## Environment Setup (Optional)

To connect a backend later:

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local
# VITE_API_URL=http://localhost:3000/api
```

## Common Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5173 (Mac/Linux)
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### Installation Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### TypeScript Errors

```bash
# Check for errors
npx tsc --noEmit
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **Recharts** - Charts
- **PapaParse** - CSV parsing

## Features

✅ Sign-In/Sign-Up screen  
✅ Landing page with file upload  
✅ Data Explorer with tables  
✅ Data Manipulation (filter/sort)  
✅ Data Augmentation (formulas)  
✅ Data Visualization (charts)  
✅ Fully responsive design  
✅ Professional UI components  

## Current State

- **Frontend only** - works standalone
- **Mock authentication** - any email/password accepted
- **Client-side CSV parsing** - up to 100MB
- **No persistence** - data lost on refresh
- **Ready for backend** - API layer prepared

## Next Steps

1. ✅ **Run app locally** (you just did this!)
2. ⬜ **Read full documentation** (links above)
3. ⬜ **Build LLM backend** (separate repo)
4. ⬜ **Connect frontend to backend** (via API)
5. ⬜ **Deploy to production** (Vercel + your backend)

## Support

- **Documentation**: Check the files listed above
- **Issues**: Create a GitHub issue
- **Questions**: Review API_INTEGRATION.md and CURSOR_SETUP.md

---

**Ready to dive deeper?**

→ Next: Read **[CURSOR_SETUP.md](./CURSOR_SETUP.md)** for complete Cursor AI setup  
→ Or: Read **[API_INTEGRATION.md](./API_INTEGRATION.md)** to build your backend

**Happy coding! 🚀**
