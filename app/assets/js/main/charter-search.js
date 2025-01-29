import Vue from 'vue'
import CharterSearchApp from '../apps/CharterSearchApp'

import i18n from "./i18n";
new Vue({
    el: '#charter-search-app',
    components: {
        CharterSearchApp
    },
    i18n,
})
