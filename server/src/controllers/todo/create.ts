import { todoSchema } from '@server/entities/todo'
import provideRepos from '@server/trpc/provideRepos'
import { todoRepository } from '@server/repositories/todoRepository'
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure'

export default authenticatedProcedure
  .meta({ description: 'Create a new todo item.' })
  .use(provideRepos({ todoRepository }))
  .input(todoSchema.pick({ title: true }))
  .mutation(async ({ input: { title }, ctx: { authUser, repos } }) =>
    repos.todoRepository.create({ title, userId: authUser.id })
  )
