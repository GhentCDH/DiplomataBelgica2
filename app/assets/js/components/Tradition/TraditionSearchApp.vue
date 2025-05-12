<template>
    <div class="row search-app">
        <aside class="col-sm-3 search-app__filters h-100 position-relative">
            <div class="bg-tertiary padding-default mh-100 border-top-dibe scrollable scrollable--vertical">
                <div v-if="modelHasChanged" class="form-group mbottom-default">
                    <b-filter-tags :items="getActiveFilterTagStrings()" @onClickClose="onCloseActiveFilter">
                        <template #startButton>
                            <button class="btn btn-primary" @click="resetAllFilters">
                                Reset all filters
                            </button>
                        </template>
                    </b-filter-tags>
                </div>
                <VueFormGenerator
                    ref="form"
                    :model="model"
                    :options="formOptions"
                    :schema="schema"
                    @validated="onFormValidated"
                />
            </div>
        </aside>

        <article class="col-sm-9 d-flex flex-column h-100 search-app__results">
            <header>
                <h1 v-if="title" class="mbottom-default">{{ title }}</h1>
                <div v-if="false">
                    <div>{{ model }}</div>
                    <div>{{getActiveFilterTagStrings()}}</div>
                    <div>{{ filterState }}</div>
                    <div>{{dataTableState}}</div>
                </div>
                <nav class="mbottom-default">
                    <div class="nav nav-pills" id="nav-tab" role="tablist">
                        <selected-items-basket
                            :selected-ids="selectedIds"
                            :get-hashed-url="getHashedUrl"
                            :set-selected-ids="setSelectedIds"
                            :remove-selected-index="removeSelectedIndex"
                            :data-table-state="dataTableState"
                            :total-records="totalRecords"
                            :filter-state="filterState"
                            :before-redirect="beforeRedirect"
                        />
                    </div>
                </nav>
            </header>
            <section class="d-flex flex-column flex-grow-1 overflow-hidden">
                <header class="row form-group">
                    <div class="col-lg-4 d-flex align-items-lg-center">
                        <b-pagination
                            :total-records="totalRecords"
                            :per-page="dataTableState.rowsPerPage"
                            :page="dataTableState.currentPage"
                            @update:page="(page) => updateDataTableState({currentPage: parseInt(page)})"
                        ></b-pagination>
                    </div>
                    <div class="col-lg-4 d-flex align-items-lg-center justify-content-lg-center">
                        <RecordCount :per-page="dataTableState.rowsPerPage" :total-records="totalRecords" :page="dataTableState.currentPage"></RecordCount>
                    </div>
                    <div class="col-lg-4 d-flex align-items-lg-center justify-content-lg-end">
                        <b-select :id="'per-page'"
                                  :label="'Per page'"
                                  :selected="dataTableState.rowsPerPage"
                                  :options="tableOptions.pagination.perPageValues.map(value => ({value, text: value}))"
                                  @update:selected="(value) => updateDataTableState({rowsPerPage: parseInt(value)})"
                                  class="w-auto"
                        ></b-select>
                    </div>
                </header>

                <article class="d-flex flex-grow-1 scrollable">
                        <b-table :items="tableData"
                                 :fields="tableOptions.fields"
                                 :sort-by="dataTableState.orderBy"
                                 :sort-ascending="dataTableState.orderAsc"
                                 @update:sort-by="(value) => updateDataTableState({orderBy: value})"
                                 @update:sort-ascending="(value) => updateDataTableState({orderAsc: value})"
                                 class="table table-striped table-bordered table-hover m-0"
                        >
                            <template #actionsPreRowHeader>
                                <th>
                                    <input
                                        type="checkbox"
                                        @change="toggleAllRowsSelection"
                                        :checked="allSelected"
                                    >
                                </th>
                            </template>
                            <template #actionsPreRow="props">
                                <td>
                                    <input
                                        type="checkbox"
                                        v-model="props.row.selected"
                                        @change="() => toggleRowSelection(props.row.id)"
                                    >
                                </td>
                            </template>
                            <template #type="props">
                                {{ props.row.type }}
                            </template>
                            <template #summary="props">
                                <div>
                                    <a target="_blank" :href="getHashedUrl(props.row.id)"
                                       @mouseup="(event) => beforeRedirect(
                                               event, dataTableState, props.row.id, props.index, totalRecords,
                                               filterState, selectedIds.length? selectedIds : null)"
                                    >
                                        <span v-if="props.row.repository.location">{{ props.row.repository.location }}</span>
                                        <span v-if="props.row.repository.name">, {{ props.row.repository.name }}</span>
                                        <span v-if="props.row.repository_reference_number"> {{ props.row.repository_reference_number }}</span>
                                    </a>
                                </div>
                                <div>
                                    {{ props.row.title }}
                                </div>
                                <div>
                                    {{ props.row.redaction_date }}
                                </div>
                            </template>
                        </b-table>
                </article>
            </section>
        </article>
        <div
                v-if="isFetching"
                class="loading-overlay"
        >
            <div class="spinner"/>
        </div>
    </div>
