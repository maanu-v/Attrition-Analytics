import React, { useState, useRef, useEffect } from 'react';
import { Send, RotateCcw, ChevronRight, ChevronLeft, Settings, BotMessageSquare, Eye, BarChart3, Brain, AlertTriangle, FileSpreadsheet, Target, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import NavHeader from '@/components/layout/NavHeader';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  sendChatMessage, 
  resetChatConversation, 
  fetchDatasetMetadata, 
  fetchQuickInsights,
  DatasetMetadata,
  QuickInsights 
} from '@/services/api';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  plotImage?: string; // Optional base64 encoded image
}

interface AnalysisAction {
  name: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const Chat = () => {
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I can help you analyze HR data and provide insights on employee performance, attrition, and demographics. What would you like to know?',
      timestamp: new Date(),
    }
  ]);
  
  // Sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [datasetMetadata, setDatasetMetadata] = useState<DatasetMetadata | null>(null);
  const [quickInsights, setQuickInsights] = useState<QuickInsights | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<string | null>(null);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Fetch dataset metadata and quick insights
  useEffect(() => {
    const fetchMetadata = async () => {
      setIsLoadingMetadata(true);
      try {
        const metadata = await fetchDatasetMetadata();
        setDatasetMetadata(metadata);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch dataset metadata",
          variant: "destructive"
        });
      } finally {
        setIsLoadingMetadata(false);
      }
    };
    
    const fetchInsights = async () => {
      setIsLoadingInsights(true);
      try {
        const insights = await fetchQuickInsights();
        setQuickInsights(insights);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch quick insights",
          variant: "destructive"
        });
      } finally {
        setIsLoadingInsights(false);
      }
    };
    
    fetchMetadata();
    fetchInsights();
  }, [toast]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Add selected analysis type to the message if selected
    const messageText = selectedAnalysisType 
      ? `[${selectedAnalysisType} Analysis] ${inputValue.trim()}`
      : inputValue.trim();

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setSelectedAnalysisType(null);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(messageText);
      
      if (response.status === 'success') {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response.response,
          timestamp: new Date(),
          plotImage: response.plot_image, // Add the plot image if available
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Handle structured error response
        const errorMsg = response.response || 'Failed to get response';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Chat API error:', error);
      
      let errorMessage = "Failed to process your request";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object') {
        // Handle fetch or Axios error objects
        if ('statusText' in error) {
          errorMessage = `Server error: ${(error as any).statusText || 'Unknown error'}`;
        }
        if ('status' in error) {
          const status = (error as any).status;
          if (status === 400) {
            errorMessage = `Bad Request (400): The server couldn't process your request. Please try again with different input.`;
          } else if (status === 401) {
            errorMessage = `Authentication Error (401): Please log in again.`;
          } else if (status === 403) {
            errorMessage = `Permission Denied (403): You don't have access to this feature.`;
          } else if (status === 404) {
            errorMessage = `Not Found (404): The requested resource was not found.`;
          } else if (status === 429) {
            errorMessage = `Too Many Requests (429): Please wait before sending more requests.`;
          } else if (status >= 500) {
            errorMessage = `Server Error (${status}): The server encountered an issue. Please try again later.`;
          }
        }
        // Try to extract more detailed error message from response
        if ('response' in error && (error as any).response && 'data' in (error as any).response) {
          const responseData = (error as any).response.data;
          if (typeof responseData === 'string') {
            errorMessage = responseData || errorMessage;
          } else if (typeof responseData === 'object') {
            // Extract error message from response data object
            if (responseData.error) errorMessage = responseData.error;
            else if (responseData.message) errorMessage = responseData.message;
            else if (responseData.detail) errorMessage = responseData.detail;
          }
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I'm sorry, I encountered an error processing your request: ${errorMessage}`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = async () => {
    try {
      await resetChatConversation();
      
      setMessages([{
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Hello! I can help you analyze HR data and provide insights on employee performance, attrition, and demographics. What would you like to know?',
        timestamp: new Date(),
      }]);
      
      toast({
        title: "Chat Reset",
        description: "The conversation has been reset."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset the conversation",
        variant: "destructive"
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  const analysisTypes: AnalysisAction[] = [
    { 
      name: 'Descriptive', 
      icon: BarChart3, 
      color: 'text-blue-500 hover:bg-blue-50',
      description: 'Summarize data patterns and current state'
    },
    { 
      name: 'Diagnostic', 
      icon: FileSpreadsheet, 
      color: 'text-orange-500 hover:bg-orange-50',
      description: 'Uncover why patterns exist in the data'
    },
    { 
      name: 'Predictive', 
      icon: TrendingUp, 
      color: 'text-emerald-500 hover:bg-emerald-50',
      description: 'Forecast future trends based on data'
    },
    { 
      name: 'Prescriptive', 
      icon: Brain, 
      color: 'text-purple-500 hover:bg-purple-50',
      description: 'Recommend actions based on insights'
    },
    { 
      name: 'Risk', 
      icon: AlertTriangle, 
      color: 'text-red-500 hover:bg-red-50',
      description: 'Identify potential attrition risks'
    },
    { 
      name: 'Trend', 
      icon: Target, 
      color: 'text-indigo-500 hover:bg-indigo-50',
      description: 'Analyze patterns over time periods'
    }
  ];

  const getBrightColor = (analysisName: string) => {
    const colors: Record<string, string> = {
      'Descriptive': 'bg-gradient-to-r from-blue-400/90 to-blue-500/90 text-white',
      'Diagnostic': 'bg-gradient-to-r from-orange-400/90 to-orange-500/90 text-white',
      'Predictive': 'bg-gradient-to-r from-emerald-400/90 to-emerald-500/90 text-white',
      'Prescriptive': 'bg-gradient-to-r from-purple-400/90 to-purple-500/90 text-white',
      'Risk': 'bg-gradient-to-r from-red-400/90 to-red-500/90 text-white',
      'Trend': 'bg-gradient-to-r from-indigo-400/90 to-indigo-500/90 text-white'
    };
    return colors[analysisName] || 'bg-gradient-to-r from-gray-400/90 to-gray-500/90 text-white';
  };

  const suggestedQueries = [
    "What factors contribute most to employee attrition?",
    "Compare attrition rates across departments",
    "Predict which employees are at highest risk of leaving",
    "How does job satisfaction affect attrition?",
    "Recommend actions to reduce attrition in sales"
  ];    // Render formatted message content with proper styling
  const renderMessageContent = (content: string, messageType: 'user' | 'assistant') => {
    // Only apply markdown formatting to assistant messages
    if (messageType === 'user') {
      return <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>;
    }
    
    return (
      <div className="markdown-content text-sm leading-relaxed">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            // Style headings
            h1: ({ node, ...props }) => <h1 className="text-lg font-bold my-2" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-base font-bold my-2" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-sm font-bold my-1" {...props} />,
            
            // Style lists
            ul: ({ node, ...props }) => <ul className="list-disc pl-4 my-2" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 my-2" {...props} />,
            li: ({ node, ...props }) => <li className="my-1" {...props} />,
            
            // Style emphasis
            strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
            em: ({ node, ...props }) => <em className="italic" {...props} />,
            
            // Style code blocks
            code: ({ node, inline, className, children, ...props }: {
              node?: any;
              inline?: boolean;
              className?: string;
              children?: React.ReactNode;
            } & React.HTMLAttributes<HTMLElement>) => {
              if (inline) {
                return <code className="bg-gray-100 px-1 rounded text-sm font-mono" {...props}>{children}</code>;
              }
              return (
                <pre className="bg-gray-100 p-2 rounded text-sm font-mono overflow-x-auto my-2">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              );
            },
            
            // Style paragraphs and other elements
            p: ({ node, ...props }) => <p className="my-2" {...props} />,
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props} />
            ),
            hr: ({ node, ...props }) => <hr className="my-4 border-t border-gray-300" {...props} />,
            a: ({ node, ...props }) => (
              <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
            ),
            
            // Style tables
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-2">
                <table className="min-w-full border-collapse border border-gray-300" {...props} />
              </div>
            ),
            thead: ({ node, ...props }) => <thead className="bg-gray-100" {...props} />,
            tbody: ({ node, ...props }) => <tbody {...props} />,
            tr: ({ node, ...props }) => <tr className="border-b border-gray-300" {...props} />,
            th: ({ node, ...props }) => <th className="border border-gray-300 px-3 py-1 text-left font-medium" {...props} />,
            td: ({ node, ...props }) => <td className="border border-gray-300 px-3 py-1" {...props} />
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Fixed NavHeader */}
      <div className="sticky top-0 z-50">
        <NavHeader />
      </div>
      
      {/* Main content area with action buttons in top-right */}
      <div className="flex flex-1 h-[calc(100vh-64px)]">
        {/* Chat Area */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'mr-80' : 'mr-0'}`}>
          {/* Fixed Chat header */}
          <div className="sticky top-0 z-40 flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <BotMessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">HR Analytics Assistant</h2>
                <p className="text-sm text-gray-500">AI-powered insights for HR data</p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleResetChat}
              disabled={isLoading || messages.length <= 1}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Chat
            </Button>
          </div>
          
          {/* Chat Messages - Adjusted for fixed header */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Show all messages including the first welcome message */}
            {messages.map((message, index) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-2xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}>
                    {renderMessageContent(message.content, message.type)}
                    
                    {/* Display plot image if available */}
                    {message.type === 'assistant' && message.plotImage && (
                      <div className="mt-3 flex justify-center">
                        <img 
                          src={`data:image/png;base64,${message.plotImage}`} 
                          alt="Data Visualization"
                          className="max-w-full rounded-lg border border-gray-200 shadow-sm"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className={`flex items-center mt-2 space-x-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
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

          {/* Suggested Queries and Input Area - Fixed to bottom */}
          <div className="sticky bottom-0 z-30 px-6 py-3 border-t border-gray-200 bg-white">
            {/* Suggested Queries */}
            <div className="flex flex-wrap gap-2 mb-4">
              {suggestedQueries.map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  onClick={() => setInputValue(query)}
                >
                  {query}
                </Button>
              ))}
            </div>

            {/* Input Area */}
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <div className="relative">
                  {selectedAnalysisType && (
                    <div className="absolute left-2.5 top-[10px] inline-flex items-center px-2 py-1 rounded text-xs font-medium shadow-sm z-10">
                      <span className={`px-2 py-0.5 rounded-full ${getBrightColor(selectedAnalysisType)}`}>
                        {selectedAnalysisType} Analysis
                        <button 
                          className="ml-1 text-white opacity-80 hover:opacity-100"
                          onClick={() => setSelectedAnalysisType(null)}
                        >
                          ×
                        </button>
                      </span>
                    </div>
                  )}
                  <Textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about HR analytics, attrition factors, employee performance..."
                    className={`min-h-[50px] max-h-32 resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${selectedAnalysisType ? 'pl-32' : 'pl-3'}`}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="h-[59px] px-6 bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar - adjusted to account for fixed navbar */}
        <div className={`fixed top-[64px] right-0 h-[calc(100vh-64px)] bg-white border-l border-gray-200 shadow-lg transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-80' : 'w-0'
        }`}>
          {/* Sidebar Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -left-10 top-4 h-8 w-8 rounded-full flex items-center justify-center border border-gray-200 bg-white shadow-sm hover:bg-gray-50 p-0"
          >
            {sidebarOpen ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </Button>

          {sidebarOpen && (
            <div className="h-full overflow-y-auto p-4 space-y-4">
              {/* Sidebar Title */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">AI Assistant Tools</h3>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              {/* Dataset Information */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Dataset Information</h3>
                
                {isLoadingMetadata ? (
                  <div className="flex justify-center items-center h-24">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                ) : datasetMetadata ? (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{datasetMetadata.name}</h4>
                      <p className="text-sm text-gray-500">
                        {datasetMetadata.rows.toLocaleString()} rows • {datasetMetadata.columns} columns
                      </p>
                      <p className="text-xs text-gray-400">
                        Updated: {formatTimestamp(datasetMetadata.last_updated)}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={datasetMetadata.quality.rating === 'Good' ? 'default' : 'secondary'}
                        className={
                          datasetMetadata.quality.rating === 'Good' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : datasetMetadata.quality.rating === 'Fair'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                        }
                      >
                        {datasetMetadata.quality.rating} Quality
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View Data
                      </Button>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Column Preview:</Label>
                      <div className="flex flex-wrap gap-1">
                        {datasetMetadata.column_list.slice(0, 9).map((column, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-white text-gray-700 border-gray-300"
                          >
                            {column}
                          </Badge>
                        ))}
                        {datasetMetadata.column_list.length > 9 && (
                          <Badge variant="outline" className="text-xs bg-white text-gray-500 border-gray-300">
                            +{datasetMetadata.column_list.length - 9} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No dataset information available
                  </div>
                )}
              </div>

              {/* Quick Insights */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Quick Insights</h3>
                
                {isLoadingInsights ? (
                  <div className="flex justify-center items-center h-24">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                ) : quickInsights ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-blue-100 text-blue-700">
                      <div className="text-xs font-medium">Attrition Rate</div>
                      <div className="text-lg font-bold">{quickInsights.attrition_rate.toFixed(1)}%</div>
                    </div>
                    <div className="p-3 rounded-lg bg-green-100 text-green-700">
                      <div className="text-xs font-medium">Avg Job Satisfaction</div>
                      <div className="text-lg font-bold">{quickInsights.avg_satisfaction.toFixed(1)}/4</div>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-100 text-orange-700">
                      <div className="text-xs font-medium">Avg Tenure</div>
                      <div className="text-lg font-bold">{quickInsights.avg_years.toFixed(1)} yrs</div>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-100 text-purple-700">
                      <div className="text-xs font-medium">Avg Age</div>
                      <div className="text-lg font-bold">{quickInsights.avg_age.toFixed(1)} yrs</div>
                    </div>
                    <div className="p-3 rounded-lg bg-teal-100 text-teal-700">
                      <div className="text-xs font-medium">Top Department</div>
                      <div className="text-lg font-bold truncate">{quickInsights.top_department}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-pink-100 text-pink-700">
                      <div className="text-xs font-medium">Overtime</div>
                      <div className="text-lg font-bold">{quickInsights.overtime_percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No insights available
                  </div>
                )}
              </div>

              {/* Analysis Types */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Analysis Types</h3>
                <div className="space-y-2">
                  {analysisTypes.map((analysis, index) => (
                    <div 
                      key={index}
                      className={`p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedAnalysisType === analysis.name
                          ? getBrightColor(analysis.name)
                          : `bg-white hover:bg-gray-50 ${analysis.color}`
                      }`}
                      onClick={() => setSelectedAnalysisType(analysis.name)}
                    >
                      <div className="flex items-center">
                        <analysis.icon className={`w-5 h-5 mr-2 ${
                          selectedAnalysisType === analysis.name ? 'text-white' : ''
                        }`} />
                        <div>
                          <div className={`font-medium ${
                            selectedAnalysisType === analysis.name ? 'text-white' : ''
                          }`}>
                            {analysis.name} Analysis
                          </div>
                          <p className={`text-xs ${
                            selectedAnalysisType === analysis.name ? 'text-white/80' : 'text-gray-500'
                          }`}>
                            {analysis.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
