import { createI18n } from "vue-i18n";

import en from "../locales/en.json";

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
    locale: "en",
    fallbackLocale: "en",
    messages: loadLocaleMessages(),
    allowComposition: true,
});