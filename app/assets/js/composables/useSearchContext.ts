import {type Ref, toRef, toValue} from "vue";
import {useStorage} from "@vueuse/core";
import axios from "axios";
import qs from "qs";
import merge from "lodash.merge";
import type {TableState} from "./useTableState.ts";

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
 *
 * It only deals with the search context and its hash; building detail-page URLs
 * is the application's responsibility (see useSearchApp.getContextualDetailUrl).
 * @param initialContext
 * @param initialMaxLocalStorage
 * @param initialResultSet
 */
export function useSearchContext(
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
     * Set the maximum number of contexts to be saved in localStorage
     * @param max
     */
    const setMaxLocalStorageContexts = (max: number) => {
        maxLocalStorageContexts.value = max;
    }

    /**
     * Source of the current search state, injected by the orchestrator so the
     * save handlers and URL builder can derive a context + content hash without
     * the calling components having to thread state through props.
     */
    type SaveContextSource = {
        getTableState: () => TableState;
        getFilters: () => object;
        getCount: () => number;
        getSelectedIds: () => number[];
        namespace: string; // disambiguates apps sharing the localStorage 'context' store
    }
    let saveContextSource: SaveContextSource | null = null;

    /**
     * Provide the live search state used when saving / identifying a context.
     * Search pages call this (via useSearchApp); detail pages that only read a
     * context never need it.
     */
    const setSaveContextSource = (source: SaveContextSource) => {
        saveContextSource = source;
    }

    /**
     * Small, deterministic, Unicode-safe string hash (cyrb53). Turns a
     * browse-set descriptor into a stable, short context key.
     */
    const cyrb53 = (str: string, seed = 0): number => {
        let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
        for (let i = 0; i < str.length; i++) {
            const ch = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        return 4294967296 * (2097151 & h2) + (h1 >>> 0);
    }

    /**
     * Content hash of a browse-set descriptor: same browse-set -> same key,
     * different -> different. This is what makes the hash stable per search
     * (filters + sort) and regenerate when those change, while page/per-page
     * changes (not part of the descriptor) keep it.
     */
    const getContextHash = (descriptor: any): string => {
        return cyrb53(JSON.stringify(descriptor)).toString(36);
    }

    /**
     * For a clicked id, determine the set to browse, the context stored under
     * the content hash, the descriptor that hash is derived from, and the
     * 1-based position of the id within the set.
     *
     * Preserves the rule that a result-row click scopes to the current selection
     * when one exists (adding the clicked id if missing); otherwise it browses
     * the full result set, using the row index for the absolute position.
     */
    const buildBrowseSet = (id: number, rowIndex?: number) => {
        const src = saveContextSource!;
        const tableState = src.getTableState();
        const selected = src.getSelectedIds();

        let ids: number[] | null;
        let index: number;
        let count: number;
        let descriptor: any;

        if (selected.length) {
            ids = [...selected];
            if (!ids.includes(id)) {
                ids.push(id);
                ids.sort((a, b) => a - b);
            }
            index = ids.indexOf(id) + 1;
            count = ids.length;
            descriptor = {ns: src.namespace, ids};
        } else {
            ids = null;
            index = (tableState.currentPage - 1) * tableState.rowsPerPage + (rowIndex ?? 0) + 1;
            count = src.getCount();
            // note: page/limit are intentionally NOT part of the identity, so
            // paging keeps the hash; sort is included, so sorting changes it
            descriptor = {
                ns: src.namespace,
                filters: src.getFilters(),
                orderBy: tableState.orderBy,
                ascending: tableState.orderAsc ?? false,
            };
        }

        const context: Context = {
            params: {
                filters: src.getFilters(),
                limit: tableState.rowsPerPage,
                page: tableState.currentPage,
                orderBy: tableState.orderBy,
                ascending: tableState.orderAsc ?? false,
            },
            searchIndex: null, // position travels in the URL fragment, not the stored context
            prevUrl: window.location.href,
            count,
            ids,
            validReadContext: false,
        };

        return {descriptor, index, context};
    }

    /**
     * Build the `${hash}:${index}` URL fragment (without the leading #) for a
     * detail link.
     * @param id clicked item id
     * @param rowIndex 0-based row index on the current page (result-set browsing only)
     */
    const getContextFragment = (id: number, rowIndex?: number): string => {
        if (!saveContextSource) return '';
        const {descriptor, index} = buildBrowseSet(id, rowIndex);
        return `${getContextHash(descriptor)}:${index}`;
    }

    /**
     * Persist the browse-set context on link click. Gates on left/middle click.
     * Recomputes the same content hash the href used, so the stored key always
     * matches the URL the browser navigates to.
     */
    const _save = (event: MouseEvent, id: number, rowIndex?: number): void => {
        if (!saveContextSource) {
            console.error('useSearchContext: save context source not set');
            return;
        }
        event.preventDefault();
        if (event.button === 0 || event.button === 1) {
            const {descriptor, context} = buildBrowseSet(id, rowIndex);
            saveContextHash(context, getContextHash(descriptor));
        }
    }

    /**
     * Save the context for visiting an item from the result table (scopes to the
     * selection when one exists, otherwise the full result set).
     */
    const saveResultContext = (event: MouseEvent, id: number, index: number): void => {
        _save(event, id, index);
    }

    /**
     * Save the context for visiting one of the selected items (always the selection).
     */
    const saveSelectionContext = (event: MouseEvent, id: number): void => {
        _save(event, id);
    }

    const saveContextHash = (context: Context, hash: string) => {
        // re-saving an existing content hash: just refresh its data, never re-link
        // the LRU (that would corrupt the linked list / create a cycle)
        if (contextState.value[hash]) {
            contextState.value[hash].data = context;
            contextState.value = {...contextState.value};
            return;
        }
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

    /**
     * Retrieve a saved context based on the `${hash}:${index}` in the url. The
     * position (index) comes from the URL and wins over the stored context.
     */
    const initContextFromUrl = () => {
        let readContext: Context = initialContext;
        let urlIndex: number | null = null;
        try {
            const raw = window.location.hash.substring(1);
            const [hash, indexStr] = raw.split(':');
            readContext = contextState.value[hash]["data"];
            readContext.validReadContext = true;
            if (indexStr !== undefined && Number(indexStr)) {
                urlIndex = Number(indexStr);
            }
        } catch (e) {
            console.log(e)
        }
        context.value = {...initialContext, ...context.value, ...readContext};
        if (urlIndex !== null) {
            context.value.searchIndex = urlIndex; // URL position wins
        }
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
        // keep the position in the URL fragment (per-tab, reload-safe); the
        // shared content-keyed context must not carry a per-tab position
        const hash = (window.location.hash.substring(1).split(':')[0]) || '';
        history.replaceState(
            history.state, '',
            `${window.location.pathname}${window.location.search}#${hash}:${index}`
        );
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
        setSaveContextSource,
        getContextFragment,
        saveResultContext,
        saveSelectionContext,
        initContextFromUrl,
        context,
        contextState,
        saveContextHash,
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