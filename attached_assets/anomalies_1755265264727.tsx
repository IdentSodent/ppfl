import { Sidebar } from "@/components/Sidebar";
import { AnomalyList } from "@/components/AnomalyList";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useEffect, useState } from "react";
import { Eye, AlertTriangle, CheckCircle, X, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Anomaly {
  id: string;
  anomalyType: string;
  confidence: number;
  severity: string;
  location: string;
  detectedAt: string;
  deviceId?: string;
  fileName?: string;
  isResolved: boolean;
}

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');

  const { data: initialAnomalies } = useQuery({
    queryKey: ["/api/anomalies"],
    queryFn: async () => {
      const response = await fetch("/api/anomalies?limit=100");
      return response.json();
    },
  });

  const { lastMessage } = useWebSocket("/ws");

  useEffect(() => {
    if (initialAnomalies && Array.isArray(initialAnomalies)) {
      setAnomalies(initialAnomalies);
    }
  }, [initialAnomalies]);

  useEffect(() => {
    if (lastMessage?.type === 'anomaly_detected') {
      setAnomalies(prev => [lastMessage.data, ...prev]);
    }
  }, [lastMessage]);

  const filteredAnomalies = anomalies.filter(anomaly => {
    if (filter === 'active') return !anomaly.isResolved;
    if (filter === 'resolved') return anomaly.isResolved;
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'border-cyber-red text-cyber-red bg-cyber-red/20';
      case 'medium': return 'border-cyber-amber text-cyber-amber bg-cyber-amber/20';
      case 'low': return 'border-yellow-500 text-yellow-500 bg-yellow-500/20';
      default: return 'border-slate-500 text-slate-500 bg-slate-500/20';
    }
  };

  const markAsResolved = async (id: string) => {
    // In a real implementation, this would call an API
    setAnomalies(prev => 
      prev.map(anomaly => 
        anomaly.id === id ? { ...anomaly, isResolved: true } : anomaly
      )
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="glass-morphism border-b border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Anomaly Detection Center</h2>
              <p className="text-slate-400">Monitor and manage security anomalies across edge devices</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className="text-sm"
              >
                All ({anomalies.length})
              </Button>
              <Button
                variant={filter === 'active' ? 'default' : 'outline'}
                onClick={() => setFilter('active')}
                className="text-sm"
              >
                Active ({anomalies.filter(a => !a.isResolved).length})
              </Button>
              <Button
                variant={filter === 'resolved' ? 'default' : 'outline'}
                onClick={() => setFilter('resolved')}
                className="text-sm"
              >
                Resolved ({anomalies.filter(a => a.isResolved).length})
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* File Upload Section */}
          <FileUpload />

          {/* Anomalies List */}
          <Card className="glass-morphism">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-white">
                  Detected Anomalies
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">
                    Showing {filteredAnomalies.length} of {anomalies.length}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {filteredAnomalies.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">No anomalies found for the selected filter</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAnomalies.map((anomaly) => (
                    <div 
                      key={anomaly.id}
                      className={`bg-slate-800/50 rounded-lg p-4 border-l-4 transition-all hover:bg-slate-700/50 ${
                        anomaly.severity === 'high' ? 'border-l-cyber-red' :
                        anomaly.severity === 'medium' ? 'border-l-cyber-amber' : 'border-l-yellow-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium text-white">
                              {anomaly.anomalyType.split('_').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </span>
                            <Badge 
                              variant="outline"
                              className={`text-xs ${getSeverityColor(anomaly.severity)}`}
                            >
                              {anomaly.severity.toUpperCase()}
                            </Badge>
                            {anomaly.isResolved && (
                              <Badge variant="outline" className="text-xs border-cyber-green text-cyber-green bg-cyber-green/20">
                                RESOLVED
                              </Badge>
                            )}
                          </div>
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-slate-500">Location:</span>
                              <span className="text-slate-300 ml-2">{anomaly.location}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Confidence:</span>
                              <span className="text-white ml-2 font-mono">{Math.round(anomaly.confidence * 100)}%</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Detected:</span>
                              <span className="text-slate-300 ml-2">
                                {formatDistanceToNow(new Date(anomaly.detectedAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-cyber-blue hover:text-blue-400"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Evidence
                          </Button>
                          {!anomaly.isResolved && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => markAsResolved(anomaly.id)}
                              className="text-cyber-green hover:text-green-400"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Resolve
                            </Button>
                          )}
                        </div>
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