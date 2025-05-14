import provideRepos from '@server/trpc/provideRepos'
import {sharedTodoRepository} from '@server/repositories/sharedTodoRepository'
import {authenticatedProcedure} from '@server/trpc/authenticatedProcedure'
import {sharedTodoIdsSchema} from '@server/entities/sharedTodo'
import {todoRepository} from '@server/repositories/todoRepository'

export default authenticatedProcedure
  .meta({description: 'Unshare todo item with other user.'})
  .use(provideRepos({sharedTodoRepository, todoRepository}))
  .input(sharedTodoIdsSchema)
  .mutation(async ({input, ctx}) =>
    ctx.repos.sharedTodoRepository.delete({
      todoId: input.todoId,
      userId: input.userId
    })
  )
