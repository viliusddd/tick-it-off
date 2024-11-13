import { router } from '@server/trpc'
import create from './create'
import deleteById from './deleteById'
import findAll from './findAll'
import update from './update'
import share from './share'

export default router({
  create,
  deleteById,
  findAll,
  share,
  update,
})
