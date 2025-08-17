import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Settings, Bell, Shield, Database, Users, Brain, Save } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings
    systemName: "PPFL Surveillance System",
    maxClients: 20,
    autoStartRounds: true,
    enableNotifications: true,
    
    // Federated Learning Settings
    defaultAlgorithm: "FedProx",
    aggregationMethod: "weighted_avg",
    minParticipants: 5,
    maxRounds: 50,
    convergenceThreshold: 0.001,
    
    // Privacy Settings
    privacyBudget: 6.0,
    defaultEpsilon: 0.1,
    defaultDelta: 1e-5,
    noiseMultiplier: 1.1,
    enableSecureAggregation: true,
    
    // Security Settings
    enableMTLS: true,
    certificateRotationDays: 30,
    enableClientAttestation: true,
    maxFailedAttempts: 3,
    sessionTimeout: 3600,
    
    // Monitoring Settings
    logLevel: "INFO",
    retentionDays: 30,
    enableMetrics: true,
    metricsInterval: 5000,
    enableAlerting: true,
  });

  const { toast } = useToast();

  const handleSave = () => {
    // In a real implementation, this would call an API
    toast({
      title: "Settings Saved",
      description: "All configuration changes have been saved successfully",
    });
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="glass-morphism border-b border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">System Settings</h2>
              <p className="text-slate-400">Configure federated learning and privacy parameters</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={handleSave} className="bg-cyber-green/20 border border-cyber-green/30 text-cyber-green hover:bg-cyber-green/30">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-slate-800/50">
              <TabsTrigger value="general" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>General</span>
              </TabsTrigger>
              <TabsTrigger value="federated" className="flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>FL Settings</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Privacy</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Monitoring</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>Alerts</span>
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <Card className="glass-morphism">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-white">General Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="systemName" className="text-slate-300">System Name</Label>
                      <Input
                        id="systemName"
                        value={settings.systemName}
                        onChange={(e) => updateSetting('systemName', e.target.value)}
                        className="bg-slate-800/50 border-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxClients" className="text-slate-300">Maximum Clients</Label>
                      <Input
                        id="maxClients"
                        type="number"
                        value={settings.maxClients}
                        onChange={(e) => updateSetting('maxClients', parseInt(e.target.value))}
                        className="bg-slate-800/50 border-slate-600"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-300">Auto-start Training Rounds</Label>
                        <p className="text-sm text-slate-400">Automatically begin new FL rounds when previous ones complete</p>
                      </div>
                      <Switch
                        checked={settings.autoStartRounds}
                        onCheckedChange={(checked) => updateSetting('autoStartRounds', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-300">Enable System Notifications</Label>
                        <p className="text-sm text-slate-400">Show alerts for system events and anomalies</p>
                      </div>
                      <Switch
                        checked={settings.enableNotifications}
                        onCheckedChange={(checked) => updateSetting('enableNotifications', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Federated Learning Settings */}
            <TabsContent value="federated">
              <Card className="glass-morphism">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-white">Federated Learning Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Default Algorithm</Label>
                      <Select value={settings.defaultAlgorithm} onValueChange={(value) => updateSetting('defaultAlgorithm', value)}>
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
                      <Label className="text-slate-300">Aggregation Method</Label>
                      <Select value={settings.aggregationMethod} onValueChange={(value) => updateSetting('aggregationMethod', value)}>
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
                      <Label htmlFor="minParticipants" className="text-slate-300">Minimum Participants</Label>
                      <Input
                        id="minParticipants"
                        type="number"
                        value={settings.minParticipants}
                        onChange={(e) => updateSetting('minParticipants', parseInt(e.target.value))}
                        className="bg-slate-800/50 border-slate-600"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxRounds" className="text-slate-300">Maximum Rounds</Label>
                      <Input
                        id="maxRounds"
                        type="number"
                        value={settings.maxRounds}
                        onChange={(e) => updateSetting('maxRounds', parseInt(e.target.value))}
                        className="bg-slate-800/50 border-slate-600"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="convergenceThreshold" className="text-slate-300">Convergence Threshold</Label>
                      <Input
                        id="convergenceThreshold"
                        type="number"
                        step="0.001"
                        value={settings.convergenceThreshold}
                        onChange={(e) => updateSetting('convergenceThreshold', parseFloat(e.target.value))}
                        className="bg-slate-800/50 border-slate-600"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy">
              <Card className="glass-morphism">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-white">Privacy Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="privacyBudget" className="text-slate-300">Total Privacy Budget (ε)</Label>
                      <Input
                        id="privacyBudget"
                        type="number"
                        step="0.1"
                        value={settings.privacyBudget}
                        onChange={(e) => updateSetting('privacyBudget', parseFloat(e.target.value))}
                        className="bg-slate-800/50 border-slate-600"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="defaultEpsilon" className="text-slate-300">Default Epsilon per Round</Label>
                      <Input
                        id="defaultEpsilon"
                        type="number"
                        step="0.01"
                        value={settings.defaultEpsilon}
                        onChange={(e) => updateSetting('defaultEpsilon', parseFloat(e.target.value))}
                        className="bg-slate-800/50 border-slate-600"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="defaultDelta" className="text-slate-300">Default Delta (δ)</Label>
                      <Input
                        id="defaultDelta"
                        type="number"
                        step="1e-6"
                        value={settings.defaultDelta}
                        onChange={(e) => updateSetting('defaultDelta', parseFloat(e.target.value))}
                        className="bg-slate-800/50 border-slate-600"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="noiseMultiplier" className="text-slate-300">Noise Multiplier</Label>
                      <Input
                        id="noiseMultiplier"
                        type="number"
                        step="0.1"
                        value={settings.noiseMultiplier}
                        onChange={(e) => updateSetting('noiseMultiplier', parseFloat(e.target.value))}
                        className="bg-slate-800/50 border-slate-600"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Enable Secure Aggregation</Label>
                      <p className="text-sm text-slate-400">Use cryptographic protocols to protect individual model updates</p>
                    </div>
                    <Switch
                      checked={settings.enableSecureAggregation}
                      onCheckedChange={(checked) => updateSetting('enableSecureAggregation', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security">
              <Card className="glass-morphism">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-white">Security Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-300">Enable mTLS</Label>
                        <p className="text-sm text-slate-400">Mutual TLS authentication for all client connections</p>
                      </div>
                      <Switch
                        checked={settings.enableMTLS}
                        onCheckedChange={(checked) => updateSetting('enableMTLS', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-300">Enable Client Attestation</Label>
                        <p className="text-sm text-slate-400">Verify client identity and integrity before allowing participation</p>
                      </div>
                      <Switch
                        checked={settings.enableClientAttestation}
                        onCheckedChange={(checked) => updateSetting('enableClientAttestation', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="certificateRotationDays" className="text-slate-300">Certificate Rotation (days)</Label>
                      <Input
                        id="certificateRotationDays"
                        type="number"
                        value={settings.certificateRotationDays}
                        onChange={(e) => updateSetting('certificateRotationDays', parseInt(e.target.value))}
                        className="bg-slate-800/50 border-slate-600"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxFailedAttempts" className="text-slate-300">Max Failed Attempts</Label>
                      <Input
                        id="maxFailedAttempts"
                        type="number"
                        value={settings.maxFailedAttempts}
                        onChange={(e) => updateSetting('maxFailedAttempts', parseInt(e.target.value))}
                        className="bg-slate-800/50 border-slate-600"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout" className="text-slate-300">Session Timeout (seconds)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                        className="bg-slate-800/50 border-slate-600"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Monitoring Settings */}
            <TabsContent value="monitoring">
              <Card className="glass-morphism">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-white">Monitoring Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Log Level</Label>
                      <Select value={settings.logLevel} onValueChange={(value) => updateSetting('logLevel', value)}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ERROR">ERROR</SelectItem>
                          <SelectItem value="WARN">WARN</SelectItem>
                          <SelectItem value="INFO">INFO</SelectItem>
                          <SelectItem value="DEBUG">DEBUG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="retentionDays" className="text-slate-300">Log Retention (days)</Label>
                      <Input
                        id="retentionDays"
                        type="number"
                        value={settings.retentionDays}
                        onChange={(e) => updateSetting('retentionDays', parseInt(e.target.value))}
                        className="bg-slate-800/50 border-slate-600"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="metricsInterval" className="text-slate-300">Metrics Interval (ms)</Label>
                      <Input
                        id="metricsInterval"
                        type="number"
                        value={settings.metricsInterval}
                        onChange={(e) => updateSetting('metricsInterval', parseInt(e.target.value))}
                        className="bg-slate-800/50 border-slate-600"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-300">Enable Metrics Collection</Label>
                        <p className="text-sm text-slate-400">Collect and store system performance metrics</p>
                      </div>
                      <Switch
                        checked={settings.enableMetrics}
                        onCheckedChange={(checked) => updateSetting('enableMetrics', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-300">Enable Alerting</Label>
                        <p className="text-sm text-slate-400">Send alerts for critical system events</p>
                      </div>
                      <Switch
                        checked={settings.enableAlerting}
                        onCheckedChange={(checked) => updateSetting('enableAlerting', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications">
              <Card className="glass-morphism">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-white">Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-300">Anomaly Detection Alerts</Label>
                        <p className="text-sm text-slate-400">Notify when new anomalies are detected</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-300">FL Round Completion</Label>
                        <p className="text-sm text-slate-400">Notify when federated learning rounds complete</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-300">Privacy Budget Warnings</Label>
                        <p className="text-sm text-slate-400">Alert when privacy budget is running low</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-300">Client Connection Events</Label>
                        <p className="text-sm text-slate-400">Notify when clients connect or disconnect</p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-300">Security Incidents</Label>
                        <p className="text-sm text-slate-400">Alert for authentication failures and security events</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}