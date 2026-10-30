import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {join, resolve} from 'node:path';

import en from '@/locales/en.json';
import fr from '@/locales/fr.json';

const root = resolve(__dirname, '..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');

const lookup = (messages: Record<string, any>, key: string): unknown =>
    key.split('.').reduce<any>((node, part) => node?.[part], messages);

// user-visible English literals that must go through i18n (issue #102)
const forbidden: Record<string, string[]> = {
    'assets/js/components/Charter/CharterSearchApp.vue': ['Update viewport on data changes', 'Lock viewport on data changes'],
    'assets/js/components/Charter/CharterMap.vue': ['title="Show all places"'],
    'assets/js/components/Charter/CharterSearchSummary.vue': ['unknown="unknown"'],
    'assets/js/components/Charter/CharterViewApp.vue': ['>DiBe ID {{', '> Images <', "'Diplomata Belgica - Charter ID '"],
    'assets/js/components/Tradition/TraditionSearchApp.vue': ["label: 'Type'", "label: 'Summary'", '{{ props.row.type }}'],
    'assets/js/components/Tradition/TraditionSearchAppForm.ts': ["label: 'Images available'"],
    'assets/js/components/Tradition/TraditionViewApp.vue': [
        'Information about the Manuscript', 'label="Stein ID"', 'Author(s) of the manuscript',
        'label="Title of the manuscript"', 'Date of redaction', 'Institution(s) covered by the manuscript',
        'Size of the manuscript', 'Writing material(s)', '>Document<', 'title="Search"',
        'Return to list', 'Result {{', "'Diplomata Belgica - Tradition ID '",
    ],
    'assets/js/components/ImageThumbnail.vue': ['Image Zoom', 'aria-label="Close"'],
    'templates/pages/charter/search.html.twig': ['{% set page_title %}Charters{% endset %}'],
    'templates/bundles/TwigBundle/Exception/error404.html.twig': ['<h1>Page not found</h1>', "path('homepage')"],
    'templates/pages/copyright/copyright.fr.html.twig': ['All rights in the pages'],
};

const newKeys = [
    'map.lockViewport', 'map.unlockViewport', 'map.showAllPlaces',
    'label.unknown', 'label.document', 'label.imageZoom', 'label.close', 'label.search',
    'tradition.type.original', 'tradition.type.copy', 'tradition.type.manuscript',
    'tradition.manuscriptInfo.title', 'tradition.manuscriptInfo.steinId', 'tradition.manuscriptInfo.authors',
    'tradition.manuscriptInfo.manuscriptTitle', 'tradition.manuscriptInfo.redactionDate',
    'tradition.manuscriptInfo.institutions', 'tradition.manuscriptInfo.size', 'tradition.manuscriptInfo.materials',
    'tradition.resultIndexOfCount', 'tradition.documentTitle', 'charter.documentTitle',
];

describe('hardcoded UI strings (#102)', () => {
    for (const [file, literals] of Object.entries(forbidden)) {
        it(`${file} has no hardcoded English UI text`, () => {
            const source = read(file);
            expect(literals.filter((literal) => source.includes(literal))).toEqual([]);
        });
    }

    it('defines the new translation keys in English and French', () => {
        const missing = newKeys.flatMap((key) => [
            ...(lookup(en, key) ? [] : [`en:${key}`]),
            ...(lookup(fr, key) ? [] : [`fr:${key}`]),
        ]);
        expect(missing).toEqual([]);
    });
});
