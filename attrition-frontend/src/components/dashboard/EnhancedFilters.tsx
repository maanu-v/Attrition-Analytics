import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  CalendarIcon, 
  FilterX,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterProps {
  collapsed: boolean;
  onToggle: () => void;
  onFiltersApplied: (filters: any) => void;
  initialFilters?: any;
  onClearFilters?: () => void;
}

interface RangeValue {
  min: number;
  max: number;
}

const departments = ['Sales', 'HR', 'Research & Development', 'IT', 'Marketing', 'Finance'];

const EnhancedFilters: React.FC<FilterProps> = ({ 
  collapsed, 
  onToggle, 
  onFiltersApplied, 
  initialFilters = {},
  onClearFilters
}) => {
  // Filter state with improved range handling
  const [tenureRange, setTenureRange] = useState<RangeValue>({ min: 0, max: 40 });
  const [satisfactionRange, setSatisfactionRange] = useState<RangeValue>({ min: 1, max: 4 });
  const [performanceRange, setPerformanceRange] = useState<RangeValue>({ min: 1, max: 5 });
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [onlyAtRisk, setOnlyAtRisk] = useState(false);
  const [gender, setGender] = useState('all');
  const [education, setEducation] = useState('all');
  const [role, setRole] = useState('all');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  
  // Initialize filters from props if provided
  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      if (initialFilters.tenureRange) {
        setTenureRange({ 
          min: initialFilters.tenureRange[0], 
          max: initialFilters.tenureRange[1] 
        });
      }
      
      if (initialFilters.satisfactionRange) {
        setSatisfactionRange({ 
          min: initialFilters.satisfactionRange[0], 
          max: initialFilters.satisfactionRange[1] 
        });
      }
      
      if (initialFilters.performanceRange) {
        setPerformanceRange({ 
          min: initialFilters.performanceRange[0], 
          max: initialFilters.performanceRange[1] 
        });
      }
      
      if (initialFilters.departments) setSelectedDepartments(initialFilters.departments);
      if (initialFilters.onlyAtRisk !== undefined) setOnlyAtRisk(initialFilters.onlyAtRisk);
      if (initialFilters.gender) setGender(initialFilters.gender);
      if (initialFilters.education) setEducation(initialFilters.education);
      if (initialFilters.role) setRole(initialFilters.role);
      if (initialFilters.dateRange) setDateRange(initialFilters.dateRange);
    }
  }, [initialFilters]);
  
  const handleApplyFilters = () => {
    const filters = {
      tenureRange: [tenureRange.min, tenureRange.max],
      satisfactionRange: [satisfactionRange.min, satisfactionRange.max],
      performanceRange: [performanceRange.min, performanceRange.max],
      departments: selectedDepartments,
      onlyAtRisk,
      gender,
      education,
      role,
      dateRange
    };
    
    onFiltersApplied(filters);
  };
  
  const handleClearFilters = () => {
    setTenureRange({ min: 0, max: 40 });
    setSatisfactionRange({ min: 1, max: 4 });
    setPerformanceRange({ min: 1, max: 5 });
    setSelectedDepartments([]);
    setOnlyAtRisk(false);
    setGender('all');
    setEducation('all');
    setRole('all');
    setDateRange({
      from: undefined,
      to: undefined,
    });
    
    if (onClearFilters) {
      onClearFilters();
    }
  };
  
  const handleDepartmentChange = (dept: string) => {
    setSelectedDepartments(prev => 
      prev.includes(dept) 
        ? prev.filter(d => d !== dept)
        : [...prev, dept]
    );
  };

  // Helper functions to handle slider changes
  const handleTenureMinChange = (value: number) => {
    setTenureRange(prev => ({ ...prev, min: Math.min(value, prev.max - 1) }));
  };

  const handleTenureMaxChange = (value: number) => {
    setTenureRange(prev => ({ ...prev, max: Math.max(value, prev.min + 1) }));
  };

  const handleSatisfactionMinChange = (value: number) => {
    setSatisfactionRange(prev => ({ ...prev, min: Math.min(value, prev.max - 1) }));
  };

  const handleSatisfactionMaxChange = (value: number) => {
    setSatisfactionRange(prev => ({ ...prev, max: Math.max(value, prev.min + 1) }));
  };

  const handlePerformanceMinChange = (value: number) => {
    setPerformanceRange(prev => ({ ...prev, min: Math.min(value, prev.max - 1) }));
  };

  const handlePerformanceMaxChange = (value: number) => {
    setPerformanceRange(prev => ({ ...prev, max: Math.max(value, prev.min + 1) }));
  };
  
  return (
    <div className={cn(
      "h-[calc(100vh-4rem)] bg-gray-50 border-r border-gray-200 transition-all duration-300 overflow-hidden",
      collapsed ? "w-12" : "w-80"
    )}>
      <div className="relative h-full">
        {/* Toggle Button - Fixed positioning */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="absolute -right-3 top-4 h-6 w-6 rounded-full flex items-center justify-center border border-gray-200 bg-white shadow-sm hover:bg-gray-50 p-0 z-10"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
        
        {/* Filter Content */}
        <div className={cn("h-full overflow-y-auto p-4", collapsed ? "invisible" : "visible")}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearFilters}
              className="text-xs text-gray-500 hover:text-gray-800 flex items-center"
            >
              <FilterX className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
          
          <div className="space-y-6">
            {/* Tenure Range - Updated Implementation */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="tenure-range">Years at Company</Label>
                <span className="text-xs font-medium text-gray-500">
                  {tenureRange.min} - {tenureRange.max} years
                </span>
              </div>
              
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Min</span>
                    <span>{tenureRange.min} years</span>
                  </div>
                  <Slider
                    id="tenure-min"
                    value={[tenureRange.min]}
                    min={0}
                    max={39}
                    step={1}
                    onValueChange={([value]) => handleTenureMinChange(value)}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Max</span>
                    <span>{tenureRange.max} years</span>
                  </div>
                  <Slider
                    id="tenure-max"
                    value={[tenureRange.max]}
                    min={1}
                    max={40}
                    step={1}
                    onValueChange={([value]) => handleTenureMaxChange(value)}
                  />
                </div>
              </div>
            </div>
            
            {/* Job Satisfaction - Updated Implementation */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="satisfaction-range">Job Satisfaction</Label>
                <span className="text-xs font-medium text-gray-500">
                  {satisfactionRange.min} - {satisfactionRange.max}
                </span>
              </div>
              
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Min (Low)</span>
                    <span>{satisfactionRange.min}</span>
                  </div>
                  <Slider
                    id="satisfaction-min"
                    value={[satisfactionRange.min]}
                    min={1}
                    max={3}
                    step={1}
                    onValueChange={([value]) => handleSatisfactionMinChange(value)}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Max (High)</span>
                    <span>{satisfactionRange.max}</span>
                  </div>
                  <Slider
                    id="satisfaction-max"
                    value={[satisfactionRange.max]}
                    min={2}
                    max={4}
                    step={1}
                    onValueChange={([value]) => handleSatisfactionMaxChange(value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 pt-1">
                <span>1 = Low</span>
                <span>4 = Very High</span>
              </div>
            </div>
            
            {/* Performance Rating - Updated Implementation */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="performance-range">Performance Rating</Label>
                <span className="text-xs font-medium text-gray-500">
                  {performanceRange.min} - {performanceRange.max}
                </span>
              </div>
              
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Min (Low)</span>
                    <span>{performanceRange.min}</span>
                  </div>
                  <Slider
                    id="performance-min"
                    value={[performanceRange.min]}
                    min={1}
                    max={4}
                    step={1}
                    onValueChange={([value]) => handlePerformanceMinChange(value)}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Max (High)</span>
                    <span>{performanceRange.max}</span>
                  </div>
                  <Slider
                    id="performance-max"
                    value={[performanceRange.max]}
                    min={2}
                    max={5}
                    step={1}
                    onValueChange={([value]) => handlePerformanceMaxChange(value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 pt-1">
                <span>1 = Low</span>
                <span>5 = Excellent</span>
              </div>
            </div>
            
            {/* Departments */}
            <div className="space-y-2">
              <Label>Departments</Label>
              <div className="grid grid-cols-1 gap-2 mt-1">
                {departments.map(dept => (
                  <div key={dept} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`dept-${dept}`} 
                      checked={selectedDepartments.includes(dept)}
                      onCheckedChange={() => handleDepartmentChange(dept)}
                    />
                    <Label htmlFor={`dept-${dept}`} className="text-sm cursor-pointer">{dept}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* At-Risk Employees Only */}
            <div className="flex items-center space-x-2">
              <Switch 
                id="at-risk" 
                checked={onlyAtRisk}
                onCheckedChange={setOnlyAtRisk}
              />
              <Label htmlFor="at-risk">At-Risk Employees Only</Label>
            </div>
            
            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Education */}
            <div className="space-y-2">
              <Label htmlFor="education">Education Level</Label>
              <Select value={education} onValueChange={setEducation}>
                <SelectTrigger id="education">
                  <SelectValue placeholder="Select education" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="highschool">High School</SelectItem>
                  <SelectItem value="bachelors">Bachelor's</SelectItem>
                  <SelectItem value="masters">Master's</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Role Level */}
            <div className="space-y-2">
              <Label htmlFor="role">Job Level</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="entrylevel">Entry Level</SelectItem>
                  <SelectItem value="midlevel">Mid Level</SelectItem>
                  <SelectItem value="seniorlevel">Senior Level</SelectItem>
                  <SelectItem value="lead">Team Lead</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="grid gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      size="sm"
                      className="justify-start text-left font-normal w-full"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* Apply Filters Button */}
            <Button 
              className="w-full" 
              onClick={handleApplyFilters}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedFilters;
