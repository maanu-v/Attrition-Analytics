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
