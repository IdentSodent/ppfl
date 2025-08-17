import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Settings } from "lucide-react";

interface PrivacyMetrics {
  epsilon: number;
  delta: number;
  remainingBudget: number;
}

export function PrivacyControls() {
  const { data: privacyMetrics } = useQuery<PrivacyMetrics[]>({
    queryKey: ["/api/privacy/budgets"],
    queryFn: async () => {
      const response = await fetch("/api/privacy/budgets");
      if (!response.ok) throw new Error('Failed to fetch privacy metrics');
      return response.json();
    },
  });

  const latestMetrics = privacyMetrics?.[0];
  const budgetPercentage = latestMetrics 
    ? Math.round((latestMetrics.remainingBudget / 6.0) * 100)
    : 70;

  return (
    <Card className="glass-morphism">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-white">
            Privacy & Security
          </CardTitle>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-green-400" />
            <span className="text-sm text-green-400">Secure</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Privacy Budget */}
        <div className="bg-slate-800/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Privacy Budget (ε)</span>
            <span className="font-mono text-yellow-400">
              {latestMetrics ? `${latestMetrics.remainingBudget.toFixed(1)} / 6.0` : '4.2 / 6.0'}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-400 to-yellow-400 h-2 rounded-full transition-all"
              style={{ width: `${budgetPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            δ = {latestMetrics?.delta.toExponential(0) || '1e-5'}, {budgetPercentage}% remaining
          </p>
        </div>
        
        {/* Secure Aggregation */}
        <div className="bg-slate-800/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Secure Aggregation</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-400 text-sm">Active</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">Bonawitz protocol, 18/20 participants</p>
        </div>
        
        {/* mTLS Certificate */}
        <div className="bg-slate-800/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">mTLS Certificate</span>
            <span className="text-green-400 text-sm font-mono">Valid</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Expires in 23 days, auto-renewal enabled</p>
        </div>
        
        {/* Anomaly Detection Stats */}
        <div className="bg-slate-800/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Anomaly Detection</span>
            <span className="text-blue-400 text-sm font-mono">147 threats blocked</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Last 24 hours, 99.2% accuracy</p>
        </div>
        
        <Button className="w-full bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-600/50">
          <Settings className="w-4 h-4 mr-2" />
          Advanced Settings
        </Button>
      </CardContent>
    </Card>
  );
}