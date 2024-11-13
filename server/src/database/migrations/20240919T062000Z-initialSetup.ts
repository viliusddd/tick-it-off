import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('user')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity()
    )
    .addColumn('first_name', 'text', (c) => c.notNull())
    .addColumn('last_name', 'text', (c) => c.notNull())
    .addColumn('email', 'text', (c) => c.notNull().unique())
    .addColumn('password', 'text', (c) => c.notNull())
    .addColumn('created_at', 'timestamptz', (c) =>
      c.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()

  await db.schema
    .createTable('friend')
    .addColumn('user_a_id', 'integer', (c) =>
      c.references('user.id').notNull().onDelete('cascade')
    )
    .addColumn('user_b_id', 'integer', (c) =>
      c.references('user.id').notNull().onDelete('cascade')
    )
    .addColumn('created_at', 'timestamptz', (c) =>
      c.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addUniqueConstraint('friend_a_friend_b_unique', ['user_a_id', 'user_b_id'])
    .execute()

  await db.schema
    .createTable('todo')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity()
    )
    .addColumn('title', 'text', (c) => c.notNull())
    .addColumn('user_id', 'integer', (c) =>
      c.references('user.id').notNull().onDelete('cascade')
    )
    .addColumn('created_at', 'timestamptz', (c) =>
      c.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()

  await db.schema
    .createTable('completion')
    .addColumn('todo_id', 'integer', (c) =>
      c.references('todo.id').notNull().onDelete('cascade')
    )
    // .addColumn('date', 'date', (c) => c.notNull())
    .addColumn('date', 'text', (c) => c.notNull())
    .addColumn('created_at', 'timestamptz', (c) =>
      c.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addUniqueConstraint('todo_id_date_unique', ['todo_id', 'date'])
    .execute()

  await db.schema
    .createTable('shared_todo')
    .addColumn('todo_id', 'integer', (c) =>
      c.references('todo.id').notNull().onDelete('cascade')
    )
    .addColumn('user_id', 'integer', (c) =>
      c.references('user.id').notNull().onDelete('cascade')
    )
    .addColumn('created_at', 'timestamptz', (c) =>
      c.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addUniqueConstraint('todo_id_user_id_unique', ['todo_id', 'user_id'])
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('todo').execute()
  await db.schema.dropTable('completion').execute()
  await db.schema.dropTable('user').execute()
  await db.schema.dropTable('friend').execute()
  await db.schema.dropTable('shared_todo').execute()
}
