import { router } from '@server/trpc'
import create from './create'
import deleteTodo from './delete'
import findAll from './findAll'
import toggle from './toggle'

export default router({
  create,
  deleteTodo,
  findAll,
  toggle,
})
