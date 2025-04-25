import {type Ref, toRef, toValue} from "vue";
import {useStorage} from "@vueuse/core";
import type {Context, DataTableState, ResultSet} from "@/types";
import axios from "axios";
import qs from "qs";
import merge from "lodash.merge";

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
    }
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
     * Handle redirecting to the detailed view of an item and saving the context. Only use this on urls gotten by getHashedUrl
     * @param event
     * @param dataTableState
     * @param id
     * @param index
     * @param count
     * @param filters
     * @param ids If the user has selected some items, these ids will be the only ones in the search context
     */
    const handleRedirect = (event, dataTableState: DataTableState, id: number, index: number, count: number, filters={},  ids: number[] | null = null): void => {
        event.preventDefault();
        if (event.button === 0 || event.button === 1){
            const href = event.target?.getAttribute("href");
            const url = new URL(href, window.location.origin);
            const hash = url.hash.substring(1);
            let context: Context = {
                params: {
                    filters: filters,
                    limit: dataTableState.rowsPerPage,
                    page: dataTableState.currentPage,
                    orderBy: dataTableState.orderBy,
                    ascending: dataTableState.orderAsc ?? false,
                },
                searchIndex: (dataTableState.currentPage - 1) * dataTableState.rowsPerPage + index + 1,
                prevUrl: window.location.href,
                count: count,
                ids: ids? [...ids] : null,
            }
            if (context.ids) {
                if (!context.ids.includes(id)){
                    context.ids.push(id);
                    context.ids.sort();
                }
                context.searchIndex = context.ids.indexOf(id) + 1;
                context.count = context.ids.length;
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
                _handleRedirectToIndex(id, fixedIndex);
            })
        } else {
            loadBySelectedIndex(fixedIndex);
        }
    }

    const loadBySelectedIndex = (index: number) => {
        const id = context.value.ids[index-1];
        _handleRedirectToIndex(id, index);
    }

    const _handleRedirectToIndex = (id: number, index: number) => {
        context.value.searchIndex = index;
        const hash = window.location.hash.substring(1);
        updateContextState(context, hash);
        const segments = window.location.pathname.split('/');
        segments[segments.length - 1] = String(id);
        const newPath = segments.join('/');

        window.location.href = `${newPath}${window.location.hash}`;
    }

    /**
     * Return to the previous url.
     */
    const returnToSearchResult = () => {
        window.location.href = context.value.prevUrl;
    }

    /**
     * Checks to make sure the context and result set are valid.
     */
    const validContextAndResultSet = (): boolean => {
        const contextValue = toValue(context)
        const resultSetValue = toValue(resultSet)
        // return true;
        return (!!contextValue.searchIndex && !!contextValue.prevUrl) && (!!contextValue.ids || (!!resultSetValue.url && !!resultSetValue.count && !!resultSetValue.ids.length))
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
        setMaxLocalStorageContexts,
        initResultSet,
        updateResultSetIndex,
        getResultSetIdByIndex,
        loadByIndex,
        resultSet,
        returnToSearchResult,
        validContextAndResultSet,
    }
}