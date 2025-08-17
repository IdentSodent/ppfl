import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { FederatedLearning } from "@/components/FederatedLearning";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useTheme } from "@/components/ThemeProvider";
import { 
  Moon, 
  Sun, 
  CheckCircle, 
  Crosshair, 
  Search, 
  Brain, 
  TrendingUp, 
  Users,
  Shield,
  Lock,
  Eye,
  Server,
  ArrowRight
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";

export default function Dashboard() {
  const { theme, setTheme } = useTheme();
  const [systemMetrics, setSystemMetrics] = useState({
    accuracy: 0.947,
    precision: 0.912,
    recall: 0.895,
    cpuUsage: 12.3,
    memoryUsage: 4.2,
    networkStatus: 'stable'
  });

  const { data: status } = useQuery({
    queryKey: ["/api/status"],
  });

  const { data: recentAnomalies = [] } = useQuery({
    queryKey: ["/api/anomalies"],
  });

  const { lastMessage, isConnected } = useWebSocket("/ws");

  // Update metrics from WebSocket
  useEffect(() => {
    if (lastMessage?.type === 'system_metrics_update') {
      setSystemMetrics(lastMessage.data.metrics);
    }
  }, [lastMessage]);

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="flex h-screen overflow-hidden" data-testid="dashboard-page">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <header className="glass-morphism border-b border-slate-700/50 p-6" data-testid="dashboard-header">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Enhanced Dashboard</h2>
              <p className="text-slate-400">Privacy-Preserving Federated Learning Surveillance System</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <div className="flex items-center space-x-2 px-3 py-2 glass-morphism rounded-lg">
                {theme === "dark" ? (
                  <Moon className="w-4 h-4 text-cyber-blue" />
                ) : (
                  <Sun className="w-4 h-4 text-cyber-amber" />
                )}
                <span className="text-sm text-cyber-blue">Dark Mode</span>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={handleThemeToggle}
                  data-testid="theme-toggle"
                />
              </div>
              
              {/* Live Updates Indicator */}
              <div className="flex items-center space-x-2 px-3 py-2 glass-morphism rounded-lg">
                <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-cyber-green' : 'bg-cyber-red'}`} />
                <span className={`text-sm ${isConnected ? 'text-cyber-green' : 'text-cyber-red'}`}>
                  {isConnected ? 'Live Updates' : 'Disconnected'}
                </span>
              </div>
              
              {/* System Status */}
              <div className="flex items-center space-x-2 px-3 py-2 glass-morphism rounded-lg">
                <Server className="w-4 h-4 text-cyber-amber" />
                <span className="text-sm font-mono text-cyber-amber" data-testid="cpu-usage">
                  {systemMetrics.cpuUsage.toFixed(1)}% CPU
                </span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Real-time Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Model Accuracy Card */}
            <Card className="glass-morphism glow-green" data-testid="accuracy-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Model Accuracy</p>
                    <p className="text-3xl font-bold text-cyber-green" data-testid="accuracy-value">
                      {(systemMetrics.accuracy * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-cyber-green">+2.3% vs last round</p>
                  </div>
                  <div className="w-12 h-12 bg-cyber-green/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-cyber-green text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Precision Card */}
            <Card className="glass-morphism glow-blue" data-testid="precision-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Precision</p>
                    <p className="text-3xl font-bold text-cyber-blue" data-testid="precision-value">
                      {(systemMetrics.precision * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-cyber-blue">+1.8% this session</p>
                  </div>
                  <div className="w-12 h-12 bg-cyber-blue/20 rounded-lg flex items-center justify-center">
                    <Crosshair className="text-cyber-blue text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Recall Card */}
            <Card className="glass-morphism glow-amber" data-testid="recall-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Recall</p>
                    <p className="text-3xl font-bold text-cyber-amber" data-testid="recall-value">
                      {(systemMetrics.recall * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-cyber-amber">+0.9% improvement</p>
                  </div>
                  <div className="w-12 h-12 bg-cyber-amber/20 rounded-lg flex items-center justify-center">
                    <Search className="text-cyber-amber text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Federated Learning Component */}
          <FederatedLearning />
          
          {/* Live Monitoring Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Status Overview */}
            <Card className="glass-morphism" data-testid="device-status-card">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">Device Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Device Status Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Online Devices</span>
                        <span className="font-mono text-cyber-green text-lg" data-testid="online-devices">
                          {status?.devices?.online || 127}
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-800/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Participating</span>
                        <span className="font-mono text-cyber-blue text-lg" data-testid="participating-devices">
                          {status?.devices?.participating || 98}
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-800/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Failed</span>
                        <span className="font-mono text-cyber-red text-lg" data-testid="failed-devices">
                          {status?.devices?.offline || 2}
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-800/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Idle</span>
                        <span className="font-mono text-cyber-amber text-lg" data-testid="idle-devices">
                          {(status?.devices?.total || 127) - (status?.devices?.online || 127)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Budget Status */}
            <Card className="glass-morphism" data-testid="privacy-budget-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">Privacy & Security Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Privacy Budget */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400">Privacy Budget (ε)</span>
                    <span className="font-mono text-cyber-green text-xl" data-testid="privacy-budget">
                      {status?.security?.privacyBudgetRemaining || 4.2}
                    </span>
                  </div>
                  <Progress value={70} className="h-3 mb-2" />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>30% used</span>
                    <span>Excellent status</span>
                  </div>
                </div>

                {/* Security Features */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-cyber-green" />
                      <span className="text-sm text-white">Secure Aggregation</span>
                    </div>
                    <Badge variant="outline" className="text-cyber-green border-cyber-green/30">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-cyber-blue" />
                      <span className="text-sm text-white">Homomorphic Encryption</span>
                    </div>
                    <Badge variant="outline" className="text-cyber-blue border-cyber-blue/30">
                      Enabled
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-cyber-amber" />
                      <span className="text-sm text-white">Tamper Detection</span>
                    </div>
                    <Badge variant="outline" className="text-cyber-amber border-cyber-amber/30">
                      Monitoring
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Anomalies Preview */}
          <Card className="glass-morphism" data-testid="recent-anomalies-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-white">Recent Anomaly Detections</CardTitle>
                <Link 
                  href="/timeline" 
                  className="text-cyber-blue hover:text-cyber-blue/80 text-sm transition-colors"
                  data-testid="view-all-anomalies"
                >
                  View All <ArrowRight className="w-4 h-4 ml-1 inline" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentAnomalies.slice(0, 3).map((anomaly: any) => (
                  <div 
                    key={anomaly.id}
                    className={`bg-slate-800/30 rounded-lg p-4 border ${
                      anomaly.severity === 'high' ? 'border-cyber-red/20' :
                      anomaly.severity === 'medium' ? 'border-cyber-amber/20' : 
                      'border-cyber-blue/20'
                    }`}
                    data-testid={`anomaly-card-${anomaly.id}`}
                  >
                    <div className="flex items-start space-x-3">
                      {anomaly.imageUrl && (
                        <img 
                          src={anomaly.imageUrl} 
                          alt="Anomaly detection thumbnail" 
                          className="w-16 h-12 rounded object-cover border border-slate-600" 
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-white">{anomaly.type.replace('_', ' ')}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              anomaly.severity === 'high' ? 'bg-cyber-red/20 text-cyber-red' :
                              anomaly.severity === 'medium' ? 'bg-cyber-amber/20 text-cyber-amber' :
                              'bg-cyber-blue/20 text-cyber-blue'
                            }`}
                          >
                            {anomaly.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400">{anomaly.description}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(anomaly.detectedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* WebSocket Status Indicator */}
      <div className="fixed bottom-4 right-4 glass-morphism rounded-lg px-4 py-2 flex items-center space-x-2" data-testid="websocket-status">
        <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-cyber-green' : 'bg-cyber-red'}`} />
        <span className={`text-xs ${isConnected ? 'text-cyber-green' : 'text-cyber-red'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
        <span className="text-xs text-slate-400 font-mono">
          {status?.devices?.total || 127} devices
        </span>
      </div>
    </div>
  );
}
