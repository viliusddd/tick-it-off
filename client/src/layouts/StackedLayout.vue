<template>
  <Menubar :model="links">
    <template #item="{ item, props }">
      <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
        <a v-ripple :href="href" v-bind="props.action" @click="navigate">
          <span :class="item.icon" />
          <span>{{ item.label }}</span>
        </a>
      </router-link>
    </template>
    <template #start>
      <div class="text-xl">Tick It Off</div>
    </template>
    <template #end>
      <VueButton
        type="button"
        icon="pi pi-user"
        variant="text"
        rounded
        @click="toggle"
        style="font-size: 1rem"
        aria-controls="overlay_menu"
        aria-haspopup="true"
      />
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
              <span class="text-sm">Admin</span>
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
  </Menubar>

  <main>
    <div class="container mx-auto px-0 py-0">
      <RouterView />
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'
import { logout } from '@/stores/user'

const router = useRouter()

const menu = ref()
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
        command: () => {
          // darkModeToggle()
          console.log('change dark mode')
        },
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

const toggle = (event) => {
  menu.value.toggle(event)
}

const { links } = defineProps<{
  links: {
    label: string
    name: string
  }[]
}>()

const route = useRoute()

const navigation = computed(() =>
  links.map((item) => ({
    ...item,
    isActive: route.name === item.name,
  }))
)

function logoutUser() {
  logout()
  router.push({ name: 'Login' })
}
</script>
