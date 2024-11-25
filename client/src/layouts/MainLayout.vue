<script setup lang="ts">
import { FwbNavbarLink } from 'flowbite-vue'
import StackedLayout from './StackedLayout.vue'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const links = computed(() => [
  ...(userStore.isLoggedIn
    ? [
        { label: 'Todo', name: 'TodoToday', icon: 'pi pi-pen-to-square', route: '/todo' },
        { label: 'Users', name: 'Users', icon: 'pi pi-users', route: '/users' },
        {
          label: 'Shared Goals',
          name: 'SharedGoals',
          icon: 'pi pi-share-alt',
          route: '/shared-goals',
        },
      ]
    : [
        { label: 'Login', name: 'Login' },
        { label: 'Signup', name: 'Signup' },
      ]),
])

function logoutUser() {
  userStore.logout()
  router.push({ name: 'Login' })
}
</script>

<template>
  <StackedLayout :links="links">
    <template #menu>
      <FwbNavbarLink v-if="userStore.isLoggedIn" @click.prevent="logoutUser" link="#"
        >Logout</FwbNavbarLink
      >
    </template>
  </StackedLayout>
</template>
