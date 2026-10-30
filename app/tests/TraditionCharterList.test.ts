import {describe, it, expect} from 'vitest';
import {createApp, h, nextTick} from 'vue';
import {createI18n} from 'vue-i18n';

import TraditionCharterList from '@/components/Tradition/TraditionCharterList.vue';
import en from '@/locales/en.json';

const datation = (preference: number, year: number) => ({preference, time: {year, month: null, day: null, interpretation: null}});

async function render(charters: object[]) {
    const el = document.createElement('div');
    const app = createApp({render: () => h(TraditionCharterList, {charters, createCharterUrl: (id: number) => `/en/charters/${id}`})});
    app.use(createI18n({legacy: false, locale: 'en', messages: {en}}));
    app.mount(el);
    await nextTick();
    return el;
}

describe('TraditionCharterList', () => {
    it('links each charter and shows its preferential date and summary', async () => {
        const el = await render([{
            id: 2741,
            datations: [datation(1, 1180), datation(0, 1201)],
            summary: 'le comte confirme',
            actors: [
                {id: 1, role: {id: 3}, name: {name: 'Baldwin'}, capacity: {id: 1, name: 'count'}, place: {id: 1, name: 'Flanders'}},
                {id: 2, role: {id: 2}, name: {name: 'Amand'}, capacity: {id: 2, name: 'abbot'}, place: {id: 2, name: 'Cateau'}},
            ],
        }]);
        const text = el.textContent ?? '';
        expect(el.querySelector('a[href="/en/charters/2741"]')?.textContent?.trim()).toBe('2741');
        expect(text).toContain('1201');
        expect(text).not.toContain('1180');
        expect(text).toContain('le comte confirme');
        // the issuer is the actor with role 2, not simply the first actor
        expect(text).toMatch(/Main issuer.*Amand.*Main beneficiary.*Baldwin/s);
    });

    it('renders charters without actors or datations', async () => {
        const el = await render([{id: 1, datations: [], actors: []}]);
        expect(el.querySelector('a[href="/en/charters/1"]')).not.toBeNull();
    });

    it('shows the folio/page column only when a charter has one (manuscripts)', async () => {
        const withFolio = await render([{id: 5, codex_pof: 'f. 12r', datations: [], actors: []}, {id: 6, datations: [], actors: []}]);
        expect(withFolio.querySelector('th')?.parentElement?.textContent).toContain('Folio/page');
        expect(withFolio.querySelector('tbody tr')?.textContent).toContain('f. 12r');

        const withoutFolio = await render([{id: 1, datations: [], actors: []}]);
        expect(withoutFolio.textContent).not.toContain('Folio/page');
    });
});
