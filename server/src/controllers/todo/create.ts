import { todoSchema } from '@server/entities/todo'
import provideRepos from '@server/trpc/provideRepos'
import { todoRepository } from '@server/repositories/todoRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'

export default authenticatedProcedure
  .use(provideRepos({ todoRepository }))
  .input(todoSchema.pick({ title: true, userId: true }))
  .mutation(async ({ input: { title, userId }, ctx }) =>
    ctx.repos.todoRepository.create({ title, userId })
  )
