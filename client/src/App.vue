<script setup lang="ts">
import {RouterView} from 'vue-router'
import {useDark} from '@vueuse/core'
import {watchEffect, onMounted} from 'vue'

const isDark = useDark()

onMounted(() => (document.documentElement.className = isDark.value ? 'p-dark' : ''))
watchEffect(() => (document.documentElement.className = isDark.value ? 'p-dark' : ''))
</script>

<template>
  <RouterView />
</template>
