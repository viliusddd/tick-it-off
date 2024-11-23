<template>
  <VueMenu :model="items" class="w-full md:w-60" ref="menu" id="overlay_menu" :popup="true">
    <template #start>
      <Suspense>
        <template #default>
          <OptionsUser class="my-2" />
        </template>
        <template #fallback>
          <div>Loading...</div>
        </template>
      </Suspense>
    </template>
    <template #item="{ item, props }">
      <a v-ripple class="flex items-center" v-bind="props.action">
        <span :class="item.icon" />
        <span>{{ item.label }}</span>
        <Badge v-if="item.badge" class="ml-auto" :value="item.badge" />
      </a>
    </template>
  </VueMenu>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import { logout } from '@/stores/user'
import { useRouter } from 'vue-router'
import { menu } from '@/stores/user'
import OptionsUser from './OptionsUser.vue'

const router = useRouter()

const isDark: Ref<boolean> = useDark({
  attribute: 'class',
  valueDark: 'dark',
  valueLight: 'light',
})
const toggleDark: () => boolean = useToggle(isDark)

function logoutUser() {
  logout()
  router.push({ name: 'Login' })
}

const items = ref([
  {
    separator: true,
  },
  {
    items: [
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
</script>
