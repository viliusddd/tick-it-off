import { todoSchema } from '@server/entities/todo'
import provideRepos from '@server/trpc/provideRepos'
import { todoRepository } from '@server/repositories/todoRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'

export default authenticatedProcedure
  .use(provideRepos({ todoRepository }))
  .input(todoSchema.pick({ id: true, title: true }))
  .mutation(async ({ input: { title, id }, ctx: { authUser, repos } }) =>
    repos.todoRepository.update({ title, id, userId: authUser.id })
  )
