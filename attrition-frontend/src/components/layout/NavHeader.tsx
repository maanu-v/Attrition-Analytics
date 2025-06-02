import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2, HelpCircle, BarChart3, MessageSquare, Upload } from 'lucide-react';

interface NavHeaderProps {
  className?: string;
}

const NavHeader: React.FC<NavHeaderProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Helper to check if a path is active
  const isActive = (path: string) => location.pathname.startsWith(path);

  // Get page title based on current path
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path.startsWith('/chat')) return 'AI Chat Assistant';
    if (path.startsWith('/dashboard')) return 'HR Analytics Dashboard';
    if (path.startsWith('/upload')) return 'Data Upload';
    if (path.startsWith('/advanced')) return 'HR Advanced Analytics';
    return 'HR Insights';
  };

  // Get icon based on current path
  const getPageIcon = () => {
    const path = location.pathname;
    
    if (path.startsWith('/chat')) return <MessageSquare className="w-5 h-5 text-white" />;
    if (path.startsWith('/dashboard')) return <BarChart3 className="w-5 h-5 text-white" />;
    if (path.startsWith('/upload')) return <Upload className="w-5 h-5 text-white" />;
    return <Building2 className="w-5 h-5 text-white" />;
  };

  // Improved layout with prominent HR Insights branding that navigates to home
  return (
    <header className={`bg-white border-b border-gray-200 h-16 flex items-center justify-between w-full px-6 shadow-sm z-50 nav-header ${className}`}>
      <div className="flex items-center">
        {/* HR Insights logo and title that navigates home */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            HR Insights
          </h1>
        </div>

        {/* Page title badge only on specific pages */}
        {location.pathname !== '/' && (
          <div className="flex items-center ml-3 pl-3 border-l border-gray-200">
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-blue-600 mr-2">
              {getPageIcon()}
            </div>
            <span className="text-sm font-medium text-gray-600">{getPageTitle()}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-4">
        <Button 
          variant={isActive('/') && location.pathname === '/' ? "default" : "ghost"} 
          onClick={() => navigate('/')}
          className={isActive('/') && location.pathname === '/' ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900"}
          size="sm"
        >
          Home
        </Button>
        
        <Button 
          variant={isActive('/dashboard') ? "default" : "ghost"} 
          onClick={() => navigate('/dashboard')}
          className={isActive('/dashboard') ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900"}
          size="sm"
        >
          Dashboard
        </Button>
        
        <Button 
          variant={isActive('/chat') ? "default" : "ghost"} 
          onClick={() => navigate('/chat')}
          className={isActive('/chat') ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900"}
          size="sm"
        >
          Chat
        </Button>
        
        <Button 
          variant={isActive('/upload') ? "default" : "ghost"} 
          onClick={() => navigate('/upload')}
          className={isActive('/upload') ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900"}
          size="sm"
        >
          Upload
        </Button>
        
        <Button 
          variant="outline" 
          className="text-gray-600 hover:text-gray-900 hidden md:flex"
          size="sm"
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Help
        </Button>
      </div>
    </header>
  );
};

export default NavHeader;
