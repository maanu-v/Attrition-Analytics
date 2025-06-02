
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  Settings, 
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface DatabaseConnectionsListProps {
  connections: DatabaseConnection[];
  onDelete: (id: string) => void;
  onSync: (id: string) => void;
  onTestConnection: (id: string) => void;
}

const DatabaseConnectionsList = ({ 
  connections, 
  onDelete, 
  onSync, 
  onTestConnection 
}: DatabaseConnectionsListProps) => {
  const { toast } = useToast();

  const getStatusIcon = (status: DatabaseConnection['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'disconnected':
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'testing':
        return <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />;
    }
  };

  const getStatusColor = (status: DatabaseConnection['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'testing':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getDatabaseTypeIcon = (type: string) => {
    // You could return different icons for different database types
    return <Database className="w-4 h-4 text-purple-600" />;
  };

  const handleDelete = (connection: DatabaseConnection) => {
    onDelete(connection.id);
    toast({
      title: "Database connection removed",
      description: `${connection.name} has been disconnected and removed.`,
    });
  };

  const handleSync = (connection: DatabaseConnection) => {
    onSync(connection.id);
    toast({
      title: "Syncing database",
      description: `Refreshing data from ${connection.name}...`,
    });
  };

  if (connections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Database Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No database connections</h3>
            <p className="text-gray-600">
              Link your company database to analyze data directly from your systems.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Connections ({connections.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {connections.map((connection) => (
            <div
              key={connection.id}
              className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-2">
                {getDatabaseTypeIcon(connection.type)}
                {getStatusIcon(connection.status)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">{connection.name}</h4>
                  <Badge className={getStatusColor(connection.status)}>
                    {connection.status}
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    {connection.type.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {connection.host}:{connection.port}/{connection.database}
                </div>
                {connection.tables && connection.records && (
                  <div className="text-sm text-gray-600">
                    {connection.tables} tables • {connection.records.toLocaleString()} records
                  </div>
                )}
                {connection.lastSync && (
                  <div className="text-xs text-gray-500 mt-1">
                    Last synced: {connection.lastSync.toLocaleString()}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {connection.status === 'connected' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSync(connection)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onTestConnection(connection.id)}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Test Connection
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(connection)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Connection
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseConnectionsList;
