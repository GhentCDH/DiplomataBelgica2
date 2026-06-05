import {onMounted, onUnmounted, watch, type Ref} from "vue";

import {type DataTableState, useTablePagination} from "./useTablePagination.ts";
import {useSimpleState} from "./useSimpleState.ts";
import {type Model, type Schema, type ValidatorFn, useVueFormGenerator} from "./useVueFormGenerator.ts";
import {type FilterTag, useActiveFilterTags} from "./useActiveFilterTags.ts";
import {useSearchContext} from "./useSearchContext.ts";
import {queryMode, useSearchApi} from "./useSearchApi.ts";
import {useItemsBasket} from "./useItemsBasket.ts";
import {useVueFormGeneratorCollapsibleGroups} from "./useVueFormGeneratorCollapsibleGroups.ts";
import {type SearchQuery, useSearchHistory} from "./useSearchHistory.ts";

/**
 * Context passed to `buildSchema` so the consuming page can build its filter
 * schema (e.g. autocomplete handlers) out of orchestrator-owned helpers without
 * a chicken-and-egg problem.
 */
export type BuildSchemaContext = {
    updateFieldValues: (data: any, fieldNames?: Array<string> | null, keepModelData?: boolean) => void;
    getFieldConfig: (fieldName: string) => any;
    filterState: Ref<any>;
}

/**
 * Events emitted by the orchestrator. Handlers may be sync or async; the
 * orchestrator awaits them where ordering matters (see `emit`).
 *
 * - `search`        fired after every fetch resolves: `{ mode, query, data }`
 * - `filterChange`  fired when filters are applied:    `{ filters }`
 * - `dataTableChange` fired on pagination/sort change: `{ state }`
 * - `popState`      fired on browser back/forward:      `{ state }`
 * - `reset`         fired when all filters are reset:   `{}`
 */
export type SearchAppEvent = 'search' | 'filterChange' | 'dataTableChange' | 'popState' | 'reset';

export type SearchAppConfig = {
    /** Search API endpoint, e.g. getRoute('tradition_search_api'). */
    searchApiUrl: string;
    /** Base URL for detail-view links (passed to useSearchContext). */
    detailBaseUrl: string;
    /** Form model defaults. */
    defaultModel?: Model;
    /** Initial pagination/sort state. */
    defaultDataTableState: DataTableState;
    /** Field-level validators forwarded to useVueFormGenerator. */
    validators?: Record<string, ValidatorFn>;
    /** localStorage key enabling collapsible form groups. Omit to disable. */
    collapsibleGroupsStorageId?: string;
    /** Build the filter schema once the form helpers are available. */
    buildSchema?: (ctx: BuildSchemaContext) => Schema;
    /** Field names not rendered as active filter tags. Defaults to defaultModel keys. */
    filterTagIgnore?: string[];
    /** Override the default VueFormGenerator options. */
    formOptions?: Record<string, any>;
    /**
     * Extra query params that aren't form fields. Merged at the top level of
     * every search query and into the pushed URL. They never enter the form
     * model or filter state (the orchestrator only parses filters/page/orderBy/
     * ascending from the URL), so the app fully owns them — pass a getter to
     * read them from app state or the URL when they need to be bookmarkable.
     */
    extraQuery?: Record<string, any> | (() => Record<string, any>);
    /** Parse the URL, run the initial search and wire popstate. Default true. */
    autoInit?: boolean;
}

const defaultFormOptions = {
    validateAfterLoad: false,
    validateAfterChanged: true,
    validationErrorClass: "has-error",
    validationSuccessClass: "success",
}

/**
 * Orchestrates a faceted search page: it wires together pagination, filter
 * state, the form/schema, the search API, the items basket, the search context
 * and the URL/history, encapsulating the "filter changed -> reset page -> build
 * query -> push history -> fetch -> refresh aggregations -> notify extensions"
 * flow that used to be copy-pasted into every search page.
 *
 * Pages supply table fields/options, a filter schema, a template and endpoint
 * config. The returned `on()` emitter and imperative setters keep it extensible
 * (e.g. the Charter map subscribes to `search` to refetch its places).
 */
