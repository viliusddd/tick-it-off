import {userPasswordChangeSchema} from '@server/entities/user'
import provideRepos from '@server/trpc/provideRepos'
import {userRepository} from '@server/repositories/userRepository'
import {authenticatedProcedure} from '@server/trpc/authenticatedProcedure'
import bcrypt from 'bcrypt'
import config from '@server/config'
import {TRPCError} from '@trpc/server'

export default authenticatedProcedure
  .meta({description: 'Update user password.'})
  .use(provideRepos({userRepository}))
  .input(userPasswordChangeSchema)
  .mutation(async ({input, ctx: {authUser, repos}}) => {
    const user = await repos.userRepository.findById(authUser.id, true)
    const passwordMatch = await bcrypt.compare(input.oldPassword, user.password)
    if (!passwordMatch) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Old password is incorrect.'
      })
    }
    const newPasswordHash = await bcrypt.hash(input.newPassword, config.auth.passwordCost)
    return repos.userRepository.updatePassword({id: authUser.id, password: newPasswordHash})
  })
