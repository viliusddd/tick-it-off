import { router } from '@server/trpc'
import create from './create'
import deleteById from './deleteById'
import findAll from './findAll'
import update from './update'

export default router({
  create,
  deleteById,
  findAll,
  update,
})
