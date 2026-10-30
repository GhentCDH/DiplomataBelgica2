import {describe, it, expect} from 'vitest';

import {normaliseRole, placeRoleKey, roleKey, roleIconImage, ROLE_COLOURS, ROLE_ICON} from '@/components/Charter/roleColours';
import {filterPlaces, createPlaceFeature} from '@/components/Charter/ChartersMap';

describe('roleColours', () => {
    it('treats role 4 (beneficiary) as role 3', () => {
        expect(normaliseRole(4)).toBe(3);
        expect(normaliseRole(2)).toBe(2);
    });

    it('gives a place the colour of its single role', () => {
        expect(placeRoleKey([2])).toBe('issuer');
        expect(placeRoleKey([1, 1])).toBe('disposant');
        expect(placeRoleKey([4])).toBe('beneficiary');
        expect(placeRoleKey([3, 4])).toBe('beneficiary');
    });

    it('marks a place with several roles as mixed, unless a role is selected', () => {
        expect(placeRoleKey([1, 3])).toBe('mixed');
        expect(placeRoleKey([1, 3], 3)).toBe('beneficiary');
    });

    it('gives each actor role a key', () => {
        expect([1, 2, 3, 4, 5].map(roleKey)).toEqual(['disposant', 'issuer', 'beneficiary', 'beneficiary', null]);
    });

    it('picks the pin icon from the roleKey property, with the default pin as fallback', () => {
        expect(roleIconImage('markerIcon')).toEqual([
            'match', ['get', 'roleKey'],
            'issuer', 'marker-issuer',
            'disposant', 'marker-disposant',
            'beneficiary', 'marker-beneficiary',
            'mixed', 'marker-mixed',
            'markerIcon',
        ]);
    });

    it('has no role key for a place without actors', () => {
        expect(placeRoleKey([])).toBeNull();
    });

    it('has a colour and an icon for every key', () => {
        for (const key of ['issuer', 'disposant', 'beneficiary', 'mixed']) {
            expect(ROLE_COLOURS[key]).toMatch(/^#[0-9a-f]{6}$/);
            expect(ROLE_ICON[key]).toBe(`marker-${key}`);
        }
    });
});

describe('ChartersMap place features', () => {
    const place = (id: number, actors: object[], charterIds: number[] = []) =>
        ({id, name: `place ${id}`, latitude: 50.8, longitude: 4.3, actors, charterIds});
    const places = [
        // actor 10 is issuer of charter 1 and beneficiary of charter 2
        place(1, [{id: 10, name: 'Count', roles: [{id: 2, charterIds: [1]}, {id: 3, charterIds: [2]}], charterIds: [1, 2]}]),
        place(2, [{id: 20, name: 'Abbey', roles: [{id: 4, charterIds: [3]}], charterIds: [3]}]),
        place(3, [], [4]),
    ];
    const roleKeys = (filter: number) =>
        Object.fromEntries([...filterPlaces(places, filter).values()].map(p => [p.id, createPlaceFeature(p).properties.roleKey]));

    it('colours places by the roles of their actors', () => {
        expect(roleKeys(0)).toEqual({1: 'mixed', 2: 'beneficiary', 3: null});
    });

    it('matches role 4 when beneficiaries are selected', () => {
        expect(roleKeys(3)).toEqual({1: 'beneficiary', 2: 'beneficiary'});
    });

    it('counts only the charters of the selected role', () => {
        const issuerPlace = filterPlaces(places, 2).get(1)!;
        expect(issuerPlace.actors[0].charterIds).toEqual([1]);
        expect(createPlaceFeature(issuerPlace).properties.charterCount).toBe(1);
    });
});
