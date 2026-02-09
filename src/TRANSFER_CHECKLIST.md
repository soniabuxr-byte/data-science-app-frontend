# Transfer to Cursor AI - Checklist

Use this checklist to ensure a smooth transfer from Figma Make to Cursor AI and GitHub.

## ✅ Pre-Transfer Verification

### Files Ready for Transfer

- [x] **All source code files** (.tsx, .ts, .css)
- [x] **Configuration files** (package.json, tsconfig.json, vite.config.ts)
- [x] **Environment template** (.env.example)
- [x] **Git configuration** (.gitignore)
- [x] **Documentation** (README.md, API_INTEGRATION.md, DEPLOYMENT.md, CURSOR_SETUP.md)
- [x] **Removed Figma dependencies** (figma:asset imports replaced with CSS gradients)

### Code Quality

- [x] **No Figma-specific imports** in active code
- [x] **Standard npm packages** only
- [x] **TypeScript compilation** works
- [x] **All components** use standard React patterns
- [x] **API structure** documented and ready for backend

### What's NOT Included (Optional Cleanup)

- [ ] `/imports` folder - Contains unused Figma-generated files (safe to delete)
- [ ] `/guidelines` folder - Figma Make guidelines (safe to delete)
- [ ] `/Attributions.md` - Figma Make attributions (safe to delete)

## 📦 Transfer Steps

### 1. Download from Figma Make

- [ ] Export/download the entire project folder
- [ ] Save to a location on your computer (e.g., `~/Projects/data-science-app`)

### 2. Open in Cursor AI

- [ ] Open Cursor AI
- [ ] File → Open Folder
- [ ] Select your downloaded project folder
- [ ] Wait for Cursor to index the project

### 3. Install Dependencies

Open terminal in Cursor (`Ctrl/Cmd + ~`):

```bash
# Verify Node.js version (should be 18+)
node --version

# Install dependencies
npm install

# Should complete without errors
```

**Expected output:** All packages install successfully, no errors.

### 4. Configure Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your settings
# For now, leave as localhost:3000
```

### 5. Test Development Server

```bash
# Start dev server
npm run dev

# Should start without errors
```

**Expected output:**
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 6. Verify in Browser

- [ ] Open `http://localhost:5173`
- [ ] **Sign-In Screen** displays correctly
  - [ ] Background gradient shows (blue gradient, not broken image)
  - [ ] Title "Data Science App.com" displays in custom font
  - [ ] Sign in/Sign up tabs work
  - [ ] Can sign in with any email/password
- [ ] **Landing Page** displays after sign-in
  - [ ] 4-step workflow visible
  - [ ] File upload area works
- [ ] **Upload a CSV** file
  - [ ] File uploads successfully
  - [ ] Data appears in Data App
- [ ] **Test all tabs** in Data App
  - [ ] Explorer: Table displays data
  - [ ] Manipulation: Filter and sort controls visible
  - [ ] Augmentation: Formula builder visible
  - [ ] Visualization: Chart options display
- [ ] **Check responsive design**
  - [ ] Open browser dev tools (F12)
  - [ ] Toggle device toolbar (mobile view)
  - [ ] Verify layout adapts to mobile

### 7. Build Test

```bash
# Build for production
npm run build
```

**Expected output:**
```
✓ XXX modules transformed.
dist/index.html                X.XX kB
dist/assets/index-XXXXX.js     XXX kB
✓ built in XXX ms
```

- [ ] Build completes successfully
- [ ] `dist/` folder created
- [ ] No TypeScript errors
- [ ] No build warnings (some are OK)

### 8. Preview Production Build

```bash
# Preview the production build
npm run preview
```

- [ ] Preview server starts
- [ ] Visit `http://localhost:4173`
- [ ] App works same as dev mode
- [ ] No console errors in browser

## 🔧 Font Verification

### Check Custom Font Loading

1. [ ] Open browser developer tools (F12)
2. [ ] Go to Network tab
3. [ ] Filter by "Font"
4. [ ] Reload page
5. [ ] Verify "Post No Bills Colombo" font loads from Google Fonts

