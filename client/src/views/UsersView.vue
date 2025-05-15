<template>
  <div :class="['flex justify-center']">
    <div :class="'overflow-hidden rounded-lg shadow-xl max-sm:w-full'">
      <div class="mb:p-5 p-3">
        <Listbox
          multiple
          v-model="selectedUsers"
          :options="usersUpdated"
          optionLabel="userbFirstName"
          :filter="true"
          :pt="{
            listContainer: {style: 'max-height: none'},
            option: {
              class: 'flex flex-row items-center justify-between',
              style: 'cursor: pointer'
            }
          }"
          @change="handleSelectionChange"
        >
          <template #header>
            <div class="mb-6 text-lg">
              <p>Add friends to share your todo lists with them.</p>
              <p class="mt-2 text-sm">Click on a user to add or remove them as a friend.</p>
            </div>
          </template>
          <template #option="slotProps">
            <div class="flex items-center gap-2">
              <div>{{ slotProps.option.userbFirstName }} {{ slotProps.option.userbLastName }}</div>
              <div v-if="slotProps.option.isFriend">
                <Tag value="Friend" severity="info" />
              </div>
            </div>
          </template>
          <template #empty>
            <div class="p-4 text-center text-gray-500">No users found</div>
          </template>
        </Listbox>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue'
import {trpc} from '@/trpc'
import {Tag, Listbox} from 'primevue'
import {useUserStore} from '@/stores/userStore'
import {useToast} from 'primevue/usetoast'

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

const userStore = useUserStore()
const toast = useToast()
const users = ref<UsersConnections[]>([])
const isLoading = ref(false)
const selectedUsers = ref<UserUpdated[]>([])

onMounted(async () => {
  isLoading.value = true
  try {
    users.value = await trpc.userRelationship.findAllWithUsers.query()
    initializeSelectedUsers()
  } catch (error) {
    console.error('Failed to load users:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load users',
      life: 3000
    })
  } finally {
    isLoading.value = false
  }
})

const usersUpdated = computed(() => {
  return users.value.reduce((usersAccum: UserUpdated[], usr) => {
    const {userbId, userbFirstName, userbLastName} = usr

    // remove self from list
    if (usr.userbId === userStore.authUserId) return usersAccum

    let isFriend = false
    if (usr.useraId === userStore.authUserId) isFriend = true

    // get index of entry in arr, to eliminate duplicates
    const index = usersAccum.findIndex(accUsr => accUsr.userbId === userbId)

    if (index === -1) usersAccum.push({userbId, userbFirstName, userbLastName, isFriend})

    return usersAccum
  }, [])
})

// Initialize selectedUsers with current friends
const initializeSelectedUsers = () => {
  selectedUsers.value = usersUpdated.value.filter(user => user.isFriend)
}

// Handle when selection changes
const handleSelectionChange = async (event: any) => {
  const currentSelection = event.value as UserUpdated[]

  // Find users that were added (in current selection but not marked as friends yet)
  const usersToAdd = currentSelection.filter(
    user => !usersUpdated.value.find(u => u.userbId === user.userbId)?.isFriend
  )

  // Find users that were removed (marked as friends but not in current selection)
  const usersToRemove = usersUpdated.value.filter(
    user => user.isFriend && !currentSelection.some(s => s.userbId === user.userbId)
  )

  // Process additions
  for (const user of usersToAdd) {
    await addUser(user.userbId)
  }

  // Process removals
  for (const user of usersToRemove) {
    await removeUser(user.userbId)
  }
}

const addUser = async (userbId: number | null) => {
  if (!userbId || !userStore.authUserId) return

  try {
    await trpc.userRelationship.add.mutate({
      useraId: userStore.authUserId,
      userbId
    })

    // Update local state
    for (const usr of usersUpdated.value) {
      if (usr.userbId === userbId) {
        usr.isFriend = true
      }
    }

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'User added as friend',
      life: 3000
    })
  } catch (error) {
    console.error('Failed to add friend:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to add friend',
      life: 3000
    })

    // Reset selection on error
    initializeSelectedUsers()
  }
}

const removeUser = async (userbId: number | null) => {
  if (!userbId || !userStore.authUserId) return

  try {
    await trpc.userRelationship.remove.mutate({
      useraId: userStore.authUserId,
      userbId
    })

    // Update local state
    for (const usr of usersUpdated.value) {
      if (usr.userbId === userbId) {
        usr.isFriend = false
      }
    }

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Friend removed',
      life: 3000
    })
  } catch (error) {
    console.error('Failed to remove friend:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to remove friend',
      life: 3000
    })

    // Reset selection on error
    initializeSelectedUsers()
  }
}

// Sync selectedUsers with usersUpdated when friendship status changes
watch(
  usersUpdated,
  () => {
    selectedUsers.value = usersUpdated.value.filter(user => user.isFriend)
  },
  {deep: true}
)
</script>
