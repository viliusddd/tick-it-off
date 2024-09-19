import { todoSchema } from '@server/entities/todo'
import provideRepos from '@server/trpc/provideRepos'
import { todoRepository } from '@server/repositories/todoRepository'
import { publicProcedure } from '@server/trpc'

export default publicProcedure
  .use(provideRepos({ todoRepository }))
  .input(todoSchema.pick({ id: true }))
  .mutation(async ({ input: { id }, ctx }) =>
    ctx.repos.todoRepository.delete(id)
  )
