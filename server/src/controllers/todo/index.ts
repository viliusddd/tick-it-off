import {router} from '@server/trpc'
import create from './create'
import deleteById from './deleteById'
import findAll from './findAll'
import update from './update'
import share from './share'
import unshare from './unshare'
import getSharedUsers from './getSharedUsers'
import findSharedWithMe from './findSharedWithMe'
import removeSharedWithMe from './removeSharedWithMe'
import getTotalTodoCount from './getTotalTodoCount'
import findById from './findById'

export default router({
  create,
  deleteById,
  findAll,
  share,
  update,
  unshare,
  getSharedUsers,
  findSharedWithMe,
  removeSharedWithMe,
  getTotalTodoCount,
  findById
})
