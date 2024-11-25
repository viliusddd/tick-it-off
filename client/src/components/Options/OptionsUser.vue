<template>
  <div class="" v-if="isLoading">Loading...</div>
  <div v-else-if="error">Error: {{ error }}</div>
  <div class="flex items-center" v-else>
    <Avatar icon="pi pi-user" class="mx-2 flex" shape="circle" />
    <span class="inline-flex flex-col items-start">
      <span class="font-bold">{{ data?.firstName }} {{ data?.lastName }}</span>
      <span class="text-sm">{{ data?.email }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { findUserById } from '@/stores/user'
import type { UserPublic } from '@server/shared/types'
import { onMounted, ref, type Ref } from 'vue'

const data: Ref<UserPublic | null> = ref(null)
const isLoading = ref(true)
const error = ref()

onMounted(async () => {
  try {
    data.value = await userStore.findUserById({ id: 2 })
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
