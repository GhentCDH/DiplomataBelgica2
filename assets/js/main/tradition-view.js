import Vue from 'vue'
import TraditionViewApp from '../apps/TraditionViewApp'

new Vue({
    el: '#tradition-view-app',
    components: {
        TraditionViewApp
    }
})

(function () {
    // Set proper page title
    let id = document.getElementById('detail-page-id');
    if (id) {
        document.title += ' ' + id.innerText.split(' ')[1];
    }
}());
