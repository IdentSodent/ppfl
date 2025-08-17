import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/hooks/use-toast";
import { 
  Moon, 
  Sun, 
  Settings as SettingsIcon, 
  Bell, 
  Database, 
  Shield,
  Palette,
  Globe,
  Download,
  Upload,
  RotateCcw
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [systemSettings, setSystemSettings] = useState({
    notifications: true,
    autoRefresh: true,
    refreshInterval: 10,
    maxLogRetention: 7,
    exportFormat: "json",
    language: "en",
    timezone: "UTC",
    debugMode: false,
  });

  const [advancedSettings, setAdvancedSettings] = useState({
    webSocketTimeout: 30,
    apiRequestTimeout: 10,
    maxConcurrentConnections: 100,
    compressionEnabled: true,
    cacheDuration: 300,
  });

  const { data: settings = [] } = useQuery({
    queryKey: ["/api/settings"],
  });

  const updateSettingMutation = useMutation({
    mutationFn: async (setting: { key: string; value: string; description: string; category: string }) => {
      const response = await apiRequest('POST', '/api/settings', setting);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "System settings have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Settings",
        description: error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const exportSettingsMutation = useMutation({
    mutationFn: async () => {
      const settingsData = {
        systemSettings,
        advancedSettings,
        themeSettings: { theme },
        exportedAt: new Date().toISOString(),
        version: "1.0.0"
      };
      
      const dataStr = JSON.stringify(settingsData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ppfl-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Settings Exported",
        description: "System settings have been exported successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export settings",
        variant: "destructive",
      });
    },
  });

  const resetSettingsMutation = useMutation({
    mutationFn: async () => {
      // Reset to default values
      const defaultSettings = {
        notifications: true,
        autoRefresh: true,
        refreshInterval: 10,
        maxLogRetention: 7,
        exportFormat: "json",
        language: "en",
        timezone: "UTC",
        debugMode: false,
      };
      
      setSystemSettings(defaultSettings);
      
      // Update each setting in the backend
      for (const [key, value] of Object.entries(defaultSettings)) {
        await updateSettingMutation.mutateAsync({
          key,
          value: value.toString(),
          description: `Reset ${key} to default value`,
          category: "system"
        });
      }
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Settings Reset",
        description: "All settings have been reset to default values",
      });
    },
    onError: (error) => {
      toast({
        title: "Reset Failed",
        description: error instanceof Error ? error.message : "Failed to reset settings",
        variant: "destructive",
      });
    },
  });

  // Load settings from backend
  useEffect(() => {
    if (settings.length > 0) {
      const settingsMap = settings.reduce((acc: any, setting: any) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      setSystemSettings(prev => ({
        ...prev,
        notifications: settingsMap.notifications === 'true',
        autoRefresh: settingsMap.autoRefresh === 'true',
        refreshInterval: parseInt(settingsMap.refreshInterval) || 10,
        maxLogRetention: parseInt(settingsMap.maxLogRetention) || 7,
        exportFormat: settingsMap.exportFormat || 'json',
        language: settingsMap.language || 'en',
        timezone: settingsMap.timezone || 'UTC',
        debugMode: settingsMap.debugMode === 'true',
      }));
    }
  }, [settings]);

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    updateSettingMutation.mutate({
      key: 'theme',
      value: newTheme,
      description: 'Application theme preference',
      category: 'appearance'
    });
  };

  const handleSystemSettingChange = (key: string, value: any, description: string) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
    updateSettingMutation.mutate({
      key,
      value: value.toString(),
      description,
      category: 'system'
    });
  };

  const handleAdvancedSettingChange = (key: string, value: any, description: string) => {
    setAdvancedSettings(prev => ({ ...prev, [key]: value }));
    updateSettingMutation.mutate({
      key,
      value: value.toString(),
      description,
      category: 'advanced'
    });
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          if (importedSettings.systemSettings) {
            setSystemSettings(importedSettings.systemSettings);
          }
          if (importedSettings.advancedSettings) {
            setAdvancedSettings(importedSettings.advancedSettings);
          }
          if (importedSettings.themeSettings?.theme) {
            setTheme(importedSettings.themeSettings.theme);
          }
          toast({
            title: "Settings Imported",
            description: "Settings have been imported successfully",
          });
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Invalid settings file format",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" data-testid="settings-page">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="glass-morphism border-b border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">System Settings</h2>
              <p className="text-slate-400">Configure system preferences and application behavior</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => exportSettingsMutation.mutate()}
                disabled={exportSettingsMutation.isPending}
                variant="outline"
                className="border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/20"
                data-testid="export-settings"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              
              <Button
                onClick={() => resetSettingsMutation.mutate()}
                disabled={resetSettingsMutation.isPending}
                variant="outline"
                className="border-cyber-amber/30 text-cyber-amber hover:bg-cyber-amber/20"
                data-testid="reset-settings"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Appearance Settings */}
          <Card className="glass-morphism" data-testid="appearance-settings">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white flex items-center">
                <Palette className="w-5 h-5 mr-2 text-cyber-purple" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {theme === "dark" ? (
                    <Moon className="w-5 h-5 text-cyber-blue" />
                  ) : (
                    <Sun className="w-5 h-5 text-cyber-amber" />
                  )}
                  <div>
                    <Label className="text-slate-300">Dark Mode</Label>
                    <p className="text-sm text-slate-400">Enable dark theme for better visibility in low-light conditions</p>
                  </div>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={handleThemeToggle}
                  data-testid="theme-toggle-switch"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Language</Label>
                  <Select 
                    value={systemSettings.language} 
                    onValueChange={(value) => handleSystemSettingChange('language', value, 'Application language')}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-300">Timezone</Label>
                  <Select 
                    value={systemSettings.timezone} 
                    onValueChange={(value) => handleSystemSettingChange('timezone', value, 'Application timezone')}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="glass-morphism" data-testid="system-settings">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white flex items-center">
                <SettingsIcon className="w-5 h-5 mr-2 text-cyber-green" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Enable Notifications</Label>
                      <p className="text-sm text-slate-400">Show system notifications and alerts</p>
                    </div>
                    <Switch
                      checked={systemSettings.notifications}
                      onCheckedChange={(checked) => handleSystemSettingChange('notifications', checked, 'Enable system notifications')}
                      data-testid="notifications-toggle"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Auto Refresh</Label>
                      <p className="text-sm text-slate-400">Automatically refresh data at intervals</p>
                    </div>
                    <Switch
                      checked={systemSettings.autoRefresh}
                      onCheckedChange={(checked) => handleSystemSettingChange('autoRefresh', checked, 'Enable automatic data refresh')}
                      data-testid="auto-refresh-toggle"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Debug Mode</Label>
                      <p className="text-sm text-slate-400">Enable detailed logging and debugging</p>
                    </div>
                    <Switch
                      checked={systemSettings.debugMode}
                      onCheckedChange={(checked) => handleSystemSettingChange('debugMode', checked, 'Enable debug mode')}
                      data-testid="debug-toggle"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Refresh Interval (seconds)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="300"
                      value={systemSettings.refreshInterval}
                      onChange={(e) => handleSystemSettingChange('refreshInterval', parseInt(e.target.value), 'Data refresh interval in seconds')}
                      className="bg-slate-800/50 border-slate-600"
                      data-testid="refresh-interval-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300">Log Retention (days)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      value={systemSettings.maxLogRetention}
                      onChange={(e) => handleSystemSettingChange('maxLogRetention', parseInt(e.target.value), 'Maximum log retention period in days')}
                      className="bg-slate-800/50 border-slate-600"
                      data-testid="log-retention-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300">Export Format</Label>
                    <Select 
                      value={systemSettings.exportFormat} 
                      onValueChange={(value) => handleSystemSettingChange('exportFormat', value, 'Default export file format')}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xml">XML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card className="glass-morphism" data-testid="advanced-settings">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white flex items-center">
                <Shield className="w-5 h-5 mr-2 text-cyber-red" />
                Advanced Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">WebSocket Timeout (seconds)</Label>
                    <Input
                      type="number"
                      min="10"
                      max="300"
                      value={advancedSettings.webSocketTimeout}
                      onChange={(e) => handleAdvancedSettingChange('webSocketTimeout', parseInt(e.target.value), 'WebSocket connection timeout')}
                      className="bg-slate-800/50 border-slate-600"
                      data-testid="websocket-timeout-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300">API Request Timeout (seconds)</Label>
                    <Input
                      type="number"
                      min="5"
                      max="60"
                      value={advancedSettings.apiRequestTimeout}
                      onChange={(e) => handleAdvancedSettingChange('apiRequestTimeout', parseInt(e.target.value), 'API request timeout duration')}
                      className="bg-slate-800/50 border-slate-600"
                      data-testid="api-timeout-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300">Max Concurrent Connections</Label>
                    <Input
                      type="number"
                      min="10"
                      max="1000"
                      value={advancedSettings.maxConcurrentConnections}
                      onChange={(e) => handleAdvancedSettingChange('maxConcurrentConnections', parseInt(e.target.value), 'Maximum concurrent connections allowed')}
                      className="bg-slate-800/50 border-slate-600"
                      data-testid="max-connections-input"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Cache Duration (seconds)</Label>
                    <Input
                      type="number"
                      min="60"
                      max="3600"
                      value={advancedSettings.cacheDuration}
                      onChange={(e) => handleAdvancedSettingChange('cacheDuration', parseInt(e.target.value), 'Cache duration for API responses')}
                      className="bg-slate-800/50 border-slate-600"
                      data-testid="cache-duration-input"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Enable Compression</Label>
                      <p className="text-sm text-slate-400">Compress API responses to reduce bandwidth</p>
                    </div>
                    <Switch
                      checked={advancedSettings.compressionEnabled}
                      onCheckedChange={(checked) => handleAdvancedSettingChange('compressionEnabled', checked, 'Enable response compression')}
                      data-testid="compression-toggle"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Import/Export Settings */}
          <Card className="glass-morphism" data-testid="import-export-settings">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white flex items-center">
                <Database className="w-5 h-5 mr-2 text-cyber-amber" />
                Backup & Restore
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-white">Import Settings</h4>
                  <p className="text-sm text-slate-400">Import settings from a previously exported file</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                    id="import-settings"
                  />
                  <Button
                    onClick={() => document.getElementById('import-settings')?.click()}
                    variant="outline"
                    className="border-cyber-green/30 text-cyber-green hover:bg-cyber-green/20"
                    data-testid="import-settings-button"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import Settings
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-white">Export Settings</h4>
                  <p className="text-sm text-slate-400">Download current settings as a backup file</p>
                </div>
                <Button
                  onClick={() => exportSettingsMutation.mutate()}
                  disabled={exportSettingsMutation.isPending}
                  variant="outline"
                  className="border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/20"
                  data-testid="export-settings-button"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {exportSettingsMutation.isPending ? 'Exporting...' : 'Export Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
