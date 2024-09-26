import { completionRepository } from '@server/repositories/completionRepository'
import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { z } from 'zod'

export default publicProcedure
  .use(provideRepos({ completionRepository }))
  .input(
    z.object({
      firstId: z.number().positive(),
      secondId: z.number().positive(),
      date: z.date().default(new Date()),
    })
  )
  .query(async ({ input: { firstId, secondId, date }, ctx }) =>
    ctx.repos.completionRepository.findByRange(firstId, secondId, date)
  )
