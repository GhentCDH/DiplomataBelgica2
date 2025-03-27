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

    // fetch data from the api
    const fetch = async (params: any, mode: queryMode) => {
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