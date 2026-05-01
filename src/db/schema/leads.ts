import { pgTable, serial, text, integer, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { contacts }          from "./contacts";
import { developerEntities } from "./developers";

export const leadStatusEnum = pgEnum("lead_status", [
  "lead",
  "opportunity",
  "deal",
  "action",
  "abeyance_hold",
  "abeyance_followup",
  "dropped",
]);

export const leads = pgTable("leads", {
  id:                serial("id").primaryKey(),
  developerEntityId: integer("developer_entity_id")
    .references(() => developerEntities.id, { onDelete: "set null" }),
  dealSize:          numeric("deal_size", { precision: 15, scale: 2 }),
  projectType:       text("project_type"),
  connectorId:       integer("connector_id")
    .references(() => contacts.id, { onDelete: "set null" }),
  notes:             text("notes"),
  status:            leadStatusEnum("status").notNull().default("lead"),
  createdAt:         timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:         timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Lead    = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