export function useSearchApp(config: SearchAppConfig) {

    const defaultModel: Model = config.defaultModel ?? {}
    const autoInit = config.autoInit ?? true

    const resolveExtraQuery = (): Record<string, any> => {
        const extra = config.extraQuery
        if (!extra) return {}
        return (typeof extra === 'function' ? extra() : extra) ?? {}
    }

    // --- event emitter (await-aware, multi-subscriber) ---------------------

    const listeners = new Map<SearchAppEvent, Set<(payload: any) => any>>();

    const on = (event: SearchAppEvent, callback: (payload: any) => any): (() => void) => {
        if (!listeners.has(event)) {
            listeners.set(event, new Set());
        }
        listeners.get(event)!.add(callback);
        return () => listeners.get(event)?.delete(callback);
    }

    const emit = async (event: SearchAppEvent, payload: any) => {
        const callbacks = listeners.get(event);
        if (!callbacks) return;
        await Promise.all([...callbacks].map(cb => cb(payload)));
    }

    // --- leaf composables --------------------------------------------------

    const {
        state: dataTableState,
        setCurrentPage,
        setState: setDataTableState,
        updateState: patchDataTableState,
        setOrderBy,
        setOrderAsc,
    } = useTablePagination(config.defaultDataTableState);

    const {state: filterState, setState: setFilterState} = useSimpleState<any>([]);

    const {
        model,
        schema,
        setSchema,
        setModel,
        modelHasChanged,
        flattenModel,
        updateFieldValues,
        getFieldConfig,
    } = useVueFormGenerator({}, defaultModel, config.validators ?? {});

    const {
        getActiveFilterTagStrings,
        closeActiveFilterTag,
    } = useActiveFilterTags(model, getFieldConfig, config.filterTagIgnore ?? Object.keys(defaultModel));

    const {
        getHashedUrl,
        setSaveContextSource,
        saveResultContext,
        saveSelectionContext,
    } = useSearchContext(config.detailBaseUrl);

    const formOptions = config.formOptions ?? defaultFormOptions;

    if (config.collapsibleGroupsStorageId) {
        useVueFormGeneratorCollapsibleGroups(schema, config.collapsibleGroupsStorageId);
    }

    const {
        data,
        isFetching,
        error,
        fetch: searchFetch,
        count: totalRecords,
        results: tableData,
        aggregations,
    } = useSearchApi(config.searchApiUrl);

    const {
        selectedIds,
        setSelectedIds,
        addSelectedIds,
        removeSelectedIds,
        removeSelectedIndex,
    } = useItemsBasket();

    // give the search context the live state it needs to build/save a context
    // on link click, so components don't have to thread it through props
    setSaveContextSource({
        getDataTableState: () => dataTableState.value,
        getFilters: () => filterState.value,
        getCount: () => totalRecords.value,
        getSelectedIds: () => selectedIds.value,
    });

    // refresh filter dropdown options whenever new aggregations come in
    watch(aggregations, (currentAggregations) => {
        if (currentAggregations) {
            updateFieldValues(currentAggregations)
        }
    });

    const {createSearchQuery, pushHistory, parseInitialUrl, onPopState} = useSearchHistory();

    // --- core search flow --------------------------------------------------

    /**
     * Build the query from current state, optionally push it to the browser
     * history, run the fetch and notify `search` subscribers with the result.
     */
    const runSearch = async (mode: queryMode, pushToHistory: boolean = false): Promise<any> => {
        const baseQuery: SearchQuery = createSearchQuery(dataTableState.value, filterState.value);
        // merge app-declared extra query params at the top level (never under
        // `filters`, so they don't get parsed back into the model/filterState)
        const query = {...baseQuery, ...resolveExtraQuery()};
        if (pushToHistory) {
            pushHistory(query, {model: model.value, paginationState: dataTableState.value});
        }
        const result = await searchFetch(query, mode);
        await emit('search', {mode, query, data: result});
        return result;
    }

    /**
     * Apply new filters: store them, reset to page 1, push history and run a
     * search WITH aggregations (so filter options refresh).
     */
    const updateFilterState = (payload: any) => {
        setFilterState(payload)
        setCurrentPage(1)
        emit('filterChange', {filters: filterState.value})
        return runSearch(queryMode.search_aggregate, true)
    }

    /**
     * Apply a pagination/sort change: push history and run a search WITHOUT
     * aggregations (filter options stay as they are).
     */
    const updateDataTableState = (payload: Partial<DataTableState>) => {
        patchDataTableState(payload)
        emit('dataTableChange', {state: dataTableState.value})
        return runSearch(queryMode.search, true)
    }

    const resetAllFilters = () => {
        setModel(defaultModel)
        setCurrentPage(1)
        emit('reset', {})
        return updateFilterState(flattenModel(model.value))
    }

    const onCloseActiveFilter = (tag: FilterTag) => {
        closeActiveFilterTag(tag);
        return updateFilterState(flattenModel(model.value))
    }

    const onFormValidated = (isValid: boolean, _errors?: any) => {
        if (!isValid) {
            return
        }
        return updateFilterState(flattenModel(model.value))
    }

    const onPopHistory = (event: PopStateEvent) => {
        if (event.state) {
            setModel(event.state.model)
            setDataTableState(event.state.paginationState)
            setFilterState(flattenModel(model.value))
            emit('popState', {state: event.state})
            // search & aggregate (no history push: we are responding to history)
            return runSearch(queryMode.search_aggregate, false)
        }
    }

    // --- initialisation ----------------------------------------------------

    /**
     * Build the schema (if provided), restore state from the URL and run the
     * initial search. `runSearch` only emits `search` after the awaited fetch,
     * so subscribers registered synchronously after `useSearchApp()` returns
     * still receive the initial event.
     */
    const init = () => {
        if (config.buildSchema) {
            setSchema(config.buildSchema({updateFieldValues, getFieldConfig, filterState}))
        }

        const {filters, page, orderBy, ascending} = parseInitialUrl()
        setFilterState(filters)

        const tmpModel: Model = {}
        Object.entries(filters).forEach(([k, v]) => {
            if (v === 'true') {
                tmpModel[k] = true
            } else if (v === 'false') {
                tmpModel[k] = false
            } else {
                tmpModel[k] = v
            }
        })
        setModel({...defaultModel, ...tmpModel})

        if (Number(page)) {
            setCurrentPage(Number(page))
        }
        if (orderBy) {
            setOrderBy(orderBy as string)
        }
        if (ascending) {
            setOrderAsc(ascending === 'true')
        }

        return runSearch(queryMode.search_aggregate, false)
    }

    let disposePopState: (() => void) | null = null;

    if (autoInit) {
        init()
        onMounted(() => {
            disposePopState = onPopState(onPopHistory)
        })
    }

    onUnmounted(() => {
        disposePopState?.()
        listeners.clear()
    })

    return {
        // --- template-facing state & handlers ---
        model,
        schema,
        formOptions,
        modelHasChanged,
        getActiveFilterTagStrings,
        onCloseActiveFilter,
        resetAllFilters,
        onFormValidated,
        dataTableState,
        totalRecords,
        tableData,
        updateDataTableState,
        isFetching,
        error,
        data,
        aggregations,
        filterState,
        // selection / basket
        selectedIds,
        setSelectedIds,
        addSelectedIds,
        removeSelectedIds,
        removeSelectedIndex,
        // search context
        getHashedUrl,
        saveResultContext,
        saveSelectionContext,

        // --- extension API ---
        on,

        // --- imperative escape hatches ---
        setModel,
        setSchema,
        setFilterState,
        updateFilterState,
        setDataTableState,
        setCurrentPage,
        setOrderBy,
        setOrderAsc,
        fetch: searchFetch,
        search: runSearch,
        updateFieldValues,
        getFieldConfig,
        flattenModel,
        init,
    }
}
