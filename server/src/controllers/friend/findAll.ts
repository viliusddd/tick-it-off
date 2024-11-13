import { limitSchema, offsetSchema } from '@server/entities/shared'
import { friendRepository } from '@server/repositories/friendRepository'
import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { z } from 'zod'

export default publicProcedure
  .meta({ description: 'Find all friend items.' })
  .use(provideRepos({ friendRepository }))
  .input(z.object({ offset: offsetSchema, limit: limitSchema }).default({}))
  .query(async ({ input, ctx: { repos } }) =>
    repos.friendRepository.findAll(input)
  )
