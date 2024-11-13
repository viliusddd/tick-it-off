import { limitSchema, offsetSchema } from '@server/entities/shared'
import { userRepository } from '@server/repositories/userRepository'
import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { z } from 'zod'

export default publicProcedure
  .meta({ description: 'Find all user items.' })
  .use(provideRepos({ userRepository }))
  .input(z.object({ offset: offsetSchema, limit: limitSchema }).default({}))
  .query(async ({ input, ctx: { repos } }) =>
    repos.userRepository.findAll(input)
  )
