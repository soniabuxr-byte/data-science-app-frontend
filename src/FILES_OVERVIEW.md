# Files Overview - What's What

Complete guide to every file in this project and whether you need it.

## 📋 Core Application Files (Required)

These files make the app work. **Do not delete.**

### Root Files

| File | Purpose | Editable? |
|------|---------|-----------|
| `App.tsx` | Main app with screen routing | ✅ Yes |
| `index.html` | HTML entry point, font loading | ✅ Yes |
| `main.tsx` | React app initialization | ⚠️ Rarely |
| `package.json` | Dependencies and scripts | ✅ Yes |
| `tsconfig.json` | TypeScript configuration | ⚠️ Rarely |
| `tsconfig.node.json` | TypeScript for Node/Vite | ❌ No |
| `vite.config.ts` | Vite build configuration | ⚠️ Rarely |
| `tailwind.config.js` | Tailwind CSS v4 config | ✅ Yes |
| `postcss.config.js` | PostCSS for Tailwind | ❌ No |

### `/components/` - React Components

| File | Purpose | Editable? |
|------|---------|-----------|
| `SignInScreen.tsx` | Sign-in/sign-up page | ✅ Yes |
| `LandingPage.tsx` | Landing page with upload | ✅ Yes |
| `DataApp.tsx` | Main data app container | ✅ Yes |
| `DataExplorer.tsx` | Data table viewer | ✅ Yes |
| `DataManipulation.tsx` | Filter/sort controls | ✅ Yes |
| `DataAugmentation.tsx` | Formula builder | ✅ Yes |
| `DataVisualization.tsx` | Charts and graphs | ✅ Yes |

### `/components/ui/` - UI Components

Pre-built components (shadcn/ui based). **Customize carefully.**

| Component | Used For |
|-----------|----------|
| `button.tsx` | Buttons throughout app |
| `input.tsx` | Text inputs, file uploads |
| `card.tsx` | Container cards |
| `table.tsx` | Data tables |
| `select.tsx` | Dropdowns |
| `tabs.tsx` | Tab navigation |
| `dialog.tsx` | Modal dialogs |
| `chart.tsx` | Recharts wrapper |
| `sonner.tsx` | Toast notifications |
| + 30 more... | Various UI elements |

### `/components/figma/` - Utilities

| File | Purpose | Used? |
|------|---------|-------|
| `ImageWithFallback.tsx` | Protected image component | ❌ Not currently |

### `/services/` - API Layer

| File | Purpose | Editable? |
|------|---------|-----------|
| `api.ts` | **All backend API calls** | ✅ **YES - Edit this!** |

### `/styles/` - Styling

| File | Purpose | Editable? |
|------|---------|-----------|
| `globals.css` | CSS variables, base styles | ✅ Yes |

## 📚 Documentation Files (Keep for Reference)

These help you understand and use the app. **Keep these.**

| File | Purpose | Read Time |
|------|---------|-----------|
| `README.md` | Project overview | 5 min |
| `GETTING_STARTED.md` | Quick start guide | 2 min |
| `CURSOR_SETUP.md` | **Cursor AI setup** | 10 min |
| `API_INTEGRATION.md` | **Backend API specs** | 15 min |
| `DEPLOYMENT.md` | Deployment guides | 10 min |
| `PROJECT_SUMMARY.md` | Architecture overview | 5 min |
| `TRANSFER_CHECKLIST.md` | Transfer verification | 10 min |
| `FILES_OVERVIEW.md` | This file | 3 min |

## 🔧 Configuration Files (Keep)

| File | Purpose | Edit? |
|------|---------|-------|
| `.env.example` | Environment template | ✅ Copy to `.env.local` |
| `.gitignore` | Git ignore rules | ⚠️ Rarely |
| `LICENSE` | MIT license | ❌ No (update copyright) |

## 🧹 Optional Files (Can Delete)

These are **NOT required** for the app to work. Safe to delete if you want a cleaner codebase.

### Figma Artifacts

| File/Folder | Purpose | Safe to Delete? |
|-------------|---------|-----------------|
| `/imports/` | Figma-generated components | ✅ **YES** |
| `imports/IPhone16Pro1.tsx` | Unused Figma component | ✅ YES |
| `imports/Info.tsx` | Unused Figma component | ✅ YES |
| `imports/ReviewMiroBoard.tsx` | Unused Figma component | ✅ YES |
| `imports/svg-*.ts` | Unused SVG files | ✅ YES |

### Figma Make Specific

| File/Folder | Purpose | Safe to Delete? |
|-------------|---------|-----------------|
| `/guidelines/` | Figma Make guidelines | ✅ **YES** |
| `Attributions.md` | Figma Make credits | ✅ YES |

### Cleanup Scripts

