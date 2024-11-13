<template>
  <div>
    <Listbox v-model="selectedUser" :options="users" filter optionLabel="firstName" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, type Ref, ref } from 'vue'
import { trpc } from '@/trpc'
import type { UserPublic } from '@server/shared/types'
const users: Ref<UserPublic[]> = ref([])
const selectedUser: Ref<UserPublic | null> = ref(null)

onMounted(async () => {
  users.value = await trpc.user.findAll.query({ offset: 0, limit: 10 })
})
</script>
