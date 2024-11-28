<template>
  <Listbox
    :options="usersUpdated"
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
        <div>{{ slotProps.option.userbFirstName }} {{ slotProps.option.userbLastName }}</div>
        <div v-if="slotProps.option.isFriend">
          <Tag value="friend" severity="info" />
        </div>
      </div>
      <div>
        <VueButton
          v-if="!slotProps.option.isFriend"
          icon="pi pi-plus"
          class="p-button-rounded p-button-text"
          @click.stop="changeStatus(slotProps.option.userbId)"
        />
        <VueButton
          v-else
          icon="pi pi-minus"
          class="p-button-rounded p-button-text"
          @click.stop="banUser(slotProps.option.userbId)"
        />
      </div>
    </template>
  </Listbox>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { trpc } from '@/trpc'
import { useUserStore } from '@/stores/userStore'
import { Tag, Listbox } from 'primevue'

const userStore = useUserStore()

type UsersConnections = {
  useraId: number | null
  userbId: number | null
  useraFirstName: string | null
  useraLastName: string | null
  userbFirstName: string | null
  userbLastName: string | null
}

type UserUpdated = {
  userbId: number | null
  userbFirstName: string | null
  userbLastName: string | null
  isFriend: boolean
}

const users = ref<UsersConnections[]>([])

const usersUpdated = computed(() => {
  return users.value.reduce((usersAccum: UserUpdated[], usr) => {
    const { userbId, userbFirstName, userbLastName } = usr

    // remove self from list
    if (usr.userbId === userStore.authUserId) return usersAccum

    let isFriend = false
    if (usr.useraId === userStore.authUserId) isFriend = true

    // get index of entry in arr, to eliminate duplicates
    const index = usersAccum.findIndex((accUsr) => accUsr.userbId === userbId)

    if (index === -1) usersAccum.push({ userbId, userbFirstName, userbLastName, isFriend })

    return usersAccum
  }, [])
})

onMounted(async () => {
  users.value = await trpc.userRelationship.findAllWithUsers.query()
})

const changeStatus = async (userId: number) => {
  console.log('Adding user:', userId)
}
const banUser = async (userId: number) => {
  console.log('Ban user:', userId)
}
</script>
