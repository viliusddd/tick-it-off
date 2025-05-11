import {limitSchema, offsetSchema} from '@server/entities/shared'
import {todoRepository} from '@server/repositories/todoRepository'
import {authenticatedProcedure} from '@server/trpc/authenticatedProcedure'
import provideRepos from '@server/trpc/provideRepos'
import {z} from 'zod'

export default authenticatedProcedure
  .meta({description: 'Find all todo items for the current user.'})
  .use(provideRepos({todoRepository}))
  .input(z.object({offset: offsetSchema, limit: limitSchema}).default({}))
  .query(async ({input, ctx: {repos, authUser}}) =>
    repos.todoRepository.findAllForUser(input, authUser.id)
  )
