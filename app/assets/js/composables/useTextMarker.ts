import type {Ref} from "vue";
import {computed, toRef} from "vue";

/**
 * Composable to convert a text into a text with <mark> elements around certain words
 * @param textRef ref to the text
 * @param initWords initial words to mark (will return same text if empty)
 * @param colorClass optional css class for the <mark> elements
 */
export function useTextMarker(textRef: Ref<string>, initWords: string[] = [], colorClass: string = ""){
    const text: Ref<string> = textRef;
    const words: Ref<string[]> = toRef(initWords);

    const setWords = (newWords: string[]) => {
        words.value = newWords;
    }

    /**
     * Computed value returning the marked text
     */
    const markedText = computed (()=> {
        if (words.value.length === 0) return text.value
        words.value.sort((a, b) => b.length - a.length)
        const regex = new RegExp(`\\b(${words.value.join('|')})\\b`, 'gi')
        return text.value.replace(regex, `<mark class="${colorClass}">$1</mark>`)
    });

    return {
        setWords,
        markedText
    }
}