</template>

<script lang="ts">
type SearchQuery = {
    orderBy: string;
    ascending: boolean;
    limit: number;
    page: number;
    filters: Filters[] | null;
}

type Filters = {
    [key: string]: any
}
</script>

<script setup lang="ts">
import {useI18n} from "vue-i18n";

import BTable from "@/components/Bootstrap/BTable.vue";
import BSelect from "@/components/Bootstrap/BSelect.vue";
import RecordCount from "@/components/Bootstrap/RecordCount.vue";
import BDropdown from "@/components/Bootstrap/BDropdown.vue";
import BPagination from "../Bootstrap/BPagination.vue";

import {type DataTableState, useTablePagination} from "@/composables/useTablePagination.ts";
import {useVueFormGenerator} from "@/composables/useVueFormGenerator.ts";
import {type FilterTag, useActiveFilterTags} from "@/composables/useActiveFilterTags.ts";
import {useSearchContext} from "@/composables/useSearchContext.ts";
import {useSearchApi} from "@/composables/useSearchApi.ts";
import {computed, onMounted, watch} from "vue";
import {useSimpleState} from "@/composables/useSimpleState.ts";
import traditionRepository from "@/repositories/TraditionRepository.ts";
import qs from "qs";
import {createTraditionsSchema} from "@/components/Tradition/TraditionSearchAppForm.ts";
import {useVueFormGeneratorCollapsibleGroups} from "@/composables/useVueFormGeneratorCollapsibleGroups.ts";
import BFilterTags from "@/components/Bootstrap/BFilterTags.vue";
import SelectedItemsBasket from "@/components/SearchContext/SelectedItemsBasket.vue";


const {t} = useI18n()

const props = defineProps({
    initUrls: {
        type: String,
        default: '{}',
    },
    title: {
        type: String,
        default: null
    }
});

const {initUrls, title} = props;

const tableOptions = {
    fields: [
        {key: 'id', label: 'Id', sortable: false, thClass: 'no-wrap'},
        {key: 'type', label: 'Type', sortable: false, thClass: 'no-wrap'},
        {key: 'summary', label: 'Summary'},
    ],
    orderBy: {
        column: 'id',
    },
    pagination: {
        chunk: 5,
        perPage: 25,
        page: 1,
        perPageValues: [25, 50, 100],
    }
}

const defaultDataTableState: DataTableState = {
    orderBy: 'id',
    orderAsc: true,
    rowsPerPage: 25,
    currentPage: 1,
}

const {
    state: dataTableState,
    setCurrentPage,
    setState: setDataTableState,
    updateState: patchDataTableState,
    setOrderBy,
    setOrderAsc
} = useTablePagination(defaultDataTableState);

const {state: filterState, setState: setFilterState} = useSimpleState([]);

const defaultModel = {}

const {
    model,
    schema,
    setSchema,
    setModel,
    modelHasChanged,
    flattenModel,
    updateFieldValues,
    getFieldConfig,
} = useVueFormGenerator({}, defaultModel);

const {
    getActiveFilterTagStrings,
    closeActiveFilterTag
} = useActiveFilterTags(model, getFieldConfig)

const onCloseActiveFilter = (tag: FilterTag) => {
    closeActiveFilterTag(tag);
    updateFilterState(flattenModel(model.value))
}


const {
    getHashedUrl,
    beforeRedirect,
} = useSearchContext('/en/tradition/original/')


const formOptions = {
    validateAfterLoad: false,
    validateAfterChanged: true,
    validationErrorClass: "has-error",
    validationSuccessClass: "success"
}

useVueFormGeneratorCollapsibleGroups(schema, 'tradition-search-groups')

const {
    data,
    isFetching,
    error,
    fetch,
    count: totalRecords,
    results: tableData,
    aggregations
} = useSearchApi('/tradition/search_api/')

watch(aggregations, (currentAggregations) => {
    if (currentAggregations) {
        updateFieldValues(currentAggregations)
    }
});

