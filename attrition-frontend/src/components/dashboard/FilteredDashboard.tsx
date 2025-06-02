import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EnhancedFilters from './EnhancedFilters';
import { Loader2, RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AttritionChart from './AttritionChart';
import FactorsChart from './FactorsChart';
import { useToast } from '@/hooks/use-toast';
import NavHeader from '@/components/layout/NavHeader';
import { 
  fetchAttritionByDepartment, 
  fetchFactorsCorrelation,
  AttritionData,
  FactorsCorrelation
} from '@/services/api';

interface DashboardData {
  totalEmployees: number;
  attritionCount: number;
  retentionCount: number;
  attritionRate: number;
  filteredData: boolean;
  departmentStats: DepartmentStat[];
}

interface DepartmentStat {
  name: string;
  count: number;
  attrition: number;
  rate: number;
}

interface FilterState {
  tenureRange?: [number, number];
  satisfactionRange?: [number, number];
  performanceRange?: [number, number];
  departments?: string[];
  onlyAtRisk?: boolean;
  gender?: string;
  education?: string;
  role?: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

const FilteredDashboard: React.FC = () => {
  const { toast } = useToast();
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [attritionByDeptData, setAttritionByDeptData] = useState<AttritionData | null>(null);
  const [factorsData, setFactorsData] = useState<FactorsCorrelation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({});
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Load initial dashboard data
  useEffect(() => {
    fetchDashboardData();
    fetchAdditionalChartData();
  }, []);

  const fetchAdditionalChartData = async () => {
    try {
      const [attritionData, factorsData] = await Promise.all([
        fetchAttritionByDepartment(),
        fetchFactorsCorrelation()
      ]);
      
      setAttritionByDeptData(attritionData);
      setFactorsData(factorsData);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load chart data. Some visualizations may be unavailable.",
        variant: "destructive"
      });
    }
  };

  const fetchDashboardData = async (filterParams = '') => {
    setIsLoading(isRefreshing ? false : true);
    setIsRefreshing(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8000/api/filtered-data${filterParams}`);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error fetching filtered data:', err);
      setError(`Failed to load dashboard data: ${errorMessage}`);
      
      toast({
        title: "Data Loading Error",
        description: `Failed to load dashboard data: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const countActiveFilters = (filters: FilterState): number => {
    let count = 0;
    
    if (filters.tenureRange) count++;
    if (filters.satisfactionRange) count++;
    if (filters.performanceRange) count++;
    if (filters.departments && filters.departments.length > 0) count++;
    if (filters.onlyAtRisk) count++;
    if (filters.gender && filters.gender !== 'all') count++;
    if (filters.education && filters.education !== 'all') count++;
    if (filters.role && filters.role !== 'all') count++;
    if (filters.dateRange?.from || filters.dateRange?.to) count++;
    
    return count;
  };

  const handleFiltersApplied = (filters: FilterState) => {
    // Convert filter data to query parameters
    const params = new URLSearchParams();
    
    // Tenure range
    if (filters.tenureRange) {
      params.append('tenureMin', filters.tenureRange[0].toString());
      params.append('tenureMax', filters.tenureRange[1].toString());
    }
    
    // Satisfaction range
    if (filters.satisfactionRange) {
      params.append('satisfactionMin', filters.satisfactionRange[0].toString());
      params.append('satisfactionMax', filters.satisfactionRange[1].toString());
    }
    
    // Performance range
    if (filters.performanceRange) {
      params.append('performanceMin', filters.performanceRange[0].toString());
      params.append('performanceMax', filters.performanceRange[1].toString());
    }
    
    // Departments
    if (filters.departments && filters.departments.length > 0) {
      filters.departments.forEach((dept: string) => {
        params.append('departments', dept);
      });
    }
    
    // At-risk flag
    if (filters.onlyAtRisk) {
      params.append('atRisk', 'true');
    }
    
    // Gender
    if (filters.gender && filters.gender !== 'all') {
      params.append('gender', filters.gender);
    }
    
    // Education
    if (filters.education && filters.education !== 'all') {
      params.append('education', filters.education);
    }
    
    // Role
    if (filters.role && filters.role !== 'all') {
      params.append('role', filters.role);
    }
    
    // Date range - Format dates properly and only if they exist
    if (filters.dateRange?.from) {
      params.append('dateFrom', filters.dateRange.from.toISOString().split('T')[0]);
    }
    if (filters.dateRange?.to) {
      params.append('dateTo', filters.dateRange.to.toISOString().split('T')[0]);
    }
    
    // Save the applied filters for potential reset later
    setAppliedFilters(filters);
    setActiveFiltersCount(countActiveFilters(filters));
    
    // Fetch data with filters
    fetchDashboardData(`?${params.toString()}`);
  };

  const handleRefresh = () => {
    // Use existing filters when refreshing
    const params = new URLSearchParams();
    
    // Reapply all filters from the saved state
    if (appliedFilters.tenureRange) {
      params.append('tenureMin', appliedFilters.tenureRange[0].toString());
      params.append('tenureMax', appliedFilters.tenureRange[1].toString());
    }
    
    // Add all other filters in the same way...
    if (appliedFilters.satisfactionRange) {
      params.append('satisfactionMin', appliedFilters.satisfactionRange[0].toString());
      params.append('satisfactionMax', appliedFilters.satisfactionRange[1].toString());
    }
    
    if (appliedFilters.performanceRange) {
      params.append('performanceMin', appliedFilters.performanceRange[0].toString());
      params.append('performanceMax', appliedFilters.performanceRange[1].toString());
    }
    
    if (appliedFilters.departments && appliedFilters.departments.length > 0) {
      appliedFilters.departments.forEach((dept: string) => {
        params.append('departments', dept);
      });
    }
    
    if (appliedFilters.onlyAtRisk) {
      params.append('atRisk', 'true');
    }
    
    if (appliedFilters.gender && appliedFilters.gender !== 'all') {
      params.append('gender', appliedFilters.gender);
    }
    
    if (appliedFilters.education && appliedFilters.education !== 'all') {
      params.append('education', appliedFilters.education);
    }
    
    if (appliedFilters.role && appliedFilters.role !== 'all') {
      params.append('role', appliedFilters.role);
    }
    
    if (appliedFilters.dateRange?.from) {
      params.append('dateFrom', appliedFilters.dateRange.from.toISOString().split('T')[0]);
    }
    if (appliedFilters.dateRange?.to) {
      params.append('dateTo', appliedFilters.dateRange.to.toISOString().split('T')[0]);
    }
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    setIsRefreshing(true);
    fetchDashboardData(queryString);
    fetchAdditionalChartData();
  };

  const handleClearFilters = () => {
    setAppliedFilters({});
    setActiveFiltersCount(0);
    fetchDashboardData();
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      {/* NavHeader */}
      <NavHeader />

      <div className="flex flex-1 w-full overflow-hidden relative">
        {/* Filter Panel with fixed position */}
        <div className={`fixed top-[73px] bottom-0 z-20 transition-all duration-300 ${
          filtersCollapsed ? 'left-[-4rem]' : 'left-0'
        }`}>
          <EnhancedFilters 
            collapsed={filtersCollapsed} 
            onToggle={() => setFiltersCollapsed(!filtersCollapsed)}
            onFiltersApplied={handleFiltersApplied}
            initialFilters={appliedFilters}
            onClearFilters={handleClearFilters}
          />
        </div>
        
        {/* Toggle Button - Separate from EnhancedFilters for better visibility */}
        <button
          onClick={() => setFiltersCollapsed(!filtersCollapsed)}
          className={`fixed top-20 z-30 flex items-center justify-center bg-white rounded-r-md border border-l-0 border-gray-200 shadow-md h-10 w-6 transition-all duration-300 hover:bg-gray-50 ${
            filtersCollapsed ? 'left-0' : 'left-[19rem]'
          }`}
        >
          {filtersCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
        
        {/* Main Content - position with left margin that adjusts based on sidebar state */}
        <div className={`flex-1 p-4 md:p-6 overflow-y-auto w-full transition-all duration-300 ${
          filtersCollapsed ? 'ml-0' : 'ml-80'
        }`}>
          {/* Dashboard Title and Refresh Button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              Attrition Analytics
              {dashboardData?.filteredData && activeFiltersCount > 0 && (
                <span className="ml-2 text-sm font-normal bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                  {activeFiltersCount} {activeFiltersCount === 1 ? 'filter' : 'filters'} applied
                </span>
              )}
            </h2>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                <p className="text-gray-500">Loading dashboard data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 text-red-500 p-4 bg-red-50 rounded-md mb-6">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          ) : dashboardData ? (
            <div className="space-y-6 w-full max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Employees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.totalEmployees.toLocaleString()}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Attrition Count</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-500">{dashboardData.attritionCount.toLocaleString()}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Retention Count</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-500">{dashboardData.retentionCount.toLocaleString()}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Attrition Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.attritionRate}%</div>
                    {dashboardData.filteredData && (
                      <div className="text-xs text-gray-500 mt-1">
                        Based on filtered data
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attrition by Department Chart */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Attrition by Department</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {attritionByDeptData ? (
                      <div className="h-80">
                        <AttritionChart data={attritionByDeptData} />
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-80">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Factors Correlation Chart */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Top Factors Influencing Attrition</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {factorsData ? (
                      <div className="h-80">
                        <FactorsChart data={factorsData} />
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-80">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Department Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData.departmentStats.length > 0 ? (
                    <div className="relative overflow-x-auto rounded-md border">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3">Department</th>
                            <th scope="col" className="px-6 py-3 text-right">Total Employees</th>
                            <th scope="col" className="px-6 py-3 text-right">Attrition Count</th>
                            <th scope="col" className="px-6 py-3 text-right">Attrition Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.departmentStats.map(dept => (
                            <tr key={dept.name} className="bg-white border-b hover:bg-gray-50">
                              <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                {dept.name}
                              </th>
                              <td className="px-6 py-4 text-right">{dept.count}</td>
                              <td className="px-6 py-4 text-right">{dept.attrition}</td>
                              <td className="px-6 py-4 text-right">
                                <span 
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    dept.rate > 15 
                                      ? 'bg-red-100 text-red-800' 
                                      : dept.rate > 10 
                                        ? 'bg-yellow-100 text-yellow-800' 
                                        : 'bg-green-100 text-green-800'
                                  }`}
                                >
                                  {dept.rate}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No department data available with the current filters
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Risk Assessment Section - Added enhancement */}
              {dashboardData.attritionRate > 10 && (
                <Card className="border-l-4 border-amber-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-amber-800">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      Attrition Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      The current attrition rate of <strong>{dashboardData.attritionRate}%</strong> is {
                        dashboardData.attritionRate > 15 
                          ? 'significantly above industry average. Immediate attention is recommended.'
                          : 'above the ideal threshold. Consider reviewing retention strategies.'
                      }
                    </p>
                    {dashboardData.departmentStats.some(dept => dept.rate > 20) && (
                      <div className="mt-3 p-3 bg-amber-50 rounded-md">
                        <p className="font-medium text-amber-800">High-Risk Departments:</p>
                        <ul className="mt-1 list-disc list-inside">
                          {dashboardData.departmentStats
                            .filter(dept => dept.rate > 20)
                            .map(dept => (
                              <li key={dept.name}>{dept.name} - {dept.rate}% attrition rate</li>
                            ))
                          }
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium">No data available</p>
              <p className="text-sm mt-2">Try adjusting your filters or refreshing the page</p>
              <Button variant="outline" className="mt-4" onClick={() => fetchDashboardData()}>
                Load Default Data
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilteredDashboard;
