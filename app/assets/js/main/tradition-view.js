import { createApp } from 'vue'
import TraditionViewApp from '../apps/TraditionViewApp.vue'
import VueCookies from 'vue-cookies'

import {i18n} from "./i18n";

const app = createApp({})
app.use(i18n)
app.use(VueCookies)
app.component('tradition-view-app', TraditionViewApp)
app.mount('#app')
