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
      <OptionsMenu />
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
import { useRoute } from 'vue-router'
import { useColorMode, useCycleList } from '@vueuse/core'
import { watchEffect } from 'vue-demi'
import OptionsMenu from '@/components/Options/OptionsMenu.vue'

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

const { links } = defineProps<{
  links: {
    label: string
    name: string
  }[]
}>()

const route = useRoute()

computed(() => links.map((item) => ({ ...item, isActive: route.name === item.name })))
</script>

<style>
html.cafe {
  filter: sepia(0.9) hue-rotate(315deg) brightness(0.9);
}

html.contrast {
  filter: contrast(2);
}
</style>
