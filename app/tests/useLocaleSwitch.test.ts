import {describe, it, expect} from 'vitest';
import {localizeUrl, switchLocaleUrl} from '@/composables/useLocaleSwitch';

describe('switchLocaleUrl', () => {
    it('replaces the locale path segment', () => {
        expect(switchLocaleUrl('http://localhost:8090/en/charters', 'fr'))
            .toBe('http://localhost:8090/fr/charters');
    });

    it('keeps the query string (search filters, page, sort)', () => {
        const url = 'http://localhost:8090/en/charters?orderBy=date_sort&page=3&filters%5Bcharter_language%5D%5B0%5D=1';
        expect(switchLocaleUrl(url, 'fr'))
            .toBe('http://localhost:8090/fr/charters?orderBy=date_sort&page=3&filters%5Bcharter_language%5D%5B0%5D=1');
    });

    it('keeps the hash (search context on detail pages)', () => {
        expect(switchLocaleUrl('http://localhost:8090/fr/charters/2741#12xr32m3lb5:7', 'en'))
            .toBe('http://localhost:8090/en/charters/2741#12xr32m3lb5:7');
    });

    it('handles a bare locale path', () => {
        expect(switchLocaleUrl('http://localhost:8090/en', 'fr')).toBe('http://localhost:8090/fr');
        expect(switchLocaleUrl('http://localhost:8090/en/', 'fr')).toBe('http://localhost:8090/fr/');
    });

    it('only touches the first path segment', () => {
        expect(switchLocaleUrl('http://localhost:8090/en/tradition/en/1', 'fr'))
            .toBe('http://localhost:8090/fr/tradition/en/1');
    });

    it('returns null when the path has no locale segment', () => {
        expect(switchLocaleUrl('http://localhost:8090/tradition/paginate', 'fr')).toBeNull();
    });
});

describe('localizeUrl', () => {
    it('moves a stored search URL to the current locale', () => {
        expect(localizeUrl('http://localhost:8090/fr/charters?page=3', 'en')).toBe('http://localhost:8090/en/charters?page=3');
    });

    it('leaves URLs without a locale segment untouched', () => {
        expect(localizeUrl('http://localhost:8090/tradition/paginate', 'fr')).toBe('http://localhost:8090/tradition/paginate');
    });
});
