import { router } from '../trpc'
import user from './user'
import todo from './todo'

export const appRouter = router({
  user,
  todo,
})

export type AppRouter = typeof appRouter
