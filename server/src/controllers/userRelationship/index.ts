import {router} from '@server/trpc'
import add from './add'
import remove from './remove'
import findAll from './findAll'
import findAllWithUsers from './findAllWithUsers'
import getStatus from './getStatus'

export default router({
  add,
  remove,
  findAll,
  findAllWithUsers,
  getStatus
})
