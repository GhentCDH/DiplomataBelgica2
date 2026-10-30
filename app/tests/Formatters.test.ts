import {describe, it, expect} from 'vitest';
import {formatRepositoryReference} from '@/components/Charter/Formatters';

describe('formatRepositoryReference', () => {
    it('separates location, repository and reference number with commas', () => {
        expect(formatRepositoryReference({location: 'Liège', name: "Archives de l'Evêché"}, 'S.Paul 15'))
            .toBe("Liège, Archives de l'Evêché, S.Paul 15");
    });

    it('skips missing parts', () => {
        expect(formatRepositoryReference({location: 'Mons', name: null}, 'S.Martin 3')).toBe('Mons, S.Martin 3');
        expect(formatRepositoryReference({location: null, name: 'Archives'}, null)).toBe('Archives');
        expect(formatRepositoryReference(null, 'B 1496/221')).toBe('B 1496/221');
        expect(formatRepositoryReference(undefined, undefined)).toBe('');
    });
});
