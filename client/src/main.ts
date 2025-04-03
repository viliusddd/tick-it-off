import './assets/style.css'
import 'primeicons/primeicons.css'
import PrimeVue from 'primevue/config'
import {createApp} from 'vue'
import {createPinia} from 'pinia'
import {ToastService, Ripple} from 'primevue'
import Noir from './presets/Noir'

import App from './App.vue'
import router from './router'

const app = createApp(App)
app
  .use(createPinia())
  .use(router)
  .use(PrimeVue, {
    theme: {
      preset: Noir,
      options: {
        prefix: 'p',
        darkModeSelector: '.p-dark',
        cssLayer: false
      }
    }
  })
  .use(ToastService)
  .directive('ripple', Ripple)
  .mount('#app')
