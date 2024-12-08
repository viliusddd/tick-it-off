import './assets/style.css'
import {createApp} from 'vue'
import PrimeVue from 'primevue/config'
import 'primeicons/primeicons.css'
import {createPinia} from 'pinia'

import Ripple from 'primevue/ripple'
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

  .directive('ripple', Ripple)
  .mount('#app')
