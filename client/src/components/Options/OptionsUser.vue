<template>
  <div class="" v-if="isLoading">Loading...</div>
  <div v-else-if="error">Error: {{ error }}</div>
  <div class="flex items-center" v-else>
    <Avatar icon="pi pi-user" class="mx-2 flex" shape="circle" />
    <span class="inline-flex flex-col items-start">
      <span class="font-bold">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
      <span class="text-sm">{{ currentUser?.email }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore'
import type { UserPublic } from '@server/shared/types'
import { onMounted, ref } from 'vue'

const userStore = useUserStore()

const currentUser = ref<UserPublic | null>(null)
const isLoading = ref(true)
const error = ref()

onMounted(async () => {
  try {
    currentUser.value = await userStore.currentUserId
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = String(err)
    }
  } finally {
    isLoading.value = false
  }
})
</script>
