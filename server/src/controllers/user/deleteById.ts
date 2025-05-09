import {userSchema} from '@server/entities/user'
import provideRepos from '@server/trpc/provideRepos'
import {userRepository} from '@server/repositories/userRepository'
import {publicProcedure} from '@server/trpc'

export default publicProcedure
  .meta({description: 'Delete user by id.'})
  .use(provideRepos({userRepository}))
  .input(userSchema.pick({id: true}))
  .mutation(async ({input: {id}, ctx}) => ctx.repos.userRepository.delete(id))
