import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Brain, Shield, Target, TrendingUp, TrendingDown, Clock } from "lucide-react";

interface Metrics {
  activeAnomalies: number;
  flProgress: number;
  privacyBudget: number;
  modelAccuracy: number;
  totalClients: number;
  onlineClients: number;
}

export function RealtimeMetrics() {
  const [metrics, setMetrics] = useState<Metrics>({
    activeAnomalies: 0,
    flProgress: 0,
    privacyBudget: 6.0,
    modelAccuracy: 0,
    totalClients: 0,
    onlineClients: 0,
  });

  const { data: initialMetrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { lastMessage } = useWebSocket("/ws");

  useEffect(() => {
    if (initialMetrics) {
      setMetrics(prev => ({ ...prev, ...initialMetrics }));
    }
  }, [initialMetrics]);

  useEffect(() => {
    if (lastMessage?.type === 'metrics_update') {
      setMetrics(lastMessage.data);
    }
  }, [lastMessage]);

  const formatTrend = (value: number, isGood: boolean) => {
    const Icon = isGood ? TrendingUp : TrendingDown;
    const color = isGood ? "text-cyber-green" : "text-cyber-red";
    return (
      <div className="flex items-center space-x-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className={`text-sm ${color}`}>
          {isGood ? "+" : ""}{value}% from last hour
        </span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Active Anomalies */}
      <Card className="glass-morphism hover:border-cyber-blue/30 transition-all animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active Anomalies</p>
              <p className="text-3xl font-bold text-cyber-red animate-counter">
                {metrics.activeAnomalies}
              </p>
            </div>
            <div className="w-12 h-12 bg-cyber-red/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-cyber-red" />
            </div>
          </div>
          <div className="mt-4">
            {formatTrend(12, false)}
          </div>
        </CardContent>
      </Card>

      {/* FL Round Progress */}
      <Card className="glass-morphism hover:border-cyber-blue/30 transition-all animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">FL Round Progress</p>
              <p className="text-3xl font-bold text-cyber-blue animate-counter">
                {metrics.flProgress}%
              </p>
            </div>
            <div className="w-12 h-12 bg-cyber-blue/20 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-cyber-blue" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">
              {metrics.onlineClients}/{metrics.totalClients} clients active
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Budget */}
      <Card className="glass-morphism hover:border-cyber-blue/30 transition-all animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Privacy Budget (ε)</p>
              <p className="text-3xl font-bold text-cyber-amber animate-counter">
                {metrics.privacyBudget.toFixed(1)}
              </p>
            </div>
            <div className="w-12 h-12 bg-cyber-amber/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-cyber-amber" />
            </div>
          </div>
          <div className="mt-4">
            {formatTrend(5, true)}
          </div>
        </CardContent>
      </Card>

      {/* Model Accuracy */}
      <Card className="glass-morphism hover:border-cyber-blue/30 transition-all animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Model Accuracy</p>
              <p className="text-3xl font-bold text-cyber-green animate-counter">
                {(metrics.modelAccuracy * 100).toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-cyber-green/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-cyber-green" />
            </div>
          </div>
          <div className="mt-4">
            {formatTrend(2.3, true)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
