import './assets/style.css'
import 'v-calendar/style.css'
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import 'primeicons/primeicons.css'
import Material from '@primevue/themes/material'
import { createPinia } from 'pinia'
import { setupCalendar } from 'v-calendar'

import Checkbox from 'primevue/checkbox'
import Toast from 'primevue/toast'
import Button from 'primevue/button'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(setupCalendar, {})
app.use(PrimeVue, {
  theme: {
    preset: Material,
  },
})
app.use(ToastService)

app.component('Checkbox', Checkbox)
app.component('Toast', Toast)
app.component('VueButton', Button)

app.mount('#app')
