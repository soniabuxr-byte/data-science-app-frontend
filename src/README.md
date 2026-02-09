# Data Science App

A modern web application for exploring, manipulating, augmenting, and visualizing CSV data files up to 100MB.

## 🚀 Quick Start (5 minutes)

**New to this project?** Start here: **[GETTING_STARTED.md](./GETTING_STARTED.md)**

```bash
npm install
npm run dev
```

Open http://localhost:5173 - Done! ✅

---

## ⚡ For Cursor AI / GitHub Users

**This frontend is ready to transfer to Cursor AI and GitHub!**

1. Copy this entire folder to your local machine
2. Open in Cursor AI or any code editor
3. Run: `npm install && npm run dev`
4. See **[CURSOR_SETUP.md](./CURSOR_SETUP.md)** for complete setup instructions

**Backend Integration:** This is frontend-only. Build your LLM backend separately and connect via API. See **[API_INTEGRATION.md](./API_INTEGRATION.md)** for endpoint specifications.

---

## Features

- **Sign-In Screen**: User authentication (currently mock implementation)
- **Landing Page**: 4-step workflow showcase with file upload
- **Data Explorer**: Interactive table with search and pagination
- **Data Manipulation**: Filter rows and sort columns
- **Data Augmentation**: Create calculated columns and derived insights
- **Data Visualization**: Multiple chart types (bar, line, pie, scatter)

## Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **CSV Parsing**: PapaParse
- **UI Components**: Custom component library based on shadcn/ui
- **Icons**: Lucide React

## Project Structure

```
/
├── App.tsx                          # Main app component with screen navigation
├── components/
│   ├── SignInScreen.tsx            # Authentication screen
│   ├── LandingPage.tsx             # Landing page with file upload
│   ├── DataApp.tsx                 # Main data app with tabs
│   ├── DataExplorer.tsx            # Data viewing and browsing
│   ├── DataManipulation.tsx        # Filtering and sorting
│   ├── DataAugmentation.tsx        # Column creation and formulas
│   ├── DataVisualization.tsx       # Charts and graphs
│   ├── figma/                      # Figma-specific utilities
│   └── ui/                         # Reusable UI components
├── styles/
│   └── globals.css                 # Global styles and CSS variables
└── services/
    └── api.ts                      # API service for backend integration (to be implemented)
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A code editor (VS Code, Cursor AI, etc.)

### Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional, for backend integration):
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```
VITE_API_URL=http://localhost:3000/api
```

4. Run the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:5173`

## Backend Integration (TO DO)

The frontend is prepared for backend integration. To connect your LLM backend:

### API Endpoints Expected

Create these endpoints in your backend:

#### Authentication
- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User sign out

#### Data Operations
- `POST /api/data/filter` - Filter data rows
- `POST /api/data/sort` - Sort data columns
- `POST /api/data/augment` - Create calculated columns with formulas
- `POST /api/data/analyze` - Run LLM analysis on data
- `POST /api/data/visualize` - Generate chart configurations

### API Integration Steps

1. Update the `VITE_API_URL` in your `.env.local` file
2. Implement the API service methods in `/services/api.ts`
3. Replace mock data with actual API calls in components
4. Add error handling and loading states

## Font Configuration

The app uses "Post No Bills Colombo Medium" for the main title. 

### Option 1: Use Google Fonts (Recommended for deployment)
Add to your `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Post+No+Bills+Colombo:wght@400;500;600&display=swap" rel="stylesheet">
```

### Option 2: Self-host fonts
1. Download the font files
2. Place them in `/public/fonts/`
3. Add @font-face rules to `/styles/globals.css`

### Option 3: Use fallback fonts (Current)
The app will fall back to `sans-serif` if the custom font isn't available.

## Deployment

### Build for production:
```bash
npm run build
```

### Deploy to GitHub Pages:
1. Push your code to GitHub
2. Enable GitHub Pages in repository settings
3. Set the source to the `main` branch
4. Your app will be available at `https://yourusername.github.io/repository-name`

### Deploy to Vercel/Netlify:
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables in dashboard
5. Deploy!

## File Upload Specifications

- **Supported formats**: CSV (JSON and Excel support coming soon)
- **Maximum file size**: 100MB
- **Validation**: Automatic file type and size validation
- **Error handling**: User-friendly error messages via toast notifications

## Current Limitations

1. Authentication is currently mock implementation (any email/password works)
2. All data processing happens in the frontend (no persistence)
3. No backend integration yet (ready for API connections)
4. CSV only (JSON and Excel parsers not yet implemented)

## Next Steps for Backend Integration

1. **Set up your LLM backend** in a separate repository
2. **Create API endpoints** matching the structure in `/services/api.ts`
3. **Update environment variables** with your backend URL
4. **Implement authentication** (JWT, OAuth, etc.)
5. **Add data persistence** (database integration)
6. **Enable LLM features**:
   - Natural language queries on data
   - Smart column suggestions
   - Automated insights
   - Chart recommendations

## Contributing

This is a personal project. If you fork it:
1. Update the branding and fonts
2. Implement your own backend
3. Add proper authentication
4. Consider data privacy and security

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please open a GitHub issue in your repository.

---

**Note**: This frontend is designed to be modular and backend-agnostic. Connect it to any backend service that implements the expected API endpoints.