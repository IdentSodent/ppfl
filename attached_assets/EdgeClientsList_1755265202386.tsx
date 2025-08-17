import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Monitor,
  Wifi,
  WifiOff,
  Clock,
  Cpu,
  HardDrive,
  Battery,
  Settings,
  Eye,
  Search,
  Filter,
  Grid3X3,
  List,
  Zap,
  Shield,
  Activity
} from "lucide-react";
import { useState } from "react";

interface EdgeClient {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
  lastSeen: string;
  capabilities: {
    cpu: string;
    memory: string;
    storage: string;
    gpu?: string;
    powerSource: 'battery' | 'ac';
    batteryLevel?: number;
  };
  latency: number;
  dataContributed: number;
  privacyBudget: number;
}

export function EdgeClientsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: clients, isLoading, error } = useQuery<EdgeClient[]>({
    queryKey: ['edgeClients'],
    queryFn: async () => {
      const response = await fetch('/api/devices');
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    },
    refetchInterval: 10000,
  });

  // Add safety check for devices data
  if (error || !Array.isArray(clients)) {
    return (
      <Card className="relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
        <CardHeader>
          <CardTitle className="gradient-text flex items-center space-x-2">
            <Monitor className="w-6 h-6" />
            <span>Edge Clients</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500">Error loading devices data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredClients = (clients || []).filter(client => 
    client?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) &&
    (statusFilter === "all" || client?.status === statusFilter)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'warning': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'offline': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'warning': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800';
    }
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 50) return 'text-green-600 dark:text-green-400';
    if (latency < 100) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (isLoading) {
    return (
      <Card className="relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        <CardHeader>
          <CardTitle className="gradient-text flex items-center space-x-2">
            <Monitor className="w-6 h-6" />
            <span>Edge Clients</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl h-48"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden rounded-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-xl">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
      <CardHeader className="space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="gradient-text flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold">Edge Clients</span>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                {filteredClients.length} devices connected
              </div>
            </div>
          </CardTitle>

          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-lg"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-lg"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl border-0 bg-gray-50 dark:bg-slate-700/50 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All', count: clients?.length || 0 },
              { key: 'online', label: 'Online', count: clients?.filter(c => c.status === 'online').length || 0 },
              { key: 'offline', label: 'Offline', count: clients?.filter(c => c.status === 'offline').length || 0 },
              { key: 'warning', label: 'Warning', count: clients?.filter(c => c.status === 'warning').length || 0 }
            ].map((filter) => (
              <Button
                key={filter.key}
                variant={statusFilter === filter.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(filter.key)}
                className="rounded-lg capitalize text-xs"
              >
                {filter.label} ({filter.count})
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        <div className={`grid gap-4 ${
          viewMode === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
        }`}>
          {filteredClients.map((client) => (
            <Card key={client.id} className="relative overflow-hidden rounded-xl border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-slate-800 dark:to-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-purple-50/20 dark:to-purple-900/10"></div>
              <div className="relative z-10 p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${getStatusColor(client.status)} shadow-lg ring-2 ring-white dark:ring-slate-800 animate-pulse`}></div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white">{client.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{client.location}</p>
                    </div>
                  </div>
                  <Badge className={`text-xs font-medium px-2 py-1 rounded-lg border ${getStatusBadge(client.status)}`}>
                    {client.status}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                      <Clock className="w-3 h-3" />
                      <span>Last seen</span>
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{client.lastSeen}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                      {client.status === 'online' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                      <span>Latency</span>
                    </div>
                    <span className={`font-bold ${getLatencyColor(client.latency)}`}>{client.latency}ms</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                      <Activity className="w-3 h-3" />
                      <span>Data contributed</span>
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{client.dataContributed}%</span>
                  </div>
                </div>

                <div className="bg-gray-100 dark:bg-slate-700/50 rounded-lg p-3 mb-4">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-3 h-3 text-blue-500" />
                      <span className="text-gray-600 dark:text-gray-300 truncate">{client.capabilities.cpu}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <HardDrive className="w-3 h-3 text-green-500" />
                      <span className="text-gray-600 dark:text-gray-300">{client.capabilities.memory}</span>
                    </div>
                    {client.capabilities.powerSource === 'battery' && (
                      <div className="flex items-center space-x-2">
                        <Battery className="w-3 h-3 text-amber-500" />
                        <span className="text-gray-600 dark:text-gray-300">{client.capabilities.batteryLevel}%</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Shield className="w-3 h-3 text-purple-500" />
                      <span className="text-gray-600 dark:text-gray-300">ε: {client.privacyBudget}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1 rounded-lg text-xs hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20">
                    <Settings className="w-3 h-3 mr-1" />
                    Configure
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 rounded-lg text-xs hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-900/20">
                    <Eye className="w-3 h-3 mr-1" />
                    Logs
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Monitor className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No clients found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria or filters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}