import './assets/style.css'
import 'v-calendar/style.css'
import {createApp} from 'vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import 'primeicons/primeicons.css'
import Aura from '@primevue/themes/aura'
import {createPinia} from 'pinia'
import {setupCalendar} from 'v-calendar'

import Checkbox from 'primevue/checkbox'
import Toast from 'primevue/toast'
import Menubar from 'primevue/menubar'
import VueMenu from 'primevue/menu'
import VueButton from 'primevue/button'
import Avatar from 'primevue/avatar'
import Ripple from 'primevue/ripple'
import Badge from 'primevue/badge'
import OverlayBadge from 'primevue/overlaybadge'

import App from './App.vue'
import router from './router'

const app = createApp(App)
app
  .use(createPinia())
  .use(router)
  .use(setupCalendar, {})
  .use(PrimeVue, {
    ripple: true,
    theme: {
      preset: Aura,
      options: {
        prefix: 'p',
        darkModeSelector: 'system',
        cssLayer: false
      }
    }
  })
  .use(ToastService)

  .component('Checkbox', Checkbox)
  .component('Toast', Toast)
  .component('VueMenu', VueMenu)
  .component('Menubar', Menubar)
  .component('VueButton', VueButton)
  .component('Avatar', Avatar)
  .component('Badge', Badge)
  .component('OverlayBadge', OverlayBadge)

  .directive('ripple', Ripple)
  .mount('#app')
