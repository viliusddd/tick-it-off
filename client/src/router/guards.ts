import {useUserStore} from '@/stores/userStore'

export const authenticate = () => {
  const userStore = useUserStore()
  if (!userStore.isLoggedIn) return {name: 'Login'}

  return true
}
