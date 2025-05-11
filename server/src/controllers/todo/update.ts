import {todoSchema} from '@server/entities/todo'
import provideRepos from '@server/trpc/provideRepos'
import {todoRepository} from '@server/repositories/todoRepository'
import {authenticatedProcedure} from '@server/trpc/authenticatedProcedure'
import {TRPCError} from '@trpc/server'

export default authenticatedProcedure
  .meta({description: 'Update existing todo item title.'})
  .use(provideRepos({todoRepository}))
  .input(todoSchema.pick({id: true, title: true}))
  .mutation(async ({input, ctx: {authUser, repos}}) => {
    // Verify the todo belongs to the current user
    const todo = await repos.todoRepository.findById(input.id)

    if (!todo) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Todo not found'
      })
    }

    if (todo.userId !== authUser.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You can only update your own todos'
      })
    }

    return repos.todoRepository.update({...input, userId: authUser.id})
  })
