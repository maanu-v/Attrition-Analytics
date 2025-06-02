import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EnhancedFilters from "./EnhancedFilters";
import { useNavigate } from "react-router-dom";
import { BarChart3 } from "lucide-react"; // Add this import at the top

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

const FilteredDashboard: React.FC = () => {
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load initial dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = (filterParams = "") => {
    setIsLoading(true);
    setError(null);

    fetch(`http://localhost:8000/api/filtered-data${filterParams}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setDashboardData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching filtered data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setIsLoading(false);
      });
  };

  const handleFiltersApplied = (filters: any) => {
    // Convert filter data to query parameters
    const params = new URLSearchParams();

    // Tenure range
    if (filters.tenureRange) {
      params.append("tenureMin", filters.tenureRange[0].toString());
      params.append("tenureMax", filters.tenureRange[1].toString());
    }

    // Satisfaction range
    if (filters.satisfactionRange) {
      params.append("satisfactionMin", filters.satisfactionRange[0].toString());
      params.append("satisfactionMax", filters.satisfactionRange[1].toString());
    }

    // Performance range
    if (filters.performanceRange) {
      params.append("performanceMin", filters.performanceRange[0].toString());
      params.append("performanceMax", filters.performanceRange[1].toString());
    }

    // Departments
    if (filters.departments && filters.departments.length > 0) {
      filters.departments.forEach((dept: string) => {
        params.append("departments", dept);
      });
    }

    // At-risk flag
    if (filters.onlyAtRisk) {
      params.append("atRisk", "true");
    }

    // Gender
    if (filters.gender !== "all") {
      params.append("gender", filters.gender);
    }

    // Education
    if (filters.education !== "all") {
      params.append("education", filters.education);
    }

    // Role
    if (filters.role !== "all") {
      params.append("role", filters.role);
    }

    // Date range
    if (filters.dateRange.from) {
      params.append("dateFrom", filters.dateRange.from.toISOString());
    }
    if (filters.dateRange.to) {
      params.append("dateTo", filters.dateRange.to.toISOString());
    }

    // Fetch data with filters
    fetchDashboardData(`?${params.toString()}`);
  };

  return (
    <div className="flex h-screen">
      <div className="flex flex-col">
        <button
          className="flex items-center gap-2 mb-4 ml-4 mt-4 px-4 py-2 bg-white border border-gray-200 shadow-sm text-blue-700 font-semibold rounded hover:bg-blue-50 transition w-fit"
          onClick={() => navigate("/dashboard")}
        >
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Dashboard
        </button>
        <EnhancedFilters
          collapsed={filtersCollapsed}
          onToggle={() => setFiltersCollapsed(!filtersCollapsed)}
          onFiltersApplied={handleFiltersApplied}
        />
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4 bg-red-50 rounded-md">
            {error}
          </div>
        ) : dashboardData ? (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">
              Attrition Analytics Dashboard
              {dashboardData.filteredData && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (Filtered)
                </span>
              )}
            </h1>

            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Employees
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.totalEmployees}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Attrition Count
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    {dashboardData.attritionCount}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Retention Count
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    {dashboardData.retentionCount}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Attrition Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.attritionRate}%
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Department Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-3">Department</th>
                        <th className="px-6 py-3">Total Employees</th>
                        <th className="px-6 py-3">Attrition Count</th>
                        <th className="px-6 py-3">Attrition Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.departmentStats.map((dept) => (
                        <tr key={dept.name} className="bg-white border-b">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {dept.name}
                          </td>
                          <td className="px-6 py-4">{dept.count}</td>
                          <td className="px-6 py-4">{dept.attrition}</td>
                          <td className="px-6 py-4">{dept.rate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Add more dashboard components as needed */}
          </div>
        ) : (
          <div className="text-center text-gray-500">No data available</div>
        )}
      </div>
    </div>
  );
};

export default FilteredDashboard;
