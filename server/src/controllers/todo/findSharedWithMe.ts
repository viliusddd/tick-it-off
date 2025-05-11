import {authenticatedProcedure} from '@server/trpc/authenticatedProcedure'
import {z} from 'zod'

export default authenticatedProcedure
  .meta({description: 'Find all todos shared with the current user'})
  .input(
    z.object({
      date: z.string()
    })
  )
  .query(async ({input, ctx: {authUser, db}}) => {
    // Join todo, user and sharedTodo tables to get todos shared with the current user
    const sharedTodos = await db
      .selectFrom('sharedTodo')
      .innerJoin('todo', 'todo.id', 'sharedTodo.todoId')
      .innerJoin('user as owner', 'owner.id', 'todo.userId')
      .leftJoin('completion', join =>
        join.onRef('completion.todoId', '=', 'todo.id').on('completion.date', '=', input.date)
      )
      .select([
        'todo.id',
        'todo.title',
        'todo.createdAt',
        db.fn.count('completion.todoId').as('completionCount'),
        'owner.firstName as ownerFirstName',
        'owner.lastName as ownerLastName'
      ])
      .where('sharedTodo.userId', '=', authUser.id)
      .groupBy(['todo.id', 'todo.title', 'todo.createdAt', 'ownerFirstName', 'ownerLastName'])
      .execute()

    return sharedTodos.map(todo => ({
      id: todo.id,
      title: todo.title,
      createdAt: todo.createdAt,
      isCompleted: Number(todo.completionCount) > 0,
      owner: `${todo.ownerFirstName} ${todo.ownerLastName}`
    }))
  })
