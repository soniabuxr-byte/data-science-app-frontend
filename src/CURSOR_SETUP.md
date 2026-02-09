# Setting Up in Cursor AI

This guide helps you transfer this frontend code to Cursor AI and prepare it for GitHub deployment.

## Quick Start

### 1. Copy Files to Cursor

1. **Download/export** this entire project folder from Figma Make
2. **Open Cursor AI** 
3. **Open folder** in Cursor: `File` → `Open Folder` → select your project folder
4. Cursor will automatically detect the project structure

### 2. Install Dependencies

Open the terminal in Cursor (`Ctrl/Cmd + ~`) and run:

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Your app should now be running at `http://localhost:5173`

## What's Already Configured

✅ **Package.json** - All dependencies are properly listed  
✅ **Vite config** - Build and dev server configured  
✅ **TypeScript** - Full type safety with proper tsconfig  
✅ **Tailwind CSS v4** - Styling system ready  
✅ **API Service** - `/services/api.ts` with all endpoints defined  
✅ **Environment setup** - `.env.example` template provided  
✅ **Git ready** - `.gitignore` configured

## Fonts Compatibility

### Current Font Setup

The app uses **"Post No Bills Colombo Medium"** for the main title. This is already configured in `/index.html` with Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Post+No+Bills+Colombo:wght@400;500;600&display=swap" rel="stylesheet">
```

### Font Fallback

If the font doesn't load, the app automatically falls back to:
- System sans-serif fonts
- Clean, professional appearance maintained

### Customizing Fonts

If you want to use a different font:

1. **Option A - Google Fonts:**
   - Update the `<link>` tag in `/index.html`
   - Update the `fontFamily` in components (search for "Post No Bills Colombo")

2. **Option B - Self-hosted:**
   - Add font files to `/public/fonts/`
   - Add `@font-face` rules to `/styles/globals.css`
   - Update component styles

3. **Option C - Remove custom fonts:**
   - Remove Google Fonts link from `/index.html`
   - Remove inline `style` props with `fontFamily` from components
   - App will use default Tailwind fonts

## Figma Imports (Optional Cleanup)

The `/imports` folder contains Figma-generated files:
- `IPhone16Pro1.tsx`
- `Info.tsx` 
- `ReviewMiroBoard.tsx`
- SVG files

**These are NOT currently used in the app** and can be safely deleted if you want a cleaner codebase:

```bash
# Optional cleanup
rm -rf /imports
```

The background image from Figma has already been replaced with a CSS gradient in `SignInScreen.tsx`, so no Figma assets are required.

## Environment Variables

### Development Setup

1. **Copy the example file:**
```bash
cp .env.example .env.local
```

2. **Edit `.env.local`:**
```env
VITE_API_URL=http://localhost:3000/api
VITE_DEBUG=true
VITE_ENV=development
```

3. **For production:** Update `VITE_API_URL` to your deployed backend URL

### Important Notes

- **NEVER commit** `.env` or `.env.local` files to GitHub
- Always use `VITE_` prefix for environment variables in Vite
- Restart dev server after changing environment variables

## Integrating Your LLM Backend

### Step 1: Review API Structure

Check `/services/api.ts` - it contains:
- ✅ All endpoint interfaces defined
- ✅ Request/response TypeScript types
- ✅ Mock implementations (currently active)
- ✅ Commented-out real API calls ready to uncomment

### Step 2: Build Backend Endpoints

In your separate backend repository (Cursor AI), create these endpoints:

**Authentication:**
- `POST /api/auth/signin`
- `POST /api/auth/signup`  
- `POST /api/auth/signout`

**Data Operations:**
- `POST /api/data/filter`
- `POST /api/data/sort`
- `POST /api/data/augment`
- `POST /api/data/suggest-operations`

**Visualization (LLM-powered):**
- `POST /api/data/recommend-charts`
- `POST /api/data/generate-insights`

**Natural Language:**
- `POST /api/data/nl-query`

### Step 3: Enable Real API Calls

Once your backend is ready, update `/services/api.ts`:

1. **Find the mock implementations** (search for "// TODO: Replace with actual API call")
2. **Uncomment the real API calls**
3. **Comment out or remove the mock returns**

Example:
```typescript
// Before (mock):
export const authAPI = {
  signIn: async (data: SignInRequest) => {
    // Mock implementation
    return { success: true, data: { ... } };
  }
}

// After (real API):
export const authAPI = {
  signIn: async (data: SignInRequest) => {
    return fetchAPI<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
```

### Step 4: Add Authorization

Add JWT token handling in `/services/api.ts`:

```typescript
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });
  
  // ... rest of implementation
}
```

## Git & GitHub Setup

### Initialize Git

If not already initialized:

```bash
git init
git add .
git commit -m "Initial commit - Data Science App frontend"
```

### Connect to GitHub

1. **Create a new repository** on GitHub (don't initialize with README)

2. **Connect your local repo:**
```bash
git remote add origin https://github.com/yourusername/your-repo-name.git
git branch -M main
git push -u origin main
```

### Recommended .gitignore

Already configured! See `/.gitignore` - it excludes:
- `node_modules/`
- `.env` and `.env.local`
- `dist/` build output
- Editor configs
- OS files

## Testing Before Deployment

### 1. Build Test

```bash
npm run build
```

This should complete without errors and create a `dist/` folder.

### 2. Preview Production Build

```bash
npm run preview
```

Access at `http://localhost:4173` - this simulates production.

