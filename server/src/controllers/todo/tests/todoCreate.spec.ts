import {authContext, requestContext} from '@tests/utils/context'
import {fakeUser} from '@server/entities/tests/fakes'
import {createTestDatabase} from '@tests/utils/database'
import {createCallerFactory} from '@server/trpc'
import {wrapInRollbacks} from '@tests/utils/transactions'
import {insertAll, selectAll} from '@tests/utils/records'
import todoRouter from '..'

const createCaller = createCallerFactory(todoRouter)
const db = await wrapInRollbacks(createTestDatabase())

it('should throw an error if user is not authenticated', async () => {
  // ARRANGE
  const {create} = createCaller(requestContext({db}))

  // ACT & ASSERT
  await expect(create({title: 'Foo'})).rejects.toThrow(/unauthenticated/i)
})

it('should create a persisted todo', async () => {
  // ARRANGE
  const [user] = await insertAll(db, 'user', fakeUser())
  const {create} = createCaller(authContext({db}, user))

  // ACT
  const todoReturned = await create({title: 'My Todo'})

  // ASSERT
  expect(todoReturned).toMatchObject({
    id: expect.any(Number),
    title: 'My Todo',
    userId: user.id
  })

  const [todoCreated] = await selectAll(db, 'todo', eb => eb('id', '=', todoReturned.id))

  expect(todoCreated).toMatchObject(todoReturned)
})
