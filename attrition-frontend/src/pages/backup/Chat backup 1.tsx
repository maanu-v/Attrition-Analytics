import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, RotateCcw, Download, Database, X, Mic, Clock, FileText, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight, Eye, BarChart3, TrendingUp, Brain, AlertTriangle, FileSpreadsheet, Target, Settings, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import DatasetImportModal from '@/components/chat/DatasetImportModal';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Array<{ type: 'image' | 'file'; url: string; name: string }>;
}

interface Dataset {
  id: string;
  name: string;
  fileName: string;
  rows: number;
  columns: number;
  updatedAt: Date;
  quality: 'Good' | 'Fair' | 'Poor';
  columnPreview: string[];
}

const Chat = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI Data Assistant. I can help you analyze your HR data, create visualizations, and provide insights on employee performance, attrition, and demographics. What would you like to explore today?',
      timestamp: new Date(Date.now() - 60000)
    }
  ]);
  
  const [datasets] = useState<Dataset[]>([
    {
      id: '1',
      name: 'Employee_Data_2024.csv',
      fileName: 'Employee_Data_2024.csv',
      rows: 1247,
      columns: 15,
      updatedAt: new Date(Date.now() - 7200000),
      quality: 'Good',
      columnPreview: ['Employee_ID', 'Name', 'Department', 'Position', 'Salary', 'Performance_Score', 'Attrition_Risk', 'Hire_Date', 'Manager_ID']
    },
    {
      id: '2',
      name: 'Performance_Reviews_2024.csv',
      fileName: 'Performance_Reviews_2024.csv',
      rows: 1180,
      columns: 12,
      updatedAt: new Date(Date.now() - 3600000),
      quality: 'Good',
      columnPreview: ['Review_ID', 'Employee_ID', 'Quarter', 'Rating', 'Goals_Met', 'Feedback', 'Improvement_Areas']
    },
    {
      id: '3',
      name: 'Salary_Data_2023-2024.csv',
      fileName: 'Salary_Data_2023-2024.csv',
      rows: 2495,
      columns: 8,
      updatedAt: new Date(Date.now() - 1800000),
      quality: 'Fair',
      columnPreview: ['Employee_ID', 'Base_Salary', 'Bonus', 'Benefits', 'Total_Compensation', 'Year', 'Department']
    }
  ]);
  
  const [currentDatasetIndex, setCurrentDatasetIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [imagePreview, setImagePreview] = useState<{ url: string; name: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [datasetImportOpen, setDatasetImportOpen] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I understand you\'re looking for insights about your HR data. Let me analyze the current dataset and provide you with relevant metrics. Based on the employee data, I can see some interesting patterns in attrition rates and performance metrics.',
        timestamp: new Date(),
        attachments: [
          { type: 'image', url: '/placeholder.svg', name: 'attrition_chart.png' }
        ]
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const openImagePreview = (url: string, name: string) => {
    setImagePreview({ url, name });
  };

  const handleDatasetImport = (datasets: any[]) => {
    toast({
      title: "Datasets imported",
      description: `${datasets.length} dataset${datasets.length > 1 ? 's' : ''} ready for analysis.`,
    });
  };

  const nextDataset = () => {
    setCurrentDatasetIndex((prev) => (prev + 1) % datasets.length);
  };

  const prevDataset = () => {
    setCurrentDatasetIndex((prev) => (prev - 1 + datasets.length) % datasets.length);
  };

  const suggestionChips = [
    'Show employee attrition trend',
    'Top 5 performers this quarter',
    'Department-wise salary analysis',
    'Predict high-risk employees'
  ];

  const quickInsights = [
    { label: 'Attrition Rate', value: '12.3%', color: 'bg-blue-100 text-blue-700' },
    { label: 'Avg Performance', value: '4.2', color: 'bg-green-100 text-green-700' },
    { label: 'Open Positions', value: '23', color: 'bg-orange-100 text-orange-700' },
    { label: 'Avg Tenure', value: '3.7yr', color: 'bg-purple-100 text-purple-700' },
    { label: 'Training Hours', value: '42.5', color: 'bg-teal-100 text-teal-700' },
    { label: 'Satisfaction', value: '8.1/10', color: 'bg-pink-100 text-pink-700' }
  ];

  const availableActions = [
    { name: 'Descriptive analysis', icon: BarChart3, color: 'text-blue-600' },
    { name: 'Predictive analysis', icon: TrendingUp, color: 'text-green-600' },
    { name: 'Prescriptive analysis', icon: Brain, color: 'text-purple-600' },
    { name: 'Statistical summary', icon: FileSpreadsheet, color: 'text-orange-600' },
    { name: 'Generate reports', icon: FileText, color: 'text-gray-600' },
    { name: 'Risk assessment', icon: AlertTriangle, color: 'text-red-600' },
    { name: 'Trend forecasting', icon: Target, color: 'text-indigo-600' },
    { name: 'Time series analysis', icon: Clock, color: 'text-cyan-600' }
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const currentDataset = datasets[currentDatasetIndex];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm z-50">
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
      
      <div className="flex flex-1 pt-16">
        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'mr-96' : 'mr-0'}`}>
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-2xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white ml-auto' 
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    
                    {message.attachments && (
                      <div className="mt-3 space-y-2">
                        {message.attachments.map((attachment, index) => (
                          <div key={index} className="relative">
                            {attachment.type === 'image' ? (
                              <div 
                                className="bg-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => openImagePreview(attachment.url, attachment.name)}
                              >
                                <img 
                                  src={attachment.url} 
                                  alt={attachment.name}
                                  className="w-full h-48 object-cover rounded-md bg-gray-200"
                                />
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs text-gray-600">{attachment.name}</span>
                                  <Button size="sm" variant="ghost" className="h-6 px-2">
                                    <Download className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                                <FileText className="w-4 h-4 text-gray-600" />
                                <span className="text-sm text-gray-700">{attachment.name}</span>
                                <Button size="sm" variant="ghost" className="h-6 px-2 ml-auto">
                                  <Download className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className={`flex items-center mt-2 space-x-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                    {message.type === 'assistant' && (
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-green-50">
                          <ThumbsUp className="w-3 h-3 text-gray-400 hover:text-green-600" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-red-50">
                          <ThumbsDown className="w-3 h-3 text-gray-400 hover:text-red-600" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-900 shadow-sm border border-gray-200 rounded-2xl px-4 py-3 max-w-xs">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className="px-6 py-3 border-t border-gray-200 bg-white">
            <div className="flex flex-wrap gap-2 mb-4">
              {suggestionChips.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  onClick={() => setInputValue(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>

            {/* Input Area */}
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your HR data..."
                  className="min-h-[50px] max-h-32 resize-none pr-20 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <div className="absolute right-2 bottom-2 flex space-x-1">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Paperclip className="w-4 h-4 text-gray-500" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Mic className="w-4 h-4 text-gray-500" />
                  </Button>
                </div>
              </div>
              <Button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="h-[50px] px-6 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`fixed top-16 right-0 h-full bg-white border-l border-gray-200 shadow-lg transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-96' : 'w-0'
        }`}>
          {/* Sidebar Toggle - Rounded square outside sidebar */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -left-12 top-4 h-9 w-9 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 z-50 flex items-center justify-center"
          >
            {sidebarOpen ? <ChevronRight className="w-7 h-7" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>

          {sidebarOpen && (
            <div className="flex flex-col h-full p-4 space-y-4">
              {/* Import Dataset Button */}
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setDatasetImportOpen(true)}
              >
                <Database className="w-4 h-4 mr-2" />
                Import Dataset
              </Button>

              {/* Dataset Summary Container */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Dataset Summary</h3>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={prevDataset}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </Button>
                    <span className="text-sm text-gray-500">{currentDatasetIndex + 1} / {datasets.length}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={nextDataset}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{currentDataset.name}</h4>
                    <p className="text-sm text-gray-500">{currentDataset.rows.toLocaleString()} rows • {currentDataset.columns} columns</p>
                    <p className="text-xs text-gray-400">Updated: 2 hours ago</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={currentDataset.quality === 'Good' ? 'default' : 'secondary'}
                      className={currentDataset.quality === 'Good' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}
                    >
                      {currentDataset.quality} Quality
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View Table
                    </Button>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Column Preview:</Label>
                    <div className="flex flex-wrap gap-1">
                      {currentDataset.columnPreview.slice(0, 9).map((column, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs bg-white text-gray-700 border-gray-300"
                        >
                          {column}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Available Actions Container */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h5 className="text-sm font-semibold text-gray-900 mb-3">Available Actions</h5>
                <div className="space-y-2">
                  {availableActions.map((action, index) => (
                    <Button 
                      key={index}
                      variant="ghost" 
                      size="sm" 
                      className={`w-full justify-start ${action.color} hover:bg-gray-100`}
                    >
                      <action.icon className="w-4 h-4 mr-2" />
                      {action.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quick Insights */}
              <div className="flex-1">
                <h5 className="text-sm font-semibold text-gray-900 mb-3">Quick Insights</h5>
                <div className="grid grid-cols-2 gap-3">
                  {quickInsights.map((insight, index) => (
                    <div key={index} className={`p-3 rounded-lg ${insight.color}`}>
                      <div className="text-xs font-medium">{insight.label}</div>
                      <div className="text-lg font-bold">{insight.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dataset Import Modal */}
      <DatasetImportModal
        open={datasetImportOpen}
        onOpenChange={setDatasetImportOpen}
        onImport={handleDatasetImport}
      />

      {/* Image Preview Dialog */}
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{imagePreview?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img 
              src={imagePreview?.url} 
              alt={imagePreview?.name}
              className="max-w-full max-h-[70vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Chat;
