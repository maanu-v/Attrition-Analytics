
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Database, 
  TestTube, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface DatabaseConnectionCardProps {
  onConnectionAdd: (connection: DatabaseConnection) => void;
}

const DatabaseConnectionCard = ({ onConnectionAdd }: DatabaseConnectionCardProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    type: 'postgresql' as const,
    host: '',
    port: '',
    database: '',
    username: '',
    password: ''
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const databaseTypes = [
    { value: 'postgresql', label: 'PostgreSQL', defaultPort: '5432' },
    { value: 'mysql', label: 'MySQL', defaultPort: '3306' },
    { value: 'sqlite', label: 'SQLite', defaultPort: '' },
    { value: 'mssql', label: 'SQL Server', defaultPort: '1433' },
    { value: 'oracle', label: 'Oracle', defaultPort: '1521' }
  ];

  const handleTypeChange = (type: string) => {
    const dbType = databaseTypes.find(t => t.value === type);
    setFormData(prev => ({
      ...prev,
      type: type as any,
      port: dbType?.defaultPort || ''
    }));
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');
    
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate random success/failure for demo
    const success = Math.random() > 0.3;
    
    setConnectionStatus(success ? 'success' : 'error');
    setIsTestingConnection(false);
    
    toast({
      title: success ? "Connection successful" : "Connection failed",
      description: success 
        ? "Database connection established successfully" 
        : "Failed to connect to database. Please check your credentials.",
      variant: success ? "default" : "destructive",
    });
  };

  const handleSaveConnection = () => {
    if (connectionStatus !== 'success') {
      toast({
        title: "Test connection first",
        description: "Please test the connection before saving.",
        variant: "destructive",
      });
      return;
    }

    const newConnection: DatabaseConnection = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      host: formData.host,
      port: formData.port,
      database: formData.database,
      username: formData.username,
      status: 'connected',
      lastSync: new Date(),
      tables: Math.floor(Math.random() * 20) + 5,
      records: Math.floor(Math.random() * 10000) + 1000
    };

    onConnectionAdd(newConnection);
    
    // Reset form
    setFormData({
      name: '',
      type: 'postgresql',
      host: '',
      port: '',
      database: '',
      username: '',
      password: ''
    });
    setConnectionStatus('idle');

    toast({
      title: "Database connection saved",
      description: "Your database has been linked successfully.",
    });
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const isFormValid = formData.name && formData.host && formData.database && formData.username && formData.password;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5" />
          <span>Link Database Connection</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="connection-name">Connection Name</Label>
            <Input
              id="connection-name"
              placeholder="e.g., HR Production Database"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="database-type">Database Type</Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {databaseTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="host">Host/IP Address</Label>
            <Input
              id="host"
              placeholder="localhost or 192.168.1.100"
              value={formData.host}
              onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              placeholder="5432"
              value={formData.port}
              onChange={(e) => setFormData(prev => ({ ...prev, port: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="database-name">Database Name</Label>
            <Input
              id="database-name"
              placeholder="hr_analytics"
              value={formData.database}
              onChange={(e) => setFormData(prev => ({ ...prev, database: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="database_user"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          />
        </div>

        {connectionStatus !== 'idle' && (
          <div className={`flex items-center space-x-2 p-3 rounded-lg ${
            connectionStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {getConnectionStatusIcon()}
            <span className="text-sm">
              {connectionStatus === 'success' 
                ? 'Connection successful! You can now save this connection.'
                : 'Connection failed. Please check your credentials and try again.'
              }
            </span>
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={!isFormValid || isTestingConnection}
            className="flex-1"
          >
            {isTestingConnection ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <TestTube className="w-4 h-4 mr-2" />
            )}
            Test Connection
          </Button>
          
          <Button
            onClick={handleSaveConnection}
            disabled={connectionStatus !== 'success'}
            className="flex-1"
          >
            <Database className="w-4 h-4 mr-2" />
            Save Connection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseConnectionCard;