| File | Purpose | Safe to Delete? |
|------|---------|-----------------|
| `cleanup-figma-files.sh` | Automated cleanup (Mac/Linux) | ✅ YES (after running) |
| `cleanup-figma-files.bat` | Automated cleanup (Windows) | ✅ YES (after running) |

## 🚫 Generated Files (Auto-Created, Do Not Commit)

These are created automatically. **Already in .gitignore.**

| File/Folder | Created By | Committed? |
|-------------|------------|------------|
| `node_modules/` | npm install | ❌ Never |
| `dist/` | npm run build | ❌ Never |
| `.env.local` | You (manual copy) | ❌ Never |
| `package-lock.json` | npm install | ✅ Yes |

## 📝 File Counts

```
Total files:         ~100+
Core app files:      ~50
UI components:       ~40
Documentation:       8
Optional (delete):   ~10
Generated (ignore):  node_modules + dist
```

## 🎯 Quick Cleanup Guide

### Minimal Codebase (Delete Optional Files)

**Mac/Linux:**
```bash
# Run the cleanup script
bash cleanup-figma-files.sh
```

**Windows:**
```bash
# Run the cleanup script
cleanup-figma-files.bat
```

**Manual cleanup:**
```bash
rm -rf imports/
rm -rf guidelines/
rm Attributions.md
rm cleanup-figma-files.sh
rm cleanup-figma-files.bat
```

### After cleanup, you'll have:

- ✅ All working code
- ✅ All documentation
- ✅ No Figma artifacts
- ✅ Smaller, cleaner repo

## 📂 Recommended Folder Structure (After Cleanup)

```
data-science-app/
├── components/          # React components
│   ├── ui/             # UI library
│   ├── figma/          # Utilities
│   └── *.tsx           # App components
├── services/           # API layer
│   └── api.ts         # ⭐ Edit this for backend
├── styles/            # Global CSS
├── docs/              # (Optional) Move all .md files here
├── App.tsx            # Main app
├── index.html         # Entry point
├── main.tsx           # React init
├── package.json       # Dependencies
└── README.md          # Overview

Hidden/Config:
├── .env.example       # Environment template
├── .env.local        # Your settings (not committed)
├── .gitignore        # Git rules
└── vite.config.ts    # Build config
```

## 🔍 Finding Files

### By Purpose

**Need to change branding?**
- `SignInScreen.tsx` - Title and tagline
- `LandingPage.tsx` - Landing page content
- `index.html` - Page title

**Need to add API calls?**
- `services/api.ts` - All API endpoints

**Need to change styling?**
- `styles/globals.css` - Colors, fonts, tokens
- `tailwind.config.js` - Tailwind config
- Individual component files - Component-specific styles

**Need to add features?**
- `DataExplorer.tsx` - Data viewing
- `DataManipulation.tsx` - Filtering/sorting
- `DataAugmentation.tsx` - Column creation
- `DataVisualization.tsx` - Charts

### By File Type

**TypeScript/React (`.tsx`)**: 50+ files (all components)  
**TypeScript (`.ts`)**: 5 files (config, services, utils)  
**CSS**: 1 file (`globals.css`)  
**Config**: 6 files (package.json, tsconfig, vite, etc.)  
**Markdown (`.md`)**: 8 files (documentation)  
**Scripts**: 2 files (cleanup helpers)

## ⚡ Files You'll Edit Most

When building your app:

1. **`/services/api.ts`** - Connect to your backend
2. **`DataAugmentation.tsx`** - Add LLM features
3. **`DataVisualization.tsx`** - Add chart types
4. **`styles/globals.css`** - Customize design
5. **`.env.local`** - Configure environment

## 🎓 Learning Path

**Day 1:** Read documentation, understand structure  
**Day 2:** Explore component files, see how they work  
**Day 3:** Edit `services/api.ts`, prepare for backend  
**Day 4:** Build your backend, test integration  
**Day 5:** Deploy and celebrate! 🎉

## ❓ Questions

**Q: Can I delete FILES_OVERVIEW.md after reading?**  
A: Yes! It's just a reference. Keep README.md instead.

**Q: What happens if I delete a component?**  
A: App will break if it's imported somewhere. Check imports first.

**Q: Can I reorganize the folder structure?**  
A: Yes, but update all import paths. Vite uses absolute paths with `@/`.

**Q: Should I commit .env.local?**  
A: **NO!** It's in .gitignore. Only commit .env.example.

**Q: Can I use this with a different backend language?**  
A: Yes! Just implement the API endpoints from `api.ts` in any language.

---

**Summary:**

- **Core app**: ~50 files (keep all)
- **Documentation**: 8 files (keep for reference)
- **Optional**: ~10 files (safe to delete)
- **Most important**: `services/api.ts` for backend integration

**Next step:** Read [CURSOR_SETUP.md](./CURSOR_SETUP.md) to get started!
