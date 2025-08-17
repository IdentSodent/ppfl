import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Database, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Activity
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface AIModel {
  id: string;
  name: string;
  version: string;
  type: string;
  architecture: string;
  status: 'training' | 'ready' | 'deployed' | 'failed';
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  trainedOn: string[];
  modelPath?: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

interface TrainingDataset {
  id: string;
  name: string;
  type: string;
  classes: string[];
  samples: number;
  description?: string;
  source?: string;
  status: 'available' | 'processing' | 'ready';
  metadata: any;
  createdAt: string;
}

export function AIModelsManager() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [datasets, setDatasets] = useState<TrainingDataset[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: initialModels, isLoading: modelsLoading } = useQuery({
    queryKey: ['/api/ai/models'],
  });

  const { data: initialDatasets, isLoading: datasetsLoading } = useQuery({
    queryKey: ['/api/datasets'],
  });

  const { lastMessage } = useWebSocket('/ws');

  useEffect(() => {
    if (initialModels && Array.isArray(initialModels)) {
      setModels(initialModels);
    }
  }, [initialModels]);

  useEffect(() => {
    if (initialDatasets && Array.isArray(initialDatasets)) {
      setDatasets(initialDatasets);
    }
  }, [initialDatasets]);

  useEffect(() => {
    if (lastMessage?.type === 'ai_model_created' || lastMessage?.type === 'ai_model_updated') {
      setModels(prev => {
        const newModels = [...prev];
        const existingIndex = newModels.findIndex(m => m.id === lastMessage.data.id);
        if (existingIndex >= 0) {
          newModels[existingIndex] = lastMessage.data;
        } else {
          newModels.unshift(lastMessage.data);
        }
        return newModels;
      });
    }

    if (lastMessage?.type === 'dataset_created') {
      setDatasets(prev => [lastMessage.data, ...prev]);
    }
  }, [lastMessage]);

  const retrainModelMutation = useMutation({
    mutationFn: async (modelId: string) => {
      const response = await apiRequest('PUT', `/api/ai/models/${modelId}`, {
        status: 'training',
        updatedAt: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Model Retraining Started",
        description: "The AI model is being retrained with the latest federated learning updates",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ai/models'] });
    },
    onError: (error) => {
      toast({
        title: "Retraining Failed",
        description: error instanceof Error ? error.message : "Failed to start model retraining",
        variant: "destructive",
      });
    },
  });

  const deployModelMutation = useMutation({
    mutationFn: async (modelId: string) => {
      const response = await apiRequest('PUT', `/api/ai/models/${modelId}`, {
        status: 'deployed',
        updatedAt: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Model Deployed",
        description: "The AI model has been successfully deployed to edge devices",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ai/models'] });
    },
    onError: (error) => {
      toast({
        title: "Deployment Failed",
        description: error instanceof Error ? error.message : "Failed to deploy model",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-cyber-green/20 text-cyber-green border-cyber-green/30';
      case 'ready': return 'bg-cyber-blue/20 text-cyber-blue border-cyber-blue/30';
      case 'training': return 'bg-cyber-amber/20 text-cyber-amber border-cyber-amber/30';
      case 'failed': return 'bg-cyber-red/20 text-cyber-red border-cyber-red/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed': return <CheckCircle className="w-4 h-4" />;
      case 'ready': return <Activity className="w-4 h-4" />;
      case 'training': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const deployedModel = models.find(m => m.status === 'deployed');
  const avgAccuracy = models.length > 0 
    ? models.reduce((sum, m) => sum + (m.accuracy || 0), 0) / models.length 
    : 0;

  if (modelsLoading || datasetsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass-morphism animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-700 rounded mb-2"></div>
                <div className="h-8 bg-slate-700 rounded mb-4"></div>
                <div className="h-4 bg-slate-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Model Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-morphism" data-testid="deployed-model-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Deployed Model</p>
                <p className="text-2xl font-bold text-white" data-testid="deployed-model-name">
                  {deployedModel ? deployedModel.name : 'None'}
                </p>
                {deployedModel && (
                  <p className="text-xs text-slate-500">
                    v{deployedModel.version} • {deployedModel.architecture.toUpperCase()}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-cyber-green/20 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-cyber-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-morphism" data-testid="model-accuracy-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Model Accuracy</p>
                <p className="text-2xl font-bold text-cyber-green" data-testid="model-accuracy">
                  {avgAccuracy > 0 ? `${(avgAccuracy * 100).toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-cyber-green/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-cyber-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-morphism" data-testid="training-datasets-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Training Datasets</p>
                <p className="text-2xl font-bold text-cyber-blue" data-testid="datasets-count">
                  {datasets.length}
                </p>
                <p className="text-xs text-slate-500">
                  {datasets.reduce((sum, d) => sum + d.samples, 0).toLocaleString()} samples
                </p>
              </div>
              <div className="w-12 h-12 bg-cyber-blue/20 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-cyber-blue" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Models Management */}
      <Card className="glass-morphism" data-testid="ai-models-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">AI Models</CardTitle>
        </CardHeader>
        <CardContent>
          {models.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No AI Models</h3>
              <p className="text-slate-400">
                AI models will appear here once training begins.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {models.map((model) => (
                <div 
                  key={model.id}
                  className="flex items-center justify-between bg-slate-800/30 rounded-lg p-4"
                  data-testid={`model-${model.id}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-cyber-blue/20 rounded-lg flex items-center justify-center">
                      {getStatusIcon(model.status)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-white">{model.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          v{model.version}
                        </Badge>
                        <Badge 
                          className={`text-xs ${getStatusColor(model.status)}`}
                        >
                          {model.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">
                        {model.architecture.toUpperCase()} • {model.type.replace('_', ' ')}
                      </p>
                      {model.accuracy && (
                        <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                          <span>Accuracy: {(model.accuracy * 100).toFixed(1)}%</span>
                          <span>Precision: {(model.precision! * 100).toFixed(1)}%</span>
                          <span>Recall: {(model.recall! * 100).toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {model.status === 'ready' && (
                      <Button
                        size="sm"
                        onClick={() => deployModelMutation.mutate(model.id)}
                        disabled={deployModelMutation.isPending}
                        className="bg-cyber-green/20 border border-cyber-green/30 text-cyber-green hover:bg-cyber-green/30"
                        data-testid={`deploy-model-${model.id}`}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Deploy
                      </Button>
                    )}
                    {(model.status === 'deployed' || model.status === 'ready') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retrainModelMutation.mutate(model.id)}
                        disabled={retrainModelMutation.isPending}
                        data-testid={`retrain-model-${model.id}`}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Retrain
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training Datasets */}
      <Card className="glass-morphism" data-testid="training-datasets-list">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">Training Datasets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {datasets.map((dataset) => (
              <div 
                key={dataset.id}
                className="bg-slate-800/30 rounded-lg p-4"
                data-testid={`dataset-${dataset.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-cyber-blue/20 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5 text-cyber-blue" />
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(dataset.status)}`}
                  >
                    {dataset.status.toUpperCase()}
                  </Badge>
                </div>
                <h3 className="font-medium text-white mb-1">{dataset.name}</h3>
                <p className="text-sm text-slate-400 mb-2">
                  {dataset.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Samples:</span>
                    <span className="text-white font-mono">{dataset.samples.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Classes:</span>
                    <span className="text-white font-mono">{dataset.classes.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Source:</span>
                    <span className="text-cyber-blue font-mono text-xs truncate ml-2">
                      {dataset.source || 'Custom'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {dataset.classes.slice(0, 5).map((cls, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {cls}
                    </Badge>
                  ))}
                  {dataset.classes.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{dataset.classes.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}