import './assets/style.css'
import {createApp} from 'vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import 'primeicons/primeicons.css'
import {createPinia} from 'pinia'

import Checkbox from 'primevue/checkbox'
import Toast from 'primevue/toast'
import Menubar from 'primevue/menubar'
import VueMenu from 'primevue/menu'
import VueButton from 'primevue/button'
import Avatar from 'primevue/avatar'
import Ripple from 'primevue/ripple'
import Badge from 'primevue/badge'
import OverlayBadge from 'primevue/overlaybadge'
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
