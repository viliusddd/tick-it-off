import provideRepos from '@server/trpc/provideRepos'
import { userRelationshipRepository } from '@server/repositories/userRelationshipRepository'
import { userRelationshipSchema } from '@server/entities/userRelationship'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'

export default authenticatedProcedure
  .meta({ description: 'Delete todo item by id.' })
  .use(provideRepos({ userRelationshipRepository }))
  .input(userRelationshipSchema.pick({ useraId: true, userbId: true }))
  .mutation(async ({ input: { useraId, userbId }, ctx }) =>
    ctx.repos.userRelationshipRepository.remove({ useraId, userbId })
  )
