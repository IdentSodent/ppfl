import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const devices = pgTable("devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  status: text("status").notNull().default("offline"), // online, offline, participating, failed
  location: text("location"),
  lastSeen: timestamp("last_seen").defaultNow(),
  uptime: real("uptime").default(0),
  capabilities: jsonb("capabilities").default("{}"),
  securityLevel: text("security_level").default("standard"),
});

export const flRounds = pgTable("fl_rounds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roundNumber: integer("round_number").notNull(),
  algorithm: text("algorithm").notNull().default("FedProx"),
  status: text("status").notNull().default("pending"), // pending, active, completed, failed
  totalClients: integer("total_clients").default(0),
  participatingClients: integer("participating_clients").default(0),
  convergenceMetric: real("convergence_metric"),
  accuracy: real("accuracy"),
  precision: real("precision"),
  recall: real("recall"),
  privacyBudget: real("privacy_budget").default(6.0),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  aggregationMethod: text("aggregation_method").default("weighted_avg"),
});

export const anomalies = pgTable("anomalies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").references(() => devices.id),
  type: text("type").notNull(), // violence, theft, trespassing, suspicious_activity
  severity: text("severity").notNull().default("medium"), // low, medium, high, critical
  confidence: real("confidence").notNull(),
  description: text("description"),
  metadata: jsonb("metadata").default("{}"),
  imageUrl: text("image_url"),
  detectedAt: timestamp("detected_at").defaultNow(),
  privacyImpact: jsonb("privacy_impact").default("{}"), // epsilon, delta values
  actionsTaken: jsonb("actions_taken").default("[]"),
});

export const privacyBudgets = pgTable("privacy_budgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").references(() => devices.id),
  epsilon: real("epsilon").notNull().default(6.0),
  delta: real("delta").notNull().default(0.00001),
  remainingBudget: real("remaining_budget").notNull().default(6.0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const securityLogs = pgTable("security_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").references(() => devices.id),
  eventType: text("event_type").notNull(), // tamper_detection, encryption_failure, audit_log
  severity: text("severity").notNull().default("info"),
  message: text("message").notNull(),
  metadata: jsonb("metadata").default("{}"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  category: text("category").default("general"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiModels = pgTable("ai_models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  version: text("version").notNull().default("1.0.0"),
  type: text("type").notNull(), // anomaly_detection, object_detection, behavior_analysis
  architecture: text("architecture").notNull(), // cnn, lstm, transformer
  status: text("status").notNull().default("training"), // training, ready, deployed, failed
  accuracy: real("accuracy"),
  precision: real("precision"),
  recall: real("recall"),
  f1Score: real("f1_score"),
  trainedOn: jsonb("trained_on").default("[]"), // datasets used for training
  modelPath: text("model_path"),
  metadata: jsonb("metadata").default("{}"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const trainingDatasets = pgTable("training_datasets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // surveillance, traffic, crowd, violence
  classes: jsonb("classes").notNull(), // array of anomaly classes
  samples: integer("samples").default(0),
  description: text("description"),
  source: text("source"), // UCF-Crime, ShanghaiTech, etc.
  status: text("status").notNull().default("available"), // available, processing, ready
  metadata: jsonb("metadata").default("{}"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const uploadedFiles = pgTable("uploaded_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  path: text("path").notNull(),
  uploadedBy: varchar("uploaded_by"),
  deviceId: varchar("device_id").references(() => devices.id),
  status: text("status").notNull().default("uploaded"), // uploaded, processing, analyzed, error
  analysisResults: jsonb("analysis_results").default("{}"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
  lastSeen: true,
});

export const insertFLRoundSchema = createInsertSchema(flRounds).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertAnomalySchema = createInsertSchema(anomalies).omit({
  id: true,
  detectedAt: true,
});

export const insertPrivacyBudgetSchema = createInsertSchema(privacyBudgets).omit({
  id: true,
  lastUpdated: true,
});

export const insertSecurityLogSchema = createInsertSchema(securityLogs).omit({
  id: true,
  timestamp: true,
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertAIModelSchema = createInsertSchema(aiModels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrainingDatasetSchema = createInsertSchema(trainingDatasets).omit({
  id: true,
  createdAt: true,
});

export const insertUploadedFileSchema = createInsertSchema(uploadedFiles).omit({
  id: true,
  uploadedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = typeof devices.$inferSelect;

export type InsertFLRound = z.infer<typeof insertFLRoundSchema>;
export type FLRound = typeof flRounds.$inferSelect;

export type InsertAnomaly = z.infer<typeof insertAnomalySchema>;
export type Anomaly = typeof anomalies.$inferSelect;

export type InsertPrivacyBudget = z.infer<typeof insertPrivacyBudgetSchema>;
export type PrivacyBudget = typeof privacyBudgets.$inferSelect;

export type InsertSecurityLog = z.infer<typeof insertSecurityLogSchema>;
export type SecurityLog = typeof securityLogs.$inferSelect;

export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;
export type SystemSettings = typeof systemSettings.$inferSelect;

export type InsertAIModel = z.infer<typeof insertAIModelSchema>;
export type AIModel = typeof aiModels.$inferSelect;

export type InsertTrainingDataset = z.infer<typeof insertTrainingDatasetSchema>;
export type TrainingDataset = typeof trainingDatasets.$inferSelect;

export type InsertUploadedFile = z.infer<typeof insertUploadedFileSchema>;
export type UploadedFile = typeof uploadedFiles.$inferSelect;
