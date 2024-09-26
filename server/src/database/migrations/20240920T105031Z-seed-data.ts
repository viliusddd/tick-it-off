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

const todayDate = new Date()
const yesterdayDate = new Date(new Date().setDate(todayDate.getDate() - 1))

const completionEntries = [
  { todo_id: 1, date: todayDate },
  { todo_id: 2, date: todayDate },
  { todo_id: 3, date: todayDate },
  { todo_id: 4, date: todayDate },
  { todo_id: 17, date: todayDate },
  { todo_id: 19, date: todayDate },
  { todo_id: 20, date: todayDate },
  { todo_id: 3, date: yesterdayDate },
  { todo_id: 17, date: yesterdayDate },
  { todo_id: 19, date: yesterdayDate },
  { todo_id: 1, date: '2024-09-09' },
  { todo_id: 2, date: '2024-09-24' },
]

export async function up(db: Kysely<any>) {
  await db.insertInto('todo').values(todoTitles).execute()
  await db.insertInto('completion').values(completionEntries).execute()
}

export async function down(db: Kysely<any>) {
  db.deleteFrom('todo').execute()
  db.deleteFrom('completion').execute()
}
