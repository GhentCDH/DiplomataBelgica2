import {describe, it, expect} from 'vitest';
import {createSchema} from '@/components/Charter/CharterSearchAppForm';

const t = (key: string) => key;
const onAutocomplete = () => () => {};

const selectFields = () => createSchema({t, onAutocomplete})
    .groups!.flatMap((group) => group.fields)
    .filter((field) => field.type === 'multiselectClear');

describe('CharterSearchAppForm', () => {
    it('passes a translated placeholder to every select field', () => {
        const missing = selectFields()
            .filter((field) => !field.placeholderSelectItem)
            .map((field) => field.model);
        expect(missing).toEqual([]);
    });

    it('uses the diocese and place-date placeholder keys', () => {
        const byModel = Object.fromEntries(selectFields().map((field) => [field.model, field.placeholderSelectItem]));
        expect(byModel['actor_place_diocese_name_1']).toBe('charters.form.field.actor_diocese.placeholder');
        expect(byModel['actor_place_diocese_name_3']).toBe('charters.form.field.actor_diocese.placeholder');
        expect(byModel['charter_place_name']).toBe('charters.form.field.place_date.placeholder');
    });
});
