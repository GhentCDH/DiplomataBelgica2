export type SearchQuery = {
    orderBy: string;
    ascending: boolean;
    limit: number;
    page: number;
    filters: Filters[] | null;
}

export type Filters = {
    [key: string]: any
}

export type Context = {
    params: object;
    searchIndex: number | null;
    prevUrl: string | null;
}