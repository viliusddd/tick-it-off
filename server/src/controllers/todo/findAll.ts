import {limitSchema, offsetSchema} from '@server/entities/shared'
import {todoRepository} from '@server/repositories/todoRepository'
import {publicProcedure} from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import {z} from 'zod'

export default publicProcedure
  .meta({description: 'Find all todo items.'})
  .use(provideRepos({todoRepository}))
  .input(z.object({offset: offsetSchema, limit: limitSchema}).default({}))
  .query(async ({input, ctx: {repos}}) => repos.todoRepository.findAll(input))
