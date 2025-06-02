const API_BASE_URL = 'http://localhost:8000/api';

// Types for API responses
export interface AttritionData {
  labels: string[];
  yesCount: number[];
  noCount: number[];
  rates: number[];
}   

export interface OverallStatistics {
  totalEmployees: number;
  attritionCount: number;
  retentionCount: number;
  attritionRate: number;
}

export interface FactorsCorrelation {
  factors: string[];
  correlations: number[];
}

export interface PredictiveFactors {
  factors: string[];
  importance: number[];
}

export interface EmployeeCount {
  total: number;
  attrited: number;
  active: number;
}

// Chat API types
export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
  status: 'success' | 'error';
}

// Dataset metadata types
export interface DatasetMetadata {
  name: string;
  rows: number;
  columns: number;
  column_list: string[];
  numeric_columns: string[];
  categorical_columns: string[];
  last_updated: number;
  categorical_preview: Record<string, Record<string, number>>;
  numeric_preview: Record<string, {min: number, max: number, mean: number, median: number}>;
  quality: {
    rating: 'Good' | 'Fair' | 'Poor';
    missing_values: number;
    missing_percentage: number;
  };
}

export interface QuickInsights {
  attrition_rate: number;
  avg_satisfaction: number;
  avg_years: number;
  avg_age: number;
  top_department: string;
  overtime_percentage: number;
}

// API functions
export const fetchAttritionByAge = async (): Promise<AttritionData> => {
  const response = await fetch(`${API_BASE_URL}/attrition-by-age`);
  if (!response.ok) {
    throw new Error('Failed to fetch attrition by age data');
  }
  return response.json();
};

export const fetchAttritionByGender = async (): Promise<AttritionData> => {
  const response = await fetch(`${API_BASE_URL}/attrition-by-gender`);
  if (!response.ok) {
    throw new Error('Failed to fetch attrition by gender data');
  }
  return response.json();
};

export const fetchAttritionByDepartment = async (): Promise<AttritionData> => {
  const response = await fetch(`${API_BASE_URL}/attrition-by-department`);
  if (!response.ok) {
    throw new Error('Failed to fetch attrition by department data');
  }
  return response.json();
};

export const fetchAttritionByEducation = async (): Promise<AttritionData> => {
  const response = await fetch(`${API_BASE_URL}/attrition-by-education`);
  if (!response.ok) {
    throw new Error('Failed to fetch attrition by education data');
  }
  return response.json();
};

export const fetchAttritionByJobSatisfaction = async (): Promise<AttritionData> => {
  const response = await fetch(`${API_BASE_URL}/attrition-by-job-satisfaction`);
  if (!response.ok) {
    throw new Error('Failed to fetch attrition by job satisfaction data');
  }
  return response.json();
};

export const fetchAttritionBySalary = async (): Promise<AttritionData> => {
  const response = await fetch(`${API_BASE_URL}/attrition-by-salary`);
  if (!response.ok) {
    throw new Error('Failed to fetch attrition by salary data');
  }
  return response.json();
};

export const fetchOverallStatistics = async (): Promise<OverallStatistics> => {
  const response = await fetch(`${API_BASE_URL}/overall-statistics`);
  if (!response.ok) {
    throw new Error('Failed to fetch overall statistics');
  }
  return response.json();
};

export const fetchFactorsCorrelation = async (): Promise<FactorsCorrelation> => {
  const response = await fetch(`${API_BASE_URL}/factors-correlation`);
  if (!response.ok) {
    throw new Error('Failed to fetch factors correlation');
  }
  return response.json();
};

export const fetchPredictiveFactors = async (): Promise<PredictiveFactors> => {
  const response = await fetch(`${API_BASE_URL}/predictive-factors`);
  if (!response.ok) {
    throw new Error('Failed to fetch predictive factors');
  }
  return response.json();
};

export const fetchEmployeeCount = async (): Promise<EmployeeCount> => {
  const response = await fetch(`${API_BASE_URL}/employee-count`);
  if (!response.ok) {
    throw new Error('Failed to fetch employee count');
  }
  return response.json();
};

// Chat API functions
export const sendChatMessage = async (message: string): Promise<ChatResponse> => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to send chat message');
  }
  
  return response.json();
};

export const resetChatConversation = async (): Promise<{ status: string; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/chat/reset`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to reset chat conversation');
  }
  
  return response.json();
};

// Dataset metadata functions
export const fetchDatasetMetadata = async (): Promise<DatasetMetadata> => {
  const response = await fetch(`${API_BASE_URL}/dataset-metadata`);
  if (!response.ok) {
    throw new Error('Failed to fetch dataset metadata');
  }
  return response.json();
};

export const fetchQuickInsights = async (): Promise<QuickInsights> => {
  const response = await fetch(`${API_BASE_URL}/quick-insights`);
  if (!response.ok) {
    throw new Error('Failed to fetch quick insights');
  }
  return response.json();
};
