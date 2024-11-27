import { limitSchema, offsetSchema } from '@server/entities/shared'
import { userRelationshipRepository } from '@server/repositories/userRelationshipRepository'
import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { z } from 'zod'

export default publicProcedure
  .meta({ description: 'Find all user relationship items.' })
  .use(provideRepos({ userRelationshipRepository }))
  .input(z.object({ offset: offsetSchema, limit: limitSchema }).default({}))
  .query(async ({ input, ctx: { repos } }) =>
    repos.userRelationshipRepository.findAllWithUsers(input)
  )
