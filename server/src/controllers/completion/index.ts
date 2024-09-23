import { router } from '@server/trpc'
import create from './create'
import findAll from './findAll'
import remove from './remove'
import toggle from './toggle'

export default router({
  create,
  findAll,
  remove,
  toggle,
})
