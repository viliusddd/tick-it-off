<template>
  <div
    class="mx-auto flex h-screen max-w-md flex-col overflow-hidden rounded-lg border bg-gray-100"
  >
    <div class="flex-1 overflow-y-auto p-4" ref="chatContainer">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="[
          'mb-2 max-w-[70%] rounded-lg p-2',
          message.user.id === user.id
            ? 'ml-auto bg-blue-500 text-white'
            : 'mr-auto bg-white text-gray-800',
        ]"
      >
        <div class="mb-1 text-xs font-bold">{{ message.user.name }}</div>
        {{ message.text }}
      </div>
    </div>
    <div class="border-t bg-white p-4">
      <div class="mb-2 flex space-x-2">
        <input
          v-model="inputValue"
          @keyup.enter="sendMessage"
          type="text"
          placeholder="Type a message..."
          class="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          @click="sendMessage"
          class="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Send
        </button>
      </div>
      <button
        @click="logout"
        class="w-full rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Sign Out
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['logout'])

const messages = ref([])
const inputValue = ref('')
const chatContainer = ref(null)

const fetchMessages = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/messages', { credentials: 'include' })
    if (!response.ok) {
      throw new Error('Failed to fetch messages')
    }
    messages.value = await response.json()
    scrollToBottom()
  } catch (error) {
    console.error('Error fetching messages:', error)
  }
}

const sendMessage = async () => {
  if (inputValue.value.trim()) {
    try {
      const response = await fetch('http://localhost:3000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputValue.value }),
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to send message')
      }
      const newMessage = await response.json()
      messages.value.push(newMessage)
      inputValue.value = ''
      scrollToBottom()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

const logout = () => {
  emit('logout')
}

onMounted(() => {
  fetchMessages()
})
</script>
