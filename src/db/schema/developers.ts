import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const developerEntities = pgTable("developer_entities", {
  id:        serial("id").primaryKey(),
  name:      text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DeveloperEntity    = typeof developerEntities.$inferSelect;
export type NewDeveloperEntity = typeof developerEntities.$inferInsert;
