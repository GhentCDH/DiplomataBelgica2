import {toRef} from "vue";
import {useStorage} from "@vueuse/core";
import type {Context, DataTableState} from "@/types";

/**
 * Composable used to manage and retrieve search contexts.
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
    const context = toRef<Context>(initialContext);
    const defaultBaseUrl = toRef<string>(initialDefaultBaseUrl);
    const maxLocalStorageContexts = toRef<number>(initialMaxLocalStorage);

    /**
     * This is an LRU storage for the search contexts using useStorage with localStorage. It stores the last maxLocalStorageContexts contexts.
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
        sessionStorage.setItem(hash, index.toString());
        return `${baseUrl.replace(/\/+$/, "")}/${id}#${hash}`;
    }

    const handleRedirect = (event, dataTableState: DataTableState) => {
        event.preventDefault();
        if (event.button === 0 || event.button === 1){
            const href = event.target?.getAttribute("href");
            const url = new URL(href, window.location.origin);
            const hash = url.hash.substring(1);
            let index = Number(sessionStorage.getItem(hash));
            let context: Context = {
                params: {}, //TODO fix this
                searchIndex: (dataTableState.currentPage - 1) * dataTableState.rowsPerPage + index,
                prevUrl: window.location.href,
            }

            saveContextHash(context, hash);
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
        let readContext: Context = initialContext;
        try {
            let hash = window.location.hash.substring(1);
            readContext = JSON.parse(localStorage.getItem("context") ?? "")[hash]["data"]
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