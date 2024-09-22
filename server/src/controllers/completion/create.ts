import { completionSchema } from '@server/entities/completion'
import provideRepos from '@server/trpc/provideRepos'
import { completionRepository } from '@server/repositories/completionRepository'
import { publicProcedure } from '@server/trpc'

export default publicProcedure
  .use(provideRepos({ completionRepository }))
  .input(completionSchema.pick({ date: true, todoId: true }))
  .mutation(async ({ input: { date, todoId }, ctx }) =>
    ctx.repos.completionRepository.create({ date, todoId })
  )
