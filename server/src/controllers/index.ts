import { router } from '../trpc'
import completion from './completion'
import todo from './todo'
import user from './user'

export const appRouter = router({
  completion,
  todo,
  user,
})

export type AppRouter = typeof appRouter
