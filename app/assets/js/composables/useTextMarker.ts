import type {Ref} from "vue";
import {computed, toRef} from "vue";

export function useTextMarker(textRef: Ref<string>, initSearchString: string | null = null, colorClass: string = ""){
    const text: Ref<string> = textRef;
    const searchString: Ref<string | null> = toRef(initSearchString);

    const setSearchString = (search: string) => {
        searchString.value = search;
    }

    const _getWords = (): string[] => {
        if (searchString.value){
            return [...searchString.value.replace(/#\([^)]*\)/g, '').matchAll(/(?<!#)\b\w+\b/g)].map(m => m[0]);
        }
        return [];
    }

    const markedText = computed (()=> {
        const terms = _getWords()
        if (terms.length === 0) return text.value
        terms.sort((a, b) => b.length - a.length)
        const regex = new RegExp(`(${terms.join('|')})`, 'g')
        return text.value.replace(regex, `<mark class="${colorClass}">$1</mark>`)
    })

    return {
        setSearchString,
        markedText
    }
}