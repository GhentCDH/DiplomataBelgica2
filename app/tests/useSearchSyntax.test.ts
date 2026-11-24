import {describe, it, expect, vi, afterEach} from 'vitest';

import {useSearchSyntax} from '@/composables/useSearchSyntax';

describe('useSearchSyntax getKeywords', () => {
    afterEach(() => vi.restoreAllMocks());

    it('returns no keywords for an empty or blank query without logging errors', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        const {getKeywords} = useSearchSyntax();

        expect(getKeywords('')).toEqual([]);
        expect(getKeywords('   ')).toEqual([]);
        expect(error).not.toHaveBeenCalled();
    });

    it('still returns the keywords of a query', () => {
        const {getKeywords} = useSearchSyntax();

        expect(getKeywords('abbatia')).toEqual(['abbatia']);
    });
});
