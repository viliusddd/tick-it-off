import {fakeTodo, fakeUser} from '@server/entities/tests/fakes'
import {createTestDatabase} from '@tests/utils/database'
import {createCallerFactory} from '@server/trpc'
import {wrapInRollbacks} from '@tests/utils/transactions'
import {clearTables, insertAll} from '@tests/utils/records'
import {authContext} from '@tests/utils/context'
import todoRouter from '..'

const createCaller = createCallerFactory(todoRouter)
const db = await wrapInRollbacks(createTestDatabase())

// a general setup for the tests
await clearTables(db, ['todo'])
const [user] = await insertAll(db, 'user', fakeUser())

// as a logged in user
const {findAll} = createCaller(authContext({db}, user))

it('should return an empty list, if there are no todos', async () => {
  // Given (ARRANGE)
  expect(await findAll()).toHaveLength(0)
})

it('should return a list of todos', async () => {
  // Given (ARRANGE)
  await insertAll(db, 'todo', [fakeTodo({userId: user.id})])

  // When (ACT)
  const todos = await findAll()

  // Then (ASSERT)
  expect(todos).toHaveLength(1)
})

it('should return a list of todos', async () => {
  // Given (ARRANGE)
  await insertAll(db, 'todo', [fakeTodo({userId: user.id})])

  // When (ACT)
  const todos = await findAll()

  // Then (ASSERT)
  expect(todos).toHaveLength(1)
})

it('should return the latest todo first', async () => {
  // Given (ARRANGE)
  const [todoOld] = await insertAll(db, 'todo', [fakeTodo({userId: user.id})])
  const [todoNew] = await insertAll(db, 'todo', [fakeTodo({userId: user.id})])

  // When (ACT)
  const todos = await findAll()

  // Then (ASSERT)
  expect(todos[0]).toMatchObject(todoNew)
  expect(todos[1]).toMatchObject(todoOld)
})
