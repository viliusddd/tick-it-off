import {completionRepository} from '@server/repositories/completionRepository'
import {publicProcedure} from '@server/trpc'
import provideRepos from '@server/trpc/provideRepos'
import {completionRangeSchema} from '@server/entities/completion'

export default publicProcedure
  .meta({
    description: 'Find all todos with this range of ids, for this date/day.'
  })
  .use(provideRepos({completionRepository}))
  .input(completionRangeSchema)
  .query(async ({input: {firstId, secondId, date}, ctx}) =>
    ctx.repos.completionRepository.findByRange(firstId, secondId, date)
  )
