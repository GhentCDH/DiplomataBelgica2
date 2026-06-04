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

    const {isFetching, error, data, execute, abort, canAbort} = useFetch(useFetchUrl, fetchOptions).get().json()

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
        // cancel any in-flight request so a slower, older response can never
        // overwrite the results of a newer one
        if (canAbort.value) {
            abort()
        }

        const queryParams = {...params}
        queryParams['mode'] = mode

        useFetchUrl.value = endpoint.value + '?' + qs.stringify(queryParams)
        await execute()

        return data.value
    }



    return {
        isFetching,
        error,
        data,
        results,
        count,
        aggregations,
        fetch,
    }
}