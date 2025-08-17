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
    queryKey: ["/api/status"],
    queryFn: async () => {
      const response = await fetch("/api/status");
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    },
  });

  const { lastMessage } = useWebSocket("/ws");

  useEffect(() => {
    if (initialMetrics) {
      setMetrics(prev => ({ 
        ...prev, 
        totalClients: initialMetrics.devices?.total || 0,
        onlineClients: initialMetrics.devices?.online || 0,
        modelAccuracy: initialMetrics.performance?.accuracy || 0.947,
        activeAnomalies: initialMetrics.security?.recentAnomalies || 0,
        privacyBudget: initialMetrics.security?.privacyBudgetRemaining || 6.0,
        flProgress: initialMetrics.fl?.currentRound ? 85 : 0
      }));
    }
  }, [initialMetrics]);

  useEffect(() => {
    if (lastMessage?.type === 'metrics_update') {
      setMetrics(lastMessage.data);
    }
  }, [lastMessage]);

  const formatTrend = (value: number, isGood: boolean) => {
    const Icon = isGood ? TrendingUp : TrendingDown;
    const color = isGood ? "text-green-400" : "text-red-400";
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
      <Card className="glass-morphism hover:border-blue-400/30 transition-all animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active Anomalies</p>
              <p className="text-3xl font-bold text-red-400 animate-counter">
                {metrics.activeAnomalies}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </div>
          <div className="mt-4">
            {formatTrend(12, false)}
          </div>
        </CardContent>
      </Card>

      {/* FL Round Progress */}
      <Card className="glass-morphism hover:border-blue-400/30 transition-all animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">FL Round Progress</p>
              <p className="text-3xl font-bold text-blue-400 animate-counter">
                {metrics.flProgress}%
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-blue-400" />
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
      <Card className="glass-morphism hover:border-blue-400/30 transition-all animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Privacy Budget (ε)</p>
              <p className="text-3xl font-bold text-yellow-400 animate-counter">
                {metrics.privacyBudget.toFixed(1)}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <div className="mt-4">
            {formatTrend(5, true)}
          </div>
        </CardContent>
      </Card>

      {/* Model Accuracy */}
      <Card className="glass-morphism hover:border-blue-400/30 transition-all animate-fade-in">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Model Accuracy</p>
              <p className="text-3xl font-bold text-green-400 animate-counter">
                {(metrics.modelAccuracy * 100).toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-400" />
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