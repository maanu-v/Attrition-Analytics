import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload as UploadIcon, 
  FileText, 
  Trash2, 
  Eye, 
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  DatabaseZap,
  ChevronLeft,
  Search,
  Filter,
  MoreHorizontal,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import DatabaseConnectionCard from '@/components/upload/DatabaseConnectionCard';
import DatabaseConnectionsList from '@/components/upload/DatabaseConnectionsList';

interface Dataset {
  id: string;
  fileName: string;
  uploadTime: Date;
  rows: number;
  columns: number;
  size: string;
  status: 'Processed' | 'Invalid' | 'Processing' | 'Waiting';
  validationMessages?: string[];
  isActive: boolean;
}

interface DatabaseConnection {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'sqlite' | 'mssql' | 'oracle';
  host: string;
  port: string;
  database: string;
  username: string;
  status: 'connected' | 'disconnected' | 'testing' | 'error';
  lastSync?: Date;
  tables?: number;
  records?: number;
}

const Upload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [datasets, setDatasets] = useState<Dataset[]>([
    {
      id: '1',
      fileName: 'Employee_Data_2024.csv',
      uploadTime: new Date(Date.now() - 7200000),
      rows: 1247,
      columns: 15,
      size: '2.1 MB',
      status: 'Processed',
      isActive: true
    },
    {
      id: '2',
      fileName: 'Performance_Reviews_2024.csv',
      uploadTime: new Date(Date.now() - 3600000),
      rows: 1180,
      columns: 12,
      size: '1.8 MB',
      status: 'Processed',
      isActive: false
    },
    {
      id: '3',
      fileName: 'Salary_Data_Invalid.csv',
      uploadTime: new Date(Date.now() - 1800000),
      rows: 0,
      columns: 0,
      size: '0.5 MB',
      status: 'Invalid',
      validationMessages: ['Missing column headers', 'Non-numeric entries found in salary field'],
      isActive: false
    },
    {
      id: '4',
      fileName: 'New_Hires_2024.csv',
      uploadTime: new Date(Date.now() - 900000),
      rows: 234,
      columns: 8,
      size: '0.8 MB',
      status: 'Processing',
      isActive: false
    }
  ]);
  
  const [dragActive, setDragActive] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [databaseConnections, setDatabaseConnections] = useState<DatabaseConnection[]>([
    {
      id: '1',
      name: 'HR Production Database',
      type: 'postgresql',
      host: 'hr-db.company.com',
      port: '5432',
      database: 'hr_analytics',
      username: 'hr_user',
      status: 'connected',
      lastSync: new Date(Date.now() - 3600000),
      tables: 15,
      records: 2450
    }
  ]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (file && file.type === 'text/csv') {
      const newDataset: Dataset = {
        id: Date.now().toString(),
        fileName: file.name,
        uploadTime: new Date(),
        rows: 0,
        columns: 0,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        status: 'Processing',
        isActive: false
      };
      
      setDatasets(prev => [newDataset, ...prev]);
      
      toast({
        title: "File uploaded successfully",
        description: `${file.name} is being processed...`,
      });

      // Simulate processing
      setTimeout(() => {
        setDatasets(prev => 
          prev.map(dataset => 
            dataset.id === newDataset.id 
              ? { ...dataset, status: 'Processed' as const, rows: Math.floor(Math.random() * 2000), columns: Math.floor(Math.random() * 20) + 5 }
              : dataset
          )
        );
      }, 3000);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (id: string) => {
    setDatasets(prev => prev.filter(dataset => dataset.id !== id));
    toast({
      title: "Dataset deleted",
      description: "The dataset has been removed successfully.",
    });
  };

  const handleSetActive = (id: string) => {
    setDatasets(prev => 
      prev.map(dataset => ({
        ...dataset,
        isActive: dataset.id === id
      }))
    );
    toast({
      title: "Active dataset updated",
      description: "The selected dataset is now active for analysis.",
    });
  };

  const handlePreview = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setPreviewOpen(true);
  };

  const getStatusIcon = (status: Dataset['status']) => {
    switch (status) {
      case 'Processed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Invalid':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'Processing':
      case 'Waiting':
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: Dataset['status']) => {
    switch (status) {
      case 'Processed':
        return 'bg-green-100 text-green-800';
      case 'Invalid':
        return 'bg-red-100 text-red-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Waiting':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDatasets = datasets.filter(dataset =>
    dataset.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDatabaseConnectionAdd = (connection: DatabaseConnection) => {
    setDatabaseConnections(prev => [...prev, connection]);
  };

  const handleDatabaseDelete = (id: string) => {
    setDatabaseConnections(prev => prev.filter(conn => conn.id !== id));
  };

  const handleDatabaseSync = (id: string) => {
    setDatabaseConnections(prev => 
      prev.map(conn => 
        conn.id === id 
          ? { ...conn, status: 'testing' as const }
          : conn
      )
    );
    
    // Simulate sync process
    setTimeout(() => {
      setDatabaseConnections(prev => 
        prev.map(conn => 
          conn.id === id 
            ? { 
                ...conn, 
                status: 'connected' as const, 
                lastSync: new Date(),
                records: Math.floor(Math.random() * 10000) + 1000
              }
            : conn
        )
      );
    }, 2000);
  };

  const handleDatabaseTestConnection = (id: string) => {
    setDatabaseConnections(prev => 
      prev.map(conn => 
        conn.id === id 
          ? { ...conn, status: 'testing' as const }
          : conn
      )
    );
    
    // Simulate test
    setTimeout(() => {
      const success = Math.random() > 0.3;
      setDatabaseConnections(prev => 
        prev.map(conn => 
          conn.id === id 
            ? { ...conn, status: success ? 'connected' as const : 'error' as const }
            : conn
        )
      );
    }, 1500);
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
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <DatabaseZap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Data Management</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search datasets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Main Tabs */}
        <Tabs defaultValue="files" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="files" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>File Uploads</span>
            </TabsTrigger>
            <TabsTrigger value="databases" className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Database Connections</span>
            </TabsTrigger>
          </TabsList>

          {/* File Uploads Tab */}
          <TabsContent value="files" className="space-y-8">
            {/* Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UploadIcon className="w-5 h-5" />
                  <span>Upload New Dataset</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    dragActive 
                      ? 'border-purple-400 bg-purple-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Drag and drop your CSV files here
                  </h3>
                  <p className="text-gray-600 mb-4">
                    or click to browse and select files
                  </p>
                  <Button
                    onClick={() => document.getElementById('file-input')?.click()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Choose Files
                  </Button>
                  <input
                    id="file-input"
                    type="file"
                    accept=".csv"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-500 mt-4">
                    Supported formats: CSV
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Datasets Table */}
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Datasets ({filteredDatasets.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Upload Time</TableHead>
                      <TableHead>Rows</TableHead>
                      <TableHead>Columns</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDatasets.map((dataset) => (
                      <TableRow key={dataset.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <FileText className="w-4 h-4 text-gray-600" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {dataset.fileName}
                                {dataset.isActive && (
                                  <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                                    Active
                                  </Badge>
                                )}
                              </div>
                              {dataset.validationMessages && (
                                <div className="text-sm text-red-600">
                                  {dataset.validationMessages[0]}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {dataset.uploadTime.toLocaleString()}
                        </TableCell>
                        <TableCell>{dataset.rows.toLocaleString()}</TableCell>
                        <TableCell>{dataset.columns}</TableCell>
                        <TableCell>{dataset.size}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(dataset.status)}
                            <Badge className={getStatusColor(dataset.status)}>
                              {dataset.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handlePreview(dataset)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Preview
                              </DropdownMenuItem>
                              {!dataset.isActive && dataset.status === 'Processed' && (
                                <DropdownMenuItem onClick={() => handleSetActive(dataset.id)}>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Set as Active
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(dataset.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredDatasets.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No datasets found</h3>
                    <p className="text-gray-600">
                      {searchTerm ? 'Try adjusting your search terms' : 'Upload your first dataset to get started'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Connections Tab */}
          <TabsContent value="databases" className="space-y-8">
            {/* Database Connection Form */}
            <DatabaseConnectionCard onConnectionAdd={handleDatabaseConnectionAdd} />

            {/* Database Connections List */}
            <DatabaseConnectionsList
              connections={databaseConnections}
              onDelete={handleDatabaseDelete}
              onSync={handleDatabaseSync}
              onTestConnection={handleDatabaseTestConnection}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Dataset Preview - {selectedDataset?.fileName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDataset && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Rows</p>
                    <p className="text-lg font-semibold">{selectedDataset.rows.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Columns</p>
                    <p className="text-lg font-semibold">{selectedDataset.columns}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Size</p>
                    <p className="text-lg font-semibold">{selectedDataset.size}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Status</p>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedDataset.status)}
                      <span className="font-semibold">{selectedDataset.status}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium mb-2">Sample Data Preview</h4>
                  <div className="bg-white rounded border p-4 text-sm">
                    <div className="grid grid-cols-5 gap-4 font-medium text-gray-700 border-b pb-2 mb-2">
                      <div>Employee_ID</div>
                      <div>Name</div>
                      <div>Department</div>
                      <div>Position</div>
                      <div>Salary</div>
                    </div>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="grid grid-cols-5 gap-4 py-1 text-gray-600">
                        <div>EMP{1000 + i}</div>
                        <div>Employee {i + 1}</div>
                        <div>Engineering</div>
                        <div>Software Engineer</div>
                        <div>${(65000 + i * 5000).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedDataset.validationMessages && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 mb-2">Validation Issues</h4>
                    <ul className="space-y-1">
                      {selectedDataset.validationMessages.map((message, index) => (
                        <li key={index} className="text-sm text-red-700 flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4" />
                          <span>{message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Upload;
