import { createI18n } from "vue-i18n";

import en from "./en.json";

function loadLocaleMessages() {
    const locales = [{ en: en }]
    const messages = {}
    locales.forEach(lang => {
        const key = Object.keys(lang)
        messages[key] = lang[key]
    })
    return messages
}

export const i18n = createI18n({
    legacy: false, // needed for composition api
    locale: "en",
    fallbackLocale: "en",
    messages: loadLocaleMessages(),
    allowComposition: true,
});