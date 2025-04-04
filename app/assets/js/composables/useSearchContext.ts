import {Ref, toRef} from "vue";
import {useStorage} from "@vueuse/core";

export interface Context {
    params: object,
    searchIndex: number,
    prevUrl: string,
}

/**
 * Composable in order to manage and retrieve search contexts.
 * @param initialDefaultBaseUrl
 * @param initialContext
 * @param initialMaxLocalStorage
 */
export function useSearchContext(
    initialDefaultBaseUrl: string = "",
    initialContext: Context = {
        params: {},
        searchIndex: null,
        prevUrl: null,
    },
    initialMaxLocalStorage: number = 20
){
    const context: Ref<Context> = toRef<Context>(initialContext);
    const defaultBaseUrl: Ref<string> = toRef<string>(initialDefaultBaseUrl);
    const maxLocalStorageContexts = toRef<number>(initialMaxLocalStorage);

    /**
     * This is a LRU storage for the search contexts using useStorage with localStorage. It stores the last MAX_LOCALSTORAGE_CONTEXTS contexts.
     */
    const contextState = useStorage('context',
        {
            LRU: "default",
            MRU: "default",
            "default": {
                "data": {},
                "next": ""
            }
        },
    );

    const setDefaultBaseUrl = (url: string) => {
        defaultBaseUrl.value = url;
    }

    const setMaxLocalStorageContexts = (max: number) => {
        maxLocalStorageContexts.value = max;
    }

    const getUrl = (id: number, index: number, baseUrl:string = defaultBaseUrl.value) => {
        let hash = getContextHash();
        sessionStorage.setItem(hash, index);
        return `${baseUrl.replace(/\/+$/, "")}/${id}#${hash}`;
    }

    const handleRedirect = (event: Event) => {
        event.preventDefault();
        if (event.button === 0 || event.button === 1){
            const href = event.target.getAttribute("href");
            const url = new URL(href, window.location.origin);
            const hash = url.hash.substring(1);
            let index = Number(sessionStorage.getItem(hash));
            let context: Context = {
                params: this.data.filters,
                searchIndex: (this.data.search.page - 1) * this.data.search.limit + index, // TODO fix this
                prev_url: window.location.href,
            }

            saveContextHash(hash, context);
        }
    }

    const getContextHash = () => {
        return window.btoa(Date.now().toString())
    }

    const saveContextHash = (context: Context, hash: string) => {
        contextState.value[contextState.value.MRU].next = hash;
        contextState.value[hash] = {
            "data": context,
            "next": ""
        }
        contextState.value.MRU = hash;
        while (Object.keys(contextState.value).length > maxLocalStorageContexts.value + 2){
            let lru = contextState.value.LRU;
            contextState.value.LRU = contextState.value[contextState.value.LRU].next;
            delete contextState.value[lru];
        }
    }

    const initContextFromUrl = () => {
        let readContext: Context = {}
        try {
            let hash = window.location.hash.substring(1);
            readContext = JSON.parse(localStorage.getItem("context"))[hash]["data"]
        } catch (e) {}
        context.value = {...initialContext, ...readContext, ...context.value}
    }

    return {
        setDefaultBaseUrl,
        getUrl,
        handleRedirect,
        initContextFromUrl,
        context,
        contextState,
        saveContextHash,
        getContextHash,
        setMaxLocalStorageContexts
    }
}