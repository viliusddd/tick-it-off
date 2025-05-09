import {router} from '@server/trpc'
import login from './login'
import signup from './signup'
import findAll from './findAll'
import findById from './findById'
import updateDetails from './updateDetails'
import updatePassword from './updatePassword'
import deleteById from './deleteById'

export default router({
  findAll,
  findById,
  login,
  signup,
  updateDetails,
  updatePassword,
  deleteById
})
