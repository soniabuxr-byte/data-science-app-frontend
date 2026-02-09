# Deployment Guide

This guide covers deploying your Data Science App frontend to various platforms.

## Prerequisites

Before deploying, ensure:
1. All code is committed to Git
2. Tests pass (if you have any)
3. Build works locally: `npm run build`
4. Environment variables are configured

## GitHub Setup

1. Create a new repository on GitHub
2. Initialize git in your project (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides the easiest deployment with automatic HTTPS and global CDN.

1. **Install Vercel CLI** (optional):
```bash
npm install -g vercel
```

2. **Deploy via GitHub**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add environment variables in dashboard:
     - `VITE_API_URL` = your backend URL

3. **Deploy via CLI**:
```bash
vercel
```

4. **Access your app** at: `https://your-app.vercel.app`

### Option 2: Netlify

Similar to Vercel with excellent performance.

1. **Deploy via GitHub**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import from Git"
   - Select your repository
   - Configure:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Add environment variables in dashboard

2. **Deploy via CLI**:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

3. **Access your app** at: `https://your-app.netlify.app`

### Option 3: GitHub Pages

Free hosting directly from your GitHub repository.

1. **Install gh-pages**:
```bash
npm install --save-dev gh-pages
```

2. **Update vite.config.ts**:
```typescript
export default defineConfig({
  base: '/your-repo-name/', // Add this line
  // ... rest of config
})
```

3. **Add deploy script to package.json**:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

4. **Deploy**:
```bash
npm run deploy
```

5. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from branch
   - Branch: `gh-pages` → `/root`
   - Save

6. **Access your app** at: `https://yourusername.github.io/your-repo/`

### Option 4: Custom Server (VPS/Cloud)

For more control, deploy to your own server.

1. **Build the app**:
```bash
npm run build
```

2. **Copy `dist` folder** to your server

3. **Configure web server** (Nginx example):
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

4. **Enable HTTPS** with Let's Encrypt:
```bash
sudo certbot --nginx -d yourdomain.com
```

## Environment Variables

### Development (.env.local)
```env
VITE_API_URL=http://localhost:3000/api
VITE_DEBUG=true
VITE_ENV=development
```

### Production
Configure in your hosting provider's dashboard:
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_DEBUG=false
VITE_ENV=production
```

## Backend Integration

### Connecting Your LLM Backend

1. **Deploy your backend separately** (e.g., to Railway, Render, or AWS)
2. **Get the backend URL** (e.g., `https://api.yourdomain.com`)
3. **Set VITE_API_URL** in your frontend deployment
4. **Configure CORS** in your backend to allow frontend domain:

```javascript
// Example Express.js CORS setup
const cors = require('cors');
app.use(cors({
  origin: [
    'https://your-frontend.vercel.app',
    'http://localhost:5173' // for development
  ]
}));
```

### API Endpoint Checklist

Ensure your backend implements these endpoints:

**Authentication:**
- [ ] POST `/api/auth/signin`
- [ ] POST `/api/auth/signup`
- [ ] POST `/api/auth/signout`

**Data Operations:**
- [ ] POST `/api/data/filter`
- [ ] POST `/api/data/sort`
- [ ] POST `/api/data/augment`
- [ ] POST `/api/data/suggest-operations`

**Visualization:**
- [ ] POST `/api/data/recommend-charts`
- [ ] POST `/api/data/generate-insights`

**Natural Language:**
- [ ] POST `/api/data/nl-query`

## Custom Domain

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Netlify
1. Go to Domain Settings
2. Add custom domain
3. Configure DNS or use Netlify DNS

## Performance Optimization

### Before Deployment

1. **Optimize images** (if you add any):
```bash
npm install --save-dev vite-plugin-image-optimizer
```

2. **Enable compression** (built into vite build)

3. **Check bundle size**:
```bash
npm run build
```

4. **Analyze bundle**:
```bash
npm install --save-dev rollup-plugin-visualizer
```

### After Deployment

1. **Test performance** with Lighthouse
2. **Monitor** with Vercel Analytics or Google Analytics
3. **Set up CDN** for static assets (already included in Vercel/Netlify)

## Troubleshooting

### Build Fails

1. Check Node.js version (should be 18+)
2. Clear cache: `rm -rf node_modules package-lock.json && npm install`
3. Check for TypeScript errors: `npm run build`

### Environment Variables Not Working

1. Prefix must be `VITE_` for Vite apps
2. Rebuild after changing env vars
3. Check deployment platform dashboard

### CORS Errors

1. Configure backend to allow your frontend domain
2. Check that API URL is correct
3. Ensure backend is deployed and accessible

### 404 on Page Refresh

Configure your hosting for SPA routing:

**Vercel**: Create `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

**Netlify**: Create `_redirects` in `public/`:
```
/*    /index.html   200
```

## Monitoring

### Error Tracking
Consider adding:
- Sentry: `npm install @sentry/react`
- LogRocket: `npm install logrocket`

### Analytics
- Google Analytics
- Vercel Analytics (built-in)
- Plausible Analytics

## Security

1. **Never commit** `.env` files
2. **Use HTTPS** for production
3. **Implement authentication** in your backend
4. **Validate all inputs** on both frontend and backend
5. **Set up rate limiting** in your API

## CI/CD (Optional)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run deploy
```

## Support

If you encounter issues:
1. Check the hosting provider's docs
2. Review build logs
3. Test locally with `npm run build && npm run preview`
4. Check browser console for errors

---

**Next Steps:**
1. Choose your hosting provider
2. Deploy your frontend
3. Deploy your backend
4. Connect them via environment variables
5. Test the full flow
6. Set up monitoring
7. Configure custom domain (optional)
