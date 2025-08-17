import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, FileVideo, FileImage, Cpu, X, CheckCircle, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface FileUploadResult {
  fileName: string;
  status: 'processed' | 'error';
  detection?: {
    type: string;
    confidence: number;
    severity: string;
  };
  error?: string;
}

interface ProcessingFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  result?: FileUploadResult;
}

export function FileUpload() {
  const [processingFiles, setProcessingFiles] = useState<ProcessingFile[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      
      const response = await apiRequest('POST', '/api/upload', formData);
      return response.json();
    },
    onSuccess: (data, files) => {
      const results = data.results as FileUploadResult[];
      
      setProcessingFiles(prev => 
        prev.map((pFile, index) => ({
          ...pFile,
          status: results[index]?.status === 'processed' ? 'completed' : 'error',
          progress: 100,
          result: results[index],
        }))
      );

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/anomalies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });

      const successCount = results.filter(r => r.status === 'processed').length;
      const errorCount = results.filter(r => r.status === 'error').length;

      if (successCount > 0) {
        toast({
          title: "Files Processed",
          description: `${successCount} file(s) processed successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        });
      }
    },
    onError: (error) => {
      setProcessingFiles(prev => 
        prev.map(pFile => ({ ...pFile, status: 'error', progress: 100 }))
      );
      
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Validate file types
    const validFiles = acceptedFiles.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'video/quicktime'];
      return validTypes.includes(file.type);
    });

    if (validFiles.length !== acceptedFiles.length) {
      toast({
        title: "Invalid File Types",
        description: "Only JPG, PNG, GIF, MP4, AVI, and MOV files are supported",
        variant: "destructive",
      });
    }

    if (validFiles.length === 0) return;

    // Add files to processing queue
    const newProcessingFiles: ProcessingFile[] = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'uploading',
    }));

    setProcessingFiles(prev => [...prev, ...newProcessingFiles]);

    // Start upload
    uploadMutation.mutate(validFiles);

    // Simulate upload progress
    newProcessingFiles.forEach((pFile, index) => {
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 90) {
          clearInterval(progressInterval);
          progress = 90;
        }
        
        setProcessingFiles(prev => 
          prev.map(p => 
            p.id === pFile.id 
              ? { ...p, progress, status: progress >= 90 ? 'processing' : 'uploading' }
              : p
          )
        );
      }, 200);
    });
  }, [uploadMutation, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.avi', '.mov'],
    },
    maxFiles: 10,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeProcessingFile = (id: string) => {
    setProcessingFiles(prev => prev.filter(pFile => pFile.id !== id));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FileImage className="w-5 h-5 text-slate-400" />;
    } else if (file.type.startsWith('video/')) {
      return <FileVideo className="w-5 h-5 text-slate-400" />;
    }
    return <FileImage className="w-5 h-5 text-slate-400" />;
  };

  const getStatusIcon = (status: ProcessingFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-cyber-green" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-cyber-red" />;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="glass-morphism">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-white">
            Anomaly Detection Upload
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-cyber-blue" />
            <span className="text-sm text-cyber-blue">TensorFlow.js Ready</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer group ${
            isDragActive 
              ? 'border-cyber-blue/70 bg-cyber-blue/10' 
              : 'border-slate-600 hover:border-cyber-blue/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="group-hover:scale-105 transition-transform">
            <UploadCloud className={`w-12 h-12 mx-auto mb-4 transition-colors ${
              isDragActive ? 'text-cyber-blue' : 'text-slate-400 group-hover:text-cyber-blue'
            }`} />
            <p className="text-lg text-slate-300 mb-2">
              {isDragActive ? 'Drop files here...' : 'Drop files here or click to upload'}
            </p>
            <p className="text-sm text-slate-400">Supports: JPG, PNG, GIF, MP4, AVI, MOV</p>
            <p className="text-xs text-slate-500 mt-2">
              Local processing with TensorFlow.js - no data leaves your device
            </p>
          </div>
        </div>
        
        {/* Processing Queue */}
        {processingFiles.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-white">Processing Queue</h4>
            {processingFiles.map((pFile) => (
              <div key={pFile.id} className="bg-slate-800/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(pFile.file)}
                    <div>
                      <p className="text-sm text-white font-medium">{pFile.file.name}</p>
                      <p className="text-xs text-slate-400">{formatFileSize(pFile.file.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(pFile.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProcessingFile(pFile.id)}
                      className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Progress value={pFile.progress} className="flex-1" />
                  <span className="text-xs text-slate-400 font-mono min-w-[80px]">
                    {pFile.status === 'completed' && pFile.result?.detection 
                      ? `${Math.round(pFile.result.detection.confidence * 100)}% ${pFile.result.detection.type}`
                      : pFile.status === 'error'
                      ? 'Error'
                      : pFile.status === 'processing'
                      ? 'Processing...'
                      : `${Math.round(pFile.progress)}%`
                    }
                  </span>
                </div>
                
                {pFile.result?.detection && (
                  <div className="mt-2 p-2 bg-slate-700/50 rounded text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-white">
                        {pFile.result.detection.type.split('_').map(w => 
                          w.charAt(0).toUpperCase() + w.slice(1)
                        ).join(' ')}
                      </span>
                      <span className={`font-bold ${
                        pFile.result.detection.severity === 'high' ? 'text-cyber-red' :
                        pFile.result.detection.severity === 'medium' ? 'text-cyber-amber' :
                        'text-yellow-500'
                      }`}>
                        {pFile.result.detection.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
                
                {pFile.result?.error && (
                  <div className="mt-2 p-2 bg-cyber-red/20 border border-cyber-red/30 rounded text-xs">
                    <span className="text-cyber-red">{pFile.result.error}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
