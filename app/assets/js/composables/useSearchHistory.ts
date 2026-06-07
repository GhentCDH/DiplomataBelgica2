import qs from "qs";
import type {TableState} from "./useTableState.ts";
import type {Model} from "./useVueFormGenerator.ts";

export type Filters = {
    [key: string]: any
}

export type SearchQuery = {
    orderBy: string;
    ascending: boolean;
    limit: number;
    page: number;
    filters: Filters | null;
}

/**
 * The state shape stored in `history.pushState` so it can be restored on popstate.
 */
export type HistoryState = {
    model: Model;
    tableState: TableState;
}

/**
 * Values parsed from the current URL query string on initial load.
 * Values are returned raw (as parsed by `qs`) so the consumer can apply the
 * exact same guards used historically (e.g. only set the page when truthy).
 */
export type InitialUrlState = {
    filters: Filters;
    page: any;
    limit: any;
    orderBy: any;
    ascending: any;
}

/**
 * Owns everything URL/history related for a faceted search page:
 * building the search query, pushing it to the browser history (together with
 * the form model and pagination state), parsing the initial URL and listening
 * for popstate events.
 *
 * The `qs.stringify`/`qs.parse` round-trip is kept identical to the original
 * inline implementation so existing detail-page links, bookmarks and saved
 * search contexts keep resolving.
 */
export function useSearchHistory() {

    /**
     * Build the API search query object from pagination + filter state.
     */
    const createSearchQuery = (tableState: TableState, filterState: any): SearchQuery => {
        return {
            orderBy: tableState.orderBy,
            ascending: tableState.orderAsc,
            limit: tableState.rowsPerPage,
            page: tableState.currentPage,
            filters: {...filterState},
        }
    }

    /**
     * Push the given query to the browser history. The current form model and
     * pagination state are stored in the history entry so they can be restored
     * when the user navigates back/forward.
     */
    const pushHistory = (query: SearchQuery, state: HistoryState) => {
        const historyState = {
            model: JSON.parse(JSON.stringify(state.model)),
            tableState: JSON.parse(JSON.stringify(state.tableState)),
        }
        history.pushState(
            historyState,
            '',
            document.location.href.split('?')[0] + '?' + qs.stringify(query)
        )
    }

    /**
     * Parse the filters/page/limit/orderBy/ascending from the current URL.
     */
    const parseInitialUrl = (): InitialUrlState => {
        const params = qs.parse(window.location.href.split('?', 2)[1])
        return {
            filters: (params['filters'] ?? {}) as Filters,
            page: params['page'],
            limit: params['limit'],
            orderBy: params['orderBy'],
            ascending: params['ascending'],
        }
    }

    /**
     * Register a popstate listener and return a disposer to remove it.
     */
    const onPopState = (callback: (event: PopStateEvent) => void): (() => void) => {
        const handler = (event: PopStateEvent) => callback(event)
        window.addEventListener('popstate', handler)
        return () => window.removeEventListener('popstate', handler)
    }

    return {
        createSearchQuery,
        pushHistory,
        parseInitialUrl,
        onPopState,
    }
}
