import provideRepos from '@server/trpc/provideRepos'
import {sharedTodoRepository} from '@server/repositories/sharedTodoRepository'
import {authenticatedProcedure} from '@server/trpc/authenticatedProcedure'
import {sharedTodoIdsSchema} from '@server/entities/sharedTodo'

export default authenticatedProcedure
  .meta({description: 'Share todo item with other user.'})
  .use(provideRepos({sharedTodoRepository}))
  .input(sharedTodoIdsSchema)
  .mutation(async ({input, ctx}) => ctx.repos.sharedTodoRepository.create(input))
