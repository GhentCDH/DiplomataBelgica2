import {describe, it, expect} from 'vitest';
import {parseTraditionKey, traditionKeyFromPath, replaceTraditionInPath} from '@/composables/useTraditionKey';

describe('tradition keys', () => {
    it('parses a "type:id" key', () => {
        expect(parseTraditionKey('manuscript:104')).toEqual({type: 'manuscript', id: '104'});
        expect(parseTraditionKey('copy:1')).toEqual({type: 'copy', id: '1'});
    });

    it('treats a bare id as an original (old bookmarks and contexts)', () => {
        expect(parseTraditionKey('12')).toEqual({type: 'original', id: '12'});
        expect(parseTraditionKey(12)).toEqual({type: 'original', id: '12'});
    });

    it('reads the key from a detail page path', () => {
        expect(traditionKeyFromPath('/fr/tradition/manuscript/104')).toBe('manuscript:104');
        expect(traditionKeyFromPath('/en/tradition/copy/1')).toBe('copy:1');
    });

    it('replaces type and id in a detail page path', () => {
        expect(replaceTraditionInPath('/fr/tradition/original/5', 'manuscript:104')).toBe('/fr/tradition/manuscript/104');
    });
});
