import type {Kysely} from 'kysely'
import {hash} from 'bcrypt'
import config from '@server/config'

const todayDate = new Date().toLocaleDateString('lt')
const yesterdayDate = new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString(
  'lt'
)

export async function up(db: Kysely<any>) {
  const users = await db
    .insertInto('user')
    .values([
      {
        first_name: 'Jon',
        last_name: 'Snow',
        email: 'jon@snow.no',
        password: await hash('foobar123', config.auth.passwordCost)
      },
      {
        first_name: 'foo',
        last_name: 'bar',
        email: 'foo@bar.baz',
        password: await hash('foobar123', config.auth.passwordCost)
      },
      {
        first_name: 'John',
        last_name: 'Wick',
        email: 'foo@protonmail.com',
        password: await hash('foobar123', config.auth.passwordCost)
      },
      {
        first_name: 'Elon',
        last_name: 'Musk',
        email: 'elon@x.com',
        password: await hash('foobar123', config.auth.passwordCost)
      },
      {
        first_name: 'Christopher',
        last_name: 'Hitchens',
        email: 'christopher@hitchens.com',
        password: await hash('foobar123', config.auth.passwordCost)
      }
    ])
    .returningAll()
    .execute()

  await db
    .insertInto('user_relationship')
    .values([
      {usera_id: users[2].id, userb_id: users[1].id},
      {usera_id: users[1].id, userb_id: users[2].id},

      {usera_id: users[0].id, userb_id: users[1].id},
      {usera_id: users[1].id, userb_id: users[0].id},

      {usera_id: users[0].id, userb_id: users[3].id},
      {usera_id: users[3].id, userb_id: users[0].id}
    ])
    .execute()

  const todos = await db
    .insertInto('todo')
    .values([
      {title: 'Drink water first thing', user_id: users[0].id},
      {title: 'Meditate for 10 minutes', user_id: users[0].id},
      {title: 'Call a friend', user_id: `${users[0].id}`},
      {title: 'Prepare lunch for tomorrow', user_id: users[0].id},
      {title: 'Read for 15 minutes', user_id: users[0].id},
      {title: 'Stretch after waking up', user_id: users[0].id},
      {title: 'Write in journal', user_id: users[0].id},
      {title: 'Organize workspace', user_id: users[1].id},
      {title: 'Water plants', user_id: users[1].id},
      {title: 'Plan next week’s meals', user_id: users[1].id},
      {title: "Schedule doctor's appointment", user_id: users[1].id},
      {title: 'Clean up inbox', user_id: users[1].id},
      {title: 'Listen to a podcast', user_id: users[2].id},
      {title: 'Take a walk after lunch', user_id: users[2].id},
      {title: 'Backup important files', user_id: users[2].id},
      {title: 'Donate unused clothes', user_id: users[2].id},
      {title: 'Review monthly budget', user_id: users[2].id},
      {title: 'Set workout goals', user_id: users[2].id},
      {title: 'Reply to pending messages', user_id: users[2].id},
      {title: 'Try a new recipe', user_id: users[2].id}
    ])
    .returningAll()
    .execute()

  await db
    .insertInto('completion')
    .values([
      {todo_id: todos[0].id, date: todayDate},
      {todo_id: todos[2].id, date: todayDate},
      {todo_id: todos[3].id, date: todayDate},
      {todo_id: todos[4].id, date: todayDate},
      {todo_id: todos[17].id, date: todayDate},
      {todo_id: todos[19].id, date: todayDate},
      {todo_id: todos[16].id, date: todayDate},
      {todo_id: todos[3].id, date: yesterdayDate},
      {todo_id: todos[17].id, date: yesterdayDate},
      {todo_id: todos[19].id, date: yesterdayDate},
      {todo_id: todos[1].id, date: '2024-09-09'},
      {todo_id: todos[2].id, date: '2024-09-24'}
    ])
    .execute()

  await db
    .insertInto('shared_todo')
    .values([
      {todo_id: todos[0].id, user_id: users[1].id},
      {todo_id: todos[0].id, user_id: users[2].id}
    ])
    .execute()
}

export async function down(db: Kysely<any>) {
  db.deleteFrom('user').execute()
  db.deleteFrom('todo').execute()
  db.deleteFrom('completion').execute()
}
