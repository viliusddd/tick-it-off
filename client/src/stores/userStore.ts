import {
  clearStoredAccessToken,
  getStoredAccessToken,
  getUserIdFromToken,
  storeAccessToken,
} from '@/utils/auth'
import { trpc } from '@/trpc'
import { computed, ref } from 'vue'

import { defineStore } from 'pinia'
import type { UserSignup } from '@server/shared/types'

export const useUserStore = defineStore('user', () => {
  // state
  const authToken = ref<string | null>(getStoredAccessToken(localStorage))
  const selectedUserId = ref<number | null>(null)

  // getters
  const authUserId = computed(() => (authToken.value ? getUserIdFromToken(authToken.value) : null))
  const isLoggedIn = computed(() => !!authToken.value)

  const currentUserId = computed(async () => {
    if (!authUserId.value) return null
    return findUserById({ id: authUserId.value })
  })

  const userRelStatus = computed(async () => {
    if (!authUserId.value || !selectedUserId.value) return null
    return getRelStatus({ useraId: authUserId.value, userbId: selectedUserId.value })
  })

  // actions
  const login = async (userLogin: { email: string; password: string }) => {
    const { accessToken } = await trpc.user.login.mutate(userLogin)

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

  const findUserById = (userId: { id: number }) => {
    return trpc.user.findById.query(userId)
  }

  const getUserRelType = (usersId: { useraId: number; userbId: number }) => {
    trpc.userRelationship.getStatus.query(usersId)
  }

  const getRelStatus = async (userRel: { useraId: number; userbId: number }) => {
    return trpc.userRelationship.getStatus.query(userRel)
  }

  return {
    authUserId,
    userRelStatus,
    isLoggedIn,
    currentUserId,
    login,
    logout,
    signup,
    findUserById,
    getUserRelType,
  }
})
