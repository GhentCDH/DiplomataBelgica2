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
    params: {
        filters: object;
        limit: number;
        page: number;
    };
    searchIndex: number | null;
    prevUrl: string | null;
    count: number;
    ids: number[] | null;
}

export type ResultSet = {
    params: {
        filters: object;
        limit: number;
        page: number;
    };
    ids: number[];
    count: number;
    url: string | null;
}