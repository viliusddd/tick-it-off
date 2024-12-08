import './assets/style.css'
import 'primeicons/primeicons.css'
import PrimeVue from 'primevue/config'
import {createApp} from 'vue'
import {createPinia} from 'pinia'
import {ToastService, Ripple} from 'primevue'
import Material from '@primevue/themes/material'

import App from './App.vue'
import router from './router'

const app = createApp(App)
app
  .use(createPinia())
  .use(router)
  .use(PrimeVue, {
    ripple: true,
    theme: {preset: Material}
  })
  .use(ToastService)
  .directive('ripple', Ripple)
  .mount('#app')
