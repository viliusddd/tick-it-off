import { router } from '../trpc'
import completion from './completion'
import userRelationship from './userRelationship'
import todo from './todo'
import user from './user'

export const appRouter = router({
  completion,
  userRelationship,
  todo,
  user,
})

export type AppRouter = typeof appRouter
