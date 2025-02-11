import qs from "qs";
import SearchSession from "./SearchSession";
import SearchContext from "./SearchContext";
import CollapsibleGroups from "./FormGeneratorCollapsibleGroups";

export default {
    mixins: [
        SearchSession,
        SearchContext,
        CollapsibleGroups,
    ],
    methods: {
        // todo: watch .data and update search session
        onData(data) {
            // update search session
            let params = this.getSearchParams();
            this.updateSearchSession({
                params: params,
                count: data?.count ?? 0
            })

            // update local data
            // this.aggregation = data.aggregation // done in onLoaded
            // this.data.search = data.search // done in onLoaded
            // this.data.filters = data.filters // done in onLoaded
            // this.data.count = data.count // done in onLoaded
        },
        getUrl(route) {
            return this.urls[route] ?? ''
        },
        getCharterUrl(id, index) {
            let context = {
                params: this.data.filters,
                searchIndex: (this.data.search.page - 1) * this.data.search.limit + index, // rely on data or params?
                searchSessionHash: this.getSearchSessionHash()
            }
            return this.urls['charter_get_single'].replace('charter_id', id) + '#' + this.getContextHash(context)
        },
        getSearchParams() {
            let params = qs.parse(window.location.href.split('?',2)[1], { plainObjects: true }) ?? [];
            params.orderBy = params.orderBy ?? this.tableOptions.orderBy?.column ?? null;
            params.ascending = params.ascending ?? 1;
            params.page = params.page ?? 1;
            params.limit = params.limit ?? this.tableOptions.perPage ?? 25;

            return params;
        },
    },
    created() {
        this.initSearchSession({
            urls: {
                paginate: this.getUrl('paginate'),
            },
            count: this?.data?.count ?? 0,
            params: this.getSearchParams()
        })
    }
}
