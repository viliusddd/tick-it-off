import { completionRepository } from '@server/repositories/completionRepository'
import { publicProcedure } from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import { z } from 'zod'
// import {} from '@server/repositories/'

const POSTGRES_INT_MAX = 2147483647

export default publicProcedure
  .use(provideRepos({ completionRepository }))
  .input(
    z.object({
      date: z.string().default(new Date().toLocaleDateString('lt')),
      offset: z.number().int().min(0).max(POSTGRES_INT_MAX).default(0),
      limit: z.number().int().min(1).max(100).default(20),
    })
  )
  .query(async ({ input: { date, limit, offset }, ctx }) => {
    console.log('foo')
    const completions = await ctx.repos.completionRepository.findAll(date, {
      offset,
      limit,
    })
    return completions
  })
