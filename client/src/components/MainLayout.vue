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
    <template #end><OptionsMenu /></template>
  </Menubar>

  <main>
    <div class="container mx-auto px-0 py-0">
      <RouterView />
    </div>
  </main>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {useRoute} from 'vue-router'
import {Menubar, Button} from 'primevue'
import OptionsMenu from '@/components/Options/OptionsMenu.vue'
import {useUserStore} from '@/stores/userStore'

const route = useRoute()

computed(() => links.value.map(item => ({...item, isActive: route.name === item.name})))

const userStore = useUserStore()

const links = computed(() => [
  ...(userStore.isLoggedIn
    ? [
        {label: 'Todo', name: 'TodoToday', icon: 'pi pi-pen-to-square', route: '/todo'},
        {label: 'Users', name: 'Users', icon: 'pi pi-users', route: '/users'},
        {
          label: 'Friends Statistics',
          name: 'FriendsStats',
          icon: 'pi pi-share-alt',
          route: '/friends-stats'
        }
      ]
    : [
        {label: 'Login', name: 'Login'},
        {label: 'Signup', name: 'Signup'}
      ])
])
</script>

<style>
html.cafe {
  filter: sepia(0.9) hue-rotate(315deg) brightness(0.9);
}

html.contrast {
  filter: contrast(2);
}
</style>
