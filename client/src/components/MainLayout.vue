<template>
  <Menubar :model="links">
    <template #start><div class="text-xl">Tick It Off</div></template>
    <template #item="{item, props, label}">
      <router-link v-if="item.route" v-slot="{href, navigate}" :to="item.route" custom>
        <a v-ripple :href="href" v-bind="props.action" @click="navigate">
          <span :class="item.icon" />
          <span>{{ label }}</span>
        </a>
      </router-link>
    </template>
    <template #end>
      <OptionsMenu />
    </template>
  </Menubar>

  <main>
    <div class="container mx-auto px-0 py-0">
      <RouterView />
    </div>
  </main>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {Menubar} from 'primevue'
import {useUserStore} from '@/stores/userStore'
import OptionsMenu from '@/components/Options/OptionsMenu.vue'

const userStore = useUserStore()

const links = computed(() => [
  ...(userStore.isLoggedIn
    ? [
        {label: 'Todo', name: 'TodoToday', icon: 'pi pi-pen-to-square', route: '/todo'},
        {label: 'Statistics', name: 'Statistics', icon: 'pi pi-chart-bar', route: '/statistics'},
        {label: 'Users', name: 'Users', icon: 'pi pi-users', route: '/users'}
      ]
    : [
        {label: 'Login', name: 'Login'},
        {label: 'Signup', name: 'Signup'}
      ])
])
</script>
