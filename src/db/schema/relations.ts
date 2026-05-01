import { relations } from "drizzle-orm";
import { contacts }          from "./contacts";
import { leads }             from "./leads";
import { meetings }          from "./meetings";
import { developerEntities } from "./developers";

export const contactsRelations = relations(contacts, ({ many }) => ({
  leadsAsConnector: many(leads),
  meetings:         many(meetings),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  connector: one(contacts, {
    fields:     [leads.connectorId],
    references: [contacts.id],
  }),
  developerEntity: one(developerEntities, {
    fields:     [leads.developerEntityId],
    references: [developerEntities.id],
  }),
  meetings: many(meetings),
}));

export const meetingsRelations = relations(meetings, ({ one }) => ({
  contact: one(contacts, {
    fields:     [meetings.contactId],
    references: [contacts.id],
  }),
  lead: one(leads, {
    fields:     [meetings.leadId],
    references: [leads.id],
  }),
  developerEntity: one(developerEntities, {
    fields:     [meetings.developerEntityId],
    references: [developerEntities.id],
  }),
}));

export const developerEntitiesRelations = relations(developerEntities, ({ many }) => ({
  leads:    many(leads),
  meetings: many(meetings),
}));
