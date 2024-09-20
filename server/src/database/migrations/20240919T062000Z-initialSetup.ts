import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('todo')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity()
    )
    .addColumn('title', 'varchar', (c) => c.notNull())
    .addColumn('is_completed', 'boolean', (c) => c.defaultTo(false).notNull())
    .addColumn('created_at', 'timestamptz', (c) =>
      c.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()

  await db.schema
    .createTable('user')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity()
    )
    .addColumn('github_id', 'varchar', (c) => c.notNull().unique())
    .addColumn('email', 'varchar', (c) => c.notNull().unique())
    .addColumn('image', 'varchar', (c) => c.notNull())
    .addColumn('created_at', 'timestamptz', (c) =>
      c.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('todo').execute()
  await db.schema.dropTable('user').execute()
}
