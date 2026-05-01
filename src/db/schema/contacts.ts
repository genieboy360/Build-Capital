import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const contacts = pgTable("contacts", {
  id:           serial("id").primaryKey(),
  name:         text("name").notNull(),
  phone:        text("phone"),
  location:     text("location"),
  emailStatus:  boolean("email_status").notNull().default(false),
  organisation: text("organisation"),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:    timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Contact    = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
