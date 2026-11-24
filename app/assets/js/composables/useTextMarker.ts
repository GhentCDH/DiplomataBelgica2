import type {Ref} from "vue";
import {computed, ref} from "vue";

// a term starts/ends where no letter or digit touches it (unicode aware, unlike \b)
const WORD_START = '(?<![\\p{L}\\p{N}])';
const WORD_END = '(?![\\p{L}\\p{N}])';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Regex source for one term: everything is literal, except `*`, which matches any letters.
 */
const termPattern = (term: string) => term.split('*').map(escapeRegExp).join('\\p{L}*');

/**
 * Turn a plain full-text query (no search syntax) into terms to mark: split on whitespace, drop quotes
 * and other punctuation around each word, keep a trailing `*` (prefix search).
 */
export function termsFromPlainQuery(query: string | null | undefined): string[] {
    return (query ?? '')
        .split(/\s+/)
        .map((word) => {
            const prefix = /\*$/.test(word);
            const core = word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
            return core && prefix ? core + '*' : core;
        })
        .filter((word) => word !== '');
}

/**
 * Add the u/i spelling of every term that has a v or j (v => u, j => i, keeping case), the way the Latin texts
 * and the search index are normalized, so a query like "vniversis" also marks "uniuersis".
 */
export function withLatinSpellings(terms: string[]): string[] {
    const latin = terms
        .map((term) => term.replace(/v/g, 'u').replace(/V/g, 'U').replace(/j/g, 'i').replace(/J/g, 'I'))
        .filter((term, index) => term !== terms[index]);
    return [...new Set([...terms, ...latin])];
}

/**
 * Composable to convert a text into a text with <mark> elements around certain words
 * @param textRef ref to the text
 * @param initWords initial terms to mark (will return same text if empty). A term is literal text,
 *                  except `*`, which matches any letters (e.g. `abb*`).
 * @param colorClass optional css class for the <mark> elements
 */
export function useTextMarker(textRef: Ref<string>, initWords: string[] = [], colorClass: string = ""){
    const text: Ref<string> = textRef;
    const words: Ref<string[]> = ref([...initWords]);

    const setWords = (newWords: string[]) => {
        words.value = [...newWords];
    }

    /**
     * Computed value returning the marked text
     */
    const markedText = computed (()=> {
        const terms = words.value.filter((word) => word !== '');
        if (terms.length === 0) return text.value
        // longest first, so the longest matching term wins
        const patterns = [...terms].sort((a, b) => b.length - a.length).map(termPattern)
        const regex = new RegExp(`${WORD_START}(${patterns.join('|')})${WORD_END}`, 'giu')
        return text.value.replace(regex, `<mark class="${colorClass}">$1</mark>`)
    });

    return {
        setWords,
        markedText
    }
}
