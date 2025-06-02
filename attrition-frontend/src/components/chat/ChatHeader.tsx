
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft,
  Building2,
  Settings,
  Download
} from 'lucide-react';

const ChatHeader = () => {
  const navigate = useNavigate();

  return (
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
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">AI Chat Assistant</h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Chat
        </Button>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </header>
  );
};

export default ChatHeader;
