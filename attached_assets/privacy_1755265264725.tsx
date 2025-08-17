import { Sidebar } from "@/components/Sidebar";
import { PrivacyControls } from "@/components/PrivacyControls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useEffect, useState } from "react";
import { Shield, ShieldCheck, AlertTriangle, Settings, Lock, Eye, Activity } from "lucide-react";

interface PrivacyMetric {
  id: string;
  epsilon: number;
  delta: number;
  budgetUsed: number;
  budgetRemaining: number;
  mechanism: string;
  recordedAt: string;
}

export default function PrivacyPage() {
  const [privacyMetrics, setPrivacyMetrics] = useState<PrivacyMetric[]>([]);

  const { data: initialMetrics } = useQuery<PrivacyMetric[]>({
    queryKey: ["/api/privacy/metrics"],
  });

  const { lastMessage } = useWebSocket("/ws");

  useEffect(() => {
    if (initialMetrics && Array.isArray(initialMetrics)) {
      setPrivacyMetrics(initialMetrics);
    }
  }, [initialMetrics]);

  const latestMetrics = privacyMetrics[0];
  const totalBudget = latestMetrics ? (latestMetrics.budgetUsed + latestMetrics.budgetRemaining) : 6.0;
  const budgetPercentage = latestMetrics ? Math.round((latestMetrics.budgetUsed / totalBudget) * 100) : 0;

  const getBudgetStatus = () => {
    if (budgetPercentage < 50) return { color: 'cyber-green', status: 'Excellent' };
    if (budgetPercentage < 75) return { color: 'cyber-amber', status: 'Good' };
    return { color: 'cyber-red', status: 'Critical' };
  };

  const budgetStatus = getBudgetStatus();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="glass-morphism border-b border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Privacy & Security Center</h2>
              <p className="text-slate-400">Monitor differential privacy budgets and security measures</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 glass-morphism rounded-lg">
                <ShieldCheck className="w-4 h-4 text-cyber-green" />
                <span className="text-sm font-mono text-cyber-green">Systems Secure</span>
              </div>
              <Button className="bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-600/50">
                <Settings className="w-4 h-4 mr-2" />
                Configure Privacy
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Privacy Budget Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-morphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Privacy Budget (ε)</p>
                    <p className="text-3xl font-bold text-cyber-amber">
                      {latestMetrics?.budgetRemaining.toFixed(1) || '6.0'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-cyber-amber/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-cyber-amber" />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-slate-500">
                    {budgetPercentage}% consumed • {budgetStatus.status}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-morphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Delta (δ)</p>
                    <p className="text-3xl font-bold text-cyber-blue">
                      {latestMetrics?.delta.toExponential(0) || '1e-5'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-cyber-blue/20 rounded-lg flex items-center justify-center">
                    <Lock className="w-6 h-6 text-cyber-blue" />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-slate-500">Privacy parameter</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-morphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Mechanism</p>
                    <p className="text-2xl font-bold text-cyber-green">
                      {latestMetrics?.mechanism || 'Gaussian'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-cyber-green/20 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-cyber-green" />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-slate-500">Noise injection method</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-morphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Privacy Violations</p>
                    <p className="text-3xl font-bold text-cyber-green">0</p>
                  </div>
                  <div className="w-12 h-12 bg-cyber-green/20 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-cyber-green" />
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-slate-500">All time record</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Privacy Budget Details */}
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">Privacy Budget Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Budget Progress */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Current Budget Usage</span>
                  <span className="font-mono text-white">
                    {latestMetrics ? `${latestMetrics.budgetUsed.toFixed(2)} / ${totalBudget.toFixed(1)}` : '0.0 / 6.0'}
                  </span>
                </div>
                <Progress 
                  value={budgetPercentage} 
                  className="w-full h-3"
                  style={{
                    backgroundColor: 'rgba(71, 85, 105, 0.3)',
                    '--progress-foreground': budgetPercentage < 50 ? 'var(--cyber-green)' : 
                                           budgetPercentage < 75 ? 'var(--cyber-amber)' : 'var(--cyber-red)'
                  } as any}
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">0%</span>
                  <span className={`text-${budgetStatus.color} font-medium`}>{budgetStatus.status}</span>
                  <span className="text-slate-500">100%</span>
                </div>
              </div>

              {/* Budget Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Remaining Budget</span>
                    <span className="font-mono text-cyber-green text-lg">
                      {latestMetrics?.budgetRemaining.toFixed(2) || '6.00'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Available for future rounds</p>
                </div>
                
                <div className="bg-slate-800/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Used This Session</span>
                    <span className="font-mono text-cyber-amber text-lg">
                      {latestMetrics?.budgetUsed.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Consumed across FL rounds</p>
                </div>
                
                <div className="bg-slate-800/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Rounds Completed</span>
                    <span className="font-mono text-cyber-blue text-lg">
                      {privacyMetrics.length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Training iterations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Controls */}
          <PrivacyControls />

          {/* Privacy History */}
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">Privacy Metrics History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {privacyMetrics.slice(0, 10).map((metric, index) => (
                  <div 
                    key={metric.id}
                    className="flex items-center justify-between bg-slate-800/30 rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-cyber-amber/20 rounded-lg flex items-center justify-center">
                        <span className="text-cyber-amber font-mono text-sm">{privacyMetrics.length - index}</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-white">Privacy Round {privacyMetrics.length - index}</span>
                          <Badge variant="outline" className="text-xs border-cyber-blue text-cyber-blue">
                            {metric.mechanism}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400">
                          δ = {metric.delta.toExponential(0)} • {new Date(metric.recordedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-mono text-cyber-amber">
                        ε = {metric.epsilon.toFixed(3)}
                      </p>
                      <p className="text-xs text-slate-400">
                        Budget used: {metric.budgetUsed.toFixed(3)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Alerts */}
          <Card className="glass-morphism border-cyber-green/20">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-cyber-green" />
                <CardTitle className="text-xl font-semibold text-white">Security Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between bg-slate-800/30 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
                    <span className="text-white">Secure Aggregation</span>
                  </div>
                  <Badge variant="outline" className="border-cyber-green text-cyber-green bg-cyber-green/20">
                    ACTIVE
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between bg-slate-800/30 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
                    <span className="text-white">mTLS Protection</span>
                  </div>
                  <Badge variant="outline" className="border-cyber-green text-cyber-green bg-cyber-green/20">
                    ENABLED
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between bg-slate-800/30 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
                    <span className="text-white">Client Attestation</span>
                  </div>
                  <Badge variant="outline" className="border-cyber-green text-cyber-green bg-cyber-green/20">
                    VERIFIED
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between bg-slate-800/30 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
                    <span className="text-white">Anomaly Detection</span>
                  </div>
                  <Badge variant="outline" className="border-cyber-green text-cyber-green bg-cyber-green/20">
                    MONITORING
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}