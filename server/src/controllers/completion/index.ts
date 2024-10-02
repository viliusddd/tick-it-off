import { router } from '@server/trpc'
import create from './create'
import findByRange from './findByRange'
import deleteById from './deleteById'
import toggle from './toggle'

export default router({
  create,
  findByRange,
  deleteById,
  toggle,
})
