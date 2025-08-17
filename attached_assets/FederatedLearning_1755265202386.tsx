import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Pause, FileText } from "lucide-react";

interface FLRound {
  id: string;
  roundNumber: number;
  algorithm: string;
  status: string;
  totalClients: number;
  participatingClients: number;
  convergenceMetric?: number;
  accuracy?: number;
}

export function FederatedLearning() {
  const [currentRound, setCurrentRound] = useState<FLRound | null>(null);

  const { data: initialRound } = useQuery({
    queryKey: ["/api/fl/current-round"],
  });

  const { lastMessage } = useWebSocket("/ws");

  useEffect(() => {
    if (initialRound) {
      setCurrentRound(initialRound);
    }
  }, [initialRound]);

  useEffect(() => {
    if (lastMessage?.type === 'fl_round_started' || lastMessage?.type === 'fl_round_updated') {
      setCurrentRound(lastMessage.data);
    }
  }, [lastMessage]);

  const progressPercentage = currentRound 
    ? Math.round((currentRound.participatingClients / currentRound.totalClients) * 100)
    : 0;

  return (
    <Card className="glass-morphism">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-white">
            Federated Learning Status
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
            <span className="text-sm text-cyber-green">Training Active</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* FL Progress */}
        {currentRound && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">
                Round {currentRound.roundNumber}/20 - {currentRound.algorithm} Algorithm
              </span>
              <span className="font-mono text-cyber-blue">
                {progressPercentage}% Complete
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-cyber-blue to-blue-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Client Participation */}
        <div>
          <h4 className="text-lg font-medium text-white mb-4">Client Participation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Active Clients</span>
                <span className="font-mono text-cyber-green">
                  {currentRound ? `${currentRound.participatingClients}/${currentRound.totalClients}` : "0/0"}
                </span>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Avg. Update Size</span>
                <span className="font-mono text-cyber-blue">156 KB</span>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Round Duration</span>
                <span className="font-mono text-slate-300">2m 34s</span>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Convergence</span>
                <span className="font-mono text-cyber-amber">
                  {currentRound?.convergenceMetric?.toFixed(4) || "0.0023"}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/20"
          >
            <Pause className="w-4 h-4 mr-2" />
            Pause Round
          </Button>
          <Button 
            variant="outline" 
            className="border-slate-600 text-slate-300 hover:bg-slate-600/50"
          >
            <FileText className="w-4 h-4 mr-2" />
            View Logs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
