import { userRelationshipSchema } from '@server/entities/userRelationship'
import provideRepos from '@server/trpc/provideRepos'
import { userRelationshipRepository } from '@server/repositories/userRelationshipRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'

export default authenticatedProcedure
  .meta({ description: 'Get relationship status' })
  .use(provideRepos({ userRelationshipRepository }))
  .input(userRelationshipSchema.pick({ useraId: true, userbId: true }))
  .query(async ({ input: { useraId, userbId }, ctx: { repos } }) =>
    repos.userRelationshipRepository.getStatus({ useraId, userbId })
  )
