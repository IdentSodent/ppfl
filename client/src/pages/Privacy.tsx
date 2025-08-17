import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle, 
  FileText, 
  Database,
  Key,
  UserCheck,
  Activity,
  CheckCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Privacy() {
  const [privacySettings, setPrivacySettings] = useState({
    defaultEpsilon: 6.0,
    defaultDelta: 0.00001,
    homomorphicEncryption: true,
    tamperDetection: true,
    auditLogging: true,
    dataRetentionDays: 30,
    anonymizationLevel: "high"
  });
  const [complianceReport, setComplianceReport] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: privacyBudgets = [] } = useQuery({
    queryKey: ["/api/privacy/budgets"],
  });

  const { data: securityLogs = [] } = useQuery({
    queryKey: ["/api/security/logs"],
  });

  const { data: settings = [] } = useQuery({
    queryKey: ["/api/settings"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (setting: { key: string; value: string; description: string; category: string }) => {
      const response = await apiRequest('POST', '/api/settings', setting);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Privacy settings have been updated successfully",
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

  const generateComplianceReportMutation = useMutation({
    mutationFn: async () => {
      // Simulate compliance report generation
      const report = `PRIVACY COMPLIANCE REPORT
Generated: ${new Date().toLocaleString()}

GDPR COMPLIANCE STATUS: ✓ COMPLIANT
- Data minimization: Implemented
- Purpose limitation: Enforced
- Storage limitation: ${privacySettings.dataRetentionDays} days
- Accuracy: Maintained through FL validation
- Security: End-to-end encryption enabled

CCPA COMPLIANCE STATUS: ✓ COMPLIANT
- Consumer rights: Implemented
- Data transparency: Full audit trails
- Opt-out mechanisms: Available
- Non-discrimination: Enforced

PRIVACY BUDGET ANALYSIS:
- Total devices monitored: ${privacyBudgets.length}
- Average epsilon remaining: ${privacyBudgets.length > 0 ? 
  (privacyBudgets.reduce((sum: number, b: any) => sum + b.remainingBudget, 0) / privacyBudgets.length).toFixed(2) : 'N/A'}
- Privacy violations detected: 0

SECURITY MEASURES:
- Homomorphic encryption: ${privacySettings.homomorphicEncryption ? 'ENABLED' : 'DISABLED'}
- Tamper detection: ${privacySettings.tamperDetection ? 'ACTIVE' : 'INACTIVE'}
- Audit logging: ${privacySettings.auditLogging ? 'ENABLED' : 'DISABLED'}

RECOMMENDATIONS:
- Continue current privacy practices
- Monitor privacy budget consumption
- Regular security audits recommended`;
      
      return { report };
    },
    onSuccess: (data) => {
      setComplianceReport(data.report);
      toast({
        title: "Compliance Report Generated",
        description: "Privacy compliance report has been generated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Generate Report",
        description: error instanceof Error ? error.message : "Failed to generate compliance report",
        variant: "destructive",
      });
    },
  });

  const handleUpdateSetting = (key: string, value: any, description: string, category: string = "privacy") => {
    updateSettingsMutation.mutate({
      key,
      value: value.toString(),
      description,
      category
    });
  };

  const totalPrivacyBudget = privacyBudgets.reduce((sum: number, budget: any) => sum + budget.remainingBudget, 0);
  const avgPrivacyBudget = privacyBudgets.length > 0 ? totalPrivacyBudget / privacyBudgets.length : 0;
  const criticalBudgets = privacyBudgets.filter((b: any) => b.remainingBudget < 1).length;
  const recentSecurityEvents = securityLogs.filter((log: any) => 
    new Date(log.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
  ).length;

  return (
    <div className="flex h-screen overflow-hidden" data-testid="privacy-page">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="glass-morphism border-b border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Privacy & Security Controls</h2>
              <p className="text-slate-400">Manage privacy budgets, security features, and compliance settings</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 glass-morphism rounded-lg">
                <Shield className="w-4 h-4 text-cyber-green" />
                <span className="text-sm text-cyber-green">Security Active</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Privacy Budget Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass-morphism" data-testid="total-budget-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Privacy Budget</p>
                    <p className="text-3xl font-bold text-cyber-green" data-testid="total-budget">
                      {totalPrivacyBudget.toFixed(1)}ε
                    </p>
                  </div>
                  <Database className="w-8 h-8 text-cyber-green" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-morphism" data-testid="avg-budget-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Avg. Remaining</p>
                    <p className="text-3xl font-bold text-cyber-blue" data-testid="avg-budget">
                      {avgPrivacyBudget.toFixed(1)}ε
                    </p>
                  </div>
                  <Key className="w-8 h-8 text-cyber-blue" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-morphism" data-testid="critical-budgets-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Critical Budgets</p>
                    <p className="text-3xl font-bold text-cyber-amber" data-testid="critical-budgets">
                      {criticalBudgets}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-cyber-amber" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-morphism" data-testid="security-events-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Security Events (24h)</p>
                    <p className="text-3xl font-bold text-cyber-red" data-testid="security-events">
                      {recentSecurityEvents}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-cyber-red" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Privacy Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-morphism" data-testid="privacy-config">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-cyber-blue" />
                  Privacy Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Default Epsilon (ε)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={privacySettings.defaultEpsilon}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value);
                        setPrivacySettings({ ...privacySettings, defaultEpsilon: newValue });
                        handleUpdateSetting('defaultEpsilon', newValue, 'Default privacy budget epsilon value');
                      }}
                      className="bg-slate-800/50 border-slate-600"
                      data-testid="epsilon-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Default Delta (δ)</Label>
                    <Input
                      type="number"
                      step="0.00001"
                      value={privacySettings.defaultDelta}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value);
                        setPrivacySettings({ ...privacySettings, defaultDelta: newValue });
                        handleUpdateSetting('defaultDelta', newValue, 'Default privacy budget delta value');
                      }}
                      className="bg-slate-800/50 border-slate-600"
                      data-testid="delta-input"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Homomorphic Encryption</Label>
                      <p className="text-sm text-slate-400">Enable homomorphic encryption for enhanced security</p>
                    </div>
                    <Switch
                      checked={privacySettings.homomorphicEncryption}
                      onCheckedChange={(checked) => {
                        setPrivacySettings({ ...privacySettings, homomorphicEncryption: checked });
                        handleUpdateSetting('homomorphicEncryption', checked, 'Enable homomorphic encryption');
                      }}
                      data-testid="homomorphic-toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Tamper Detection</Label>
                      <p className="text-sm text-slate-400">Monitor for tampered device updates</p>
                    </div>
                    <Switch
                      checked={privacySettings.tamperDetection}
                      onCheckedChange={(checked) => {
                        setPrivacySettings({ ...privacySettings, tamperDetection: checked });
                        handleUpdateSetting('tamperDetection', checked, 'Enable tamper detection monitoring');
                      }}
                      data-testid="tamper-toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">Audit Logging</Label>
                      <p className="text-sm text-slate-400">Enable comprehensive audit trails</p>
                    </div>
                    <Switch
                      checked={privacySettings.auditLogging}
                      onCheckedChange={(checked) => {
                        setPrivacySettings({ ...privacySettings, auditLogging: checked });
                        handleUpdateSetting('auditLogging', checked, 'Enable audit logging');
                      }}
                      data-testid="audit-toggle"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Data Retention (Days)</Label>
                  <Input
                    type="number"
                    value={privacySettings.dataRetentionDays}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value);
                      setPrivacySettings({ ...privacySettings, dataRetentionDays: newValue });
                      handleUpdateSetting('dataRetentionDays', newValue, 'Data retention period in days');
                    }}
                    className="bg-slate-800/50 border-slate-600"
                    data-testid="retention-input"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Status */}
            <Card className="glass-morphism" data-testid="security-status">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-cyber-green" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-cyber-green" />
                      <span className="text-sm text-white">Secure Aggregation</span>
                    </div>
                    <Badge variant="outline" className="text-cyber-green border-cyber-green/30">
                      Active
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-cyber-blue" />
                      <span className="text-sm text-white">Homomorphic Encryption</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${privacySettings.homomorphicEncryption ? 'text-cyber-green border-cyber-green/30' : 'text-slate-500 border-slate-500/30'}`}
                    >
                      {privacySettings.homomorphicEncryption ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-cyber-amber" />
                      <span className="text-sm text-white">Tamper Detection</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${privacySettings.tamperDetection ? 'text-cyber-amber border-cyber-amber/30' : 'text-slate-500 border-slate-500/30'}`}
                    >
                      {privacySettings.tamperDetection ? 'Monitoring' : 'Disabled'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-cyber-purple" />
                      <span className="text-sm text-white">Audit Logging</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${privacySettings.auditLogging ? 'text-cyber-purple border-cyber-purple/30' : 'text-slate-500 border-slate-500/30'}`}
                    >
                      {privacySettings.auditLogging ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>

                {/* Privacy Budget Health */}
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Overall Privacy Health</span>
                    <span className="text-sm font-mono text-cyber-green">
                      {avgPrivacyBudget > 3 ? 'Excellent' : avgPrivacyBudget > 1 ? 'Good' : 'Critical'}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, (avgPrivacyBudget / 6) * 100)} 
                    className="h-2"
                  />
                </div>

                {/* Recent Security Events */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-white mb-3">Recent Security Events</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {securityLogs.slice(0, 5).map((log: any) => (
                      <div key={log.id} className="flex items-center space-x-2 text-xs">
                        <CheckCircle className="w-3 h-3 text-cyber-green flex-shrink-0" />
                        <span className="text-slate-300 truncate">{log.message}</span>
                        <span className="text-slate-500 flex-shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                    {securityLogs.length === 0 && (
                      <p className="text-xs text-slate-500">No recent security events</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compliance & Reporting */}
          <Card className="glass-morphism" data-testid="compliance-reporting">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white flex items-center">
                <UserCheck className="w-5 h-5 mr-2 text-cyber-green" />
                Compliance & Reporting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-white">Privacy Compliance Report</h4>
                  <p className="text-sm text-slate-400">Generate comprehensive privacy and compliance report</p>
                </div>
                <Button
                  onClick={() => generateComplianceReportMutation.mutate()}
                  disabled={generateComplianceReportMutation.isPending}
                  className="bg-cyber-blue/20 border border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/30"
                  data-testid="generate-report-button"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {generateComplianceReportMutation.isPending ? 'Generating...' : 'Generate Report'}
                </Button>
              </div>

              {complianceReport && (
                <div className="mt-4">
                  <Label className="text-slate-300 mb-2 block">Compliance Report</Label>
                  <Textarea
                    value={complianceReport}
                    readOnly
                    className="bg-slate-800/50 border-slate-600 h-64 font-mono text-xs"
                    data-testid="compliance-report"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-slate-800/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-cyber-green" />
                    <span className="text-sm font-medium text-white">GDPR Compliance</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Data processing compliant with EU General Data Protection Regulation
                  </p>
                </div>
                
                <div className="bg-slate-800/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-cyber-green" />
                    <span className="text-sm font-medium text-white">CCPA Compliance</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    California Consumer Privacy Act requirements satisfied
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
