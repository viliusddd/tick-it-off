import {todoRepository} from '@server/repositories/todoRepository'
import {authenticatedProcedure} from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import {z} from 'zod'

export default authenticatedProcedure
  .meta({description: 'Find todo item by id.'})
  .use(provideRepos({todoRepository}))
  .input(z.object({id: z.number()}))
  .query(async ({input, ctx: {repos, authUser}}) =>
    repos.todoRepository.findById(input.id, authUser.id)
  )
