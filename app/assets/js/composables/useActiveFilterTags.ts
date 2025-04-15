import type {Model} from "@/composables/useVueFormGenerator";
import type {Filters} from "../types";

enum FilterType {
    INVALID,
    OBJECTLIST, // Expects a "name" field for each object
    DATERANGE, // Expects a "from" and "till" field with each day, month and year fields
    BOOLEAN,
    STRING,
}

// export type FilterTag = [string, string, string, FilterType]; // [label, value, key, type]
export type FilterTag = {
    label: string,
    value: string,
    key: string,
    type: FilterType
}

export function useActiveFilterTags(ignore: string[] = []) {

    function getFilterType(k: string, v: any): FilterType {
        if (typeof v === "string") {
            return FilterType.STRING;
        } else if (Array.isArray(v)) {
            if (v.length > 0 && typeof v[0] === "object") {
                return FilterType.OBJECTLIST;
            }
        } else if (typeof v === "object") {
            if (isDateRange(v)) {
                return FilterType.DATERANGE;
            }
        } else if (typeof v === "boolean" || v === 'true' || v === 'false') {
            return FilterType.BOOLEAN;
        }
        return FilterType.INVALID;
    }

    const typesFunctionsMap: Map<FilterType, (k: string, v: any) => FilterTag[]> = new Map();

    typesFunctionsMap.set(FilterType.STRING, (k: string, v: string) => {
        let res: FilterTag[] = [];
        res.push({label: `${k}: `, value: v, key: k, type: FilterType.STRING});
        return res;
    });

    typesFunctionsMap.set(FilterType.OBJECTLIST, (k: string, v: any[]) => {
        let res: FilterTag[] = [];
        v.forEach((item) => {
            if (item.name){
                res.push({label: "", value: item.name, key: k, type: FilterType.OBJECTLIST});
            }
        });
        return res
    });

    function isDateRange(v: any): boolean {
        return !!v && v.from && v.till && (v.from.day || v.till.day || v.from.month || v.till.month || v.from.year || v.till.year);
    }

    typesFunctionsMap.set(FilterType.DATERANGE, (k: string, v: any) => {
        let res: FilterTag[] = [];
        if(isDateRange(v)){
            if(v.from.day || v.from.month || v.from.year){
                res.push({label: "from: ", value: `${v.from.day? v.from.day : "?"}/${v.from.month ? v.from.month : "?"}/${v.from.year ? v.from.year : "?"}`, key: k, type: FilterType.DATERANGE});
            }
            if (v.till.day || v.till.month || v.till.year){
                res.push({label: "till: ", value: `${v.till.day ? v.till.day : "?"}/${v.till.month ? v.till.month : "?"}/${v.till.year ? v.till.year : "?"}`, key: k, type: FilterType.DATERANGE});
            }
        }
        return res
    });

    typesFunctionsMap.set(FilterType.BOOLEAN, (k: string, v: boolean) => {
        let res: FilterTag[] = [];
        if (v) {
            res.push({label: `${k}: `, value: "true", key: k, type: FilterType.BOOLEAN});
        } else {
            res.push({label: `${k}: `, value: "false", key: k, type: FilterType.BOOLEAN});
        }
        return res
    });

    const getActiveFilterTagStrings = (model: Model): FilterTag[] => {
        let res: FilterTag[] = [];
        Object.entries(model).forEach(([k,v],_) => {
            if (!ignore.includes(k)){
                const handle = typesFunctionsMap.get(getFilterType(k, v));
                if (handle){
                    res = res.concat(handle(k,v))
                }
            }
        });
        return res
    }


    const closeFilterFunctionsMap: Map<FilterType, (model: Model, tag: FilterTag) => void> = new Map();

    closeFilterFunctionsMap.set(FilterType.STRING, (model: Model, tag: FilterTag) => {
        delete model[tag.key]
    });

    closeFilterFunctionsMap.set(FilterType.BOOLEAN, closeFilterFunctionsMap.get(FilterType.STRING)!);

    closeFilterFunctionsMap.set(FilterType.OBJECTLIST, (model: Model, tag: FilterTag) => {
        model[tag.key] = model[tag.key].filter((item: any) => item.name !== tag.value);
    });

    closeFilterFunctionsMap.set(FilterType.DATERANGE, (model: Model, tag: FilterTag) => {
        if (tag.label.includes("from")) {
            model[tag.key].from = {day: null, month: null, year: null};
        } else if (tag.label.includes("till")) {
            model[tag.key].till = {day: null, month: null, year: null};
        }
    });

    const closeActiveFilterTag = (model: Model, tag: FilterTag) => {
        const handle = closeFilterFunctionsMap.get(tag.type);
        if (handle){
            handle(model, tag)
        }
    }

    return {
        getActiveFilterTagStrings,
        closeActiveFilterTag
    }
}
