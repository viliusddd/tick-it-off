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
        rounded
        @click="toggle"
        style="font-size: 1rem"
        aria-controls="overlay_menu"
        aria-haspopup="true"
      />
      <VueMenu ref="menu" id="overlay_menu" :model="items" :popup="true" />
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
import { useRoute } from 'vue-router'
import { ref } from 'vue'

const menu = ref()
const items = ref([
  {
    label: 'Foo Bar',
    items: [
      {
        label: 'Settings',
        icon: 'pi pi-cog',
      },
      {
        label: 'Dark Mode',
        icon: 'pi pi-moon',
      },
      {
        label: 'Log Out',
        icon: 'pi pi-sign-out',
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
</script>
