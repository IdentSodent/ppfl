import { Sidebar } from "@/components/Sidebar";
import { EdgeClientsList } from "@/components/EdgeClientsList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useEffect, useState } from "react";
import { Users, Plus, Search, Wifi, WifiOff, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface EdgeDevice {
  id: string;
  deviceId: string;
  deviceType: string;
  status: string;
  lastSeen: string;
  latency: number;
  location?: string;
  capabilities?: any;
  isParticipating: boolean;
}

export default function ClientsPage() {
  const [devices, setDevices] = useState<EdgeDevice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');

  const { data: initialDevices } = useQuery({
    queryKey: ["/api/devices"],
  });

  const { lastMessage } = useWebSocket("/ws");

  useEffect(() => {
    if (initialDevices && Array.isArray(initialDevices)) {
      setDevices(initialDevices);
    }
  }, [initialDevices]);

  useEffect(() => {
    if (lastMessage?.type === 'device_updated') {
      setDevices(prev => 
        prev.map(device => 
          device.id === lastMessage.data.id ? { ...device, ...lastMessage.data } : device
        )
      );
    }
  }, [lastMessage]);

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.deviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online': return 'bg-cyber-green';
      case 'warning': return 'bg-cyber-amber';
      case 'offline': return 'bg-cyber-red';
      default: return 'bg-slate-500';
    }
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 50) return 'text-cyber-green';
    if (latency < 100) return 'text-cyber-blue';
    if (latency < 200) return 'text-cyber-amber';
    return 'text-cyber-red';
  };

  const onlineCount = devices.filter(d => d.status === 'online').length;
  const participatingCount = devices.filter(d => d.isParticipating).length;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="glass-morphism border-b border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Edge Clients Management</h2>
              <p className="text-slate-400">Monitor and manage federated learning edge devices</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 glass-morphism rounded-lg">
                <Users className="w-4 h-4 text-cyber-green" />
                <span className="text-sm font-mono text-white">{onlineCount}/{devices.length} Online</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 glass-morphism rounded-lg">
                <Activity className="w-4 h-4 text-cyber-blue" />
                <span className="text-sm font-mono text-white">{participatingCount} Participating</span>
              </div>
              <Button className="bg-cyber-blue/20 border border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/30">
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Filters */}
          <Card className="glass-morphism">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search devices by ID, type, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-800/50 border-slate-600"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('all')}
                    className="text-sm"
                  >
                    All ({devices.length})
                  </Button>
                  <Button
                    variant={statusFilter === 'online' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('online')}
                    className="text-sm"
                  >
                    Online ({onlineCount})
                  </Button>
                  <Button
                    variant={statusFilter === 'offline' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('offline')}
                    className="text-sm"
                  >
                    Offline ({devices.length - onlineCount})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Devices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDevices.map((device) => (
              <Card key={device.id} className="glass-morphism hover:border-cyber-blue/30 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 ${getStatusColor(device.status)} rounded-full status-indicator`}></div>
                      <div>
                        <h3 className="font-mono text-lg text-white">{device.deviceId}</h3>
                        <p className="text-sm text-slate-400">{device.deviceType}</p>
                      </div>
                    </div>
                    {device.isParticipating && (
                      <Badge variant="outline" className="text-xs border-cyber-blue text-cyber-blue bg-cyber-blue/20">
                        FL ACTIVE
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Status:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        {device.status === 'online' ? (
                          <Wifi className="w-4 h-4 text-cyber-green" />
                        ) : (
                          <WifiOff className="w-4 h-4 text-cyber-red" />
                        )}
                        <span className={`font-medium ${device.status === 'online' ? 'text-cyber-green' : 'text-cyber-red'}`}>
                          {device.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">Latency:</span>
                      <p className={`font-mono text-lg ${getLatencyColor(device.latency)}`}>
                        {device.status === 'offline' ? 'N/A' : `${device.latency}ms`}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Location:</span>
                      <p className="text-white">{device.location || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Last Seen:</span>
                      <p className="text-slate-300 text-xs">
                        {formatDistanceToNow(new Date(device.lastSeen), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  {device.capabilities && (
                    <div className="pt-3 border-t border-slate-700">
                      <span className="text-slate-500 text-sm">Capabilities:</span>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Memory:</span>
                          <span className="text-white">{device.capabilities.memoryGB}GB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Storage:</span>
                          <span className="text-white">{device.capabilities.storageGB}GB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">CUDA:</span>
                          <span className={device.capabilities.hasCuda ? 'text-cyber-green' : 'text-cyber-red'}>
                            {device.capabilities.hasCuda ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Power:</span>
                          <span className="text-white">{Math.round(device.capabilities.processingPower)}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      Configure
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      View Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDevices.length === 0 && (
            <Card className="glass-morphism">
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">No devices found matching your criteria</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}