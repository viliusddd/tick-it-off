import {authenticatedProcedure} from '@server/trpc/authenticatedProcedure'
import {z} from 'zod'
import {idSchema} from '@server/entities/shared'
import {TRPCError} from '@trpc/server'

export default authenticatedProcedure
  .meta({description: 'Remove a todo that has been shared with the current user'})
  .input(
    z.object({
      todoId: idSchema
    })
  )
  .mutation(async ({input, ctx: {authUser, db}}) => {
    // First check if the todo is actually shared with this user
    const sharedEntry = await db
      .selectFrom('sharedTodo')
      .select(['todoId', 'userId'])
      .where('todoId', '=', input.todoId)
      .where('userId', '=', authUser.id)
      .executeTakeFirst()

    if (!sharedEntry) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'This todo is not shared with you'
      })
    }

    // Delete the shared relationship
    await db
      .deleteFrom('sharedTodo')
      .where('todoId', '=', input.todoId)
      .where('userId', '=', authUser.id)
      .execute()

    return {success: true}
  })
