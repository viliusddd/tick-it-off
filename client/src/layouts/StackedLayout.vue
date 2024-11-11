<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DarkMode from '@/components/DarkMode.vue'

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

<template>
  <Menubar :model="links">
    <template #start>
      <div class="text-3xl">Tick It Off</div>
    </template>
    <template #item="{ item, props }">
      <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
        <a v-ripple :href="href" v-bind="props.action" @click="navigate">
          <span :class="item.icon" />
          <span>{{ item.label }}</span>
        </a>
      </router-link>
    </template>
    <template #end>
      <div class="flex">
        <DarkMode class="mb-3" />
        <div class="pi pi-user" style="font-size: 1.5rem"></div>
      </div>
    </template>
  </Menubar>

  <main>
    <div class="container mx-auto px-0 py-0">
      <RouterView />
    </div>
  </main>
</template>
