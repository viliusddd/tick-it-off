import { router } from '@server/trpc'
import create from './create'
import remove from './remove'
import toggle from './toggle'

export default router({
  create,
  remove,
  toggle,
})
