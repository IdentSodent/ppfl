import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Cpu, Wifi, WifiOff, Plus, Settings, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function DeviceManagement() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: "",
    location: "",
    securityLevel: "standard"
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: devices = [], isLoading } = useQuery({
    queryKey: ["/api/devices"],
  });

  const addDeviceMutation = useMutation({
    mutationFn: async (deviceData: any) => {
      const response = await apiRequest('POST', '/api/devices', deviceData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Device Added",
        description: "New edge device has been added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/devices'] });
      setIsAddDialogOpen(false);
      setNewDevice({ name: "", location: "", securityLevel: "standard" });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Device",
        description: error instanceof Error ? error.message : "Failed to add device",
        variant: "destructive",
      });
    },
  });

  const updateDeviceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await apiRequest('PUT', `/api/devices/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Device Updated",
        description: "Device status has been updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/devices'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Device",
        description: error instanceof Error ? error.message : "Failed to update device",
        variant: "destructive",
      });
    },
  });

  const deleteDeviceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/devices/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Device Removed",
        description: "Device has been removed from the system",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/devices'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Remove Device",
        description: error instanceof Error ? error.message : "Failed to remove device",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'cyber-green';
      case 'participating':
        return 'cyber-blue';
      case 'offline':
        return 'cyber-red';
      default:
        return 'slate-500';
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'cyber-red';
      case 'high':
        return 'cyber-amber';
      case 'standard':
        return 'cyber-blue';
      default:
        return 'slate-500';
    }
  };

  const filteredDevices = devices.filter((device: any) => {
    if (statusFilter === "all") return true;
    return device.status === statusFilter;
  });

  const handleAddDevice = () => {
    if (!newDevice.name || !newDevice.location) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    addDeviceMutation.mutate({
      ...newDevice,
      status: "offline",
      capabilities: { video: true, audio: false }
    });
  };

  const handleStatusToggle = (deviceId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'online' ? 'offline' : 'online';
    updateDeviceMutation.mutate({
      id: deviceId,
      updates: { status: newStatus }
    });
  };

  return (
    <div className="flex h-screen overflow-hidden" data-testid="device-management-page">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="glass-morphism border-b border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Edge Device Management</h2>
              <p className="text-slate-400">Monitor and manage federated learning edge devices</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={statusFilter} onValueChange={setStatusFilter} data-testid="status-filter">
                <SelectTrigger className="w-48 bg-slate-800/50 border-slate-600">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="participating">Participating</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-cyber-green/20 border border-cyber-green/30 text-cyber-green hover:bg-cyber-green/30"
                    data-testid="add-device-button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Device
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-morphism border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Add New Edge Device</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="device-name" className="text-slate-300">Device Name</Label>
                      <Input
                        id="device-name"
                        value={newDevice.name}
                        onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                        placeholder="e.g., Camera A-01"
                        className="bg-slate-800/50 border-slate-600"
                        data-testid="device-name-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="device-location" className="text-slate-300">Location</Label>
                      <Input
                        id="device-location"
                        value={newDevice.location}
                        onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
                        placeholder="e.g., Building A - Floor 1"
                        className="bg-slate-800/50 border-slate-600"
                        data-testid="device-location-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="security-level" className="text-slate-300">Security Level</Label>
                      <Select value={newDevice.securityLevel} onValueChange={(value) => setNewDevice({ ...newDevice, securityLevel: value })}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleAddDevice}
                      disabled={addDeviceMutation.isPending}
                      className="w-full bg-cyber-green/20 border border-cyber-green/30 text-cyber-green hover:bg-cyber-green/30"
                      data-testid="confirm-add-device"
                    >
                      {addDeviceMutation.isPending ? 'Adding...' : 'Add Device'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Device Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass-morphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Devices</p>
                    <p className="text-3xl font-bold text-white" data-testid="total-devices">
                      {devices.length}
                    </p>
                  </div>
                  <Cpu className="w-8 h-8 text-cyber-blue" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-morphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Online</p>
                    <p className="text-3xl font-bold text-cyber-green" data-testid="online-count">
                      {devices.filter((d: any) => d.status === 'online').length}
                    </p>
                  </div>
                  <Wifi className="w-8 h-8 text-cyber-green" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-morphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Participating</p>
                    <p className="text-3xl font-bold text-cyber-blue" data-testid="participating-count">
                      {devices.filter((d: any) => d.status === 'participating').length}
                    </p>
                  </div>
                  <Settings className="w-8 h-8 text-cyber-blue" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-morphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Offline</p>
                    <p className="text-3xl font-bold text-cyber-red" data-testid="offline-count">
                      {devices.filter((d: any) => d.status === 'offline').length}
                    </p>
                  </div>
                  <WifiOff className="w-8 h-8 text-cyber-red" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Device List */}
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Device Registry</span>
                <Badge variant="outline" className="text-cyber-blue border-cyber-blue/30">
                  {filteredDevices.length} devices
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="text-slate-400">Loading devices...</div>
                </div>
              ) : filteredDevices.length === 0 ? (
                <div className="text-center py-8" data-testid="no-devices">
                  <Cpu className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Devices Found</h3>
                  <p className="text-slate-400">
                    {statusFilter === 'all' 
                      ? 'No edge devices have been registered yet.'
                      : `No devices with status "${statusFilter}" found.`
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDevices.map((device: any) => {
                    const statusColor = getStatusColor(device.status);
                    const securityColor = getSecurityLevelColor(device.securityLevel);
                    
                    return (
                      <div 
                        key={device.id}
                        className="bg-slate-800/30 rounded-lg p-6 border border-slate-700/30"
                        data-testid={`device-card-${device.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-3 h-3 bg-${statusColor} rounded-full`} />
                            <div>
                              <h4 className="text-lg font-semibold text-white">{device.name}</h4>
                              <p className="text-sm text-slate-400">{device.location}</p>
                              <div className="flex items-center space-x-4 mt-2">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs bg-${statusColor}/20 text-${statusColor} border-${statusColor}/30`}
                                >
                                  {device.status.toUpperCase()}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs bg-${securityColor}/20 text-${securityColor} border-${securityColor}/30`}
                                >
                                  {device.securityLevel.toUpperCase()} SECURITY
                                </Badge>
                                {device.uptime !== undefined && (
                                  <span className="text-xs text-slate-500 font-mono">
                                    {device.uptime.toFixed(1)}% uptime
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusToggle(device.id, device.status)}
                              disabled={updateDeviceMutation.isPending}
                              className={`border-${statusColor}/30 text-${statusColor} hover:bg-${statusColor}/20`}
                              data-testid={`toggle-device-${device.id}`}
                            >
                              {device.status === 'online' ? 'Take Offline' : 'Bring Online'}
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteDeviceMutation.mutate(device.id)}
                              disabled={deleteDeviceMutation.isPending}
                              className="border-cyber-red/30 text-cyber-red hover:bg-cyber-red/20"
                              data-testid={`delete-device-${device.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {device.capabilities && (
                          <div className="mt-4 pt-4 border-t border-slate-700/30">
                            <p className="text-xs text-slate-400 mb-2">Capabilities:</p>
                            <div className="flex items-center space-x-4 text-xs">
                              {Object.entries(device.capabilities as object).map(([key, value]) => (
                                <span key={key} className={`${value ? 'text-cyber-green' : 'text-slate-500'}`}>
                                  {key}: {value ? 'Yes' : 'No'}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
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
