# Data Science App - Frontend

A browser-based data analysis tool built with React, Vite, and Tailwind CSS.

## Features

- **Drag & Drop CSV Upload** - Upload files up to 100MB
- **Data Exploration** - Browse data in an interactive table with search and pagination
- **Data Manipulation** - Filter, sort, and transform your data
- **Data Augmentation** - Create calculated columns, concatenate fields, extract patterns
- **Data Visualization** - Generate bar, line, pie, and scatter charts
- **Export** - Download your modified data as CSV

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS v4
- Recharts (visualization)
- PapaParse (CSV parsing)
- Radix UI (components)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000/api` |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set `VITE_API_URL` environment variable to your backend URL
4. Deploy

### Build for Production

```bash
npm run build
```

Output will be in the `build/` directory.

## Backend

This frontend connects to a FastAPI backend for authentication. See the [backend repository](https://github.com/yourusername/data-science-app-backend) for setup instructions.

## License

MIT
