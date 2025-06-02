import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  MessageSquare,
  Upload,
  Building2,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  const navigationCards = [
    {
      id: "dashboard",
      title: "Dashboard",
      description: "Explore employee attrition and workforce analytics",
      icon: BarChart3,
      path: "/dashboard",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      id: "chat",
      title: "Chat",
      description: "Talk to your data assistant for insights and predictions",
      icon: MessageSquare,
      path: "/chat",
      gradient: "from-green-500 to-green-600",
    },
    {
      id: "upload",
      title: "Upload",
      description: "Manage and upload your HR datasets with ease",
      icon: Upload,
      path: "/upload",
      gradient: "from-purple-500 to-purple-600",
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">HR Insights</h1>
            </div>

            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-gray-900"
              >
                Home
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/chat")}
                className="text-gray-600 hover:text-gray-900"
              >
                Chat
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/upload")}
                className="text-gray-600 hover:text-gray-900"
              >
                Upload
              </Button>
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-gray-900"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HR Insights
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock the power of AI-driven HR analytics. Explore workforce
            trends, predict attrition, and make data-driven decisions with ease.
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {navigationCards.map((card) => (
            <Card
              key={card.id}
              className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-0 bg-white/60 backdrop-blur-sm"
              onClick={() => handleNavigation(card.path)}
            >
              <CardContent className="p-8 text-center">
                <div
                  className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${card.gradient} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}
                >
                  <card.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
                  {card.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Real-time Analytics
            </h4>
            <p className="text-sm text-gray-600">
              Monitor workforce metrics in real-time with interactive dashboards
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">AI Assistant</h4>
            <p className="text-sm text-gray-600">
              Chat with your data and get instant insights and predictions
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Easy Upload</h4>
            <p className="text-sm text-gray-600">
              Seamlessly upload and manage your HR datasets
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-orange-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Enterprise Ready
            </h4>
            <p className="text-sm text-gray-600">
              Scalable solution designed for organizations of all sizes
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-24">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">HR Insights</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900 transition-colors">
                Documentation
              </a>
              <a href="#" className="hover:text-gray-900 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-gray-900 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Help Button */}
      <Button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300"
        size="icon"
      >
        <HelpCircle className="w-6 h-6 text-white" />
      </Button>
    </div>
  );
};

export default Landing;
