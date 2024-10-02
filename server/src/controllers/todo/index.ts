import { router } from '@server/trpc'
import create from './create'
import deleteById from './delete'
import findAll from './findAll'

export default router({
  create,
  deleteById,
  findAll,
})
