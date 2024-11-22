<template>
  <VueMenu :model="items" class="w-full md:w-60" ref="menu" id="overlay_menu" :popup="true">
    <template #start>
      <button
        v-ripple
        class="hover:bg-surface-100 dark:hover:bg-surface-800 relative flex w-full cursor-pointer items-start overflow-hidden rounded-none border-0 bg-transparent p-2 pl-4 transition-colors duration-200"
      >
        <Avatar
          image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
          class="mr-2"
          shape="circle"
        />
        <span class="inline-flex flex-col items-start">
          <span class="font-bold">Foo Bar</span>
          <span class="text-sm">email</span>
        </span>
      </button>
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
import { findUserById } from '@/stores/user'
// console.log(await findUserById({ id: 2 }))

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
