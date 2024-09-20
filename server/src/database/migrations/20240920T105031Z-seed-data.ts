import type { Kysely } from 'kysely'

const todoTitles = [
  { title: 'Drink water first thing' },
  { title: 'Meditate for 10 minutes' },
  { title: 'Call a friend' },
  { title: 'Prepare lunch for tomorrow' },
  { title: 'Read for 15 minutes' },
  { title: 'Stretch after waking up' },
  { title: 'Write in journal' },
  { title: 'Organize workspace' },
  { title: 'Water plants' },
  { title: 'Plan next week’s meals' },
  { title: "Schedule doctor's appointment" },
  { title: 'Clean up inbox' },
  { title: 'Listen to a podcast' },
  { title: 'Take a walk after lunch' },
  { title: 'Backup important files' },
  { title: 'Donate unused clothes' },
  { title: 'Review monthly budget' },
  { title: 'Set workout goals' },
  { title: 'Reply to pending messages' },
  { title: 'Try a new recipe' },
]

export async function up(db: Kysely<any>) {
  await db.insertInto('todo').values(todoTitles).execute()
}

export async function down(db: Kysely<any>) {
  db.deleteFrom('todo').execute()
}
