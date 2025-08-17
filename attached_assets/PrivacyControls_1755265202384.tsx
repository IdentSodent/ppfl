import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Settings } from "lucide-react";

interface PrivacyMetrics {
  epsilon: number;
  delta: number;
  budgetUsed: number;
  budgetRemaining: number;
}

export function PrivacyControls() {
  const { data: privacyMetrics } = useQuery<PrivacyMetrics[]>({
    queryKey: ["/api/privacy/metrics"],
  });

  const latestMetrics = privacyMetrics?.[0];
  const budgetPercentage = latestMetrics 
    ? Math.round((latestMetrics.budgetUsed / (latestMetrics.budgetUsed + latestMetrics.budgetRemaining)) * 100)
    : 70;

  return (
    <Card className="glass-morphism">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-white">
            Privacy & Security
          </CardTitle>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-cyber-green" />
            <span className="text-sm text-cyber-green">Secure</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Privacy Budget */}
        <div className="bg-slate-800/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Privacy Budget (ε)</span>
            <span className="font-mono text-cyber-amber">
              {latestMetrics ? `${latestMetrics.budgetUsed.toFixed(1)} / ${(latestMetrics.budgetUsed + latestMetrics.budgetRemaining).toFixed(1)}` : '4.2 / 6.0'}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyber-green to-cyber-amber h-2 rounded-full transition-all"
              style={{ width: `${budgetPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            δ = {latestMetrics?.delta.toExponential(0) || '1e-5'}, {100 - budgetPercentage}% budget remaining
          </p>
        </div>
        
        {/* Secure Aggregation */}
        <div className="bg-slate-800/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Secure Aggregation</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-cyber-green rounded-full"></div>
              <span className="text-cyber-green text-sm">Active</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">Bonawitz protocol, 18/20 participants</p>
        </div>
        
        {/* mTLS Certificate */}
        <div className="bg-slate-800/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">mTLS Certificate</span>
            <span className="text-cyber-green text-sm font-mono">Valid</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Expires in 23 days, auto-renewal enabled</p>
        </div>
        
        {/* Anomaly Detection Stats */}
        <div className="bg-slate-800/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Anomaly Detection</span>
            <span className="text-cyber-blue text-sm font-mono">147 threats blocked</span>
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
