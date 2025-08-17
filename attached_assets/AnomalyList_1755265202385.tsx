import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
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
}

export function AnomalyList() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

  const { data: initialAnomalies } = useQuery({
    queryKey: ["/api/anomalies"],
    queryFn: async () => {
      const response = await fetch("/api/anomalies?limit=10");
      return response.json();
    },
  });

  const { lastMessage } = useWebSocket("/ws");

  useEffect(() => {
    if (initialAnomalies) {
      setAnomalies(initialAnomalies);
    }
  }, [initialAnomalies]);

  useEffect(() => {
    if (lastMessage?.type === 'anomaly_detected') {
      setAnomalies(prev => [lastMessage.data, ...prev.slice(0, 9)]);
    }
  }, [lastMessage]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'border-cyber-red text-cyber-red bg-cyber-red/20';
      case 'medium':
        return 'border-cyber-amber text-cyber-amber bg-cyber-amber/20';
      case 'low':
        return 'border-yellow-500 text-yellow-500 bg-yellow-500/20';
      default:
        return 'border-slate-500 text-slate-500 bg-slate-500/20';
    }
  };

  const getSeverityBorderColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'border-l-cyber-red';
      case 'medium':
        return 'border-l-cyber-amber';
      case 'low':
        return 'border-l-yellow-500';
      default:
        return 'border-l-slate-500';
    }
  };

  const formatAnomalyType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card className="glass-morphism">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-white">
            Recent Anomalies
          </CardTitle>
          <Button variant="ghost" className="text-cyber-blue text-sm hover:text-blue-400">
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {anomalies.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No anomalies detected</p>
          </div>
        ) : (
          anomalies.map((anomaly) => (
            <div 
              key={anomaly.id}
              className={`bg-slate-800/50 rounded-lg p-4 border-l-4 ${getSeverityBorderColor(anomaly.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-white">
                      {formatAnomalyType(anomaly.anomalyType)}
                    </span>
                    <Badge 
                      variant="outline"
                      className={`text-xs ${getSeverityColor(anomaly.severity)}`}
                    >
                      {anomaly.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">
                    {anomaly.location}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    {formatDistanceToNow(new Date(anomaly.detectedAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-lg text-white">
                    {Math.round(anomaly.confidence * 100)}%
                  </span>
                  <p className="text-slate-500 text-xs">confidence</p>
                </div>
              </div>
            </div>
          ))
        )}
        
        <Button className="w-full bg-cyber-red/20 border border-cyber-red/30 text-cyber-red hover:bg-cyber-red/30">
          <Eye className="w-4 h-4 mr-2" />
          View Evidence
        </Button>
      </CardContent>
    </Card>
  );
}
