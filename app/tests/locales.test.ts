import {describe, it, expect} from 'vitest';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join, resolve} from 'node:path';

import en from '@/locales/en.json';
import fr from '@/locales/fr.json';

const root = resolve(__dirname, '..');

const flatten = (obj: Record<string, any>, prefix = ''): Record<string, string> =>
    Object.entries(obj).reduce((acc, [key, value]) => {
        const path = prefix + key;
        return typeof value === 'object' && value !== null
            ? {...acc, ...flatten(value, path + '.')}
            : {...acc, [path]: value};
    }, {} as Record<string, string>);

const listFiles = (dir: string, extensions: string[]): string[] =>
    readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) return listFiles(path, extensions);
        return extensions.some((ext) => name.endsWith(ext)) ? [path] : [];
    });

const enFlat = flatten(en);
const frFlat = flatten(fr);

describe('vue-i18n locale files', () => {
    it('en.json and fr.json define the same keys', () => {
        const enKeys = Object.keys(enFlat).sort();
        const frKeys = Object.keys(frFlat).sort();
        expect(frKeys.filter((key) => !enKeys.includes(key))).toEqual([]);
        expect(enKeys.filter((key) => !frKeys.includes(key))).toEqual([]);
    });

    it('has no empty French messages (vue-i18n does not fall back on "")', () => {
        expect(Object.entries(frFlat).filter(([, value]) => value.trim() === '').map(([key]) => key)).toEqual([]);
    });

    it('has no leading/trailing whitespace in messages', () => {
        const padded = [...Object.entries(enFlat), ...Object.entries(frFlat)]
            .filter(([, value]) => value !== value.trim())
            .map(([key]) => key);
        expect(padded).toEqual([]);
    });

    it('defines every static t() key used in the Vue apps', () => {
        const used = new Set<string>();
        for (const file of listFiles(join(root, 'assets/js'), ['.vue', '.ts', '.js'])) {
            for (const match of readFileSync(file, 'utf8').matchAll(/\bt\(\s*['"]([\w.\-()]+)['"]/g)) {
                used.add(match[1]);
            }
        }
        expect([...used].filter((key) => !(key in enFlat)).sort()).toEqual([]);
    });

    it('uses the requested French labels', () => {
        expect(frFlat['charters.form.field.actor_function.label']).toBe('Fonction/titre');
        expect(frFlat['label.actors']).toBe('Acteurs');
        expect(frFlat['form.allAuthors']).toBe('Tous les acteurs');
        expect(enFlat['form.allAuthors']).toBe('All actors');
        expect(frFlat['charters.form.field.fulltext.placeholder']).toBe('Recherche dans le texte complet');
    });
});

describe('Symfony XLIFF translations', () => {
    const xliff = readFileSync(join(root, 'translations/messages+intl-icu.fr.xlf'), 'utf8');
    const units = [...xliff.matchAll(/<trans-unit[^>]*resname="([^"]+)"[^>]*>\s*<source>([^<]*)<\/source>\s*<target>([^<]*)<\/target>/g)]
        .map(([, resname, source, target]) => ({resname, source, target}));
    const resnames = new Set(units.map((unit) => unit.resname));

    it('uses the source string as resname (Symfony looks up by resname)', () => {
        expect(units.filter((unit) => unit.resname !== unit.source)).toEqual([]);
    });

    it('translates every literal |trans string used in the Twig templates', () => {
        const used = new Set<string>();
        for (const file of listFiles(join(root, 'templates'), ['.twig'])) {
            for (const match of readFileSync(file, 'utf8').matchAll(/['"]([^'"]+)['"]\s*\|\s*trans\b/g)) {
                used.add(match[1]);
            }
        }
        expect([...used].filter((key) => !resnames.has(key)).sort()).toEqual([]);
    });

    it('translates the navbar and language names', () => {
        const target = Object.fromEntries(units.map((unit) => [unit.resname, unit.target]));
        expect(target['Charters']).toBe('Chartes');
        expect(target['Traditions']).toBe('Tradition');
        expect(target['English']).toBe('Anglais');
        expect(target['French']).toBe('Français');
    });
});
