<script setup lang="ts">
import { FwbNavbarLink } from 'flowbite-vue'
import StackedLayout from './StackedLayout.vue'
import { isLoggedIn, logout } from '@/stores/user'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const links = computed(() => [
  ...(isLoggedIn.value
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
  logout()
  router.push({ name: 'Login' })
}
</script>

<template>
  <StackedLayout :links="links">
    <template #menu>
      <FwbNavbarLink v-if="isLoggedIn" @click.prevent="logoutUser" link="#">Logout</FwbNavbarLink>
    </template>
  </StackedLayout>
</template>
