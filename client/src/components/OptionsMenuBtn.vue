<template>
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
</template>

<script setup lang="ts">
import { menu } from '@/stores/user'

const toggle = (event) => {
  menu.value.toggle(event)
}
</script>
