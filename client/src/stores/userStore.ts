import {
  clearStoredAccessToken,
  getStoredAccessToken,
  getUserIdFromToken,
  storeAccessToken
} from '@/utils/auth'
import {trpc} from '@/trpc'
import {computed, ref, type Ref} from 'vue'
import {defineStore} from 'pinia'
import type {UserPublic, UserSignup} from '@server/shared/types'

export const useUserStore = defineStore('user', () => {
  // state
  const authToken = ref<string | null>(getStoredAccessToken(localStorage))
  const selectedUserId = ref<number | null>(null)
  const currentDate: Ref<Date> = ref(new Date())

  // getters
  const authUserId = computed(() => (authToken.value ? getUserIdFromToken(authToken.value) : null))
  const isLoggedIn = computed(() => !!authToken.value)

  const currentUser = computed(async (): Promise<UserPublic | null> => {
    if (!authUserId.value) return null
    return findUserById({id: authUserId.value})
  })

  const userRelStatus = computed(async () => {
    if (!authUserId.value || !selectedUserId.value) return null
    return getRelStatus({useraId: authUserId.value, userbId: selectedUserId.value})
  })

  // actions
  const login = async (userLogin: {email: string; password: string}) => {
    const {accessToken} = await trpc.user.login.mutate(userLogin)

    authToken.value = accessToken
    storeAccessToken(localStorage, accessToken)
  }

  const logout = () => {
    authToken.value = null
    clearStoredAccessToken(localStorage)
  }

  const signup = async (userDetails: UserSignup) => {
    trpc.user.signup.mutate(userDetails)
  }

  const findUserById = (userId: {id: number}) => {
    return trpc.user.findById.query(userId)
  }

  const getUserRelType = (usersId: {useraId: number; userbId: number}) => {
    trpc.userRelationship.getStatus.query(usersId)
  }

  const getRelStatus = async (userRel: {useraId: number; userbId: number}) => {
    return trpc.userRelationship.getStatus.query(userRel)
  }

  const updateDetails = async (details: UserPublic) => {
    trpc.user.updateDetails.mutate(details)
  }

  const updatePassword = async (oldPassword: string, newPassword: string) => {
    return trpc.user.updatePassword.mutate({oldPassword, newPassword})
  }

  const deleteById = async (userId: {id: number}) => {
    trpc.user.deleteById.mutate(userId)
  }

  return {
    authUserId,
    userRelStatus,
    isLoggedIn,
    currentUser,
    currentDate,
    login,
    logout,
    signup,
    updateDetails,
    updatePassword,
    deleteById,
    findUserById,
    getUserRelType
  }
})
