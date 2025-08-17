import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Database, Download, Play, Pause, GitBranch, TrendingUp, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Model {
  id: string;
  modelName: string;
  version: string;
  accuracy?: number;
  modelSize: number;
  isDeployed: boolean;
  deployedAt?: string;
  createdAt: string;
  metadata?: any;
}

export default function ModelsPage() {
  const { data: models = [] } = useQuery<Model[]>({
    queryKey: ["/api/models"],
  });

  const deployedModel = models.find(m => m.isDeployed);
  const totalModels = models.length;
  const avgAccuracy = models.length > 0 
    ? models.reduce((sum, m) => sum + (m.accuracy || 0), 0) / models.length 
    : 0;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="glass-morphism border-b border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Model Registry</h2>
              <p className="text-slate-400">Manage and deploy federated learning models</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 glass-morphism rounded-lg">
                <Database className="w-4 h-4 text-cyber-blue" />
                <span className="text-sm font-mono text-white">{totalModels} Models</span>
              </div>
              <Button className="bg-cyber-blue/20 border border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/30">
                <GitBranch className="w-4 h-4 mr-2" />
                New Version
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Model Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass-morphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Models</p>
                    <p className="text-3xl font-bold text-white">{totalModels}</p>
                  </div>
                  <div className="w-12 h-12 bg-cyber-blue/20 rounded-lg flex items-center justify-center">
                    <Database className="w-6 h-6 text-cyber-blue" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-morphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Deployed</p>
                    <p className="text-3xl font-bold text-cyber-green">
                      {deployedModel ? '1' : '0'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-cyber-green/20 rounded-lg flex items-center justify-center">
                    <Play className="w-6 h-6 text-cyber-green" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-morphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Avg. Accuracy</p>
                    <p className="text-3xl font-bold text-cyber-amber">
                      {(avgAccuracy * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-cyber-amber/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-cyber-amber" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-morphism">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Last Updated</p>
                    <p className="text-lg font-bold text-white">
                      {models[0] ? formatDistanceToNow(new Date(models[0].createdAt), { addSuffix: true }) : 'Never'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-slate-600/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-slate-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Currently Deployed Model */}
          {deployedModel && (
            <Card className="glass-morphism border-cyber-green/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-cyber-green rounded-full animate-pulse"></div>
                    <CardTitle className="text-xl font-semibold text-white">Currently Deployed</CardTitle>
                  </div>
                  <Badge variant="outline" className="border-cyber-green text-cyber-green bg-cyber-green/20">
                    PRODUCTION
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <span className="text-slate-400 text-sm">Model Name</span>
                    <p className="text-white font-medium">{deployedModel.modelName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm">Version</span>
                    <p className="text-cyber-blue font-mono">{deployedModel.version}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm">Accuracy</span>
                    <p className="text-cyber-green font-mono text-lg">
                      {deployedModel.accuracy ? `${(deployedModel.accuracy * 100).toFixed(1)}%` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm">Size</span>
                    <p className="text-white">{formatFileSize(deployedModel.modelSize)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" className="border-cyber-red text-cyber-red hover:bg-cyber-red/20">
                    <Pause className="w-4 h-4 mr-2" />
                    Rollback
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-600/50">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Model Registry */}
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">Model Versions</CardTitle>
            </CardHeader>
            <CardContent>
              {models.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">No models found in registry</p>
                  <p className="text-slate-500 text-sm mt-1">Models will appear here after federated learning rounds complete</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {models.map((model) => (
                    <div 
                      key={model.id}
                      className={`bg-slate-800/30 rounded-lg p-4 transition-all hover:bg-slate-700/30 ${
                        model.isDeployed ? 'border border-cyber-green/30' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-cyber-blue/20 rounded-lg flex items-center justify-center">
                            <Database className="w-5 h-5 text-cyber-blue" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-white">{model.modelName}</span>
                              <Badge variant="outline" className="text-xs">
                                v{model.version}
                              </Badge>
                              {model.isDeployed && (
                                <Badge variant="outline" className="text-xs border-cyber-green text-cyber-green bg-cyber-green/20">
                                  DEPLOYED
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-slate-400">
                              <span>Size: {formatFileSize(model.modelSize)}</span>
                              <span>Created: {formatDistanceToNow(new Date(model.createdAt), { addSuffix: true })}</span>
                              {model.deployedAt && (
                                <span>Deployed: {formatDistanceToNow(new Date(model.deployedAt), { addSuffix: true })}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          {model.accuracy && (
                            <div className="text-right">
                              <p className="text-lg font-mono text-cyber-green">
                                {(model.accuracy * 100).toFixed(1)}%
                              </p>
                              <p className="text-xs text-slate-400">accuracy</p>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            {!model.isDeployed && (
                              <Button variant="outline" size="sm" className="text-cyber-green border-cyber-green hover:bg-cyber-green/20">
                                <Play className="w-4 h-4 mr-1" />
                                Deploy
                              </Button>
                            )}
                            <Button variant="outline" size="sm" className="text-slate-400 border-slate-600 hover:bg-slate-600/50">
                              <Download className="w-4 h-4 mr-1" />
                              Export
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Model Performance Comparison */}
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {models.filter(m => m.accuracy).slice(0, 5).map((model, index) => (
                  <div key={model.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                        <span className="text-slate-300 font-mono text-sm">#{index + 1}</span>
                      </div>
                      <div>
                        <span className="text-white font-medium">{model.modelName} v{model.version}</span>
                        <p className="text-slate-400 text-sm">{formatFileSize(model.modelSize)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-mono text-white">
                          {model.accuracy ? `${(model.accuracy * 100).toFixed(1)}%` : 'N/A'}
                        </p>
                        <p className="text-xs text-slate-400">accuracy</p>
                      </div>
                      <div className="w-24 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-cyber-blue to-cyber-green h-2 rounded-full"
                          style={{ width: `${model.accuracy ? model.accuracy * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}