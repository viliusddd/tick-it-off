import { router } from '@server/trpc'
import login from './login'
import signup from './signup'
import findAll from './findAll'
import findById from './findById'

export default router({
  findAll,
  findById,
  login,
  signup,
})
