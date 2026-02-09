# API Integration Guide

This guide explains how to integrate your LLM backend with this frontend application.

## Overview

The frontend is designed to work with a RESTful API backend. All API calls are centralized in `/services/api.ts`, making it easy to swap between mock implementations and real backend endpoints.

## Quick Start

1. **Set your API URL** in `.env.local`:
```env
VITE_API_URL=http://localhost:3000/api
```

2. **Review the API service** at `/services/api.ts`

3. **Implement matching endpoints** in your backend

4. **Replace mock implementations** with actual API calls

## API Structure

### Base Configuration

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

All API endpoints are prefixed with this base URL.

### Response Format

All APIs return a consistent response structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

## Authentication APIs

### POST `/api/auth/signin`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "email": "user@example.com"
    },
    "token": "jwt_token_here"
  }
}
```

**Frontend Usage:**
```typescript
import { authAPI } from './services/api';

const result = await authAPI.signIn({ email, password });
if (result.success) {
  // Store token, update UI
  localStorage.setItem('token', result.data.token);
}
```

### POST `/api/auth/signup`

**Request:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as signin

### POST `/api/auth/signout`

**Request:** Empty or token in header

**Response:**
```json
{
  "success": true
}
```

## Data Manipulation APIs

### POST `/api/data/filter`

Filter data rows based on conditions.

**Request:**
```json
{
  "data": [
    {"name": "John", "age": 30},
    {"name": "Jane", "age": 25}
  ],
  "filters": [
    {
      "column": "age",
      "operator": "greaterThan",
      "value": 26
    }
  ]
}
```

**Operators:**
- `equals`: Exact match
- `contains`: Substring match (case-insensitive)
- `greaterThan`: Numeric comparison
- `lessThan`: Numeric comparison

**Response:**
```json
{
  "success": true,
  "data": [
    {"name": "John", "age": 30}
  ]
}
```

### POST `/api/data/sort`

Sort data by column.

**Request:**
```json
{
  "data": [
    {"name": "John", "age": 30},
    {"name": "Jane", "age": 25}
  ],
  "column": "age",
  "direction": "asc"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {"name": "Jane", "age": 25},
    {"name": "John", "age": 30}
  ]
}
```

## Data Augmentation APIs (LLM-Powered)

### POST `/api/data/augment`

Create new columns using LLM or formulas.

**Request:**
```json
{
  "data": [
    {"first_name": "John", "last_name": "Doe"},
    {"first_name": "Jane", "last_name": "Smith"}
  ],
  "headers": ["first_name", "last_name"],
  "operation": {
    "type": "concatenate",
    "config": {
      "columns": ["first_name", "last_name"],
      "separator": " ",
      "newColumnName": "full_name"
    }
  }
}
```

**Operation Types:**
- `formula`: Apply mathematical formula
- `concatenate`: Combine columns
- `extract`: Extract patterns (regex, dates, etc.)
- `llm-generate`: Use LLM to generate new values

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {"first_name": "John", "last_name": "Doe", "full_name": "John Doe"},
      {"first_name": "Jane", "last_name": "Smith", "full_name": "Jane Smith"}
    ],
    "headers": ["first_name", "last_name", "full_name"],
    "newColumn": "full_name"
  }
}
```

### POST `/api/data/suggest-operations`

Get LLM suggestions for useful operations.

**Request:**
```json
{
  "data": [...],
  "headers": ["date", "amount", "category"]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    "Extract month from date column",
    "Calculate running total of amount",
    "Categorize amounts as 'high', 'medium', 'low'"
  ]
}
```

## Visualization APIs (LLM-Powered)

### POST `/api/data/recommend-charts`

Get smart chart recommendations based on data.

**Request:**
```json
{
  "data": [...],
  "headers": ["category", "sales", "date"]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "bar",
      "xAxis": "category",
      "yAxis": "sales",
      "title": "Sales by Category",
      "reason": "Categorical data with numeric values is best shown as a bar chart"
    },
    {
      "type": "line",
      "xAxis": "date",
      "yAxis": "sales",
      "title": "Sales Over Time",
      "reason": "Time series data reveals trends best in a line chart"
    }
  ]
}
```

### POST `/api/data/generate-insights`

Generate insights from chart data.

**Request:**
```json
{
  "chartType": "bar",
  "data": [
    {"category": "A", "value": 100},
    {"category": "B", "value": 150},
    {"category": "C", "value": 75}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    "Category B has the highest value at 150",
    "Category C is 50% lower than Category B",
    "Total across all categories is 325"
  ]
}
```

## Natural Language Query API (LLM-Powered)

### POST `/api/data/nl-query`

Process natural language questions about data.

