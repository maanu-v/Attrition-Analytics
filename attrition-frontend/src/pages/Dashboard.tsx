import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Download,
  BarChart3,
  ChevronLeft,
  Target,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
// import EnhancedFilters from '@/components/dashboard/EnhancedFilters';
import { 
  fetchOverallStatistics, 
  fetchEmployeeCount,
  OverallStatistics,
  EmployeeCount
} from '@/services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedDataset, setSelectedDataset] = useState('HR-Employee-Attrition-All.csv');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [overallStats, setOverallStats] = useState<OverallStatistics | null>(null);
  const [employeeCount, setEmployeeCount] = useState<EmployeeCount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API when component mounts
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [statsData, countData] = await Promise.all([
          fetchOverallStatistics(),
          fetchEmployeeCount()
        ]);
        
        setOverallStats(statsData);
        setEmployeeCount(countData);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const keyMetrics = [
    { 
      title: 'Attrition Rate', 
      value: overallStats ? `${overallStats.attritionRate}%` : '-', 
      change: '+2.1%', // This would come from comparing with previous period
      trend: 'up',
      icon: TrendingUp,
      color: 'text-red-600'
    },
    { 
      title: 'Total Employees', 
      value: employeeCount ? employeeCount.total.toLocaleString() : '-', 
      change: '-', 
      trend: 'neutral',
      icon: Users,
      color: 'text-blue-600'
    },
    { 
      title: 'Active Employees', 
      value: employeeCount ? employeeCount.active.toLocaleString() : '-', 
      change: '-', 
      trend: 'neutral',
      icon: Target,
      color: 'text-green-600'
    },
    { 
      title: 'Attrited Employees', 
      value: employeeCount ? employeeCount.attrited.toLocaleString() : '-', 
      change: '-', 
      trend: 'neutral',
      icon: DollarSign,
      color: 'text-purple-600'
    }
  ];

  const handleExport = (type: string) => {
    console.log(`Exporting as ${type}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={selectedDataset} onValueChange={setSelectedDataset}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HR-Employee-Attrition-All.csv">HR-Employee-Attrition-All.csv</SelectItem>
              <SelectItem value="Performance_Reviews_2024.csv">Performance_Reviews_2024.csv</SelectItem>
              <SelectItem value="Salary_Data_2023-2024.csv">Salary_Data_2023-2024.csv</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={() => navigate('/advanced')}>
            <Calendar className="w-4 h-4 mr-2" />
            Apply Filters
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => handleExport('all')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Enhanced Sidebar
        <EnhancedFilters 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        /> */}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                <p className="text-gray-600">Loading dashboard data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 max-w-md">
                <p>{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-3" 
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {keyMetrics.map((metric, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                          {metric.change !== '-' && (
                            <div className="flex items-center mt-2">
                              <span className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                                {metric.change}
                              </span>
                              <span className="text-sm text-gray-500 ml-1">vs last month</span>
                            </div>
                          )}
                        </div>
                        <div className={`p-3 rounded-lg ${metric.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                          <metric.icon className={`w-6 h-6 ${metric.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Dashboard Tabs */}
              <DashboardTabs 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
