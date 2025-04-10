import {toRef} from "vue";
import type {ResultSet, Context} from "@/types";
import axios from "axios";
import qs from "qs";
import merge from "lodash.merge";


export function useResultSet(
    initialResultSet: ResultSet = {
        params: {
            filters: {},
            limit: 10,
            page: 1
        },
        ids: [],
        count: 0,
        url: ""
    }
) {
    const resultSetState = toRef<ResultSet>(initialResultSet);

    const initResultSet = (context: Context, url: string) => {
        let newResultSet: ResultSet = {
            params: merge(initialResultSet.params, context.params),
            ids: [],
            count: context.count,
            url: url
        }
        resultSetState.value = {...resultSetState.value, ...newResultSet}
        updateResultSetIndex().then();
    }

    const updateResultSetIndex = async () => {
        console.log(resultSetState.value.url + '?' + qs.stringify(resultSetState.value.params))
        let response = await axios.get(resultSetState.value.url + '?' + qs.stringify(resultSetState.value.params));
        console.log(response.data);
        resultSetState.value.ids = response.data;
        resultSetState.value = {...resultSetState.value};
        console.log(resultSetState.value.ids);
    }

    const getResultSetIdByIndex = async (index: number) => {
        if ( !index || index < 1 || index > resultSetState.value.count ) return null;

        let limit = resultSetState.value.params.limit
        let page = Math.floor((index -1) / limit) + 1

        if ( page !== resultSetState.value.params.page ) {
            resultSetState.value.params.page = page
             await updateResultSetIndex()
        }

        let rsIndex = (index - 1) - (page - 1)*limit
        return resultSetState.value.ids[rsIndex]
    }

    return {
        initResultSet,
        updateResultSetIndex,
        getResultSetIdByIndex,
        resultSetState,
    }
}