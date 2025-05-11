import provideRepos from '@server/trpc/provideRepos'
import {authenticatedProcedure} from '@server/trpc/authenticatedProcedure'
import {z} from 'zod'
import {idSchema} from '@server/entities/shared'
import {sharedTodoRepository} from '@server/repositories/sharedTodoRepository'
import {userRepository} from '@server/repositories/userRepository'
import {todoRepository} from '@server/repositories/todoRepository'
import {TRPCError} from '@trpc/server'

export default authenticatedProcedure
  .meta({description: 'Get users that a todo is shared with'})
  .use(provideRepos({sharedTodoRepository, userRepository, todoRepository}))
  .input(
    z.object({
      todoId: idSchema
    })
  )
  .query(async ({input, ctx: {repos, db}}) => {
    // First check if the todo belongs to the current user
    const todo = await repos.todoRepository.findById(input.todoId)
    if (!todo) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Todo not found'
      })
    }

    // Get all shared entries for this todo
    const sharedUsers = await db
      .selectFrom('sharedTodo')
      .select(['userId'])
      .where('todoId', '=', input.todoId)
      .execute()

    return sharedUsers
  })
