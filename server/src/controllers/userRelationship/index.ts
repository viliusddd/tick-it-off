import { router } from '@server/trpc'
import create from './create'
import findAll from './findAll'
import getType from './getType'

export default router({
  create,
  findAll,
  getType,
})