//selected rows
const {state: selectedIds, setState: setSelectedIds} = useSimpleState([]);

function removeSelectedId(id: number){
    selectedIds.value.splice(selectedIds.value.indexOf(id), 1);
}

function removeSelectedIndex(index: number){
    selectedIds.value.splice(index, 1);
}

function toggleRowSelection(id: number){
    if (selectedIds.value.includes(id)){
        removeSelectedId(id)
    } else {
        setSelectedIds([...selectedIds.value, id].sort((a, b) => a-b));
    }
}

function toggleAllRowsSelection(){
    const ids: number[] = tableData.value.map((row: any) => row.id);
    if (ids.every((v: number) => selectedIds.value.includes(v))){
        ids.forEach((id: number) => {
            removeSelectedId(id)
        })
    } else {
        setSelectedIds([...new Set([...selectedIds.value, ...ids])].sort((a, b) => a-b));
    }
}

const allSelected = computed(() => {
    const ids = tableData.value.map((row: any) => row.id);
    return ids.every((v: number) => selectedIds.value.includes(v))
});

const tableDataWithCheckbox = computed(() => {
    return tableData.value.map(row => ({
        ...row,
        selected: selectedIds.value.includes(row.id)
    }))
});

const onFormValidated = (isValid, errors) => {
    if (!isValid) {
        return
    }
    updateFilterState(flattenModel(model.value))
}

const onAutocomplete = (fieldName: string) => {
    return (query: string) => {
        traditionRepository.autocomplete(fieldName, query, filterState)
            .then((response) => {
                updateFieldValues(response.data, [fieldName])
                // const fieldConfig = getFieldConfig(fieldName)
                // fieldConfig.values = response.data?.[fieldName] ?? []
                // return response
            })
    }
}

const createSearchQuery = (paginationState: DataTableState, filterState: any) => {
    const query: SearchQuery = {
        orderBy: paginationState.orderBy,
        ascending: paginationState.orderAsc,
        limit: paginationState.rowsPerPage,
        page: paginationState.currentPage,
        filters: null,
    }

    query.filters = {...filterState}
    return query
}

const resetAllFilters = () => {
    setModel(defaultModel)
    setCurrentPage(1)
    updateFilterState(flattenModel(model.value))
}

const pushHistory = (query: string) => {
    const state = {
        model: JSON.parse(JSON.stringify(model.value)),
        paginationState: JSON.parse(JSON.stringify(dataTableState.value)),
    }
    history.pushState(state, '', document.location.href.split('?')[0] + '?' + qs.stringify(query))
}

const onPopHistory = (event: PopStateEvent) => {
    if (event.state) {
        setModel(event.state.model)
        setDataTableState(event.state.paginationState)
        setFilterState(flattenModel(model.value))

        const query = createSearchQuery(dataTableState.value, filterState.value);

        // search & aggregate
        fetch(query, 'search_aggregate');
    }
}

const updateDataTableState = (payload: Partial<DataTableState>) => {
    // update datatable state
    patchDataTableState(payload)

    // create search query
    const query = createSearchQuery(dataTableState.value, filterState.value);

    // push query to history
    pushHistory(query)

    // paginate (DO NOT aggregate!)
    fetch(query, 'search');
}

const updateFilterState = (payload: any) => {
    // update filter state
    setFilterState(payload)
    // reset pagination
    setCurrentPage(1)

    // create search query
    const query = createSearchQuery(dataTableState.value, filterState.value);

    // push query to history
    pushHistory(query)

    // search & aggregate
    fetch(query, 'search_aggregate');
}


setSchema(createTraditionsSchema({
    t,
    onAutocomplete
}))

let params = qs.parse(window.location.href.split('?', 2)[1])
const filters = params['filters'] ?? {}
setFilterState(filters)
let tmpModel = {}
Object.entries(filters).forEach(([k,v]) => {
    if (v === 'true') {
        tmpModel[k] = true
    }else if (v === 'false') {
        tmpModel[k] = false
    } else {
        tmpModel[k] = v;
    }
})
setModel({...defaultModel, ...tmpModel})
if (Number(params['page'])){
    setCurrentPage(Number(params['page']))
}

if (params['orderBy']) {
    setOrderBy(params['orderBy'])
}
if (params['ascending']) {
    setOrderAsc(params['ascending'] == 'true')
}

const query = createSearchQuery(dataTableState.value, filterState.value);
fetch(query, 'search_aggregate');

onMounted(() => {
    window.onpopstate = ((event: PopStateEvent) => {
        onPopHistory(event)
    })
})

</script>
