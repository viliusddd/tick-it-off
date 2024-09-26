import { router } from '@server/trpc'
import create from './create'
import findAll from './findAll'
import findByRange from './findByRange'
import deleteById from './deleteById'
import toggle from './toggle'

export default router({
  create,
  findAll,
  findByRange,
  deleteById,
  toggle,
})
