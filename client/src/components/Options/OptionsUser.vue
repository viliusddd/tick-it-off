<template>
  <div class="flex items-center">
    <Avatar icon="pi pi-user" class="mx-2 flex" shape="circle" />
    <span class="inline-flex flex-col items-start">
      <span class="font-bold">{{ user?.firstName }} {{ user?.lastName }}</span>
      <span class="text-sm">{{ user?.email }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import {Avatar} from 'primevue'
import type {UserPublic} from '@server/shared/types'

defineProps<{user: UserPublic | null}>()
</script>
