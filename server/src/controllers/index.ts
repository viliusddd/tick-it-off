import { router } from '../trpc'
import completion from './completion'
import friend from './friend'
import todo from './todo'
import user from './user'

export const appRouter = router({
  completion,
  friend,
  todo,
  user,
})

export type AppRouter = typeof appRouter
