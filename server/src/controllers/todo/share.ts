import provideRepos from '@server/trpc/provideRepos'
import { sharedTodoRepository } from '@server/repositories/sharedTodoRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'
import { sharedTodoIdsSchema } from '@server/entities/sharedTodo'
import { TRPCError } from '@trpc/server'

export default authenticatedProcedure
  .meta({ description: 'Share todo item with other user.' })
  .use(provideRepos({ sharedTodoRepository }))
  .input(sharedTodoIdsSchema)
  .mutation(async ({ input, ctx: { authUser, repos } }) => {
    if (input.userId !== authUser.id) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User is not authorized to share this todo',
      })
    }
    return repos.sharedTodoRepository.create(input)
  })
