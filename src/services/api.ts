/**
 * API Service for Backend Integration
 * 
 * This file connects to the FastAPI backend.
 * Backend runs at http://localhost:8000
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Helper function for making API calls
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      credentials: 'include', // Important for session cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.detail || data.message || 'An error occurred',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// ============================================================================
// AUTHENTICATION APIs
// ============================================================================

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string | number;
    username: string;
    role: string;
  };
  message: string;
}

export interface GuestAccessResponse {
  user: {
    id: number;
    username: string;
    role: string;
  };
  message: string;
  sample_data: {
    project_id: number;
    dataset_id: number;
    records: number;
  };
  note: string;
}

export const authAPI = {
  // Sign in with email (used as username) and password
  signIn: async (data: SignInRequest): Promise<ApiResponse<AuthResponse>> => {
    return fetchAPI<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({
        username: data.email, // Backend uses username, we use email
        password: data.password,
      }),
    });
  },

  // Register a new account
  signUp: async (data: SignUpRequest): Promise<ApiResponse<AuthResponse>> => {
    return fetchAPI<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify({
        username: data.email, // Use email as username
        password: data.password,
      }),
    });
  },

  // Sign out
  signOut: async (): Promise<ApiResponse<void>> => {
    return fetchAPI<void>('/logout', {
      method: 'POST',
    });
  },

  // Guest access - creates a temporary account with sample data
  guestAccess: async (): Promise<ApiResponse<GuestAccessResponse>> => {
    return fetchAPI<GuestAccessResponse>('/guest-access', {
      method: 'POST',
    });
  },

  // Get current user info
  getCurrentUser: async (): Promise<ApiResponse<AuthResponse['user']>> => {
    return fetchAPI<AuthResponse['user']>('/me', {
      method: 'GET',
    });
  },
};

// ============================================================================
// DATA MANIPULATION APIs
// ============================================================================

export interface FilterRequest {
  data: any[];
  filters: {
    column: string;
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
    value: string | number;
  }[];
}

export interface SortRequest {
  data: any[];
  column: string;
  direction: 'asc' | 'desc';
}

export const dataAPI = {
  // Filter data using LLM or backend logic
  filter: async (request: FilterRequest): Promise<ApiResponse<any[]>> => {
    // TODO: Replace with actual API call
    // return fetchAPI<any[]>('/data/filter', {
    //   method: 'POST',
    //   body: JSON.stringify(request),
    // });
    
    // Mock implementation - client-side filtering
    let filtered = [...request.data];
    request.filters.forEach(filter => {
      filtered = filtered.filter(row => {
        const value = row[filter.column];
        switch (filter.operator) {
          case 'equals':
            return value == filter.value;
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'greaterThan':
            return Number(value) > Number(filter.value);
          case 'lessThan':
            return Number(value) < Number(filter.value);
          default:
            return true;
        }
      });
    });
    
    return { success: true, data: filtered };
  },

  // Sort data
  sort: async (request: SortRequest): Promise<ApiResponse<any[]>> => {
    // TODO: Replace with actual API call
    // return fetchAPI<any[]>('/data/sort', {
    //   method: 'POST',
    //   body: JSON.stringify(request),
    // });
    
    // Mock implementation - client-side sorting
    const sorted = [...request.data].sort((a, b) => {
      const aVal = a[request.column];
      const bVal = b[request.column];
      
      if (aVal === bVal) return 0;
      
      const comparison = aVal < bVal ? -1 : 1;
      return request.direction === 'asc' ? comparison : -comparison;
    });
    
    return { success: true, data: sorted };
  },
};

// ============================================================================
// DATA AUGMENTATION APIs (LLM-Powered)
// ============================================================================

export interface AugmentRequest {
  data: any[];
  headers: string[];
  operation: {
    type: 'formula' | 'concatenate' | 'extract' | 'llm-generate';
    config: any;
  };
}

export interface AugmentResponse {
  data: any[];
  headers: string[];
  newColumn: string;
}

export const augmentAPI = {
  // Create new columns with formulas or LLM assistance
  augment: async (request: AugmentRequest): Promise<ApiResponse<AugmentResponse>> => {
    // TODO: Replace with actual LLM API call
    // This is where your LLM backend would:
    // 1. Parse natural language formulas
    // 2. Generate new columns based on context
    // 3. Extract insights from existing data
    // 4. Create intelligent transformations
    
    // return fetchAPI<AugmentResponse>('/data/augment', {
    //   method: 'POST',
    //   body: JSON.stringify(request),
    // });
    
    // Mock implementation
    return {
      success: true,
      data: {
        data: request.data,
        headers: request.headers,
        newColumn: 'calculated_column',
      },
    };
  },

  // Use LLM to suggest column operations
  suggestOperations: async (data: any[], headers: string[]): Promise<ApiResponse<string[]>> => {
    // TODO: Replace with actual LLM API call
    // Your LLM could analyze the data and suggest:
    // - Useful calculated columns
    // - Data cleaning operations
    // - Interesting transformations
    
    // return fetchAPI<string[]>('/data/suggest-operations', {
    //   method: 'POST',
    //   body: JSON.stringify({ data, headers }),
    // });
    
    // Mock implementation
    return {
      success: true,
      data: [
        'Calculate total revenue',
        'Extract month from date',
        'Categorize by price range',
      ],
    };
  },
};

// ============================================================================
// VISUALIZATION APIs (LLM-Powered)
// ============================================================================

export interface ChartRecommendation {
  type: 'bar' | 'line' | 'pie' | 'scatter';
  xAxis: string;
  yAxis: string;
  title: string;
  reason: string;
}

export const visualizationAPI = {
  // Get LLM-powered chart recommendations
  recommendCharts: async (
    data: any[],
    headers: string[]
  ): Promise<ApiResponse<ChartRecommendation[]>> => {
    // TODO: Replace with actual LLM API call
    // Your LLM could analyze the data structure and:
    // - Recommend the best chart types
    // - Suggest meaningful axis combinations
    // - Identify patterns worth visualizing
    
    // return fetchAPI<ChartRecommendation[]>('/data/recommend-charts', {
    //   method: 'POST',
    //   body: JSON.stringify({ data, headers }),
    // });
    
    // Mock implementation
    return {
      success: true,
      data: [
        {
          type: 'bar',
          xAxis: headers[0] || 'category',
          yAxis: headers[1] || 'value',
          title: 'Distribution Analysis',
          reason: 'Shows clear comparison between categories',
        },
      ],
    };
  },

  // Generate insights from visualizations
  generateInsights: async (
    chartType: string,
    data: any[]
  ): Promise<ApiResponse<string[]>> => {
    // TODO: Replace with actual LLM API call
    // Your LLM could analyze the chart data and provide:
    // - Key trends
    // - Anomalies
    // - Actionable insights
    
    // return fetchAPI<string[]>('/data/generate-insights', {
    //   method: 'POST',
    //   body: JSON.stringify({ chartType, data }),
    // });
    
    // Mock implementation
    return {
      success: true,
      data: [
        'The highest value is in category A',
        'There is an upward trend over time',
        'Category B shows significant growth',
      ],
    };
  },
};

// ============================================================================
// NATURAL LANGUAGE QUERY APIs (LLM-Powered)
// ============================================================================

export interface NLQueryRequest {
  query: string;
  data: any[];
  headers: string[];
}

export interface NLQueryResponse {
  answer: string;
  visualization?: {
    type: string;
    config: any;
  };
  filteredData?: any[];
}

export const nlAPI = {
  // Process natural language queries about the data
  query: async (request: NLQueryRequest): Promise<ApiResponse<NLQueryResponse>> => {
    // TODO: Replace with actual LLM API call
    // Examples of queries:
    // - "What's the average sales by region?"
    // - "Show me all customers from California"
    // - "Which product has the highest revenue?"
    
    // return fetchAPI<NLQueryResponse>('/data/nl-query', {
    //   method: 'POST',
    //   body: JSON.stringify(request),
    // });
    
    // Mock implementation
    return {
      success: true,
      data: {
        answer: 'Based on your data, here are the results...',
        visualization: {
          type: 'bar',
          config: {},
        },
      },
    };
  },
};

// Export all APIs
export default {
  auth: authAPI,
  data: dataAPI,
  augment: augmentAPI,
  visualization: visualizationAPI,
  nl: nlAPI,
};
