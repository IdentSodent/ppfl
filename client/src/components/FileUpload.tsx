import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, File, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: 'uploaded' | 'processing' | 'analyzed' | 'error';
  analysisResults?: any;
  uploadedAt: string;
}

interface FileUploadProps {
  deviceId?: string;
  onAnalysisComplete?: (file: UploadedFile, analysis: any) => void;
}

const FileUpload = ({ deviceId, onAnalysisComplete }: FileUploadProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      if (deviceId) formData.append('deviceId', deviceId);
      formData.append('uploadedBy', 'user');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return response.json();
    },
    onSuccess: (uploadedFile: UploadedFile) => {
      setUploadedFiles(prev => [...prev, uploadedFile]);

      // Start polling for analysis results
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/uploads`);
          const files = await response.json();
          const currentFile = files.find((f: UploadedFile) => f.id === uploadedFile.id);

          if (currentFile && currentFile.status !== 'uploaded' && currentFile.status !== 'processing') {
            setUploadedFiles(prev =>
              prev.map(f => f.id === uploadedFile.id ? currentFile : f)
            );

            if (currentFile.status === 'analyzed' && onAnalysisComplete) {
              onAnalysisComplete(currentFile, currentFile.analysisResults);
            }

            clearInterval(pollInterval);

            if (currentFile.status === 'analyzed') {
              toast({
                title: "Analysis Complete",
                description: currentFile.analysisResults?.anomalyDetected
                  ? `${currentFile.analysisResults.anomalyType} detected with ${(currentFile.analysisResults.confidence * 100).toFixed(1)}% confidence`
                  : "No anomalies detected",
                variant: currentFile.analysisResults?.anomalyDetected ? "destructive" : "default",
              });
            }
          }
        } catch (error) {
          console.error('Failed to fetch analysis results:', error);
          clearInterval(pollInterval);
        }
      }, 2000);

      // Stop polling after 60 seconds
      setTimeout(() => clearInterval(pollInterval), 60000);

      toast({
        title: "File Uploaded",
        description: `${uploadedFile.originalName} uploaded successfully. Analysis in progress...`,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/uploads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/anomalies'] });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload files smaller than 50MB",
          variant: "destructive",
        });
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'video/mov', 'video/mkv'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload images (JPEG, PNG, GIF) or videos (MP4, AVI, MOV, MKV)",
          variant: "destructive",
        });
        return;
      }

      uploadMutation.mutate(file);
    });
  }, [uploadMutation, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.avi', '.mov', '.mkv']
    },
    maxFiles: 5,
    multiple: true
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded':
      case 'processing':
        return <Clock className="w-4 h-4 text-cyber-blue" />;
      case 'analyzed':
        return <CheckCircle className="w-4 h-4 text-cyber-green" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-cyber-red" />;
      default:
        return <File className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card className="glass-morphism" data-testid="file-upload-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">
            AI-Powered Anomaly Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-cyber-blue bg-cyber-blue/10'
                : 'border-slate-600 hover:border-cyber-blue/50'
            }`}
            data-testid="dropzone"
          >
            <input {...getInputProps()} data-testid="file-input" />
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-cyber-blue">Drop files here...</p>
            ) : (
              <div className="space-y-2">
                <p className="text-slate-300">
                  Drag & drop surveillance files here, or click to select
                </p>
                <p className="text-sm text-slate-500">
                  Supports images (JPEG, PNG, GIF) and videos (MP4, AVI, MOV, MKV) up to 50MB
                </p>
              </div>
            )}
          </div>

          {uploadMutation.isPending && (
            <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-4 w-4 border border-cyber-blue border-t-transparent"></div>
                <span className="text-sm text-slate-300">Uploading and analyzing...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card className="glass-morphism" data-testid="uploaded-files-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between bg-slate-800/30 rounded-lg p-4"
                  data-testid={`file-${file.id}`}
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(file.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">
                          {file.originalName}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {file.status.toUpperCase()}
                        </Badge>
                      </div>
                      {file.analysisResults && (
                        <div className="mt-1 space-y-1">
                          <p className="text-sm text-slate-400">
                            {file.analysisResults.description}
                          </p>
                          {file.analysisResults.anomalyDetected && (
                            <div className="flex items-center space-x-2">
                              <Badge
                                className={`text-xs ${getSeverityColor(file.analysisResults.severity)}`}
                              >
                                {file.analysisResults.severity?.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-slate-400">
                                Confidence: {(file.analysisResults.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="text-slate-400 hover:text-white"
                    data-testid={`remove-file-${file.id}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;
export { FileUpload };