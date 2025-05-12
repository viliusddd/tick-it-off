import {todoSchema} from '@server/entities/todo'
import provideRepos from '@server/trpc/provideRepos'
import {todoRepository} from '@server/repositories/todoRepository'
import {authenticatedProcedure} from '@server/trpc/authenticatedProcedure'

export default authenticatedProcedure
  .meta({description: 'Update existing todo item title.'})
  .use(provideRepos({todoRepository}))
  .input(todoSchema.pick({id: true, title: true}))
  .mutation(async ({input, ctx}) =>
    ctx.repos.todoRepository.update({...input, userId: ctx.authUser.id})
  )
