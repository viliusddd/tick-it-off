<template>
  <div id="app">
    <AuthComponent v-if="!user" @login="login" />
    <ChatComponent v-else :user="user" @logout="logout" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AuthComponent from './components/AuthComponent.vue'
import ChatComponent from './components/ChatComponent.vue'

const user = ref(null)

const fetchUser = async () => {
  const response = await fetch('http://localhost:3000/api/user', { credentials: 'include' })
  const data = await response.json()
  user.value = data
}

const login = () => {
  window.location.href = 'http://localhost:3000/auth/github'
}

const logout = async () => {
  await fetch('http://localhost:3000/api/logout', { credentials: 'include' })
  user.value = null
}

onMounted(fetchUser)
</script>
