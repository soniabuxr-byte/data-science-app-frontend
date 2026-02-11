/**
 * API Service for Backend Integration
 * 
 * Connects to the FastAPI backend on Railway
 * All endpoints are now REAL - no more mocks!
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
      credentials: 'include',
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

// Helper for multipart form data (file uploads)
async function fetchAPIMultipart<T>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      // Don't set Content-Type - browser will set it with boundary
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
  sample_data?: {
    project_id: number;
    dataset_id: number;
    records: number;
  };
  note?: string;
}

export const authAPI = {
  signIn: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    return fetchAPI<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({
        username: email,
        password: password,
      }),
    });
  },

  signUp: async (email: string, password: string, name: string): Promise<ApiResponse<AuthResponse>> => {
    return fetchAPI<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify({
        username: email,
        password: password,
      }),
    });
  },

  signOut: async (): Promise<ApiResponse<void>> => {
    return fetchAPI<void>('/logout', {
      method: 'POST',
    });
  },

  guestAccess: async (): Promise<ApiResponse<GuestAccessResponse>> => {
    return fetchAPI<GuestAccessResponse>('/guest-access', {
      method: 'POST',
    });
  },

  getCurrentUser: async (): Promise<ApiResponse<AuthResponse['user']>> => {
    return fetchAPI<AuthResponse['user']>('/me', {
      method: 'GET',
    });
  },
};

// ============================================================================
// CSV UPLOAD & TABLE MANAGEMENT APIs
// ============================================================================

export interface UploadResponse {
  message: string;
  table_name: string;
  rows: number;
  columns: string[];
}

export interface TableInfo {
  name: string;
  columns: string[];
  row_count: number;
}

export interface TableStatistics {
  column: string;
  type: string;
  count: number;
  unique: number;
  mean?: number;
  std?: number;
  min?: number;
  max?: number;
  missing: number;
}

export const tableAPI = {
  // Upload a CSV file to the backend (demo endpoint - no auth required)
  uploadCSV: async (file: File): Promise<ApiResponse<UploadResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchAPIMultipart<UploadResponse>('/demo-upload/', formData);
  },

  // List all tables
  listTables: async (): Promise<ApiResponse<string[]>> => {
    return fetchAPI<string[]>('/tables');
  },

  // Get table info
  getTableInfo: async (tableName: string): Promise<ApiResponse<TableInfo>> => {
    return fetchAPI<TableInfo>(`/tables/${tableName}/info`);
  },

  // Get table statistics
  getStatistics: async (tableName: string): Promise<ApiResponse<TableStatistics[]>> => {
    return fetchAPI<TableStatistics[]>(`/tables/${tableName}/statistics`);
  },

  // Get table overview (comprehensive)
  getOverview: async (tableName: string): Promise<ApiResponse<any>> => {
    return fetchAPI<any>(`/tables/${tableName}/overview`);
  },

  // Query table data with pagination
  queryData: async (tableName: string, limit: number = 100, offset: number = 0): Promise<ApiResponse<any[]>> => {
    return fetchAPI<any[]>(`/tables/${tableName}/query?limit=${limit}&offset=${offset}`);
  },

  // Export table as CSV
  exportTable: async (tableName: string): Promise<ApiResponse<Blob>> => {
    try {
      const response = await fetch(`${API_URL}/tables/${tableName}/export?format=csv`, {
        credentials: 'include',
      });
      if (!response.ok) {
        return { success: false, error: 'Export failed' };
      }
      const blob = await response.blob();
      return { success: true, data: blob };
    } catch (error) {
      return { success: false, error: 'Export failed' };
    }
  },
};

// ============================================================================
// DATA FILTERING APIs
// ============================================================================

export interface FilterCondition {
  column: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'is_null' | 'not_null';
  value?: string | number;
}

export interface FilterRequest {
  filters: FilterCondition[];
  logic?: 'AND' | 'OR';
}

export interface FilterResponse {
  filtered_count: number;
  total_count: number;
  data: any[];
}

export const filterAPI = {
  // Get filterable columns for a table
  getFilterableColumns: async (tableName: string): Promise<ApiResponse<any[]>> => {
    return fetchAPI<any[]>(`/filter/${tableName}/columns`);
  },

  // Get filter info for a specific column
  getColumnFilterInfo: async (tableName: string, columnName: string): Promise<ApiResponse<any>> => {
    return fetchAPI<any>(`/filter/${tableName}/column/${columnName}`);
  },

  // Preview filter results (doesn't save)
  previewFilters: async (tableName: string, filters: FilterRequest): Promise<ApiResponse<FilterResponse>> => {
    return fetchAPI<FilterResponse>(`/filter/${tableName}/preview`, {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  },

  // Apply filters temporarily
  applyFilters: async (tableName: string, filters: FilterRequest): Promise<ApiResponse<FilterResponse>> => {
    return fetchAPI<FilterResponse>(`/filter/${tableName}/apply`, {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  },

  // Apply filters permanently (creates new table)
  applyFiltersPermanent: async (tableName: string, filters: FilterRequest, newTableName: string): Promise<ApiResponse<any>> => {
    return fetchAPI<any>(`/filter/${tableName}/apply-permanent`, {
      method: 'POST',
      body: JSON.stringify({
        ...filters,
        new_table_name: newTableName,
      }),
    });
  },

  // Generate SQL query from filters
  generateSQL: async (tableName: string, filters: FilterRequest): Promise<ApiResponse<string>> => {
    return fetchAPI<string>(`/filter/${tableName}/sql`, {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  },
};

// ============================================================================
// DATA AUGMENTATION APIs
// ============================================================================

export interface AugmentationRequest {
  request: string; // Natural language description of what to do
}

export interface AugmentationResponse {
  success: boolean;
  new_column?: string;
  message: string;
  preview?: any[];
}

export const augmentAPI = {
  // Augment data with a new calculated column
  augmentData: async (tableName: string, request: string): Promise<ApiResponse<AugmentationResponse>> => {
    return fetchAPI<AugmentationResponse>(`/augment/${tableName}`, {
      method: 'POST',
      body: JSON.stringify({ request }),
    });
  },

  // Preview augmentation before applying
  previewAugmentation: async (tableName: string, request: string): Promise<ApiResponse<AugmentationResponse>> => {
    return fetchAPI<AugmentationResponse>(`/augment/${tableName}/preview`, {
      method: 'POST',
      body: JSON.stringify({ request }),
    });
  },
};

// ============================================================================
// ENHANCED ANALYSIS APIs
// ============================================================================

export interface ColumnAnalysis {
  column: string;
  type: string;
  statistics: any;
  distribution?: any;
  insights?: string[];
}

export interface BivariateAnalysis {
  column1: string;
  column2: string;
  correlation?: number;
  chart_data?: any;
  insights?: string[];
}

export const analysisAPI = {
  // Get enhanced column analysis
  getColumnAnalysis: async (tableName: string, columnName: string): Promise<ApiResponse<ColumnAnalysis>> => {
    return fetchAPI<ColumnAnalysis>(`/enhanced/data/${tableName}/${columnName}/analysis`);
  },

  // Get bivariate analysis between two columns
  getBivariateAnalysis: async (tableName: string, col1: string, col2: string): Promise<ApiResponse<BivariateAnalysis>> => {
    return fetchAPI<BivariateAnalysis>(`/enhanced/data/${tableName}/bivariate-analysis?col1=${col1}&col2=${col2}`);
  },

  // Get waterfall analysis
  getWaterfallAnalysis: async (tableName: string, categoryCol: string, valueCol: string): Promise<ApiResponse<any>> => {
    return fetchAPI<any>(`/enhanced/data/${tableName}/waterfall-analysis?category_col=${categoryCol}&value_col=${valueCol}`);
  },

  // Get histogram analysis
  getHistogramAnalysis: async (tableName: string, columnName: string, bins: number = 10): Promise<ApiResponse<any>> => {
    return fetchAPI<any>(`/enhanced/data/${tableName}/histogram-analysis?column=${columnName}&bins=${bins}`);
  },

  // Generate advanced chart
  generateAdvancedChart: async (tableName: string, chartConfig: any): Promise<ApiResponse<any>> => {
    return fetchAPI<any>(`/enhanced/data/${tableName}/advanced-chart`, {
      method: 'POST',
      body: JSON.stringify(chartConfig),
    });
  },
};

// ============================================================================
// AI / NATURAL LANGUAGE QUERY APIs
// ============================================================================

export interface NLQueryRequest {
  query: string;
}

export interface NLQueryResponse {
  answer: string;
  sql_query?: string;
  result_data?: any[];
  visualization?: {
    type: string;
    config: any;
  };
  insights?: string[];
}

export const aiAPI = {
  // Process natural language query about data
  // Uses demo endpoint for demo tables (no auth required), authenticated endpoint otherwise
  query: async (tableName: string, query: string): Promise<ApiResponse<NLQueryResponse>> => {
    // Use demo endpoint for demo tables (created by demo-upload)
    const endpoint = tableName.startsWith('demo_') 
      ? `/demo-query/${tableName}`
      : `/analysis/${tableName}/query`;
    
    return fetchAPI<NLQueryResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ question: query }),
    });
  },
};

// ============================================================================
// PROJECT MANAGEMENT APIs
// ============================================================================

export interface Project {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface Dataset {
  id: number;
  name: string;
  table_name: string;
  rows: number;
  columns: number;
}

export const projectAPI = {
  // List user's projects
  listProjects: async (): Promise<ApiResponse<Project[]>> => {
    return fetchAPI<Project[]>('/projects');
  },

  // Create a new project
  createProject: async (name: string, description?: string): Promise<ApiResponse<Project>> => {
    return fetchAPI<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  },

  // Delete a project
  deleteProject: async (projectId: number): Promise<ApiResponse<void>> => {
    return fetchAPI<void>(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  },

  // List datasets in a project
  listDatasets: async (projectId: number): Promise<ApiResponse<Dataset[]>> => {
    return fetchAPI<Dataset[]>(`/projects/${projectId}/datasets`);
  },
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const healthAPI = {
  check: async (): Promise<ApiResponse<any>> => {
    return fetchAPI<any>('/health');
  },
};

// ============================================================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================================================

// These maintain the old API structure for components that haven't been updated yet
export const dataAPI = {
  filter: async (request: { data: any[]; filters: any[] }): Promise<ApiResponse<any[]>> => {
    // Client-side filtering fallback when no table is uploaded to backend
    let filtered = [...request.data];
    request.filters.forEach((filter: any) => {
      filtered = filtered.filter(row => {
        const value = row[filter.column];
        switch (filter.operator) {
          case 'equals':
            return value == filter.value;
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'greaterThan':
          case 'greater_than':
            return Number(value) > Number(filter.value);
          case 'lessThan':
          case 'less_than':
            return Number(value) < Number(filter.value);
          default:
            return true;
        }
      });
    });
    return { success: true, data: filtered };
  },

  sort: async (request: { data: any[]; column: string; direction: 'asc' | 'desc' }): Promise<ApiResponse<any[]>> => {
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

export const visualizationAPI = {
  recommendCharts: async (data: any[], headers: string[]): Promise<ApiResponse<any[]>> => {
    // Smart recommendations based on data types
    const recommendations = [];
    const numericCols = headers.filter(h => data.some(row => !isNaN(parseFloat(row[h]))));
    const categoricalCols = headers.filter(h => !numericCols.includes(h));
    
    if (numericCols.length >= 2) {
      recommendations.push({
        type: 'scatter',
        xAxis: numericCols[0],
        yAxis: numericCols[1],
        title: `${numericCols[0]} vs ${numericCols[1]}`,
        reason: 'Good for showing correlation between numeric values',
      });
    }
    
    if (categoricalCols.length > 0 && numericCols.length > 0) {
      recommendations.push({
        type: 'bar',
        xAxis: categoricalCols[0],
        yAxis: numericCols[0],
        title: `${numericCols[0]} by ${categoricalCols[0]}`,
        reason: 'Compare values across categories',
      });
    }
    
    if (numericCols.length > 0) {
      recommendations.push({
        type: 'line',
        xAxis: headers[0],
        yAxis: numericCols[0],
        title: `Trend of ${numericCols[0]}`,
        reason: 'Shows trends over time or sequence',
      });
    }

    return { success: true, data: recommendations };
  },

  generateInsights: async (chartType: string, data: any[]): Promise<ApiResponse<string[]>> => {
    const insights: string[] = [];
    if (data.length > 0) {
      insights.push(`Dataset contains ${data.length} records`);
      const keys = Object.keys(data[0]);
      insights.push(`${keys.length} columns available for analysis`);
    }
    return { success: true, data: insights };
  },
};

export const nlAPI = {
  query: async (request: { query: string; data: any[]; headers: string[] }): Promise<ApiResponse<any>> => {
    // This will be connected to backend AI when a table is uploaded
    return {
      success: true,
      data: {
        answer: 'To use AI queries, please upload your data first. The AI will then be able to analyze your dataset.',
        visualization: null,
      },
    };
  },
};

// Export all APIs
export default {
  auth: authAPI,
  table: tableAPI,
  filter: filterAPI,
  augment: augmentAPI,
  analysis: analysisAPI,
  ai: aiAPI,
  project: projectAPI,
  health: healthAPI,
  // Legacy
  data: dataAPI,
  visualization: visualizationAPI,
  nl: nlAPI,
};
