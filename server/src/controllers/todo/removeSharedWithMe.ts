import {idSchema} from '@server/entities/shared'
import {authenticatedProcedure} from '@server/trpc/authenticatedProcedure'
import {sharedTodoRepository} from '@server/repositories/sharedTodoRepository'
import provideRepos from '@server/trpc/provideRepos'
import {z} from 'zod'

export default authenticatedProcedure
  .meta({description: 'Remove a todo that has been shared with the current user'})
  .use(provideRepos({sharedTodoRepository}))
  .input(z.object({todoId: idSchema}))
  .mutation(async ({input, ctx}) => {
    ctx.repos.sharedTodoRepository.delete({
      todoId: input.todoId,
      userId: ctx.authUser.id
    })
  })
