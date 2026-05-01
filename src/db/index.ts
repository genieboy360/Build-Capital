import { neon }    from "@neondatabase/serverless";
import { drizzle }  from "drizzle-orm/neon-http";

import * as contacts          from "./schema/contacts";
import * as leads             from "./schema/leads";
import * as meetings          from "./schema/meetings";
import * as developerEntities from "./schema/developers";
import * as relations         from "./schema/relations";

const schema = {
  ...contacts,
  ...leads,
  ...meetings,
  ...developerEntities,
  ...relations,
};

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });

export * from "./schema/contacts";
export * from "./schema/leads";
export * from "./schema/meetings";
export * from "./schema/developers";
export * from "./schema/relations";
