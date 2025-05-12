import provideRepos from '@server/trpc/provideRepos'
import {authenticatedProcedure} from '@server/trpc/authenticatedProcedure'
import {sharedTodoRepository} from '@server/repositories/sharedTodoRepository'
import {todoRepository} from '@server/repositories/todoRepository'

export default authenticatedProcedure
  .meta({description: 'Find all todos shared with the current user, get their data'})
  .use(provideRepos({sharedTodoRepository, todoRepository}))
  .query(async ({ctx}) => ctx.repos.sharedTodoRepository.findTodos(ctx.authUser.id))
