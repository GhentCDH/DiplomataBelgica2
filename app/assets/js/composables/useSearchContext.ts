import {type Ref, toRef} from "vue";
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
        params: {
            filters: {},
            limit: 25,
            page: 1
        },
        searchIndex: null,
        prevUrl: null,
        count: 0,
        ids: null,
    },
    initialMaxLocalStorage: number = 20
){
    const context: Ref<Context> = toRef<Context>(initialContext);
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
            },
        }, localStorage, {deep: true});

    const setDefaultBaseUrl = (url: string) => {
        defaultBaseUrl.value = url;
    }

    const setMaxLocalStorageContexts = (max: number) => {
        maxLocalStorageContexts.value = max;
    }

    const getHashedUrl = (id: number, index: number, baseUrl:string = defaultBaseUrl.value) => {
        let hash = getContextHash();
        sessionStorage.setItem(hash, index.toString());
        return `${baseUrl.replace(/\/+$/, "")}/${id}#${hash}`;
    }

    const handleRedirect = (event, dataTableState: DataTableState, count: number, filters={},  ids: number[] | null = null): void => {
        console.log("handleRedirect", event, dataTableState, filters);
        event.preventDefault();
        if (event.button === 0 || event.button === 1){
            const href = event.target?.getAttribute("href");
            const url = new URL(href, window.location.origin);
            const hash = url.hash.substring(1);
            let index = Number(sessionStorage.getItem(hash));
            let context: Context = {
                params: {
                    filters: filters,
                    limit: dataTableState.rowsPerPage,
                    page: dataTableState.currentPage,
                },
                searchIndex: (dataTableState.currentPage - 1) * dataTableState.rowsPerPage + index,
                prevUrl: window.location.href,
                count: count,
                ids: ids,
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
        contextState.value = { ...contextState.value };
    }

    const initContextFromUrl = () => {
        let readContext: Context = initialContext;
        try {
            let hash = window.location.hash.substring(1);
            readContext = contextState.value[hash]["data"]
        } catch (e) {
            console.log(e)
        }
        context.value = {...initialContext, ...context.value, ...readContext}
    }

    return {
        setDefaultBaseUrl,
        getHashedUrl,
        handleRedirect,
        initContextFromUrl,
        context,
        contextState,
        saveContextHash,
        getContextHash,
        setMaxLocalStorageContexts
    }
}