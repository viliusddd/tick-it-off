<script setup lang="ts">
import {FwbNavbarLink} from 'flowbite-vue'
import StackedLayout from './StackedLayout.vue'
import {useUserStore} from '@/stores/userStore'
import {useRouter} from 'vue-router'

const router = useRouter()

const links = [{label: 'Home', name: 'Home'}]

const userStore = useUserStore()

function logoutUser() {
  userStore.logout()
  router.push({name: 'Login'})
}
</script>

<template>
  <StackedLayout :links="links">
    <template #menu>
      <FwbNavbarLink @click.prevent="logoutUser" link="#">Logout</FwbNavbarLink>
    </template>
  </StackedLayout>
</template>
