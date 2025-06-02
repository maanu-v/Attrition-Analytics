import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import {
  fetchAttritionByAge,
  fetchAttritionByDepartment,
  fetchAttritionByEducation,
  fetchAttritionByGender,
  fetchAttritionByJobSatisfaction,
  fetchAttritionBySalary,
  fetchFactorsCorrelation,
  fetchPredictiveFactors,
  AttritionData,
  FactorsCorrelation,
  PredictiveFactors
} from '@/services/api';
import AttritionChart from './AttritionChart';
import FactorsChart from './FactorsChart';
import PredictiveFactorsChart from './PredictiveFactorsChart';

// Add proper interface for PredictiveFactorsChart props
interface PredictiveFactorsChartProps {
  data: PredictiveFactors;
}

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ activeTab, onTabChange }) => {
  const [ageData, setAgeData] = useState<AttritionData | null>(null);
  const [departmentData, setDepartmentData] = useState<AttritionData | null>(null);
  const [genderData, setGenderData] = useState<AttritionData | null>(null);
  const [educationData, setEducationData] = useState<AttritionData | null>(null);
  const [satisfactionData, setSatisfactionData] = useState<AttritionData | null>(null);
  const [salaryData, setSalaryData] = useState<AttritionData | null>(null);
  const [correlationData, setCorrelationData] = useState<FactorsCorrelation | null>(null);
  const [predictiveFactors, setPredictiveFactors] = useState<PredictiveFactors | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({
    age: true,
    department: true,
    gender: true,
    education: true,
    satisfaction: true,
    salary: true,
    correlation: true,
    predictive: true
  });
  const [error, setError] = useState<Record<string, string | null>>({
    age: null,
    department: null,
    gender: null,
    education: null,
    satisfaction: null,
    salary: null,
    correlation: null,
    predictive: null
  });

  useEffect(() => {
    // Fetch data based on active tab to minimize unnecessary API calls
    const fetchData = async () => {
      switch (activeTab) {
        case 'overview':
          if (!ageData) {
            try {
              setLoading(prev => ({ ...prev, age: true }));
              const data = await fetchAttritionByAge();
              setAgeData(data);
              setError(prev => ({ ...prev, age: null }));
            } catch (err) {
              setError(prev => ({ ...prev, age: 'Failed to load age data' }));
              console.error('API Error:', err);
            } finally {
              setLoading(prev => ({ ...prev, age: false }));
            }
          }
          
          if (!departmentData) {
            try {
              setLoading(prev => ({ ...prev, department: true }));
              const data = await fetchAttritionByDepartment();
              setDepartmentData(data);
              setError(prev => ({ ...prev, department: null }));
            } catch (err) {
              setError(prev => ({ ...prev, department: 'Failed to load department data' }));
              console.error('API Error:', err);
            } finally {
              setLoading(prev => ({ ...prev, department: false }));
            }
          }
          
          if (!genderData) {
            try {
              setLoading(prev => ({ ...prev, gender: true }));
              const data = await fetchAttritionByGender();
              setGenderData(data);
              setError(prev => ({ ...prev, gender: null }));
            } catch (err) {
              setError(prev => ({ ...prev, gender: 'Failed to load gender data' }));
              console.error('API Error:', err);
            } finally {
              setLoading(prev => ({ ...prev, gender: false }));
            }
          }
          break;
          
        case 'demographics':
          if (!educationData) {
            try {
              setLoading(prev => ({ ...prev, education: true }));
              const data = await fetchAttritionByEducation();
              setEducationData(data);
              setError(prev => ({ ...prev, education: null }));
            } catch (err) {
              setError(prev => ({ ...prev, education: 'Failed to load education data' }));
              console.error('API Error:', err);
            } finally {
              setLoading(prev => ({ ...prev, education: false }));
            }
          }
          break;
          
        case 'satisfaction':
          if (!satisfactionData) {
            try {
              setLoading(prev => ({ ...prev, satisfaction: true }));
              const data = await fetchAttritionByJobSatisfaction();
              setSatisfactionData(data);
              setError(prev => ({ ...prev, satisfaction: null }));
            } catch (err) {
              setError(prev => ({ ...prev, satisfaction: 'Failed to load satisfaction data' }));
              console.error('API Error:', err);
            } finally {
              setLoading(prev => ({ ...prev, satisfaction: false }));
            }
          }
          break;
          
        case 'compensation':
          if (!salaryData) {
            try {
              setLoading(prev => ({ ...prev, salary: true }));
              const data = await fetchAttritionBySalary();
              setSalaryData(data);
              setError(prev => ({ ...prev, salary: null }));
            } catch (err) {
              setError(prev => ({ ...prev, salary: 'Failed to load salary data' }));
              console.error('API Error:', err);
            } finally {
              setLoading(prev => ({ ...prev, salary: false }));
            }
          }
          break;
          
        case 'predictors':
          if (!correlationData) {
            try {
              setLoading(prev => ({ ...prev, correlation: true }));
              const data = await fetchFactorsCorrelation();
              setCorrelationData(data);
              setError(prev => ({ ...prev, correlation: null }));
            } catch (err) {
              setError(prev => ({ ...prev, correlation: 'Failed to load correlation data' }));
              console.error('API Error:', err);
            } finally {
              setLoading(prev => ({ ...prev, correlation: false }));
            }
          }
          
          if (!predictiveFactors) {
            try {
              setLoading(prev => ({ ...prev, predictive: true }));
              const data = await fetchPredictiveFactors();
              setPredictiveFactors(data);
              setError(prev => ({ ...prev, predictive: null }));
            } catch (err) {
              setError(prev => ({ ...prev, predictive: 'Failed to load predictive factors' }));
              console.error('API Error:', err);
            } finally {
              setLoading(prev => ({ ...prev, predictive: false }));
            }
          }
          break;
      }
    };

    fetchData();
  }, [activeTab, ageData, departmentData, genderData, educationData, satisfactionData, salaryData, correlationData, predictiveFactors]);

  const renderLoading = () => (
    <div className="flex h-64 items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="mb-2 h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading data...</p>
      </div>
    </div>
  );

  const renderError = (message: string) => (
    <div className="flex h-64 items-center justify-center">
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
        <p>{message}</p>
      </div>
    </div>
  );

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4">
      <TabsList className="grid grid-cols-5 w-full max-w-4xl mx-auto">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="demographics">Demographics</TabsTrigger>
        <TabsTrigger value="satisfaction">Job Satisfaction</TabsTrigger>
        <TabsTrigger value="compensation">Compensation</TabsTrigger>
        <TabsTrigger value="predictors">Key Predictors</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Age Distribution Chart */}
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-medium">Attrition by Age Group</h3>
              {loading.age ? renderLoading() : 
               error.age ? renderError(error.age) : 
               ageData && <AttritionChart data={ageData} />}
            </CardContent>
          </Card>
          
          {/* Department Distribution Chart */}
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-medium">Attrition by Department</h3>
              {loading.department ? renderLoading() : 
               error.department ? renderError(error.department) : 
               departmentData && <AttritionChart data={departmentData} />}
            </CardContent>
          </Card>
          
          {/* Gender Distribution Chart */}
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-medium">Attrition by Gender</h3>
              {loading.gender ? renderLoading() : 
               error.gender ? renderError(error.gender) : 
               genderData && <AttritionChart data={genderData} />}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="demographics" className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-medium">Attrition by Education Level</h3>
            {loading.education ? renderLoading() : 
             error.education ? renderError(error.education) : 
             educationData && <AttritionChart data={educationData} />}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="satisfaction" className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-medium">Attrition by Job Satisfaction</h3>
            {loading.satisfaction ? renderLoading() : 
             error.satisfaction ? renderError(error.satisfaction) : 
             satisfactionData && <AttritionChart data={satisfactionData} />}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="compensation" className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-medium">Attrition by Salary Band</h3>
            {loading.salary ? renderLoading() : 
             error.salary ? renderError(error.salary) : 
             salaryData && <AttritionChart data={salaryData} />}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="predictors" className="space-y-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Correlation Chart */}
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-medium">Factor Correlation with Attrition</h3>
              {loading.correlation ? renderLoading() : 
               error.correlation ? renderError(error.correlation) : 
               correlationData && <FactorsChart data={correlationData} />}
            </CardContent>
          </Card>
          
          {/* Predictive Factors Chart */}
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-medium">Key Predictors of Attrition</h3>
              {loading.predictive ? renderLoading() : 
               error.predictive ? renderError(error.predictive) : 
               predictiveFactors && <PredictiveFactorsChart data={predictiveFactors as PredictiveFactors} />}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
