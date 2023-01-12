import Vue from 'vue'
import CharterViewApp from '../apps/CharterViewApp'

new Vue({
    el: '#charter-view-app',
    components: {
        CharterViewApp
    }
})

// (function () {
//     // Set proper page title
//     let id = document.getElementById('detail-page-id');
//     if (id) {
//         document.title += ' ID ' + id.innerText.split(' ')[2];
//     }
// }());
