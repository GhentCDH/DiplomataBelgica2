import { createApp } from 'vue'
import TraditionSearchApp from '@/components/Tradition/TraditionSearchApp.vue'
import VueCookies from 'vue-cookies'

import { i18n } from "../locales/i18n";
import { useI18n } from "vue-i18n";

// vue3-form-generator-legacy custom fields
import VueFormGenerator from 'vue3-form-generator-legacy'
import VueMultiselect from "vue-multiselect";
import FieldMultiselectClear from "@/components/FormGenerator/FieldMultiselectClear.vue";
import FieldCheckbox from "@/components/FormGenerator/FieldCheckbox.vue";
import FieldDMYRange from '@/components/FormGenerator/FieldDMYRange.vue';

// create app
const app = createApp({
    setup() {
        const { t } = useI18n({})
        return { t }
    }
})
app.use(i18n)
app.use(VueCookies)

// register custom fields
app.use(VueFormGenerator)
app.component('multiselect', VueMultiselect)
app.component('fieldMultiselectClear', FieldMultiselectClear)
app.component('fieldCheckboxBS5', FieldCheckbox);
app.component('fieldDMYRange', FieldDMYRange);

// main app component
app.component('tradition-search-app', TraditionSearchApp)
app.mount('#app')
