import provideRepos from '@server/trpc/provideRepos'
import {sharedTodoRepository} from '@server/repositories/sharedTodoRepository'
import {authenticatedProcedure} from '@server/trpc/authenticatedProcedure'
import {sharedTodoIdsSchema} from '@server/entities/sharedTodo'
import {todoRepository} from '@server/repositories/todoRepository'
import {TRPCError} from '@trpc/server'

export default authenticatedProcedure
  .meta({description: 'Unshare todo item with other user.'})
  .use(provideRepos({sharedTodoRepository, todoRepository}))
  .input(sharedTodoIdsSchema)
  .mutation(async ({input, ctx: {authUser, repos}}) => {
    // First verify the todo belongs to the user
    const todo = await repos.todoRepository.findById(input.todoId)
    if (!todo || todo.userId !== authUser.id) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User is not authorized to unshare this todo'
      })
    }

    // Delete the share relationship
    return repos.sharedTodoRepository.delete({
      todoId: input.todoId,
      userId: input.userId
    })
  })
