import {completionRepository} from '@server/repositories/completionRepository'
import {publicProcedure} from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'

export default publicProcedure
  .meta({description: 'Get daily completions'})
  .use(provideRepos({completionRepository}))
  .query(async ({ctx}) => ctx.repos.completionRepository.getDailyCompletions())
