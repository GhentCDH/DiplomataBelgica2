import type {Ref} from "vue";
import {computed, toRef} from "vue";

export function useTextMarker(textRef: Ref<string>, initWords: string[] = [], colorClass: string = ""){
    const text: Ref<string> = textRef;
    const words: Ref<string[]> = toRef(initWords);

    const setWords = (newWords: string[]) => {
        words.value = newWords;
    }

    const markedText = computed (()=> {
        if (words.value.length === 0) return text.value
        words.value.sort((a, b) => b.length - a.length)
        const regex = new RegExp(`\\b(${words.value.join('|')})\\b`, 'g')
        return text.value.replace(regex, `<mark class="${colorClass}">$1</mark>`)
    })

    return {
        setWords,
        markedText
    }
}