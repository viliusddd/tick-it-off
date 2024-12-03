import {userSchema} from '@server/entities/user'
import {userRepository} from '@server/repositories/userRepository'
import {publicProcedure} from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'

export default publicProcedure
  .meta({description: 'Find user by id.'})
  .use(provideRepos({userRepository}))
  .input(userSchema.pick({id: true}))
  .query(async ({input: {id}, ctx}) => ctx.repos.userRepository.findById(id))
