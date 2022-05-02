import Vue from 'vue'
import CharterSearchApp from '../apps/CharterSearchApp'

import fieldDMYRange from '../Components/FormFields/fieldDMYRange'

Vue.component('fieldDMYRange', fieldDMYRange)

new Vue({
    el: '#charter-search-app',
    components: {
        CharterSearchApp
    }
})
