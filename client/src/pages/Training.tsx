import { Sidebar } from "@/components/Sidebar";
import { FederatedLearning } from "@/components/FederatedLearning";
import { FileUpload } from "@/components/FileUpload";
import { AIModelsManager } from "@/components/AIModelsManager";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useEffect, useState } from "react";
import { Brain, Play, Pause, Settings, TrendingUp, Clock, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface FLRound {
  id: string;
  roundNumber: number;
  algorithm: string;
  status: string;
  totalClients: number;
  participatingClients: number;
  convergenceMetric?: number;
  accuracy?: number;
  precision?: number;
  recall?: number;
  startedAt: string;
  completedAt?: string;
  aggregationMethod: string;
  privacyBudget: number;
}

export default function Training() {
  const [rounds, setRounds] = useState<FLRound[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('FedProx');
  const [selectedAggregation, setSelectedAggregation] = useState('weighted_avg');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: initialRounds } = useQuery({
    queryKey: ["/api/fl/rounds"],
  });

  const { data: devices = [] } = useQuery({
    queryKey: ["/api/devices"],
  });

  const { lastMessage } = useWebSocket("/ws");

  useEffect(() => {
    if (initialRounds && Array.isArray(initialRounds)) {
      setRounds(initialRounds);
    }
  }, [initialRounds]);

  useEffect(() => {
    if (lastMessage?.type === 'fl_round_started' || lastMessage?.type === 'fl_round_updated') {
      setRounds(prev => {
        const newRounds = [...prev];
        const existingIndex = newRounds.findIndex(r => r.id === lastMessage.data.id);
        if (existingIndex >= 0) {
          newRounds[existingIndex] = lastMessage.data;
        } else {
          newRounds.unshift(lastMessage.data);
        }
        return newRounds;
      });
    }
  }, [lastMessage]);

  const startRoundMutation = useMutation({
    mutationFn: async (params: { algorithm: string; aggregationMethod: string }) => {
      const onlineDevices = devices.filter((d: any) => d.status === 'online' || d.status === 'participating');
      const roundData = {
        roundNumber: rounds.length + 1,
        algorithm: params.algorithm,
        status: 'active',
        totalClients: onlineDevices.length,
        participatingClients: 0,
        aggregationMethod: params.aggregationMethod,
        privacyBudget: 6.0,
      };
      
      const response = await apiRequest('POST', '/api/fl/start-round', roundData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Training Round Started",
        description: `New federated learning round started with ${selectedAlgorithm} algorithm`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/fl/rounds'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Start Round",
        description: error instanceof Error ? error.message : "Failed to start training round",
        variant: "destructive",
      });
    },
  });

  const stopRoundMutation = useMutation({
    mutationFn: async (roundId: string) => {
      const response = await apiRequest('PUT', `/api/fl/rounds/${roundId}`, {
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Training Round Stopped",
        description: "Federated learning round has been stopped",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/fl/rounds'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Stop Round",
        description: error instanceof Error ? error.message : "Failed to stop training round",
        variant: "destructive",
      });
    },
  });

  const currentRound = rounds.find(r => r.status === 'active');
  const completedRounds = rounds.filter(r => r.status === 'completed');
  const avgAccuracy = completedRounds.length > 0 
    ? completedRounds.reduce((sum, r) => sum + (r.accuracy || 0), 0) / completedRounds.length 
    : 0;

  const handleStartRound = () => {
    if (currentRound) {
      toast({
        title: "Training Already Active",
        description: "A federated learning round is already in progress",
        variant: "destructive",
      });
      return;
    }
    startRoundMutation.mutate({
      algorithm: selectedAlgorithm,
      aggregationMethod: selectedAggregation
    });
  };

  const handleStopRound = () => {
    if (currentRound) {
      stopRoundMutation.mutate(currentRound.id);
    }
  };

  const onlineDeviceCount = devices.filter((d: any) => d.status === 'online' || d.status === 'participating').length;

  return (
    <div className="flex h-screen overflow-hidden" data-testid="training-page">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="glass-morphism border-b border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Federated Learning Training</h2>
              <p className="text-slate-400">Manage and monitor distributed model training across edge devices</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 glass-morphism rounded-lg">
                <Brain className="w-4 h-4 text-cyber-blue" />
                <span className="text-sm font-mono text-white">
                  {currentRound ? `Round ${currentRound.roundNumber} Active` : 'Ready to Train'}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* File Upload for AI Analysis */}
          <FileUpload 
            deviceId="training-device" 
            onAnalysisComplete={(file, analysis) => {
              if (analysis.anomalyDetected) {
                toast({
                  title: "Anomaly Detected",
                  description: `${analysis.anomalyType} detected with ${(analysis.confidence * 100).toFixed(1)}% confidence`,
                  variant: "destructive",
                });
              }
            }}
          />

          {/* AI Models and Datasets Management */}
          <AIModelsManager />

          {/* Current Training Status */}
          <FederatedLearning />

          {/* Training Controls */}
          <Card className="glass-morphism" data-testid="training-controls">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">Training Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Algorithm</label>
                  <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm} data-testid="algorithm-select">
                    <SelectTrigger className="bg-slate-800/50 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FedProx">FedProx</SelectItem>
                      <SelectItem value="FedAvg">FedAvg</SelectItem>
                      <SelectItem value="SCAFFOLD">SCAFFOLD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Aggregation Method</label>
                  <Select value={selectedAggregation} onValueChange={setSelectedAggregation} data-testid="aggregation-select">
                    <SelectTrigger className="bg-slate-800/50 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weighted_avg">Weighted Average</SelectItem>
                      <SelectItem value="krum">Krum</SelectItem>
                      <SelectItem value="trimmed_mean">Trimmed Mean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Available Devices</label>
                  <div className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md">
                    <span className="text-white font-mono" data-testid="available-devices">
                      {onlineDeviceCount} devices
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Actions</label>
                  <div className="flex space-x-2">
                    {!currentRound ? (
                      <Button 
                        onClick={handleStartRound}
                        disabled={startRoundMutation.isPending || onlineDeviceCount === 0}
                        className="flex-1 bg-cyber-green/20 border border-cyber-green/30 text-cyber-green hover:bg-cyber-green/30"
                        data-testid="start-round-button"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {startRoundMutation.isPending ? 'Starting...' : 'Start Round'}
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleStopRound}
                        disabled={stopRoundMutation.isPending}
                        className="flex-1 bg-cyber-red/20 border border-cyber-red/30 text-cyber-red hover:bg-cyber-red/30"
                        data-testid="stop-round-button"
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        {stopRoundMutation.isPending ? 'Stopping...' : 'Stop Round'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Training Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-morphism" data-testid="total-rounds-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Rounds</p>
                    <p className="text-3xl font-bold text-white" data-testid="total-rounds">
                      {rounds.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-cyber-blue/20 rounded-lg flex items-center justify-center">
                    <Brain className="w-6 h-6 text-cyber-blue" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-morphism" data-testid="avg-accuracy-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Avg. Accuracy</p>
                    <p className="text-3xl font-bold text-cyber-green" data-testid="avg-accuracy">
                      {avgAccuracy > 0 ? `${(avgAccuracy * 100).toFixed(1)}%` : 'N/A'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-cyber-green/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-cyber-green" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-morphism" data-testid="active-participants-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Active Participants</p>
                    <p className="text-3xl font-bold text-cyber-amber" data-testid="active-participants">
                      {currentRound?.participatingClients || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-cyber-amber/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-cyber-amber" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Training History */}
          <Card className="glass-morphism" data-testid="training-history">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">Training History</CardTitle>
            </CardHeader>
            <CardContent>
              {rounds.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Training Rounds</h3>
                  <p className="text-slate-400">
                    Start your first federated learning round to begin training.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rounds.slice(0, 10).map((round) => (
                    <div 
                      key={round.id}
                      className="flex items-center justify-between bg-slate-800/30 rounded-lg p-4"
                      data-testid={`round-${round.id}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-cyber-blue/20 rounded-lg flex items-center justify-center">
                          <span className="text-cyber-blue font-mono text-sm">
                            {round.roundNumber}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-white">Round {round.roundNumber}</span>
                            <Badge variant="outline" className="text-xs">
                              {round.algorithm}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                round.status === 'completed' ? 'border-cyber-green text-cyber-green' :
                                round.status === 'active' ? 'border-cyber-blue text-cyber-blue' :
                                'border-slate-500 text-slate-500'
                              }`}
                            >
                              {round.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400">
                            {round.participatingClients}/{round.totalClients} clients participated
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {round.accuracy && (
                          <p className="text-lg font-mono text-cyber-green">
                            {(round.accuracy * 100).toFixed(1)}%
                          </p>
                        )}
                        <p className="text-xs text-slate-400">
                          {round.convergenceMetric?.toFixed(4) || 'N/A'} convergence
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
