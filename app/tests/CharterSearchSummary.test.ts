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

async function mount(charter: object) {
    const el = document.createElement('div');
    const app = createApp({render: () => h(CharterSearchSummary, {charter})});
    app.use(createI18n({legacy: false, locale: 'en', messages: {en}}));
    app.mount(el);
    await nextTick();
    return el;
}

async function render(charter: object) {
    return (await mount(charter)).textContent ?? '';
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

    it('shows the highlighted summary of the plain search', async () => {
        const el = await mount({id: 1, actors: [], summary: 'donation to Gand',
            _highlight: {'search_text.summary': ['donation to <mark>Gand</mark>']}});
        expect(el.querySelector('.charter__search-summary mark')?.textContent).toBe('Gand');
    });

    it('keeps the summary highlight of the legacy summary filter', async () => {
        const el = await mount({id: 1, actors: [], summary: ['legacy <mark>hit</mark>']});
        expect(el.querySelector('mark')?.textContent).toBe('hit');
    });

    it('labels the highlights of the text, actors and places', async () => {
        const text = await render({id: 1, actors: [], summary: 'x', _highlight: {
            'search_text.full_text': ['in <mark>Gandavo</mark>'],
            'search_text.actor_names': ['<mark>Balduinus</mark>'],
            'search_text.actor_places': ['<mark>Gent</mark>'],
            'search_text.place_date': ['<mark>Gand</mark>'],
        }});
        expect(text).toContain(en.charters.search.highlight.full_text);
        expect(text).toContain(en.charters.search.highlight.actor_names);
        expect(text).toContain(en.charters.search.highlight.actor_places);
        expect(text).toContain(en.charters.search.highlight.place_date);
        expect(text).toContain('Gandavo');
    });
});
