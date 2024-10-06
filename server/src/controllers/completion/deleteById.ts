import { completionSchema } from '@server/entities/completion'
import provideRepos from '@server/trpc/provideRepos'
import { completionRepository } from '@server/repositories/completionRepository'
import { publicProcedure } from '@server/trpc'

export default publicProcedure
  .meta({ description: '"Uncheck" todo on this date/day.' })
  .use(provideRepos({ completionRepository }))
  .input(completionSchema.pick({ todoId: true, date: true }))
  .mutation(async ({ input, ctx }) =>
    ctx.repos.completionRepository.delete(input)
  )
