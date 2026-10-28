import {describe, it, expect} from 'vitest';
import {createSchema} from '@/components/Charter/CharterSearchAppForm';

const t = (key: string) => key;
const onAutocomplete = () => () => {};

const fieldByModel = (model: string) => createSchema({t, onAutocomplete, searchSyntaxUrl: '/fr/charters/search_syntax'})
    .groups!.flatMap((group) => group.fields)
    .find((field) => field.model === model)!;

describe('CharterSearchAppForm search syntax link', () => {
    for (const model of ['summary', 'fulltext']) {
        it(`links the ${model} field to the search syntax page`, () => {
            const field = fieldByModel(model);
            expect(field.hintHtml).toBe(true);
            expect(field.hint).toContain('href="/fr/charters/search_syntax"');
            expect(field.hint).toContain('target="_blank"');
            expect(field.hint).toContain('charters.form.searchSyntaxLink');
        });
    }

    it('omits the link when no url is given', () => {
        const field = createSchema({t, onAutocomplete}).groups!.flatMap((group) => group.fields)
            .find((f) => f.model === 'summary')!;
        expect(field.hint).toBeUndefined();
    });
});
