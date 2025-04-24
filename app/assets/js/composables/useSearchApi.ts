import {ref, toValue, watch, shallowRef} from 'vue';
import {useFetch} from '@vueuse/core';
import qs from 'qs'

export enum queryMode {
    search = 'search',
    aggregate = 'aggregate',
    search_aggregate = 'search_aggregate',
}

export function useSearchApi(url: string) {

    const endpoint = ref<string>(toValue(url));

    const useFetchUrl = ref<string>('')
    const fetchOptions = {
        immediate: false
    }

    const {isFetching, error, data, execute} = useFetch(useFetchUrl, fetchOptions).get().json()

    // result state
    const count = ref<number>(0)
    const aggregations = shallowRef<any>({})
    const results = shallowRef<any>([])

    // watch for changes in the data and fill the results, count and aggregations
    watch(data, (newData) => {
        if (newData) {
            count.value = newData.count
            results.value = newData.data
            if (newData?.aggregation) {
                aggregations.value = newData.aggregation
            }
        }
    })

    function balancedParentheses(str: string): boolean {
        let depth = 0;
        for (const char of str) {
            if (char === '(') {
                depth++;
            } else if (char === ')') {
                if (depth === 0) return false;
                depth--;
            }
        }
        return depth === 0;
    }

    const validate_search = (search: string): boolean => {
        const invalidOrAnd = /(^\s*[,+])|([,+]\s*$)|([,+]{2,})|([,+]\s*[^\s\w(#])|([^\w\s)]\s*[,+])/;
        const invalidNot = /(#$)|(#[^\s\w(])/;
        const invalidRange = /([%/]\D)|([%/]\d+[^(])/
        return !invalidNot.test(search) && !invalidOrAnd.test(search) && !invalidRange.test(search) && balancedParentheses(search);
    }

    // fetch data from the api
    const fetch = async (params: any, mode: queryMode) => {
        if ('fulltext' in params['filters']) {
            if (!validate_search(params['filters']['fulltext'])) {
                return;
            }
        }
        if ('summary' in params['filters']) {
            if (!validate_search(params['filters']['summary'])) {
                return;
            }
        }
        const queryParams = {...params}
        queryParams['mode'] = mode

        useFetchUrl.value = endpoint.value + '?' + qs.stringify(queryParams)
        await execute()
    }

    return {
        isFetching,
        error,
        data,
        results,
        count,
        aggregations,
        fetch
    }
}