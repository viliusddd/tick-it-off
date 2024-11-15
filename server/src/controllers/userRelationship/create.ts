import { userRelationshipSchema } from '@server/entities/userRelationship'
import provideRepos from '@server/trpc/provideRepos'
import { userRelationshipRepository } from '@server/repositories/userRelationshipRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'

export default authenticatedProcedure
  .meta({ description: 'Create a new userRelationship entry.' })
  .use(provideRepos({ userRelationshipRepository }))
  .input(userRelationshipSchema.pick({ useraId: true, userbId: true }))
  .mutation(async ({ input: { useraId, userbId }, ctx: { repos } }) =>
    repos.userRelationshipRepository.create({ useraId, userbId })
  )
