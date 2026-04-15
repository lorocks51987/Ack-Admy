import { pgTable, text, uuid, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const complianceRecordsTable = pgTable("compliance_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  moduleId: text("module_id").notNull(),
  moduleTitle: text("module_title").notNull(),
  score: integer("score").notNull().default(0),
  maxScore: integer("max_score").notNull().default(100),
  passed: boolean("passed").notNull().default(false),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const insertComplianceRecordSchema = createInsertSchema(complianceRecordsTable).omit({ id: true });
export type InsertComplianceRecord = z.infer<typeof insertComplianceRecordSchema>;
export type ComplianceRecord = typeof complianceRecordsTable.$inferSelect;
