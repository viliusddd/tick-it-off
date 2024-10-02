import { completionRepository } from '@server/repositories/completionRepository'
import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { completionRangeSchema } from '@server/entities/completion'

export default publicProcedure
  .use(provideRepos({ completionRepository }))
  .input(completionRangeSchema)
  .query(async ({ input: { firstId, secondId, date }, ctx }) =>
    ctx.repos.completionRepository.findByRange(firstId, secondId, date)
  )