**If font doesn't load:**
- App should still look good with fallback fonts
- This is expected and OK - font is optional

## 🐛 Common Issues & Fixes

### Issue: `npm install` fails

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Issue: Port 5173 already in use

**Solution:**
```bash
# Kill the process using port 5173
# On Mac/Linux:
lsof -ti:5173 | xargs kill -9

# On Windows:
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F

# Or just use a different port
npm run dev -- --port 3000
```

### Issue: TypeScript errors

**Solution:**
```bash
# Check TypeScript compilation
npx tsc --noEmit

# If errors persist, check tsconfig.json is correct
```

### Issue: Background shows broken image

**Already fixed!** The background now uses CSS gradients instead of Figma assets.

## 📤 GitHub Setup

### Initialize Git Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Data Science App frontend"
```

### Create GitHub Repository

1. [ ] Go to [github.com](https://github.com) and sign in
2. [ ] Click "New repository" (green button)
3. [ ] Enter repository name (e.g., `data-science-app-frontend`)
4. [ ] Choose public or private
5. [ ] **DO NOT** initialize with README (you already have one)
6. [ ] Click "Create repository"

### Connect and Push

```bash
# Add GitHub as remote (replace with your URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

### Verify on GitHub

- [ ] Visit your repository on GitHub
- [ ] All files are visible
- [ ] README.md displays correctly
- [ ] `.env.local` is NOT committed (should be in .gitignore)
- [ ] `node_modules/` is NOT committed

## 🎯 Next Steps After Transfer

### Immediate (Required for functionality)

1. [ ] **Read CURSOR_SETUP.md** for detailed Cursor-specific instructions
2. [ ] **Read API_INTEGRATION.md** to understand backend requirements
3. [ ] **Set up your LLM backend** in a separate repository

### Short-term (Before deployment)

4. [ ] **Create backend API endpoints** matching `/services/api.ts`
5. [ ] **Update `.env.local`** with your backend URL
6. [ ] **Replace mock API calls** with real backend calls
7. [ ] **Test end-to-end** with real backend

### Long-term (Production ready)

8. [ ] **Implement real authentication** (JWT, OAuth)
9. [ ] **Add error boundaries** for better error handling
10. [ ] **Set up monitoring** (Sentry, LogRocket)
11. [ ] **Add analytics** (Google Analytics, Plausible)
12. [ ] **Deploy frontend** (Vercel/Netlify) - see DEPLOYMENT.md
13. [ ] **Deploy backend** (Railway/Render/AWS)
14. [ ] **Configure custom domain** (optional)

## 📚 Documentation Reference

| File | Purpose |
|------|---------|
| `README.md` | Overview, features, basic setup |
| `CURSOR_SETUP.md` | **→ Cursor-specific setup guide (READ THIS FIRST)** |
| `API_INTEGRATION.md` | Detailed API endpoint specifications |
| `DEPLOYMENT.md` | Deployment instructions for various platforms |
| `TRANSFER_CHECKLIST.md` | This file - verification checklist |

## ✨ Success Criteria

You've successfully transferred when:

- ✅ Code opens in Cursor without errors
- ✅ `npm install` completes successfully
- ✅ `npm run dev` starts development server
- ✅ App displays correctly in browser (no broken images/fonts)
- ✅ Can sign in, upload CSV, and view data
- ✅ `npm run build` creates production bundle
- ✅ Code is pushed to GitHub
- ✅ `.env.local` and `node_modules` are NOT in GitHub

## 🚀 You're Ready!

Once all items above are checked, you're ready to:

1. **Build your LLM backend** in Cursor (separate project)
2. **Connect the two** via API calls
3. **Deploy both** to production
4. **Share your app** with the world!

---

**Questions or stuck?** 
- Review the documentation files listed above
- Check the "Common Issues" section
- Ensure you're using Node.js 18 or higher

**Good luck with your data science app! 🎉**
