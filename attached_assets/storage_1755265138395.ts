import { 
  users, type User, type InsertUser,
  edgeDevices, type EdgeDevice, type InsertEdgeDevice,
  federatedLearningRounds, type FederatedLearningRound, type InsertFLRound,
  anomalyDetections, type AnomalyDetection, type InsertAnomaly,
  privacyMetrics, type PrivacyMetric, type InsertPrivacyMetric,
  modelRegistry, type ModelRegistry, type InsertModel
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, isNull, count } from "drizzle-orm";

interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Edge device methods
  getAllEdgeDevices(): Promise<EdgeDevice[]>;
  getEdgeDevice(id: string): Promise<EdgeDevice | undefined>;
  createEdgeDevice(insertDevice: InsertEdgeDevice): Promise<EdgeDevice>;
  updateEdgeDevice(id: string, updates: Partial<EdgeDevice>): Promise<EdgeDevice>;
  
  // Federated learning methods
  getCurrentFLRound(): Promise<FederatedLearningRound | undefined>;
  getAllFLRounds(): Promise<FederatedLearningRound[]>;
  createFLRound(insertRound: InsertFLRound): Promise<FederatedLearningRound>;
  updateFLRound(id: string, updates: Partial<FederatedLearningRound>): Promise<FederatedLearningRound>;
  
  // Anomaly methods
  getActiveAnomalies(): Promise<AnomalyDetection[]>;
  getRecentAnomalies(limit: number): Promise<AnomalyDetection[]>;
  createAnomaly(insertAnomaly: InsertAnomaly): Promise<AnomalyDetection>;
  
  // Privacy methods
  getPrivacyBudget(): Promise<PrivacyMetric | undefined>;
  getPrivacyMetrics(): Promise<PrivacyMetric[]>;
  createPrivacyMetric(insertMetric: InsertPrivacyMetric): Promise<PrivacyMetric>;
  
  // Model methods
  getAllModels(): Promise<ModelRegistry[]>;
  getLatestModelAccuracy(): Promise<number | undefined>;
  
  // Dashboard methods
  getDashboardMetrics(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Edge device methods
  async getAllEdgeDevices(): Promise<EdgeDevice[]> {
    return await db.select().from(edgeDevices).orderBy(desc(edgeDevices.createdAt));
  }

  async getEdgeDevice(id: string): Promise<EdgeDevice | undefined> {
    const [device] = await db.select().from(edgeDevices).where(eq(edgeDevices.id, id));
    return device || undefined;
  }

  async createEdgeDevice(insertDevice: InsertEdgeDevice): Promise<EdgeDevice> {
    const [device] = await db
      .insert(edgeDevices)
      .values(insertDevice)
      .returning();
    return device;
  }

  async updateEdgeDevice(id: string, updates: Partial<EdgeDevice>): Promise<EdgeDevice> {
    const [device] = await db
      .update(edgeDevices)
      .set({ ...updates, lastSeen: new Date() })
      .where(eq(edgeDevices.id, id))
      .returning();
    return device;
  }

  // Federated learning methods
  async getCurrentFLRound(): Promise<FederatedLearningRound | undefined> {
    const [round] = await db
      .select()
      .from(federatedLearningRounds)
      .where(eq(federatedLearningRounds.status, 'active'))
      .orderBy(desc(federatedLearningRounds.startedAt))
      .limit(1);
    return round || undefined;
  }

  async getAllFLRounds(): Promise<FederatedLearningRound[]> {
    return await db
      .select()
      .from(federatedLearningRounds)
      .orderBy(desc(federatedLearningRounds.startedAt))
      .limit(50);
  }

  async createFLRound(insertRound: InsertFLRound): Promise<FederatedLearningRound> {
    const [round] = await db
      .insert(federatedLearningRounds)
      .values(insertRound)
      .returning();
    return round;
  }

  async updateFLRound(id: string, updates: Partial<FederatedLearningRound>): Promise<FederatedLearningRound> {
    const [round] = await db
      .update(federatedLearningRounds)
      .set(updates)
      .where(eq(federatedLearningRounds.id, id))
      .returning();
    return round;
  }

  // Anomaly methods
  async getActiveAnomalies(): Promise<AnomalyDetection[]> {
    return await db
      .select()
      .from(anomalyDetections)
      .where(eq(anomalyDetections.isResolved, false))
      .orderBy(desc(anomalyDetections.detectedAt));
  }

  async getRecentAnomalies(limit: number): Promise<AnomalyDetection[]> {
    return await db
      .select()
      .from(anomalyDetections)
      .orderBy(desc(anomalyDetections.detectedAt))
      .limit(limit);
  }

  async createAnomaly(insertAnomaly: InsertAnomaly): Promise<AnomalyDetection> {
    const [anomaly] = await db
      .insert(anomalyDetections)
      .values(insertAnomaly)
      .returning();
    return anomaly;
  }

  // Privacy methods
  async getPrivacyBudget(): Promise<PrivacyMetric | undefined> {
    const [metric] = await db
      .select()
      .from(privacyMetrics)
      .orderBy(desc(privacyMetrics.recordedAt))
      .limit(1);
    return metric || undefined;
  }

  async getPrivacyMetrics(): Promise<PrivacyMetric[]> {
    return await db
      .select()
      .from(privacyMetrics)
      .orderBy(desc(privacyMetrics.recordedAt))
      .limit(20);
  }

  async createPrivacyMetric(insertMetric: InsertPrivacyMetric): Promise<PrivacyMetric> {
    const [metric] = await db
      .insert(privacyMetrics)
      .values(insertMetric)
      .returning();
    return metric;
  }

  // Model methods
  async getAllModels(): Promise<ModelRegistry[]> {
    return await db
      .select()
      .from(modelRegistry)
      .orderBy(desc(modelRegistry.createdAt));
  }

  async getLatestModelAccuracy(): Promise<number | undefined> {
    const [model] = await db
      .select()
      .from(modelRegistry)
      .where(eq(modelRegistry.isDeployed, true))
      .orderBy(desc(modelRegistry.deployedAt))
      .limit(1);
    return model?.accuracy || undefined;
  }

  // Dashboard methods
  async getDashboardMetrics(): Promise<any> {
    const activeAnomalies = await this.getActiveAnomalies();
    const currentRound = await this.getCurrentFLRound();
    const privacyBudget = await this.getPrivacyBudget();
    const modelAccuracy = await this.getLatestModelAccuracy();
    const edgeDevices = await this.getAllEdgeDevices();

    return {
      activeAnomalies: activeAnomalies.length,
      flProgress: currentRound ? Math.round(((currentRound.participatingClients || 0) / currentRound.totalClients) * 100) : 0,
      privacyBudget: privacyBudget?.budgetRemaining || 6.0,
      modelAccuracy: modelAccuracy || 0.947,
      totalClients: edgeDevices.length,
      onlineClients: edgeDevices.filter(d => d.status === 'online').length,
    };
  }
}

export const storage = new DatabaseStorage();