import { RealtimeMetrics } from '@/components/RealtimeMetrics';
import { FederatedLearning } from '@/components/FederatedLearning';
import { AnomalyList } from '@/components/AnomalyList';
import { EdgeClientsList } from '@/components/EdgeClientsList';
import { PrivacyControls } from '@/components/PrivacyControls';
import { FileUpload } from '@/components/FileUpload';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, Shield, Users, Database, TrendingUp, AlertTriangle, Zap, Brain, Eye, Menu } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/Sidebar";

export function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { data: dashboardMetrics, error, isLoading } = useQuery({
    queryKey: ['status'],
    queryFn: async () => {
      const response = await fetch('/api/status');
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    },
    refetchInterval: 5000,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-purple-900">
      {/* Mobile Header */}
      <div className="md:hidden bg-white/80 backdrop-blur-xl border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 gradient-bg rounded-xl flex items-center justify-center shadow-lg">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg gradient-text">IntelliGuard</h2>
            <p className="text-xs text-muted-foreground">AI Security</p>
          </div>
        </div>
        
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <div className="h-full bg-white/95 backdrop-blur-xl">
              <Sidebar />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="responsive-container">
        <div className="py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8 animate-fade-in">
          {/* Hero Section */}
          <div className="mobile-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold gradient-text mb-3 sm:mb-4 animate-slide-up">
              Intelligence Hub
            </h1>
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-4xl mx-auto animate-slide-up" style={{animationDelay: '0.1s'}}>
              Real-time federated learning insights and privacy-preserving surveillance analytics
            </p>
          </div>

          {/* Enhanced Metrics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <Card className="relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-xl shadow-red-500/10 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-500 hover:scale-[1.02] group animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5"></div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <div>
                  <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">Active Threats</CardTitle>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-600 dark:text-red-400 animate-bounce-in">
                    {dashboardMetrics?.security?.recentAnomalies || 0}
                  </div>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0 relative z-10">
                <div className="flex items-center space-x-3">
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs font-medium px-2 py-1 rounded-full">
                    +2 new
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">last hour</span>
                </div>
                <div className="mt-3 w-full bg-red-100 dark:bg-red-900/20 rounded-full h-2">
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.02] group animate-scale-in" style={{animationDelay: '0.1s'}}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <div>
                  <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">Learning Progress</CardTitle>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400 animate-bounce-in">
                    {dashboardMetrics?.fl?.currentRound ? 85 : 0}%
                  </div>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0 relative z-10">
                <div className="space-y-3">
                  <Progress
                    value={dashboardMetrics?.fl?.currentRound ? 85 : 0}
                    className="h-3 bg-blue-100 dark:bg-blue-900/20 rounded-full overflow-hidden"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Round {dashboardMetrics?.fl?.currentRound || 0} in progress</span>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium px-2 py-1 rounded-full">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-xl shadow-green-500/10 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-500 hover:scale-[1.02] group animate-scale-in" style={{animationDelay: '0.2s'}}>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <div>
                  <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">Active Nodes</CardTitle>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400 animate-bounce-in">
                    {dashboardMetrics?.devices?.online || 0}
                  </div>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" style={{animationDelay: '0.5s'}}></div>
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" style={{animationDelay: '1s'}}></div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium px-2 py-1 rounded-full">
                    Healthy
                  </Badge>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">all systems operational</span>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-xl shadow-purple-500/10 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-[1.02] group animate-scale-in" style={{animationDelay: '0.3s'}}>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <div>
                  <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">Privacy Shield</CardTitle>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-bounce-in">
                    {Math.round((dashboardMetrics?.security?.privacyBudgetRemaining || 4.2) / 6.0 * 100)}%
                  </div>
                </div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0 relative z-10">
                <div className="space-y-3">
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                    Maximum Security
                  </Badge>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Differential privacy enabled</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Grid - Better responsive layout */}
          <div className="responsive-grid responsive-grid-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* Federated Learning Panel */}
            <div className="xl:col-span-2 space-y-6">
              <FederatedLearning />
            </div>

            {/* Recent Anomalies */}
            <div className="xl:col-span-1">
              <AnomalyList />
            </div>
          </div>

          {/* Bottom Section - Improved layout */}
          <div className="responsive-grid responsive-grid-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Edge Clients Status */}
            <EdgeClientsList />

            {/* Privacy Controls */}
            <PrivacyControls />
          </div>

          {/* File Upload Area */}
          <FileUpload />
        </div>
      </div>
    </div>
  );
}