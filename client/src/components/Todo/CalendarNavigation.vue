<template>
  <div class="flex items-center justify-between">
    <Button @click="changeDate(-1)" variant="text">
      <i style="font-size: 1.5rem" class="pi pi-angle-left" />
    </Button>
    <DatePicker
      class="flex-grow"
      v-model="userStore.currentDate"
      mode="date"
      dateFormat="yy-mm-dd"
      :max-date="new Date()"
      showIcon
      fluid
      iconDisplay="input"
      :showOnFocus="false"
      size="large"
      placeholder="Large"
      :pt="{pcInputText: {style: 'background-color: red'}}"
    />
    <Button @click="goToToday" :disabled="isToday"
      ><p :class="{'cursor-not-allowed': isToday}">Today</p></Button
    >
    <Button @click="changeDate(1)" :disabled="isToday" variant="text">
      <i
        style="font-size: 1.5rem"
        class="pi pi-angle-right"
        :class="{'cursor-not-allowed': isToday}"
      />
    </Button>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {Button, DatePicker} from 'primevue'
import {useRouter} from 'vue-router'
import {useUserStore} from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const isToday = computed(() => {
  return userStore.currentDate.toDateString() === new Date().toDateString()
})

const changeDate = (days: number) => {
  const newDate = new Date(new Date().setDate(userStore.currentDate.getDate() + days))

  if (newDate <= new Date())
    router.push({name: 'SpecificDate', params: {date: newDate.toLocaleDateString('lt')}})

  userStore.currentDate = newDate
}

const goToToday = () => {
  const today = new Date()
  userStore.currentDate = today

  router.push({name: 'SpecificDate', params: {date: today.toLocaleDateString('lt')}})
}
</script>
