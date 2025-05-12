import provideRepos from '@server/trpc/provideRepos'
import {authenticatedProcedure} from '@server/trpc/authenticatedProcedure'
import {sharedTodoRepository} from '@server/repositories/sharedTodoRepository'
import {idSchema} from '@server/entities/shared'
import {z} from 'zod'

export default authenticatedProcedure
  .meta({description: 'Get users that a todo is shared with'})
  .use(provideRepos({sharedTodoRepository}))
  .input(z.object({todoId: idSchema}))
  .query(async ({input, ctx}) => ctx.repos.sharedTodoRepository.findUsers(input.todoId))
