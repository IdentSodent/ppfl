import { storage } from '../storage';
import { InsertEdgeDevice, InsertAnomaly } from '@shared/schema';

interface SimulatedClient {
  id: string;
  deviceId: string;
  type: string;
  baseLatency: number;
  activityCycle: number;
  lastActivity: Date;
}

export class ClientSimulator {
  private clients: SimulatedClient[] = [];
  private isRunning = false;
  private readonly deviceTypes = [
    'Jetson Nano',
    'Jetson Xavier',
    'Raspberry Pi 4',
    'Desktop GPU',
    'Edge TPU',
    'Intel NUC'
  ];
  
  async startSimulation() {
    if (this.isRunning) return;
    
    console.log('Starting edge client simulation...');
    this.isRunning = true;
    
    // Initialize 20 virtual clients
    await this.initializeClients();
    
    // Start simulation loops
    this.simulateClientActivity();
    this.simulateAnomalyGeneration();
  }
  
  private async initializeClients() {
    // First, get existing devices to avoid duplicates
    const existingDevices = await storage.getAllEdgeDevices();
    const existingDeviceIds = new Set(existingDevices.map(d => d.deviceId));
    
    for (let i = 1; i <= 20; i++) {
      const deviceId = `client-${i.toString().padStart(3, '0')}`;
      
      // Check if device already exists
      if (existingDeviceIds.has(deviceId)) {
        const existingDevice = existingDevices.find(d => d.deviceId === deviceId);
        if (existingDevice) {
          const client: SimulatedClient = {
            id: existingDevice.id,
            deviceId: existingDevice.deviceId,
            type: existingDevice.deviceType,
            baseLatency: existingDevice.latency || 50,
            activityCycle: 30000 + Math.random() * 60000,
            lastActivity: new Date(),
          };
          this.clients.push(client);
          console.log(`Using existing client: ${deviceId} (${existingDevice.deviceType})`);
        }
        continue;
      }
      
      const deviceType = this.deviceTypes[Math.floor(Math.random() * this.deviceTypes.length)];
      
      const clientData: InsertEdgeDevice = {
        deviceId,
        deviceType,
        status: Math.random() > 0.1 ? 'online' : 'offline', // 90% online rate
        capabilities: {
          processingPower: Math.random() * 100,
          memoryGB: 4 + Math.floor(Math.random() * 28), // 4-32GB
          storageGB: 32 + Math.floor(Math.random() * 468), // 32-500GB
          hasCuda: Math.random() > 0.6,
        },
        location: `Location-${Math.floor(Math.random() * 10) + 1}`,
        latency: 20 + Math.floor(Math.random() * 200), // 20-220ms
        isParticipating: Math.random() > 0.3, // 70% participation rate
      };
      
      try {
        const device = await storage.createEdgeDevice(clientData);
        
        const client: SimulatedClient = {
          id: device.id,
          deviceId: device.deviceId,
          type: device.deviceType,
          baseLatency: device.latency || 50,
          activityCycle: 30000 + Math.random() * 60000, // 30-90 seconds
          lastActivity: new Date(),
        };
        
        this.clients.push(client);
        console.log(`Created new client: ${deviceId} (${deviceType})`);
      } catch (error) {
        console.error(`Failed to initialize client ${deviceId}:`, error);
      }
    }
  }
  
  private simulateClientActivity() {
    const updateInterval = 10000; // 10 seconds
    
    setInterval(async () => {
      if (!this.isRunning) return;
      
      for (const client of this.clients) {
        try {
          // Randomly update client status
          const shouldUpdate = Math.random() < 0.1; // 10% chance per interval
          
          if (shouldUpdate) {
            const newStatus = Math.random() > 0.05 ? 'online' : 'offline'; // 95% uptime
            const newLatency = client.baseLatency + (Math.random() - 0.5) * 50;
            
            await storage.updateEdgeDevice(client.id, {
              status: newStatus,
              latency: Math.max(10, Math.floor(newLatency)),
              lastSeen: new Date(),
            });
          }
        } catch (error) {
          console.error(`Error updating client ${client.deviceId}:`, error);
        }
      }
    }, updateInterval);
  }
  
  private simulateAnomalyGeneration() {
    const anomalyInterval = 15000 + Math.random() * 45000; // 15-60 seconds
    
    setTimeout(async () => {
      if (!this.isRunning) return;
      
      try {
        await this.generateRandomAnomaly();
      } catch (error) {
        console.error('Error generating anomaly:', error);
      }
      
      // Schedule next anomaly
      this.simulateAnomalyGeneration();
    }, anomalyInterval);
  }
  
  private async generateRandomAnomaly() {
    const onlineClients = this.clients.filter(async (client) => {
      const device = await storage.getEdgeDevice(client.id);
      return device?.status === 'online';
    });
    
    if (onlineClients.length === 0) return;
    
    const client = onlineClients[Math.floor(Math.random() * onlineClients.length)];
    const anomalyTypes = [
      'violence',
      'theft', 
      'trespassing',
      'suspicious_behavior',
      'unauthorized_access',
      'loitering'
    ];
    
    const anomalyType = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
    const confidence = 0.3 + Math.random() * 0.7; // 30-100%
    
    let severity: string;
    if (confidence > 0.8) severity = 'high';
    else if (confidence > 0.6) severity = 'medium';
    else severity = 'low';
    
    const anomalyData: InsertAnomaly = {
      deviceId: client.id,
      anomalyType,
      confidence: Math.round(confidence * 100) / 100,
      severity,
      location: `Camera #${Math.floor(Math.random() * 20) + 1}`,
      boundingBox: {
        x: Math.floor(Math.random() * 640),
        y: Math.floor(Math.random() * 480),
        width: 50 + Math.floor(Math.random() * 200),
        height: 50 + Math.floor(Math.random() * 150),
      },
      fileName: `frame_${Date.now()}.jpg`,
      fileType: 'image/jpeg',
      filePath: null,
      isResolved: false,
    };
    
    const anomaly = await storage.createAnomaly(anomalyData);
    console.log(`Generated anomaly: ${anomalyType} (${severity}) from ${client.deviceId}`);
  }
  
  stopSimulation() {
    this.isRunning = false;
    console.log('Stopping edge client simulation...');
  }
}
