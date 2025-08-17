import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, Users, TrendingUp, Clock } from "lucide-react";

export function FederatedLearning() {
  const { data: rounds = [] } = useQuery({
    queryKey: ["/api/fl/rounds"],
  });

  const { data: devices = [] } = useQuery({
    queryKey: ["/api/devices"],
  });

  const currentRound = rounds.find((r: any) => r.status === 'active');
  const onlineDevices = devices.filter((d: any) => d.status === 'online' || d.status === 'participating').length;
  const participatingDevices = devices.filter((d: any) => d.status === 'participating').length;

  return (
    <Card className="glass-morphism" data-testid="federated-learning-card">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white flex items-center">
          <Brain className="w-6 h-6 mr-2 text-cyber-blue" />
          Federated Learning Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentRound ? (
          <>
            {/* Current Round Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="w-4 h-4 text-cyber-blue" />
                  <span className="text-sm text-slate-400">Round</span>
                </div>
                <div className="text-2xl font-bold text-cyber-blue" data-testid="current-round">
                  {currentRound.roundNumber}
                </div>
                <div className="text-xs text-slate-500">{currentRound.algorithm}</div>
              </div>

              <div className="bg-slate-800/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-cyber-green" />
                  <span className="text-sm text-slate-400">Participants</span>
                </div>
                <div className="text-2xl font-bold text-cyber-green" data-testid="participants">
                  {currentRound.participatingClients || 0}
                </div>
                <div className="text-xs text-slate-500">of {currentRound.totalClients} devices</div>
              </div>

              <div className="bg-slate-800/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-cyber-amber" />
                  <span className="text-sm text-slate-400">Accuracy</span>
                </div>
                <div className="text-2xl font-bold text-cyber-amber" data-testid="accuracy">
                  {currentRound.accuracy ? `${(currentRound.accuracy * 100).toFixed(1)}%` : 'N/A'}
                </div>
                <div className="text-xs text-slate-500">
                  {currentRound.convergenceMetric ? `${currentRound.convergenceMetric.toFixed(4)} convergence` : 'Initializing...'}
                </div>
              </div>

              <div className="bg-slate-800/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-cyber-purple" />
                  <span className="text-sm text-slate-400">Duration</span>
                </div>
                <div className="text-2xl font-bold text-cyber-purple" data-testid="duration">
                  {(() => {
                    const start = new Date(currentRound.startedAt);
                    const now = new Date();
                    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
                    return `${diffMinutes}m`;
                  })()}
                </div>
                <div className="text-xs text-slate-500">
                  Started {new Date(currentRound.startedAt).toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Training Progress</span>
                <Badge variant="outline" className="text-cyber-blue border-cyber-blue/30">
                  {currentRound.status.toUpperCase()}
                </Badge>
              </div>
              <Progress 
                value={85} 
                className="h-2" 
                data-testid="training-progress"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Round {currentRound.roundNumber} in progress</span>
                <span>85% complete</span>
              </div>
            </div>

            {/* Algorithm Details */}
            <div className="bg-slate-800/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-white mb-3">Algorithm Configuration</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Algorithm:</span>
                  <span className="ml-2 text-cyber-blue font-mono">{currentRound.algorithm}</span>
                </div>
                <div>
                  <span className="text-slate-400">Aggregation:</span>
                  <span className="ml-2 text-cyber-green font-mono">{currentRound.aggregationMethod}</span>
                </div>
                <div>
                  <span className="text-slate-400">Privacy Budget:</span>
                  <span className="ml-2 text-cyber-amber font-mono">ε = {currentRound.privacyBudget}</span>
                </div>
                <div>
                  <span className="text-slate-400">Online Devices:</span>
                  <span className="ml-2 text-cyber-purple font-mono">{onlineDevices}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* No Active Round */
          <div className="text-center py-8" data-testid="no-active-round">
            <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Active Training Round</h3>
            <p className="text-slate-400 mb-4">
              Start a new federated learning round to begin training across edge devices.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyber-green">{onlineDevices}</div>
                <div className="text-xs text-slate-400">Online Devices</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-500">{rounds.length}</div>
                <div className="text-xs text-slate-400">Total Rounds</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyber-blue">
                  {rounds.length > 0 ? `${((rounds[0]?.accuracy || 0) * 100).toFixed(1)}%` : 'N/A'}
                </div>
                <div className="text-xs text-slate-400">Last Accuracy</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
