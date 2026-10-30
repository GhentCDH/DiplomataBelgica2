import {describe, it, expect} from 'vitest';
import {createSchema} from '@/components/Charter/CharterSearchAppForm';

const t = (key: string) => key;
const onAutocomplete = () => () => {};

const actorModels = (index: number) => createSchema({t, onAutocomplete})
    .groups!.flatMap((group) => group.fields)
    .map((field) => field.model)
    .filter((model) => model.startsWith('actor_') && model.endsWith('_' + index));

describe('CharterSearchAppForm actor fields', () => {
    for (const index of [1, 2, 3]) {
        it(`orders actor ${index} as role, function, institution, name, diocese, principality, order`, () => {
            expect(actorModels(index)).toEqual([
                `actor_${index}`,
                `actor_role_${index}`,
                `actor_capacity_${index}`,
                `actor_place_name_${index}`,
                `actor_name_full_name_${index}`,
                `actor_place_diocese_name_${index}`,
                `actor_place_principality_name_${index}`,
                `actor_order_name_${index}`,
            ]);
        });
    }

    it('keeps autocomplete on the name field and visibility rules on actors 2 and 3', () => {
        const fields = createSchema({t, onAutocomplete}).groups!.flatMap((group) => group.fields);
        const field = (model: string) => fields.find((f) => f.model === model)!;
        expect(field('actor_name_full_name_2').selectOptions.onSearch).toBeTypeOf('function');
        expect(field('actor_name_full_name_2').selectOptions.internalSearch).toBe(false);
        expect(field('actor_role_1').visible).toBeUndefined();
        expect(field('actor_role_2').visible).toBeTypeOf('function');
        expect(field('actor_3').visible).toBeTypeOf('function');
    });
});
