<template>
  <Button
    icon="pi pi-user"
    variant="text"
    rounded
    @click="toggleMenu"
    style="font-size: 1rem"
    aria-controls="overlay_menu"
    aria-haspopup="true"
  />
  <Menu :model="menuItems" ref="menu" class="w-full md:w-60" id="overlay_menu" :popup="true">
    <template #start>
      <OptionsUser :user="currentUser" class="my-2" />
    </template>
    <template #item="{item, props}">
      <a v-ripple class="flex items-center" v-bind="props.action">
        <span :class="item.icon" />
        <span>{{ item.label }}</span>
      </a>
    </template>
  </Menu>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'
import {useRouter} from 'vue-router'
import {Button, Menu} from 'primevue'
import {useDark, useToggle} from '@vueuse/core'
import {useUserStore} from '@/stores/userStore'
import OptionsUser from './OptionsUser.vue'

const isDark = useDark()
const toggleDarkMode = useToggle(isDark)

const router = useRouter()
const userStore = useUserStore()

const menu = ref()
const currentUser = ref()

watch(menu, async () => (currentUser.value = await userStore.currentUser))

const menuItems = ref([
  {
    items: [
      {
        separator: true
      },
      {
        label: 'Settings',
        icon: 'pi pi-user-edit',
        command: () => router.push({name: 'Settings'})
      },
      {
        label: 'Dark Mode',
        icon: 'pi pi-moon',
        command: () => toggleDarkMode()
      },
      {
        separator: true
      },
      {
        label: 'Log Out',
        icon: 'pi pi-sign-out',
        command: logoutUser
      }
    ]
  }
])

function logoutUser() {
  userStore.logout()
  router.push({name: 'Login'})
}

const toggleMenu = (event: Event) => menu.value.toggle(event)
</script>
