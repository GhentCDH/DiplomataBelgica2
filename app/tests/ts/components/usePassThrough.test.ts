import {describe, it, expect} from 'vitest';
import {resolvePt} from "@/components/Bootstrap/usePassThrough";

describe('resolvePt', () => {
    const defaultPt = {item: 'page-item', link: 'page-link'};

    it('falls back to the component default', () => {
        expect(resolvePt('item', defaultPt)).toBe('page-item');
    });

    it('global overrides the default', () => {
        expect(resolvePt('item', defaultPt, {item: 'global-item'})).toBe('global-item');
    });

    it('instance overrides global and default', () => {
        expect(resolvePt('item', defaultPt, {item: 'global-item'}, {item: 'instance-item'})).toBe('instance-item');
    });

    it('respects an empty-string override (e.g. BS3 dropping page-item)', () => {
        expect(resolvePt('item', defaultPt, {item: ''})).toBe('');
    });

    it('returns "" for an unknown element', () => {
        expect(resolvePt('missing', defaultPt)).toBe('');
    });

    it('falls through global when global lacks the element', () => {
        expect(resolvePt('link', defaultPt, {item: 'x'})).toBe('page-link');
    });
});
