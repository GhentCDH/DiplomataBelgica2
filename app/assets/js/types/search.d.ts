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
        [key: string]: any;
    };
    validReadContext: boolean | null;
    searchIndex: number | null;
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