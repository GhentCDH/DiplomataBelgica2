import Vue from 'vue'
import CharterSearchApp from '../apps/CharterSearchApp'

import fieldDMYRange from '../components/FormFields/fieldDMYRange'

Vue.component('fieldDMYRange', fieldDMYRange)

new Vue({
    el: '#charter-search-app',
    components: {
        CharterSearchApp
    }
})
