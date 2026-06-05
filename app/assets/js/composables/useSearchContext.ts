import {type Ref, toRef, toValue} from "vue";
import {useStorage} from "@vueuse/core";
import axios from "axios";
import qs from "qs";
import merge from "lodash.merge";
import type {DataTableState} from "./useTablePagination.ts";

export type Context = {
    params: {
        filters: object;
        limit: number;
        page: number;
        [key: string]: any;
    };
    validReadContext: boolean | null;
    searchIndex: number | null; // currently selected index in the resultset
    prevUrl: string | null;
    count: number;
    ids: number[] | null; // IDs selected by the user
}

export type ResultSet = {
    params: {
        filters: object;
        limit: number;
        page: number;
    };
    ids: number[]; // Calculated IDs
    count: number;
    url: string | null;
}

/**
 * Composable used to save, retrieve and manage search contexts.
 * @param initialDefaultBaseUrl
 * @param initialContext
 * @param initialMaxLocalStorage
 * @param initialResultSet
 */
export function useSearchContext(
    initialDefaultBaseUrl: string = "",
    initialContext: Context = {
        params: {
            filters: {},
            limit: 25,
            page: 1,
        },
        validReadContext: false,
        searchIndex: null,
        prevUrl: null,
        count: 0,
        ids: null,
    },
    initialMaxLocalStorage: number = 20,
    initialResultSet: ResultSet = {
        params: {
            filters: {},
            limit: 10,
            page: 1,
        },
        ids: [],
        count: 0,
        url: ""
    },
){
    /**
     * State of the retrieved search context.
     */
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

    /**
     * set the default base url for the detailed view of the items
     * @param url
     */
    const setDefaultBaseUrl = (url: string) => {
        defaultBaseUrl.value = url;
    }

    /**
     * Set the maximum number of contexts to be saved in localStorage
     * @param max
     */
    const setMaxLocalStorageContexts = (max: number) => {
        maxLocalStorageContexts.value = max;
    }

    /**
     * Get a url to the detailed view of an item with a hash to the search context.
     * @param id
     * @param baseUrl defaults to the set defaultBaseUrl
     */
    const getHashedUrl = (id: number, baseUrl:string = defaultBaseUrl.value) => {
        let hash = getContextHash();
        return `${baseUrl.replace(/\/+$/, "")}/${id}#${hash}`;
    }

    /**
     * Source of the current search state, injected by the orchestrator so the
     * save handlers below can build a context without the calling components
     * having to thread pagination/filter/selection state through props.
     */
    type SaveContextSource = {
        getDataTableState: () => DataTableState;
        getFilters: () => object;
        getCount: () => number;
        getSelectedIds: () => number[];
    }
    let saveContextSource: SaveContextSource | null = null;

    /**
     * Provide the live search state used when saving a context on link click.
     * Search pages call this (via useSearchApp); detail pages that only read a
     * context never need it.
     */
    const setSaveContextSource = (source: SaveContextSource) => {
        saveContextSource = source;
    }

    /**
     * Shared link-click handler: gate on left/middle click, read the #hash from
     * the clicked link and persist a context built from the current search
     * state. Only use this on urls produced by getHashedUrl.
     */
    const _save = (event: MouseEvent, id: number, index: number, ids: number[] | null): void => {
        if (!saveContextSource) {
            console.error('useSearchContext: save context source not set');
            return;
        }
        event.preventDefault();
        if (event.button === 0 || event.button === 1) {
            const href = (event.currentTarget as Element)?.getAttribute("href");
            const url = new URL(href!, window.location.origin);
            const hash = url.hash.substring(1);

            const dataTableState = saveContextSource.getDataTableState();
            let context: Context = {
                params: {
                    filters: saveContextSource.getFilters(),
                    limit: dataTableState.rowsPerPage,
                    page: dataTableState.currentPage,
                    orderBy: dataTableState.orderBy,
                    ascending: dataTableState.orderAsc ?? false,
                },
                searchIndex: (dataTableState.currentPage - 1) * dataTableState.rowsPerPage + index + 1,
                prevUrl: window.location.href,
                count: saveContextSource.getCount(),
                ids: ids ? [...ids] : null,
                validReadContext: false,
            }
            if (context.ids) {
                if (!context.ids.includes(id)) {
                    context.ids.push(id);
                    context.ids.sort();
                }
                context.searchIndex = context.ids.indexOf(id) + 1;
                context.count = context.ids.length;
            }

            saveContextHash(context, hash);
        }
    }

    /**
     * Save the context for visiting an item from the result table. Browsing
     * scopes to the current selection when one exists, otherwise to the full
     * result set (using the row index for the position).
     */
    const saveResultContext = (event: MouseEvent, id: number, index: number): void => {
        const selectedIds = saveContextSource?.getSelectedIds() ?? [];
        _save(event, id, index, selectedIds.length ? selectedIds : null);
    }

    /**
     * Save the context for visiting one of the selected items. Browsing always
     * scopes to the current selection (position is derived from the id).
     */
    const saveSelectionContext = (event: MouseEvent, id: number): void => {
        const selectedIds = saveContextSource?.getSelectedIds() ?? [];
        _save(event, id, 0, selectedIds);
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

    const updateContextState = (context: Context, hash: string) => {
        contextState.value[hash].data = context;
        contextState.value = { ...contextState.value };
    }

    /**
     * Retrieve a saved context based on the hash in the url.
     */
    const initContextFromUrl = () => {
        let readContext: Context = initialContext;
        try {
            let hash = window.location.hash.substring(1);
            readContext = contextState.value[hash]["data"];
            readContext.validReadContext = true;
        } catch (e) {
            console.log(e)
        }
        context.value = {...initialContext, ...context.value, ...readContext};
    }


    //ResultSet

    /**
     * Result set containing details about the search and ids of the items in the search.
     */
    const resultSet: Ref<ResultSet> = toRef<ResultSet>(initialResultSet);

    /**
     * Initialize the result set based on the context and set the pagination url
     * @param context obtained after running initContextFromUrl
     * @param url
     */
    const initResultSet = (context: Context, url: string) => {
        let newResultSet: ResultSet = {
            params: merge(initialResultSet.params, context.params),
            ids: [],
            count: context.count,
            url: url
        }
        resultSet.value = {...resultSet.value, ...newResultSet}
        updateResultSetIndex().then();
    }

    const updateResultSetIndex = async () => {
        let response = await axios.get(resultSet.value.url + '?' + qs.stringify(resultSet.value.params));
        resultSet.value.ids = response.data;
        resultSet.value = {...resultSet.value};
    }

    const getResultSetIdByIndex = async (index: number) => {
        if ( !index || index < 1 || index > resultSet.value.count ) return null;

        let limit = resultSet.value.params.limit
        let page = Math.floor((index -1) / limit) + 1

        if ( page !== resultSet.value.params.page ) {
            resultSet.value.params.page = page
            await updateResultSetIndex()
        }

        let rsIndex = (index - 1) - (page - 1)*limit
        return resultSet.value.ids[rsIndex]
    }

    /**
     * Load a new item based on the passed index in the result set.
     * Only call this after the context and result set have been initialized.
     * @param index
     */
    const loadByIndex = (index: number) => {
        let fixedIndex = Math.min(index, context.value.count);
        fixedIndex = Math.max(fixedIndex, 1);
        if (!context.value.ids){
            getResultSetIdByIndex(index).then((id) => {
                if (id){
                    _updateContext(id, fixedIndex);
                }
            });
        } else {
            loadBySelectedIndex(fixedIndex);
        }
    }

    const loadBySelectedIndex = (index: number) => {
        if (context.value.ids){
            const id = context.value.ids[index-1];
            _updateContext(id, index);
        }
    }

    const _updateContext = (id: number, index: number) => {
        context.value.searchIndex = index;
        const hash = window.location.hash.substring(1);
        updateContextState(context.value, hash);
        if (onIdChanged.value){
            onIdChanged.value(id.toString());
        }
    }

    const onIdChanged = toRef<null | ((id: string) => void)>(null);

    /**
     * Set a callback that will be executed when the currently selected index/id in the context/resultset is changed
     * @param callback
     */
    const setOnIdChanged = (callback: (id: string) => void) => {
        onIdChanged.value = callback;
    }

    /**
     * Return to the previous url.
     */
    const returnToSearchResult = () => {
        window.location.href = context.value.prevUrl!;
    }

    /**
     * Checks to make sure the context and result set are valid.
     */
    const validContextAndResultSet = (): boolean => {
        const contextValue = toValue(context)
        const resultSetValue = toValue(resultSet)
        return (!!contextValue.searchIndex && !!contextValue.prevUrl) && (!!contextValue.ids || (!!resultSetValue.url && !!resultSetValue.count && !!resultSetValue.ids.length))
    }

    return {
        setDefaultBaseUrl,
        getHashedUrl,
        setSaveContextSource,
        saveResultContext,
        saveSelectionContext,
        initContextFromUrl,
        context,
        contextState,
        saveContextHash,
        getContextHash,
        setMaxLocalStorageContexts,
        initResultSet,
        updateResultSetIndex,
        getResultSetIdByIndex,
        loadByIndex,
        resultSet,
        returnToSearchResult,
        validContextAndResultSet,
        setOnIdChanged
    }
}