import {describe, it, expect} from 'vitest';
import {ref} from 'vue';

import {useTextMarker, termsFromPlainQuery, withLatinSpellings} from '@/composables/useTextMarker';

const mark = (text: string, terms: string[]) => useTextMarker(ref(text), terms, 'hl').markedText.value;

describe('useTextMarker', () => {
    it('marks whole words, ignoring case', () => {
        expect(mark('Baldwin met baldwinus and Baldwin.', ['baldwin']))
            .toBe('<mark class="hl">Baldwin</mark> met baldwinus and <mark class="hl">Baldwin</mark>.');
    });

    it('treats regex metacharacters in a term literally', () => {
        expect(mark('S.Martin or SxMartin (b)', ['S.Martin', '(b)']))
            .toBe('<mark class="hl">S.Martin</mark> or SxMartin <mark class="hl">(b)</mark>');
    });

    it('lets * match any letters, accented ones included', () => {
        expect(mark('abbatia, abbé and abbas', ['abb*']))
            .toBe('<mark class="hl">abbatia</mark>, <mark class="hl">abbé</mark> and <mark class="hl">abbas</mark>');
    });

    it('finds words that start or end with an accented letter', () => {
        expect(mark('Évêque de Pévèle', ['évêque', 'pévèle']))
            .toBe('<mark class="hl">Évêque</mark> de <mark class="hl">Pévèle</mark>');
    });

    it('prefers the longest term and leaves the given array untouched', () => {
        const terms = ['Gand', 'Gandavum'];
        expect(mark('apud Gandavum', terms)).toBe('apud <mark class="hl">Gandavum</mark>');
        expect(terms).toEqual(['Gand', 'Gandavum']);
    });

    it('returns the text unchanged without terms', () => {
        expect(mark('a <b>c</b>', [])).toBe('a <b>c</b>');
    });
});

describe('termsFromPlainQuery', () => {
    it('splits on whitespace, drops quotes and punctuation, keeps a trailing *', () => {
        expect(termsFromPlainQuery(' "Baldwin of"  Gand* , (comes)  ')).toEqual(['Baldwin', 'of', 'Gand*', 'comes']);
    });

    it('returns nothing for an empty or missing query', () => {
        expect(termsFromPlainQuery('')).toEqual([]);
        expect(termsFromPlainQuery(undefined)).toEqual([]);
    });
});

describe('withLatinSpellings', () => {
    it('adds the u/i spelling of terms with v or j, as the index does', () => {
        expect(withLatinSpellings(['Vniversis', 'Jacobus', 'abbas'])).toEqual(['Vniversis', 'Jacobus', 'abbas', 'Uniuersis', 'Iacobus']);
    });

    it('marks the normalized Latin text for a v/j query', () => {
        expect(mark('Notum sit uniuersis', withLatinSpellings(['vniversis'])))
            .toBe('Notum sit <mark class="hl">uniuersis</mark>');
    });
});
