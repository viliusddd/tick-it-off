<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    :header="action === 'share' ? 'Share with user' : 'Unshare todo'"
    :style="{width: '90%', maxWidth: '450px'}"
    :dismissableMask="true"
  >
    <p class="mb-4" v-if="user">
      {{
        action === 'share'
          ? `Are you sure you want to share this todo with ${user.firstName} ${user.lastName}?`
          : `Are you sure you want to stop sharing this todo with ${user.firstName} ${user.lastName}?`
      }}
    </p>

    <template #footer>
      <Button label="Cancel" class="p-button-text" @click="$emit('update:visible', false)" />
      <Button
        :label="action === 'share' ? 'Share' : 'Unshare'"
        :class="action === 'share' ? 'p-button-primary' : 'p-button-danger'"
        @click="$emit('confirm')"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import {Button, Dialog} from 'primevue'

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
}

defineProps<{
  visible: boolean
  user: User | null
  action: 'share' | 'unshare'
}>()

defineEmits(['update:visible', 'confirm'])
</script>
