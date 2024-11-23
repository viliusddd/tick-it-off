<template>
  <div>
    <Listbox v-model="selectedUser" :options="users" optionLabel="firstName" :filter="true">
      <template #option="slotProps">
        <div class="flex items-center justify-end gap-2">
          <div>{{ slotProps.option.firstName }} {{ slotProps.option.lastName }}</div>
          <div>[rel type badge]</div>
          <Button
            icon="pi pi-plus"
            class="p-button-rounded p-button-text"
            @click.stop="changeStatus(slotProps.option.id)"
          />
        </div>
      </template>
    </Listbox>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import { trpc } from '@/trpc'
import type { UserPublic } from '@server/shared/types'
import Listbox from 'primevue/listbox'
import Button from 'primevue/button'

const users: Ref<UserPublic[]> = ref([])
const selectedUser: Ref<UserPublic | null> = ref(null)

onMounted(async () => {
  users.value = await trpc.user.findAll.query({ offset: 0, limit: 10 })
})

const changeStatus = async (user: UserPublic) => {
  console.log('Adding user:', user)
}
</script>
