import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Filter, 
  CalendarIcon, 
  X, 
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight, 
  Building2
} from 'lucide-react';
import { format } from 'date-fns';

interface EnhancedFiltersProps {
  collapsed: boolean;
  onToggle: () => void;
  onFiltersApplied: (filters: any) => void;
}

const EnhancedFilters = ({ collapsed, onToggle, onFiltersApplied }: EnhancedFiltersProps) => {
  const [tenureRange, setTenureRange] = useState([0, 20]);
  const [satisfactionRange, setSatisfactionRange] = useState([1, 5]);
  const [performanceRange, setPerformanceRange] = useState([1, 5]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [onlyAtRisk, setOnlyAtRisk] = useState(false);
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedEducation, setSelectedEducation] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false);
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([
    'Sales', 'Research & Development', 'Human Resources'
  ]);
  
  const educationLevels = [
    { label: 'High School', value: 'highschool' },
    { label: 'Bachelor\'s', value: 'bachelors' },
    { label: 'Master\'s', value: 'masters' },
    { label: 'PhD', value: 'phd' }
  ];

  const roles = [
    { label: 'Entry Level', value: 'entrylevel' },
    { label: 'Mid Level', value: 'midlevel' },
    { label: 'Senior Level', value: 'seniorlevel' },
    { label: 'Lead', value: 'lead' },
    { label: 'Manager', value: 'manager' },
    { label: 'Director', value: 'director' }
  ];

  // Load departments from backend when component mounts
  useEffect(() => {
    fetch('http://localhost:8000/api/attrition-by-department')
      .then(response => response.json())
      .then(data => {
        if (data && data.labels) {
          setAvailableDepartments(data.labels);
        }
      })
      .catch(error => console.error('Error fetching departments:', error));
  }, []);
  
  const handleDepartmentToggle = (dept: string) => {
    setSelectedDepartments(prev => 
      prev.includes(dept) 
        ? prev.filter(d => d !== dept)
        : [...prev, dept]
    );
  };

  const handleApplyFilters = () => {
    const filters = {
      tenureRange,
      satisfactionRange,
      performanceRange,
      departments: selectedDepartments,
      onlyAtRisk,
      gender: selectedGender,
      education: selectedEducation,
      role: selectedRole,
      dateRange: { from: dateFrom, to: dateTo }
    };
    
    onFiltersApplied(filters);
  };

  const handleResetFilters = () => {
    setTenureRange([0, 20]);
    setSatisfactionRange([1, 5]);
    setPerformanceRange([1, 5]);
    setSelectedDepartments([]);
    setOnlyAtRisk(false);
    setSelectedGender('all');
    setSelectedEducation('all');
    setSelectedRole('all');
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const activeFiltersCount = [
    tenureRange[0] > 0 || tenureRange[1] < 20,
    satisfactionRange[0] > 1 || satisfactionRange[1] < 5,
    performanceRange[0] > 1 || performanceRange[1] < 5,
    selectedDepartments.length > 0,
    onlyAtRisk,
    selectedGender !== 'all',
    selectedEducation !== 'all',
    selectedRole !== 'all',
    dateFrom || dateTo
  ].filter(Boolean).length;

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? 'w-16' : 'w-80'}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900">Advanced Filters</h2>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {!collapsed && (
          <div className="space-y-6">
            {/* Department Dropdown */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Departments</Label>
              <Popover open={departmentDropdownOpen} onOpenChange={setDepartmentDropdownOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between text-left"
                    onClick={() => setDepartmentDropdownOpen(!departmentDropdownOpen)}
                  >
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4" />
                      <span>
                        {selectedDepartments.length === 0 
                          ? 'Select departments...' 
                          : `${selectedDepartments.length} selected`
                        }
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="start">
                  <div className="space-y-2">
                    {availableDepartments.map((dept) => (
                      <div key={dept} className="flex items-center space-x-2">
                        <Checkbox
                          id={dept}
                          checked={selectedDepartments.includes(dept)}
                          onCheckedChange={() => handleDepartmentToggle(dept)}
                        />
                        <Label htmlFor={dept} className="text-sm font-normal">{dept}</Label>
                      </div>
                    ))}
                    {selectedDepartments.length > 0 && (
                      <div className="pt-2 border-t">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedDepartments([])}
                          className="w-full text-xs"
                        >
                          Clear all
                        </Button>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* Show selected departments as badges */}
              {selectedDepartments.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedDepartments.map((dept) => (
                    <Badge key={dept} variant="secondary" className="text-xs">
                      {dept}
                      <button
                        onClick={() => handleDepartmentToggle(dept)}
                        className="ml-1 hover:bg-gray-300 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Tenure Range Slider */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Tenure Range: {tenureRange[0]} - {tenureRange[1]} years
              </Label>
              <Slider
                value={tenureRange}
                onValueChange={setTenureRange}
                max={20}
                min={0}
                step={0.5}
                className="w-full"
              />
            </div>

            {/* Satisfaction Range */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Satisfaction Score: {satisfactionRange[0]} - {satisfactionRange[1]}
              </Label>
              <Slider
                value={satisfactionRange}
                onValueChange={setSatisfactionRange}
                max={5}
                min={1}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Performance Range */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Performance Score: {performanceRange[0]} - {performanceRange[1]}
              </Label>
              <Slider
                value={performanceRange}
                onValueChange={setPerformanceRange}
                max={5}
                min={1}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* At-Risk Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="at-risk"
                checked={onlyAtRisk}
                onCheckedChange={setOnlyAtRisk}
              />
              <Label htmlFor="at-risk" className="text-sm font-medium">Show only at-risk employees</Label>
            </div>

            {/* Gender Filter */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Gender</Label>
              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Education Level */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Education Level</Label>
              <Select value={selectedEducation} onValueChange={setSelectedEducation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Education Levels</SelectItem>
                  {educationLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Level */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Role Level</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Role Levels</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "MMM dd") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "MMM dd") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t">
              <Button className="w-full" onClick={handleApplyFilters}>
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
              <Button variant="outline" className="w-full" onClick={handleResetFilters}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset All
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedFilters;
