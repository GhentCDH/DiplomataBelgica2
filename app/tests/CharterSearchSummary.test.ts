import {describe, it, expect} from 'vitest';
import {createApp, h, nextTick} from 'vue';
import {createI18n} from 'vue-i18n';

import CharterSearchSummary from '@/components/Charter/CharterSearchSummary.vue';
import en from '@/locales/en.json';

const actor = (id: number, roleId: number, name: string) => ({
    id,
    role: {id: roleId, name: `role ${roleId}`},
    name: {name},
    capacity: {id: 1, name: 'lord'},
    place: {id: 1, name: 'Clacy-et-Thierret'},
});

async function render(charter: object) {
    const el = document.createElement('div');
    const app = createApp({render: () => h(CharterSearchSummary, {charter})});
    app.use(createI18n({legacy: false, locale: 'en', messages: {en}}));
    app.mount(el);
    await nextTick();
    return el.textContent ?? '';
}

describe('CharterSearchSummary', () => {
    it('shows the disposant when a charter has no issuer (e.g. DiBe 32481)', async () => {
        const text = await render({id: 32481, actors: [actor(1, 1, 'Godabertus'), actor(2, 3, 'S. Aubert')]});
        expect(text).toContain('Author of the actio juridica');
        expect(text).toContain('Godabertus');
    });

    it('shows only the issuer when there is one (e.g. DiBe 33130)', async () => {
        const text = await render({id: 33130, actors: [actor(1, 1, 'Godabertus'), actor(2, 2, 'Bishop')]});
        expect(text).toContain('Main issuer');
        expect(text).toContain('Bishop');
        expect(text).not.toContain('Author of the actio juridica');
    });
});
