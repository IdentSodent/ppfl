import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { AnomalyDetectionService } from "./services/anomalyDetection";
import { FederatedLearningOrchestrator } from "./services/flOrchestrator";
import { ClientSimulator } from "./services/clientSimulator";
import { insertAnomalySchema, insertEdgeDeviceSchema, insertFLRoundSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'video/quicktime'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize services
  const anomalyService = new AnomalyDetectionService();
  const flOrchestrator = new FederatedLearningOrchestrator();
  const clientSimulator = new ClientSimulator();
  
  // Start background services
  await anomalyService.initialize();
  flOrchestrator.startTraining();
  clientSimulator.startSimulation();
  
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const broadcastToClients = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Handle client messages
        console.log('Received message:', data);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  // API Routes

  // Dashboard metrics
  app.get('/api/dashboard/metrics', async (req, res) => {
    try {
      const activeAnomalies = await storage.getActiveAnomalies();
      const currentRound = await storage.getCurrentFLRound();
      const privacyBudget = await storage.getPrivacyBudget();
      const modelAccuracy = await storage.getLatestModelAccuracy();
      const edgeDevices = await storage.getAllEdgeDevices();

      res.json({
        activeAnomalies: activeAnomalies.length,
        flProgress: currentRound ? Math.round(((currentRound.participatingClients || 0) / currentRound.totalClients) * 100) : 0,
        privacyBudget: privacyBudget?.budgetRemaining || 6.0,
        modelAccuracy: modelAccuracy || 94.7,
        totalClients: edgeDevices.length,
        onlineClients: edgeDevices.filter(d => d.status === 'online').length,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
    }
  });

  // Edge devices
  app.get('/api/devices', async (req, res) => {
    try {
      const devices = await storage.getAllEdgeDevices();
      res.json(devices);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch edge devices' });
    }
  });

  app.post('/api/devices', async (req, res) => {
    try {
      const deviceData = insertEdgeDeviceSchema.parse(req.body);
      const device = await storage.createEdgeDevice(deviceData);
      
      broadcastToClients({ type: 'device_added', data: device });
      res.json(device);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid device data', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create edge device' });
      }
    }
  });

  // Anomaly detection
  app.get('/api/anomalies', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const anomalies = await storage.getRecentAnomalies(limit);
      res.json(anomalies);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch anomalies' });
    }
  });

  // File upload for anomaly detection
  app.post('/api/upload', upload.array('files', 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const results = [];
      for (const file of files) {
        try {
          const detection = await anomalyService.processFile(file);
          results.push({
            fileName: file.originalname,
            status: 'processed',
            detection,
          });
          
          // Broadcast real-time update
          broadcastToClients({
            type: 'anomaly_detected',
            data: detection,
          });
        } catch (error) {
          results.push({
            fileName: file.originalname,
            status: 'error',
            error: error instanceof Error ? error.message : 'Processing failed',
          });
        }
      }

      res.json({ results });
    } catch (error) {
      res.status(500).json({ error: 'File upload failed' });
    }
  });

  // Federated learning
  app.get('/api/fl/current-round', async (req, res) => {
    try {
      const currentRound = await storage.getCurrentFLRound();
      res.json(currentRound);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch current FL round' });
    }
  });

  app.get('/api/fl/rounds', async (req, res) => {
    try {
      const rounds = await storage.getAllFLRounds();
      res.json(rounds);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch FL rounds' });
    }
  });

  app.post('/api/fl/start-round', async (req, res) => {
    try {
      const roundData = insertFLRoundSchema.parse(req.body);
      const round = await storage.createFLRound(roundData);
      
      broadcastToClients({
        type: 'fl_round_started',
        data: round,
      });
      
      res.json(round);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid round data', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to start FL round' });
      }
    }
  });

  // Privacy metrics
  app.get('/api/privacy/metrics', async (req, res) => {
    try {
      const metrics = await storage.getPrivacyMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch privacy metrics' });
    }
  });

  // Model registry
  app.get('/api/models', async (req, res) => {
    try {
      const models = await storage.getAllModels();
      res.json(models);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch models' });
    }
  });

  // Real-time updates setup
  const sendPeriodicUpdates = () => {
    setInterval(async () => {
      try {
        const metrics = await storage.getDashboardMetrics();
        broadcastToClients({
          type: 'metrics_update',
          data: metrics,
        });
      } catch (error) {
        console.error('Failed to send periodic updates:', error);
      }
    }, 5000); // Update every 5 seconds
  };

  sendPeriodicUpdates();

  return httpServer;
}
