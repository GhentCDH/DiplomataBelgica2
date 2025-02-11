import { createApp } from 'vue'
import CharterViewApp from '../components/Charter/CharterViewApp.vue'
import VueCookies from 'vue-cookies'

import {i18n} from "../locales/i18n";

const app = createApp({})
app.use(i18n)
app.use(VueCookies)
app.component('charter-view-app', CharterViewApp)
app.mount('#app')
