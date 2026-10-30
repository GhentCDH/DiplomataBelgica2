import {describe, it, expect} from 'vitest';
import {formatCodex, formatOriginal} from '@/components/Charter/Formatters';

const url = (type: string, id: string) => `/en/tradition/${type}/${id}`;

describe('tradition item image links', () => {
    it('returns the external image links of a manuscript with the manuscript', () => {
        const codex = {
            id: 110,
            repository: {location: 'Valenciennes', name: 'Bibliothèque municipale [BM]'},
            repository_reference_number: 'Manuscrit 784',
            redaction_date: '1201-1400',
            image_urls: [{id: 1, url: 'http://bvmm.irht.cnrs.fr/resultRecherche/resultRecherche.php?COMPOSITION_ID=6452'}],
        };
        expect(formatCodex(codex, 'manuscript', url)).toEqual({
            text: 'Valenciennes, Bibliothèque municipale [BM], Manuscrit 784 (1201-1400)',
            link: '/en/tradition/manuscript/110',
            links: ['http://bvmm.irht.cnrs.fr/resultRecherche/resultRecherche.php?COMPOSITION_ID=6452'],
        });
    });

    it('returns the external image links of an original', () => {
        const original = {id: 5, repository: {location: 'Lille', name: 'AD'}, repository_reference_number: 'B 1', image_urls: [{url: 'http://x/1'}, {url: ''}]};
        expect(formatOriginal(original, url)?.links).toEqual(['http://x/1']);
    });

    it('returns no links when there are none', () => {
        expect(formatCodex({id: 1, repository: {location: 'Lille'}}, 'copy', url)?.links).toEqual([]);
    });
});
