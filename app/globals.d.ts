declare module '*.vue';
declare module '@/types' {
    export * from "./assets/js/types";
    // above is cleaner, but sometimes jetbrains won't find the definitions unless all specified sperately
    // export {
    //     DataTableState, RadioItem, Filters, SearchQuery, Context, ResultSet
    // } from "./assets/js/types";
}
declare module '@/*';
declare module 'articles';
declare module 'qs';
declare module 'lodash.merge';