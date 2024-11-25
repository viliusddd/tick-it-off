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
  const authToken = ref<string | null>(getStoredAccessToken(localStorage))

  const authUserId = computed(() => (authToken.value ? getUserIdFromToken(authToken.value) : null))
  const isLoggedIn = computed(() => !!authToken.value)
  const currentUser = computed(async () => {
    if (!authUserId.value) return null
    return findUserById({ id: authUserId.value })
  })

  async function login(userLogin: { email: string; password: string }) {
    const { accessToken } = await trpc.user.login.mutate(userLogin)

    authToken.value = accessToken
    storeAccessToken(localStorage, accessToken)
  }

  function logout() {
    authToken.value = null
    clearStoredAccessToken(localStorage)
  }

  async function signup(userDetails: UserSignup) {
    trpc.user.signup.mutate(userDetails)
  }

  async function findUserById(userId: { id: number }) {
    return trpc.user.findById.query(userId)
  }

  async function getUserRelType(usersId: { useraId: number; userbId: number }) {
    trpc.userRelationship.getType.query(usersId)
  }

  return {
    authUserId,
    isLoggedIn,
    currentUser,
    login,
    logout,
    signup,
    findUserById,
    getUserRelType,
  }
})
