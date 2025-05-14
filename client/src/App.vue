<template>
  <RouterView />
</template>

<script setup lang="ts">
import {watchEffect, onMounted} from 'vue'
import {RouterView} from 'vue-router'
import {useDark} from '@vueuse/core'

const isDark = useDark()

onMounted(() => (document.documentElement.className = isDark.value ? 'p-dark' : ''))
watchEffect(() => (document.documentElement.className = isDark.value ? 'p-dark' : ''))
</script>
