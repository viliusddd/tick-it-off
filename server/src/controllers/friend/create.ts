import { friendSchema } from '@server/entities/friend'
import provideRepos from '@server/trpc/provideRepos'
import { friendRepository } from '@server/repositories/friendRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'

export default authenticatedProcedure
  .meta({ description: 'Create a new friend entry.' })
  .use(provideRepos({ friendRepository }))
  .input(friendSchema.pick({ useraId: true, userbId: true }))
  .mutation(async ({ input: { useraId, userbId }, ctx: { repos } }) =>
    repos.friendRepository.create({ useraId, userbId })
  )
