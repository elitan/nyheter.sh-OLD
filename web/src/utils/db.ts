import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import { type DB } from "./kysely-types";
import { Pool } from "pg";

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL as string,
    }),
  }),
  plugins: [new CamelCasePlugin()],
});
