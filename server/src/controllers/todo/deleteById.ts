import {todoSchema} from '@server/entities/todo'
import provideRepos from '@server/trpc/provideRepos'
import {todoRepository} from '@server/repositories/todoRepository'
import {authenticatedProcedure} from '@server/trpc/authenticatedProcedure'

export default authenticatedProcedure
  .meta({description: 'Delete todo item by id.'})
  .use(provideRepos({todoRepository}))
  .input(todoSchema.pick({id: true}))
  .mutation(async ({input, ctx}) => ctx.repos.todoRepository.delete(input.id, ctx.authUser.id))
