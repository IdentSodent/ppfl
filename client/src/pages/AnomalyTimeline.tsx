import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";

export default function AnomalyTimeline() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("24h");

  const { data: anomalies = [] } = useQuery({
    queryKey: ["/api/anomalies"],
  });

  const { data: devices = [] } = useQuery({
    queryKey: ["/api/devices"],
  });

  const getDeviceName = (deviceId: string) => {
    const device = devices.find((d: any) => d.id === deviceId);
    return device?.name || `Device ${deviceId}`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'cyber-red';
      case 'medium':
        return 'cyber-amber';
      case 'low':
        return 'cyber-blue';
      default:
        return 'slate-500';
    }
  };

  const filteredAnomalies = anomalies.filter((anomaly: any) => {
    if (typeFilter !== "all" && anomaly.type !== typeFilter) return false;
    
    if (timeFilter !== "all") {
      const now = new Date();
      const detectedTime = new Date(anomaly.detectedAt);
      const diffHours = (now.getTime() - detectedTime.getTime()) / (1000 * 60 * 60);
      
      if (timeFilter === "24h" && diffHours > 24) return false;
      if (timeFilter === "7d" && diffHours > 24 * 7) return false;
      if (timeFilter === "30d" && diffHours > 24 * 30) return false;
    }
    
    return true;
  });

  return (
    <div className="flex h-screen overflow-hidden" data-testid="anomaly-timeline-page">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="glass-morphism border-b border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Anomaly Detection Timeline</h2>
              <p className="text-slate-400">Review and analyze security anomalies detected across edge devices</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={typeFilter} onValueChange={setTypeFilter} data-testid="type-filter">
                <SelectTrigger className="w-48 bg-slate-800/50 border-slate-600">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="violence">Violence</SelectItem>
                  <SelectItem value="theft">Theft</SelectItem>
                  <SelectItem value="trespassing">Trespassing</SelectItem>
                  <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={timeFilter} onValueChange={setTimeFilter} data-testid="time-filter">
                <SelectTrigger className="w-48 bg-slate-800/50 border-slate-600">
                  <SelectValue placeholder="Filter by time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Timeline View</span>
                <Badge variant="outline" className="text-cyber-blue border-cyber-blue/30">
                  {filteredAnomalies.length} anomalies
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredAnomalies.length === 0 ? (
                <div className="text-center py-12" data-testid="no-anomalies">
                  <CheckCircle className="w-16 h-16 text-cyber-green mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Anomalies Found</h3>
                  <p className="text-slate-400">
                    No security anomalies match your current filter criteria.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredAnomalies.map((anomaly: any) => {
                    const severityColor = getSeverityColor(anomaly.severity);
                    
                    return (
                      <div 
                        key={anomaly.id}
                        className={`flex space-x-4 border-l-2 border-${severityColor}/30 pl-6 relative`}
                        data-testid={`timeline-entry-${anomaly.id}`}
                      >
                        <div className={`absolute left-0 top-0 w-3 h-3 bg-${severityColor} rounded-full -translate-x-1.5`} />
                        <div className="flex-1">
                          <div className="bg-slate-800/30 rounded-lg p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="text-lg font-semibold text-white capitalize">
                                  {anomaly.type.replace('_', ' ')} Detected
                                </h4>
                                <p className="text-sm text-slate-400">
                                  {getDeviceName(anomaly.deviceId)} • {anomaly.description}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {new Date(anomaly.detectedAt).toLocaleString()}
                                </p>
                              </div>
                              <Badge 
                                variant="outline" 
                                className={`px-3 py-1 text-sm bg-${severityColor}/20 text-${severityColor} border-${severityColor}/30`}
                              >
                                {anomaly.severity}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Main Detection Image */}
                              {anomaly.imageUrl && (
                                <div className="md:col-span-2">
                                  <img 
                                    src={anomaly.imageUrl} 
                                    alt={`${anomaly.type} detection frame`}
                                    className="w-full h-48 rounded-lg object-cover border border-slate-600" 
                                  />
                                </div>
                              )}
                              
                              {/* Detection Metadata */}
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm text-slate-400 mb-2">Detection Confidence</p>
                                  <Progress 
                                    value={anomaly.confidence * 100} 
                                    className={`h-2 [&>div]:bg-${severityColor}`}
                                  />
                                  <p className={`text-xs text-${severityColor} mt-1`}>
                                    {(anomaly.confidence * 100).toFixed(1)}%
                                  </p>
                                </div>
                                
                                {anomaly.privacyImpact && (
                                  <div>
                                    <p className="text-sm text-slate-400 mb-2">Privacy Impact</p>
                                    <p className="text-xs text-cyber-blue font-mono">
                                      ε = {anomaly.privacyImpact.epsilon}, δ = {anomaly.privacyImpact.delta}
                                    </p>
                                  </div>
                                )}
                                
                                {anomaly.actionsTaken && anomaly.actionsTaken.length > 0 && (
                                  <div>
                                    <p className="text-sm text-slate-400 mb-2">Actions Taken</p>
                                    <div className="space-y-1">
                                      {anomaly.actionsTaken.map((action: string, index: number) => (
                                        <div key={index} className="flex items-center space-x-2">
                                          <CheckCircle className="w-3 h-3 text-cyber-green" />
                                          <span className="text-xs text-slate-300 capitalize">
                                            {action.replace('_', ' ')}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
