import { completionPaginationSchema } from '@server/entities/completion'
import { completionRepository } from '@server/repositories/completionRepository'
import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'

export default publicProcedure
  .use(provideRepos({ completionRepository }))
  .input(completionPaginationSchema)
  .query(async ({ input: { date, limit, offset }, ctx }) =>
    ctx.repos.completionRepository.findAll(date, {
      offset,
      limit,
    })
  )
