import {userSchema} from '@server/entities/user'
import provideRepos from '@server/trpc/provideRepos'
import {userRepository} from '@server/repositories/userRepository'
import {authenticatedProcedure} from '@server/trpc/authenticatedProcedure'

export default authenticatedProcedure
  .meta({description: 'Update user details.'})
  .use(provideRepos({userRepository}))
  .input(userSchema.omit({password: true}))
  .mutation(async ({input, ctx: {authUser, repos}}) =>
    repos.userRepository.updateDetails({...input, id: authUser.id})
  )
