import { router } from '@server/trpc'
import create from './create'
import deleteTodo from './delete'
import findAll from './findAll'

export default router({
  create,
  deleteTodo,
  findAll,
})
