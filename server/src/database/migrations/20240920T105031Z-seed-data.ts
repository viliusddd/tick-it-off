import type { Kysely } from 'kysely'

const todayDate = new Date()
const yesterdayDate = new Date(new Date().setDate(todayDate.getDate() - 1))

export async function up(db: Kysely<any>) {
  const users = await db
    .insertInto('user')
    .values([
      {
        first_name: 'Jon',
        last_name: 'Snow',
        email: 'jon@snow.no',
        password: 'foobar123',
      },
      {
        first_name: 'foo',
        last_name: 'bar',
        email: 'foo@bar.baz',
        password: 'foobar123',
      },
      {
        first_name: 'John',
        last_name: 'Wick',
        email: 'foo@protonmail.com',
        password: 'foobar123',
      },
    ])
    .returningAll()
    .execute()

  await db
    .insertInto('todo')
    .values([
      { title: 'Drink water first thing', user_id: users[0].id },
      { title: 'Meditate for 10 minutes', user_id: users[0].id },
      { title: 'Call a friend', user_id: `${users[0].id}` },
      { title: 'Prepare lunch for tomorrow', user_id: users[0].id },
      { title: 'Read for 15 minutes', user_id: users[0].id },
      { title: 'Stretch after waking up', user_id: users[0].id },
      { title: 'Write in journal', user_id: users[0].id },
      { title: 'Organize workspace', user_id: users[1].id },
      { title: 'Water plants', user_id: users[1].id },
      { title: 'Plan next week’s meals', user_id: users[1].id },
      { title: "Schedule doctor's appointment", user_id: users[1].id },
      { title: 'Clean up inbox', user_id: users[1].id },
      { title: 'Listen to a podcast', user_id: users[2].id },
      { title: 'Take a walk after lunch', user_id: users[2].id },
      { title: 'Backup important files', user_id: users[2].id },
      { title: 'Donate unused clothes', user_id: users[2].id },
      { title: 'Review monthly budget', user_id: users[2].id },
      { title: 'Set workout goals', user_id: users[2].id },
      { title: 'Reply to pending messages', user_id: users[2].id },
      { title: 'Try a new recipe', user_id: users[2].id },
    ])
    .execute()

  await db
    .insertInto('completion')
    .values([
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
    ])
    .execute()
}

export async function down(db: Kysely<any>) {
  db.deleteFrom('user').execute()
  db.deleteFrom('todo').execute()
  db.deleteFrom('completion').execute()
}
