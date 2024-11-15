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
    <button @click="next()">
      <i v-if="state === 'dark'" i-carbon-moon inline-block align-middle class="align-middle" />
      <i v-if="state === 'light'" i-carbon-sun inline-block align-middle class="align-middle" />
      <i v-if="state === 'cafe'" i-carbon-cafe inline-block align-middle class="align-middle" />
      <i
        v-if="state === 'contrast'"
        i-carbon-contrast
        inline-block
        align-middle
        class="align-middle"
      />
      <i v-if="state === 'auto'" i-carbon-laptop inline-block align-middle class="align-middle" />

      <span class="ml-2 capitalize">{{ state }}</span>
    </button>
    <div class="container mx-auto px-0 py-0">
      <RouterView />
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { type Ref, ref } from 'vue'
import { logout } from '@/stores/user'
import { useColorMode, useCycleList, useDark, useToggle } from '@vueuse/core'
import { watchEffect } from 'vue-demi'

const mode = useColorMode({
  emitAuto: true,
  modes: {
    contrast: 'dark contrast',
    cafe: 'cafe',
  },
})

const { state, next } = useCycleList(['dark', 'light', 'cafe', 'contrast', 'auto'] as const, {
  initialValue: mode,
})
watchEffect(() => (mode.value = state.value))

const isDark: Ref<boolean> = useDark({
  attribute: 'class',
  valueDark: 'dark',
  valueLight: 'light',
})
const toggleDark: () => boolean = useToggle(isDark)

const { links } = defineProps<{
  links: {
    label: string
    name: string
  }[]
}>()

const route = useRoute()
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

const toggle = (event) => {
  menu.value.toggle(event)
}

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

<style>
html.cafe {
  filter: sepia(0.9) hue-rotate(315deg) brightness(0.9);
}

html.contrast {
  filter: contrast(2);
}
</style>
