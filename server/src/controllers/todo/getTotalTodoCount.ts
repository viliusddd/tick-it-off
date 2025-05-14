import provideRepos from '@server/trpc/provideRepos'
import {authenticatedProcedure} from '@server/trpc/authenticatedProcedure'
import {todoRepository} from '@server/repositories/todoRepository'

export default authenticatedProcedure
  .meta({description: 'Get total todo count'})
  .use(provideRepos({todoRepository}))
  .query(async ({ctx}) => ctx.repos.todoRepository.getTotalTodoCount())
