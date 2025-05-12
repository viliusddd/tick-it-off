import provideRepos from '@server/trpc/provideRepos'
import {authenticatedProcedure} from '@server/trpc/authenticatedProcedure'
import {sharedTodoRepository} from '@server/repositories/sharedTodoRepository'

export default authenticatedProcedure
  .meta({description: 'Find all todos shared with the current user'})
  .use(provideRepos({sharedTodoRepository}))
  .query(async ({ctx}) => ctx.repos.sharedTodoRepository.findTodos(ctx.authUser.id))
