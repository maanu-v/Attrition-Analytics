
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  FileText, 
  Database, 
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface Dataset {
  id: string;
  name: string;
  type: 'csv' | 'database';
  status: 'processed' | 'processing' | 'error';
  rows: number;
  columns: number;
  uploadTime: Date;
  size?: string;
  connectionString?: string;
}

interface DatasetImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (selectedDatasets: Dataset[]) => void;
}

const DatasetImportModal = ({ open, onOpenChange, onImport }: DatasetImportModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);

  // Mock datasets - in real app, these would come from the Upload page state
  const availableDatasets: Dataset[] = [
    {
      id: '1',
      name: 'Employee_Data_2024.csv',
      type: 'csv',
      status: 'processed',
      rows: 1247,
      columns: 15,
      size: '2.1 MB',
      uploadTime: new Date(Date.now() - 7200000)
    },
    {
      id: '2',
      name: 'Performance_Reviews_2024.csv',
      type: 'csv',
      status: 'processed',
      rows: 1180,
      columns: 12,
      size: '1.8 MB',
      uploadTime: new Date(Date.now() - 3600000)
    },
    {
      id: '3',
      name: 'HR Database - PostgreSQL',
      type: 'database',
      status: 'processed',
      rows: 2450,
      columns: 28,
      connectionString: 'postgresql://hr-db.company.com:5432/hr_analytics',
      uploadTime: new Date(Date.now() - 86400000)
    },
    {
      id: '4',
      name: 'Salary_Data_2023.csv',
      type: 'csv',
      status: 'processing',
      rows: 0,
      columns: 0,
      size: '1.2 MB',
      uploadTime: new Date(Date.now() - 900000)
    },
    {
      id: '5',
      name: 'Legacy HR System - MySQL',
      type: 'database',
      status: 'error',
      rows: 0,
      columns: 0,
      connectionString: 'mysql://legacy-hr.company.com:3306/employees',
      uploadTime: new Date(Date.now() - 172800000)
    }
  ];

  const filteredDatasets = availableDatasets.filter(dataset =>
    dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    dataset.status === 'processed' // Only show processed datasets
  );

  const handleDatasetToggle = (datasetId: string) => {
    setSelectedDatasets(prev => 
      prev.includes(datasetId)
        ? prev.filter(id => id !== datasetId)
        : [...prev, datasetId]
    );
  };

  const handleImport = () => {
    const datasetsToImport = availableDatasets.filter(dataset => 
      selectedDatasets.includes(dataset.id)
    );
    onImport(datasetsToImport);
    onOpenChange(false);
    setSelectedDatasets([]);
  };

  const getStatusIcon = (status: Dataset['status']) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: Dataset['status']) => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Import Datasets for Analysis</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search datasets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Dataset List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredDatasets.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No datasets available</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'No datasets match your search.' : 'Upload datasets in the Upload page to get started.'}
                </p>
              </div>
            ) : (
              filteredDatasets.map((dataset) => (
                <div
                  key={dataset.id}
                  className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleDatasetToggle(dataset.id)}
                >
                  <Checkbox
                    checked={selectedDatasets.includes(dataset.id)}
                    onCheckedChange={() => handleDatasetToggle(dataset.id)}
                  />
                  
                  <div className="flex items-center space-x-2">
                    {dataset.type === 'csv' ? (
                      <FileText className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Database className="w-5 h-5 text-purple-600" />
                    )}
                    {getStatusIcon(dataset.status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{dataset.name}</h4>
                      <Badge className={getStatusColor(dataset.status)}>
                        {dataset.status}
                      </Badge>
                      {dataset.type === 'database' && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          Database
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {dataset.rows.toLocaleString()} rows • {dataset.columns} columns
                      {dataset.size && ` • ${dataset.size}`}
                    </div>
                    {dataset.connectionString && (
                      <div className="text-xs text-gray-500 mt-1 font-mono">
                        {dataset.connectionString}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      Uploaded {dataset.uploadTime.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Selected Summary */}
          {selectedDatasets.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                Selected Datasets ({selectedDatasets.length})
              </h4>
              <div className="space-y-1">
                {selectedDatasets.map(id => {
                  const dataset = availableDatasets.find(d => d.id === id);
                  return dataset ? (
                    <div key={id} className="text-sm text-blue-800">
                      • {dataset.name} ({dataset.rows.toLocaleString()} rows)
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={selectedDatasets.length === 0}
            >
              Import {selectedDatasets.length > 0 && `${selectedDatasets.length} Dataset${selectedDatasets.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DatasetImportModal;
