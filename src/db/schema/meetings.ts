import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { contacts }          from "./contacts";
import { leads }             from "./leads";
import { developerEntities } from "./developers";

export const meetings = pgTable("meetings", {
  id:                serial("id").primaryKey(),
  location:          text("location"),
  attendees:         text("attendees").array(),
  developerEntityId: integer("developer_entity_id")
    .references(() => developerEntities.id, { onDelete: "set null" }),
  dateTime:          timestamp("date_time", { withTimezone: true }).notNull(),
  remarks:           text("remarks"),
  postRemarks:       text("post_remarks"),
  // linked to EITHER a contact OR a lead (enforced at app layer)
  contactId:         integer("contact_id")
    .references(() => contacts.id, { onDelete: "set null" }),
  leadId:            integer("lead_id")
    .references(() => leads.id, { onDelete: "set null" }),
  createdAt:         timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:         timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Meeting    = typeof meetings.$inferSelect;
export type NewMeeting = typeof meetings.$inferInsert;
