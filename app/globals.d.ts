declare module '*.vue';
declare module '@/types' {
    export {
        DataTableState, RadioItem, Filters, SearchQuery, Context, ResultSet
    } from "./assets/js/types";
}
declare module '@/*';
declare module 'articles';
declare module 'qs';
declare module 'lodash.merge';