### 3. Check for Issues

- [ ] All pages load correctly
- [ ] File upload works (CSV parsing)
- [ ] All tabs function (Explorer, Manipulation, Augmentation, Visualization)
- [ ] Charts render properly
- [ ] No console errors
- [ ] Responsive on mobile/tablet/desktop

## Deployment Options

See `/DEPLOYMENT.md` for detailed deployment guides:

1. **Vercel** (Recommended) - Easiest with automatic deployments
2. **Netlify** - Great alternative with similar features
3. **GitHub Pages** - Free static hosting
4. **Custom VPS** - Full control

## Working with Cursor AI Features

### AI Chat Commands

Use Cursor's AI to help with:

```
"Add error handling to the filter API call"
"Create a loading state for chart generation" 
"Add unit tests for the data manipulation component"
"Optimize the CSV parsing for large files"
```

### Cursor Rules

Create a `.cursorrules` file in your project root:

```
This is a React + TypeScript + Vite project for data science visualization.

Key patterns:
- Use functional components with hooks
- Keep API calls in /services/api.ts
- Follow the existing component structure
- Use Tailwind CSS v4 for styling
- Maintain TypeScript type safety

When adding features:
- Update both TypeScript interfaces and implementation
- Add error handling with toast notifications
- Consider loading states for async operations
- Maintain responsive design patterns
```

### Code Organization

Current structure (keep this organized):

```
/
├── components/           # React components
│   ├── ui/              # Reusable UI components (shadcn-based)
│   ├── figma/           # Figma-specific utilities
│   ├── SignInScreen.tsx # Authentication
│   ├── LandingPage.tsx  # Landing page with upload
│   └── Data*.tsx        # Data app components
├── services/            # API and external services
│   └── api.ts          # All API calls centralized here
├── styles/             # Global styles and CSS
└── App.tsx             # Main app with routing
```

## Common Issues & Solutions

### Issue: Font not displaying
**Solution:** Check that Google Fonts link is in `/index.html` and internet connection is available. Font will fall back to sans-serif if unavailable.

### Issue: Build fails with "Cannot find module"
**Solution:** 
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Environment variables not working
**Solution:** 
- Ensure variables start with `VITE_`
- Restart dev server after changes
- Check `.env.local` exists and has correct values

### Issue: API calls failing
**Solution:**
- Check `VITE_API_URL` is correct
- Verify backend is running and accessible
- Check browser console for CORS errors
- Confirm backend CORS allows your frontend domain

### Issue: TypeScript errors in `/services/api.ts`
**Solution:** The API service uses TypeScript for type safety. Fix type mismatches by updating interfaces to match your backend's actual response structure.

## Backend Development Workflow

**Recommended approach:**

1. **Frontend Repository (this one):**
   - Contains all UI code
   - Makes API calls to backend
   - Deploy separately (Vercel/Netlify)

2. **Backend Repository (separate - build in Cursor):**
   - Express/FastAPI/Flask backend with LLM integration
   - Implements the API endpoints from `/services/api.ts`
   - Deploy separately (Railway/Render/AWS)

3. **Connect them:**
   - Set `VITE_API_URL` in frontend to backend URL
   - Configure CORS in backend to allow frontend domain
   - Both can be developed and deployed independently

## Next Steps

1. ✅ **Set up in Cursor** - Open project folder
2. ✅ **Install dependencies** - `npm install`
3. ✅ **Test locally** - `npm run dev`
4. ⬜ **Push to GitHub** - Initialize git and push
5. ⬜ **Build your LLM backend** - In separate repository
6. ⬜ **Connect frontend to backend** - Update API URLs
7. ⬜ **Deploy both** - Frontend to Vercel, Backend to your choice
8. ⬜ **Test production** - Verify everything works together

## Support & Documentation

- **README.md** - Overview and features
- **API_INTEGRATION.md** - Detailed API endpoint specs
- **DEPLOYMENT.md** - Deployment instructions
- **This file** - Cursor-specific setup

## Questions?

Common questions:

**Q: Do I need to modify Tailwind config?**  
A: No, it's already configured for v4.0 with the plugin system.

**Q: Can I use this with a different backend language?**  
A: Yes! Just implement the API endpoints from `/services/api.ts` in any language.

**Q: Is the authentication secure?**  
A: Currently it's mock authentication. You MUST implement real auth in your backend with JWT/OAuth before production use.

**Q: Can I add more chart types?**  
A: Yes! Recharts supports many chart types. Add them in `DataVisualization.tsx`.

**Q: How do I add more data transformation features?**  
A: Update `DataAugmentation.tsx` component and corresponding API endpoints in your backend.

---

**You're all set!** This codebase is ready to transfer to Cursor AI and connect to your LLM backend. Good luck with your project! 🚀