**Request:**
```json
{
  "query": "What's the average sales by region?",
  "data": [...],
  "headers": ["region", "sales", "date"]
}
```

**Example Queries:**
- "Show me all rows where sales > 1000"
- "What's the total revenue by month?"
- "Which region has the highest sales?"
- "Create a chart comparing sales across regions"

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "The average sales by region are: North: $1,234, South: $987, East: $1,456, West: $1,100",
    "visualization": {
      "type": "bar",
      "config": {
        "xAxis": "region",
        "yAxis": "avg_sales"
      }
    },
    "filteredData": [
      {"region": "North", "avg_sales": 1234},
      {"region": "South", "avg_sales": 987}
    ]
  }
}
```

## Implementation Steps

### Step 1: Enable Authentication

Update `SignInScreen.tsx`:

```typescript
import { authAPI } from '../services/api';

const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const result = await authAPI.signIn({ email, password });
  
  if (result.success && result.data) {
    localStorage.setItem('token', result.data.token);
    toast.success('Signed in successfully!');
    onSignIn();
  } else {
    toast.error(result.error || 'Sign in failed');
  }
};
```

### Step 2: Add Authorization Headers

Update `/services/api.ts`:

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

### Step 3: Replace Mock Data Processing

In `DataManipulation.tsx`, replace client-side filtering:

```typescript
import { dataAPI } from '../services/api';

const handleFilter = async () => {
  const result = await dataAPI.filter({
    data: currentData,
    filters: activeFilters
  });
  
  if (result.success && result.data) {
    setFilteredData(result.data);
  }
};
```

### Step 4: Add LLM Features

In `DataAugmentation.tsx`, use LLM for smart suggestions:

```typescript
import { augmentAPI } from '../services/api';

useEffect(() => {
  const loadSuggestions = async () => {
    const result = await augmentAPI.suggestOperations(data, headers);
    if (result.success && result.data) {
      setSuggestions(result.data);
    }
  };
  
  loadSuggestions();
}, [data, headers]);
```

### Step 5: Enable Smart Visualizations

In `DataVisualization.tsx`:

```typescript
import { visualizationAPI } from '../services/api';

useEffect(() => {
  const getRecommendations = async () => {
    const result = await visualizationAPI.recommendCharts(data, headers);
    if (result.success && result.data) {
      setChartSuggestions(result.data);
    }
  };
  
  getRecommendations();
}, [data, headers]);
```

## Error Handling

All API calls should handle errors:

```typescript
const result = await dataAPI.filter(request);

if (!result.success) {
  toast.error(result.error || 'Operation failed');
  console.error('API Error:', result.error);
  return;
}

// Process result.data
```

## Loading States

Add loading indicators:

```typescript
const [isLoading, setIsLoading] = useState(false);

const handleOperation = async () => {
  setIsLoading(true);
  try {
    const result = await api.someOperation();
    // Handle result
  } finally {
    setIsLoading(false);
  }
};
```

## Testing Your Backend

### Using cURL

```bash
# Test signin
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test filter with auth
curl -X POST http://localhost:3000/api/data/filter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"data":[...],"filters":[...]}'
```

### Using Postman

1. Create a collection for your API
2. Add environment variables for `API_URL` and `TOKEN`
3. Test each endpoint
4. Validate response formats

## CORS Configuration

Your backend must allow requests from your frontend:

```javascript
// Express.js example
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',           // Development
    'https://your-app.vercel.app',     // Production
  ],
  credentials: true,
}));
```

## Rate Limiting

Implement rate limiting to protect your LLM API:

```javascript
// Express.js example
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Monitoring

Log API calls for debugging:

```typescript
// In /services/api.ts
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}) {
  const startTime = Date.now();
  
  if (import.meta.env.VITE_DEBUG === 'true') {
    console.log(`API Call: ${endpoint}`, options);
  }
  
  const response = await fetch(...);
  
  if (import.meta.env.VITE_DEBUG === 'true') {
    console.log(`API Response (${Date.now() - startTime}ms):`, response);
  }
  
  return response;
}
```

## Security Considerations

1. **Never expose API keys** in frontend code
2. **Validate all inputs** on the backend
3. **Use HTTPS** in production
4. **Implement authentication** and authorization
5. **Rate limit** expensive LLM operations
6. **Sanitize user data** before processing
7. **Set up CORS** properly

## Next Steps

1. Set up your backend repository in Cursor AI
2. Implement the API endpoints listed above
3. Test each endpoint with the provided request/response formats
4. Update `VITE_API_URL` in your frontend
5. Replace mock implementations with real API calls
6. Deploy both frontend and backend
7. Test the full integration

---

**Need help?** Check the `/services/api.ts` file for detailed TypeScript interfaces and mock implementations.
