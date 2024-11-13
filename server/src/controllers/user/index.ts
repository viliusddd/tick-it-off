import { router } from '@server/trpc'
import login from './login'
import signup from './signup'
import findAll from './findAll'

export default router({
  findAll,
  login,
  signup,
})
