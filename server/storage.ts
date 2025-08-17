import { 
  type User, 
  type InsertUser,
  type Device,
  type InsertDevice,
  type FLRound,
  type InsertFLRound,
  type Anomaly,
  type InsertAnomaly,
  type PrivacyBudget,
  type InsertPrivacyBudget,
  type SecurityLog,
  type InsertSecurityLog,
  type SystemSettings,
  type InsertSystemSettings,
  type AIModel,
  type InsertAIModel,
  type TrainingDataset,
  type InsertTrainingDataset,
  type UploadedFile,
  type InsertUploadedFile
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Devices
  getAllDevices(): Promise<Device[]>;
  getDevice(id: string): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: string, updates: Partial<Device>): Promise<Device | undefined>;
  deleteDevice(id: string): Promise<boolean>;

  // FL Rounds
  getAllFLRounds(): Promise<FLRound[]>;
  getFLRound(id: string): Promise<FLRound | undefined>;
  createFLRound(round: InsertFLRound): Promise<FLRound>;
  updateFLRound(id: string, updates: Partial<FLRound>): Promise<FLRound | undefined>;

  // Anomalies
  getAllAnomalies(): Promise<Anomaly[]>;
  getAnomaly(id: string): Promise<Anomaly | undefined>;
  createAnomaly(anomaly: InsertAnomaly): Promise<Anomaly>;
  getAnomaliesByTimeRange(startDate: Date, endDate: Date): Promise<Anomaly[]>;

  // Privacy Budgets
  getAllPrivacyBudgets(): Promise<PrivacyBudget[]>;
  getPrivacyBudgetByDevice(deviceId: string): Promise<PrivacyBudget | undefined>;
  createPrivacyBudget(budget: InsertPrivacyBudget): Promise<PrivacyBudget>;
  updatePrivacyBudget(id: string, updates: Partial<PrivacyBudget>): Promise<PrivacyBudget | undefined>;

  // Security Logs
  getAllSecurityLogs(): Promise<SecurityLog[]>;
  createSecurityLog(log: InsertSecurityLog): Promise<SecurityLog>;

  // System Settings
  getAllSettings(): Promise<SystemSettings[]>;
  getSetting(key: string): Promise<SystemSettings | undefined>;
  setSetting(setting: InsertSystemSettings): Promise<SystemSettings>;

  // AI Models
  getAllAIModels(): Promise<AIModel[]>;
  getAIModel(id: string): Promise<AIModel | undefined>;
  createAIModel(model: InsertAIModel): Promise<AIModel>;
  updateAIModel(id: string, updates: Partial<AIModel>): Promise<AIModel | undefined>;
  deleteAIModel(id: string): Promise<boolean>;

  // Training Datasets
  getAllTrainingDatasets(): Promise<TrainingDataset[]>;
  getTrainingDataset(id: string): Promise<TrainingDataset | undefined>;
  createTrainingDataset(dataset: InsertTrainingDataset): Promise<TrainingDataset>;
  updateTrainingDataset(id: string, updates: Partial<TrainingDataset>): Promise<TrainingDataset | undefined>;

  // Uploaded Files
  getAllUploadedFiles(): Promise<UploadedFile[]>;
  getUploadedFile(id: string): Promise<UploadedFile | undefined>;
  createUploadedFile(file: InsertUploadedFile): Promise<UploadedFile>;
  updateUploadedFile(id: string, updates: Partial<UploadedFile>): Promise<UploadedFile | undefined>;
  deleteUploadedFile(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private devices: Map<string, Device> = new Map();
  private flRounds: Map<string, FLRound> = new Map();
  private anomalies: Map<string, Anomaly> = new Map();
  private privacyBudgets: Map<string, PrivacyBudget> = new Map();
  private securityLogs: Map<string, SecurityLog> = new Map();
  private systemSettings: Map<string, SystemSettings> = new Map();
  private aiModels: Map<string, AIModel> = new Map();
  private trainingDatasets: Map<string, TrainingDataset> = new Map();
  private uploadedFiles: Map<string, UploadedFile> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize with sample devices
    const sampleDevices: Device[] = [
      {
        id: "device-001",
        name: "Parking Lot Camera A",
        status: "online",
        location: "Parking Lot - Section A",
        lastSeen: new Date(),
        uptime: 98.2,
        capabilities: { video: true, audio: false, nightVision: true },
        securityLevel: "high"
      },
      {
        id: "device-002",
        name: "Main Entrance Camera",
        status: "online",
        location: "Main Entrance - Door 1",
        lastSeen: new Date(),
        uptime: 99.1,
        capabilities: { video: true, audio: true, faceRecognition: true },
        securityLevel: "critical"
      },
      {
        id: "device-003",
        name: "Corridor B Camera",
        status: "participating",
        location: "Building B - Corridor",
        lastSeen: new Date(),
        uptime: 95.8,
        capabilities: { video: true, audio: false, motionDetection: true },
        securityLevel: "standard"
      }
    ];

    sampleDevices.forEach(device => this.devices.set(device.id, device));

    // Initialize sample FL rounds
    const sampleRounds: FLRound[] = [
      {
        id: "round-001",
        roundNumber: 17,
        algorithm: "FedProx",
        status: "active",
        totalClients: 127,
        participatingClients: 98,
        convergenceMetric: 0.0023,
        accuracy: 0.947,
        precision: 0.912,
        recall: 0.895,
        privacyBudget: 4.2,
        startedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        completedAt: null,
        aggregationMethod: "weighted_avg"
      }
    ];

    sampleRounds.forEach(round => this.flRounds.set(round.id, round));

    // Initialize sample anomalies
    const sampleAnomalies: Anomaly[] = [
      {
        id: "anomaly-001",
        deviceId: "device-001",
        type: "suspicious_activity",
        severity: "high",
        confidence: 0.943,
        description: "Suspicious movement patterns detected in parking area",
        metadata: { duration: 45, personCount: 2 },
        imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400",
        detectedAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        privacyImpact: { epsilon: 0.1, delta: 0.00001 },
        actionsTaken: ["alert_sent", "recorded"]
      },
      {
        id: "anomaly-002",
        deviceId: "device-002",
        type: "trespassing",
        severity: "medium",
        confidence: 0.871,
        description: "Unauthorized access attempt at main entrance",
        metadata: { duration: 23, attempts: 3 },
        imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400",
        detectedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        privacyImpact: { epsilon: 0.08, delta: 0.00001 },
        actionsTaken: ["alert_sent"]
      }
    ];

    sampleAnomalies.forEach(anomaly => this.anomalies.set(anomaly.id, anomaly));

    // Initialize default system settings
    const defaultSettings: SystemSettings[] = [
      {
        id: "setting-001",
        key: "darkMode",
        value: "true",
        description: "Enable dark mode theme",
        category: "appearance",
        updatedAt: new Date()
      },
      {
        id: "setting-002",
        key: "privacyBudgetDefault",
        value: "6.0",
        description: "Default privacy budget epsilon value",
        category: "privacy",
        updatedAt: new Date()
      }
    ];

    defaultSettings.forEach(setting => this.systemSettings.set(setting.key, setting));

    // Initialize training datasets with surveillance datasets
    const surveillanceDatasets: TrainingDataset[] = [
      {
        id: "dataset-001",
        name: "UCF-Crime",
        type: "surveillance",
        classes: ["robbery", "fighting", "shooting", "vandalism", "burglary", "abuse", "arrest", "arson", "assault", "accident", "explosion", "normal", "stealing"],
        samples: 1900,
        description: "Large-scale real world anomaly detection dataset with 13 classes",
        source: "UCF-Crime Dataset",
        status: "ready",
        metadata: { 
          videoCount: 1900,
          normalVideos: 950, 
          anomalyVideos: 950,
          resolution: "variable",
          duration: "2-30 minutes per video"
        },
        createdAt: new Date()
      },
      {
        id: "dataset-002", 
        name: "ShanghaiTech Campus",
        type: "surveillance",
        classes: ["running", "fighting", "vehicle_intrusion", "normal", "loitering", "unauthorized_access"],
        samples: 437,
        description: "Campus surveillance footage with multi-camera scenarios",
        source: "ShanghaiTech Dataset",
        status: "ready",
        metadata: {
          videoCount: 437,
          trainVideos: 274,
          testVideos: 163,
          cameras: 13,
          resolution: "856x480"
        },
        createdAt: new Date()
      },
      {
        id: "dataset-003",
        name: "Avenue Dataset", 
        type: "surveillance",
        classes: ["loitering", "throwing_objects", "wrong_direction", "running", "normal"],
        samples: 37,
        description: "Street and walkway scenes with pedestrian anomalies",
        source: "Avenue Dataset",
        status: "ready",
        metadata: {
          videoCount: 37,
          trainVideos: 16,
          testVideos: 21,
          resolution: "640x360"
        },
        createdAt: new Date()
      }
    ];

    surveillanceDatasets.forEach(dataset => this.trainingDatasets.set(dataset.id, dataset));

    // Initialize AI models
    const initialModels: AIModel[] = [
      {
        id: "model-001",
        name: "PPFL Anomaly Detector",
        version: "1.2.0",
        type: "anomaly_detection", 
        architecture: "cnn",
        status: "deployed",
        accuracy: 0.947,
        precision: 0.912,
        recall: 0.895,
        f1Score: 0.903,
        trainedOn: ["dataset-001", "dataset-002", "dataset-003"],
        modelPath: "/models/ppfl_anomaly_v1.2.0.json",
        metadata: {
          epochs: 100,
          batchSize: 32,
          optimizer: "adam",
          learningRate: 0.001,
          classes: 13,
          inputShape: [224, 224, 3],
          totalParams: 23512341
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];

    initialModels.forEach(model => this.aiModels.set(model.id, model));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Devices
  async getAllDevices(): Promise<Device[]> {
    return Array.from(this.devices.values());
  }

  async getDevice(id: string): Promise<Device | undefined> {
    return this.devices.get(id);
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const id = randomUUID();
    const device: Device = { 
      id,
      name: insertDevice.name,
      status: insertDevice.status || 'offline',
      location: insertDevice.location || null,
      lastSeen: new Date(),
      uptime: insertDevice.uptime || null,
      capabilities: insertDevice.capabilities || {},
      securityLevel: insertDevice.securityLevel || 'standard'
    };
    this.devices.set(id, device);
    return device;
  }

  async updateDevice(id: string, updates: Partial<Device>): Promise<Device | undefined> {
    const device = this.devices.get(id);
    if (!device) return undefined;

    const updatedDevice = { ...device, ...updates, lastSeen: new Date() };
    this.devices.set(id, updatedDevice);
    return updatedDevice;
  }

  async deleteDevice(id: string): Promise<boolean> {
    return this.devices.delete(id);
  }

  // FL Rounds
  async getAllFLRounds(): Promise<FLRound[]> {
    return Array.from(this.flRounds.values()).sort((a, b) => b.roundNumber - a.roundNumber);
  }

  async getFLRound(id: string): Promise<FLRound | undefined> {
    return this.flRounds.get(id);
  }

  async createFLRound(insertRound: InsertFLRound): Promise<FLRound> {
    const id = randomUUID();
    const round: FLRound = { 
      id,
      status: insertRound.status || 'active',
      roundNumber: insertRound.roundNumber,
      algorithm: insertRound.algorithm || 'fedavg',
      totalClients: insertRound.totalClients || null,
      participatingClients: insertRound.participatingClients || null,
      convergenceMetric: insertRound.convergenceMetric || null,
      accuracy: insertRound.accuracy || null,
      precision: insertRound.precision || null,
      recall: insertRound.recall || null,
      privacyBudget: insertRound.privacyBudget || null,
      aggregationMethod: insertRound.aggregationMethod || null,
      startedAt: new Date(),
      completedAt: null
    };
    this.flRounds.set(id, round);
    return round;
  }

  async updateFLRound(id: string, updates: Partial<FLRound>): Promise<FLRound | undefined> {
    const round = this.flRounds.get(id);
    if (!round) return undefined;

    const updatedRound = { ...round, ...updates };
    this.flRounds.set(id, updatedRound);
    return updatedRound;
  }

  // Anomalies
  async getAllAnomalies(): Promise<Anomaly[]> {
    return Array.from(this.anomalies.values()).sort((a, b) => 
      new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
    );
  }

  async getAnomaly(id: string): Promise<Anomaly | undefined> {
    return this.anomalies.get(id);
  }

  async createAnomaly(insertAnomaly: InsertAnomaly): Promise<Anomaly> {
    const id = randomUUID();
    const anomaly: Anomaly = { 
      id,
      type: insertAnomaly.type,
      description: insertAnomaly.description || null,
      deviceId: insertAnomaly.deviceId || null,
      severity: insertAnomaly.severity,
      confidence: insertAnomaly.confidence,
      imageUrl: insertAnomaly.imageUrl || null,
      detectedAt: new Date(),
      privacyImpact: insertAnomaly.privacyImpact || {},
      actionsTaken: insertAnomaly.actionsTaken || {},
      metadata: insertAnomaly.metadata || {}
    };
    this.anomalies.set(id, anomaly);
    return anomaly;
  }

  async getAnomaliesByTimeRange(startDate: Date, endDate: Date): Promise<Anomaly[]> {
    return Array.from(this.anomalies.values()).filter(anomaly => {
      const detectedTime = new Date(anomaly.detectedAt).getTime();
      return detectedTime >= startDate.getTime() && detectedTime <= endDate.getTime();
    });
  }

  // Privacy Budgets
  async getAllPrivacyBudgets(): Promise<PrivacyBudget[]> {
    return Array.from(this.privacyBudgets.values());
  }

  async getPrivacyBudgetByDevice(deviceId: string): Promise<PrivacyBudget | undefined> {
    return Array.from(this.privacyBudgets.values()).find(budget => budget.deviceId === deviceId);
  }

  async createPrivacyBudget(insertBudget: InsertPrivacyBudget): Promise<PrivacyBudget> {
    const id = randomUUID();
    const budget: PrivacyBudget = { 
      id,
      deviceId: insertBudget.deviceId || null,
      epsilon: insertBudget.epsilon || 0.1,
      delta: insertBudget.delta || 0.00001,
      remainingBudget: insertBudget.remainingBudget || 1.0,
      lastUpdated: new Date()
    };
    this.privacyBudgets.set(id, budget);
    return budget;
  }

  async updatePrivacyBudget(id: string, updates: Partial<PrivacyBudget>): Promise<PrivacyBudget | undefined> {
    const budget = this.privacyBudgets.get(id);
    if (!budget) return undefined;

    const updatedBudget = { ...budget, ...updates, lastUpdated: new Date() };
    this.privacyBudgets.set(id, updatedBudget);
    return updatedBudget;
  }

  // Security Logs
  async getAllSecurityLogs(): Promise<SecurityLog[]> {
    return Array.from(this.securityLogs.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async createSecurityLog(insertLog: InsertSecurityLog): Promise<SecurityLog> {
    const id = randomUUID();
    const log: SecurityLog = { 
      id,
      deviceId: insertLog.deviceId || null,
      severity: insertLog.severity || 'info',
      eventType: insertLog.eventType,
      message: insertLog.message,
      timestamp: new Date(),
      metadata: insertLog.metadata || {}
    };
    this.securityLogs.set(id, log);
    return log;
  }

  // System Settings
  async getAllSettings(): Promise<SystemSettings[]> {
    return Array.from(this.systemSettings.values());
  }

  async getSetting(key: string): Promise<SystemSettings | undefined> {
    return this.systemSettings.get(key);
  }

  async setSetting(insertSetting: InsertSystemSettings): Promise<SystemSettings> {
    const existing = this.systemSettings.get(insertSetting.key);
    const id = existing?.id || randomUUID();
    const setting: SystemSettings = { 
      ...insertSetting, 
      id,
      updatedAt: new Date()
    };
    this.systemSettings.set(insertSetting.key, setting);
    return setting;
  }

  // AI Models
  async getAllAIModels(): Promise<AIModel[]> {
    return Array.from(this.aiModels.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getAIModel(id: string): Promise<AIModel | undefined> {
    return this.aiModels.get(id);
  }

  async createAIModel(insertModel: InsertAIModel): Promise<AIModel> {
    const id = randomUUID();
    const model: AIModel = { 
      id,
      type: insertModel.type,
      name: insertModel.name,
      version: insertModel.version || '1.0.0',
      status: insertModel.status || 'training',
      accuracy: insertModel.accuracy || null,
      precision: insertModel.precision || null,
      recall: insertModel.recall || null,
      f1Score: insertModel.f1Score || null,
      trainedOn: insertModel.trainedOn || [],
      architecture: insertModel.architecture,
      modelPath: insertModel.modelPath || null,
      metadata: insertModel.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.aiModels.set(id, model);
    return model;
  }

  async updateAIModel(id: string, updates: Partial<AIModel>): Promise<AIModel | undefined> {
    const model = this.aiModels.get(id);
    if (!model) return undefined;

    const updatedModel = { ...model, ...updates, updatedAt: new Date() };
    this.aiModels.set(id, updatedModel);
    return updatedModel;
  }

  async deleteAIModel(id: string): Promise<boolean> {
    return this.aiModels.delete(id);
  }

  // Training Datasets
  async getAllTrainingDatasets(): Promise<TrainingDataset[]> {
    return Array.from(this.trainingDatasets.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getTrainingDataset(id: string): Promise<TrainingDataset | undefined> {
    return this.trainingDatasets.get(id);
  }

  async createTrainingDataset(insertDataset: InsertTrainingDataset): Promise<TrainingDataset> {
    const id = randomUUID();
    const dataset: TrainingDataset = { 
      id,
      type: insertDataset.type,
      name: insertDataset.name,
      description: insertDataset.description || null,
      status: insertDataset.status || 'available',
      createdAt: new Date(),
      classes: insertDataset.classes || [],
      samples: insertDataset.samples || null,
      source: insertDataset.source || null,
      metadata: insertDataset.metadata || {}
    };
    this.trainingDatasets.set(id, dataset);
    return dataset;
  }

  async updateTrainingDataset(id: string, updates: Partial<TrainingDataset>): Promise<TrainingDataset | undefined> {
    const dataset = this.trainingDatasets.get(id);
    if (!dataset) return undefined;

    const updatedDataset = { ...dataset, ...updates };
    this.trainingDatasets.set(id, updatedDataset);
    return updatedDataset;
  }

  // Uploaded Files
  async getAllUploadedFiles(): Promise<UploadedFile[]> {
    return Array.from(this.uploadedFiles.values()).sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  async getUploadedFile(id: string): Promise<UploadedFile | undefined> {
    return this.uploadedFiles.get(id);
  }

  async createUploadedFile(insertFile: InsertUploadedFile): Promise<UploadedFile> {
    const id = randomUUID();
    const file: UploadedFile = { 
      id,
      path: insertFile.path,
      size: insertFile.size,
      status: insertFile.status || 'uploaded',
      deviceId: insertFile.deviceId || null,
      filename: insertFile.filename,
      originalName: insertFile.originalName,
      mimeType: insertFile.mimeType,
      uploadedBy: insertFile.uploadedBy || null,
      analysisResults: insertFile.analysisResults || {},
      uploadedAt: new Date()
    };
    this.uploadedFiles.set(id, file);
    return file;
  }

  async updateUploadedFile(id: string, updates: Partial<UploadedFile>): Promise<UploadedFile | undefined> {
    const file = this.uploadedFiles.get(id);
    if (!file) return undefined;

    const updatedFile = { ...file, ...updates };
    this.uploadedFiles.set(id, updatedFile);
    return updatedFile;
  }

  async deleteUploadedFile(id: string): Promise<boolean> {
    return this.uploadedFiles.delete(id);
  }
}

export const storage = new MemStorage();
