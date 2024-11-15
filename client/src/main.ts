import './assets/style.css'
import 'v-calendar/style.css'
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import 'primeicons/primeicons.css'
import Aura from '@primevue/themes/aura'
import { createPinia } from 'pinia'
import { setupCalendar } from 'v-calendar'

import Checkbox from 'primevue/checkbox'
import Toast from 'primevue/toast'
import Menubar from 'primevue/menubar'
import VueMenu from 'primevue/menu'
import Listbox from 'primevue/listbox'
import VueButton from 'primevue/button'
import Avatar from 'primevue/avatar'
import Ripple from 'primevue/ripple'
import Badge from 'primevue/badge'
import OverlayBadge from 'primevue/overlaybadge'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(setupCalendar, {})
app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: 'system',
      cssLayer: false,
    },
  },
})
app.use(ToastService)

app.component('Checkbox', Checkbox)
app.component('Toast', Toast)
app.component('VueMenu', VueMenu)
app.component('Menubar', Menubar)
app.component('Listbox', Listbox)
app.component('VueButton', VueButton)
app.component('Avatar', Avatar)
app.component('Badge', Badge)
app.component('OverlayBadge', OverlayBadge)

app.directive('ripple', Ripple)

app.mount('#app')
