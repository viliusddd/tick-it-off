import { completionSchema } from '@server/entities/completion'
import provideRepos from '@server/trpc/provideRepos'
import { completionRepository } from '@server/repositories/completionRepository'
import { publicProcedure } from '@server/trpc'

export default publicProcedure
  .use(provideRepos({ completionRepository }))
  .input(completionSchema.pick({ todoId: true, date: true }))
  .mutation(async ({ input: { todoId, date }, ctx }) =>
    ctx.repos.completionRepository.delete(todoId, date)
  )
