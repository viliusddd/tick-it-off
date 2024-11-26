<template>
  <Listbox
    v-model="selectedUser"
    :options="users"
    optionLabel="firstName"
    :filter="true"
    :pt="{
      listContainer: { style: 'max-height: none' },
      option: {
        class: 'flex flex-row items-center justify-between',
        style: 'cursor: default',
      },
    }"
  >
    <template #option="slotProps">
      <div class="flex items-center gap-2">
        <div>{{ slotProps.option.firstName }} {{ slotProps.option.lastName }}</div>
        <Tag value="foo" />
      </div>
      <div>
        <VueButton
          icon="pi pi-plus"
          class="p-button-rounded p-button-text"
          @click.stop="changeStatus(slotProps.option.id)"
        />
        <VueButton
          icon="pi pi-ban"
          class="p-button-rounded p-button-text"
          @click.stop="banUser(slotProps.option.id)"
        />
      </div>
    </template>
  </Listbox>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import { trpc } from '@/trpc'
import type { UserPublic } from '@server/shared/types'
import { useUserStore } from '@/stores/userStore'
import { Tag, Listbox } from 'primevue'

const selectedUser: Ref<UserPublic | null> = ref(null)
const users = ref<UserPublic[]>([])
const relData = ref()

const userStore = useUserStore()

onMounted(async () => (users.value = await trpc.user.findAll.query()))

// const getRelationship = async (userbId: number) => {
//   if (!userStore.authUserId) return null
//   relData.value = trpc.userRelationship.getType.query({ useraId: userStore.authUserId, userbId })
// }

const changeStatus = async (user: UserPublic) => {
  console.log('Adding user:', user)
}
const banUser = async (user: UserPublic) => {
  console.log('Ban user:', user)
}
</script>
