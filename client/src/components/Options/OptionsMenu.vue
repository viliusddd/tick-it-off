<template>
  <VueButton
    type="button"
    icon="pi pi-user"
    variant="text"
    rounded
    @click="toggleMenu"
    style="font-size: 1rem"
    aria-controls="overlay_menu"
    aria-haspopup="true"
  />
  <VueMenu :model="menuItems" ref="menu" class="w-full md:w-60" id="overlay_menu" :popup="true">
    <template #start>
      <Suspense>
        <template #default>
          <OptionsUser class="my-2" />
        </template>
        <template #fallback>
          <div>Loading user...</div>
        </template>
      </Suspense>
    </template>
    <template #item="{ item, props }">
      <a v-ripple class="flex items-center" v-bind="props.action">
        <span :class="item.icon" />
        <span>{{ item.label }}</span>
      </a>
    </template>
  </VueMenu>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import OptionsUser from './OptionsUser.vue'

const router = useRouter()
const userStore = useUserStore()

const menuItems = ref([
  {
    items: [
      {
        separator: true,
      },
      {
        label: 'Settings',
        icon: 'pi pi-cog',
        route: '/settings',
      },
      {
        label: 'Dark Mode',
        icon: 'pi pi-moon',
        command: () => toggleDark(),
      },
      {
        separator: true,
      },
      {
        label: 'Log Out',
        icon: 'pi pi-sign-out',
        command: logoutUser,
      },
    ],
  },
])

function logoutUser() {
  userStore.logout()
  router.push({ name: 'Login' })
}

const isDark: Ref<boolean> = useDark({
  attribute: 'class',
  valueDark: 'dark',
  valueLight: 'light',
})
const toggleDark: () => boolean = useToggle(isDark)

const menu = ref()

const toggleMenu = (event: Event) => {
  menu.value.toggle(event)
}
</script>
