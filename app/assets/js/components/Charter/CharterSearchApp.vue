<template>
    <div class="row search-app">
        <aside class="col-sm-3 search-app__filters h-100 position-relative">
            <div class="bg-tertiary padding-default mh-100 border-top-dibe scrollable scrollable--vertical">
                <div v-if="modelHasChanged" class="form-group mbottom-default flex-row">

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
                    <div>{{ filteredPlaceData.size }}</div>
                </div>
                <nav class="mbottom-default">
                    <div class="nav nav-pills" id="nav-tab" role="tablist">
                        <button class="nav-link active" id="nav-results-tab" data-bs-toggle="tab"
                                data-bs-target="#nav-results" type="button" role="tab" aria-controls="nav-results"
                                aria-selected="true"
                                ><i
                            class="fa-solid fa-bars"></i> Browse results
                        </button>
                        <button class="nav-link" id="nav-map-tab" data-bs-toggle="tab" data-bs-target="#nav-map"
                                type="button" role="tab" aria-controls="nav-map" aria-selected="false"
                                ><i class="fa-solid fa-map-location-dot"></i> Browse
                            map
                        </button>
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
                <div class="tab-content w-100 h-100" id="nav-tabContent">
                    <div class="tab-pane show active w-100 h-100" id="nav-results" role="tabpanel"
                         aria-labelledby="nav-results-tab">
                        <div class="d-flex flex-column w-100 h-100">
                            <nav class="row form-group">
                                <div class="col-lg-4 d-flex align-items-lg-center">
                                    <b-pagination
                                        :total-records="totalRecords"
                                        :per-page="dataTableState.rowsPerPage"
                                        :page="dataTableState.currentPage"
                                        @update:page="(page) => updateDataTableState({currentPage: parseInt(page)})"
                                    ></b-pagination>
                                </div>
                                <div class="col-lg-4 d-flex align-items-lg-center justify-content-lg-center">
                                    <RecordCount :per-page="dataTableState.rowsPerPage" :total-records="totalRecords"
                                                 :page="dataTableState.currentPage"></RecordCount>
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
                            </nav>

                            <div class="flex-grow-1 scrollable">
                                <b-table :items="tableDataWithCheckbox"
                                         :fields="tableOptions.fields"
                                         :sort-by="dataTableState.orderBy"
                                         :sort-ascending="dataTableState.orderAsc"
                                         @update:sort-by="(value) => updateDataTableState({orderBy: value})"
                                         @update:sort-ascending="(value) => updateDataTableState({orderAsc: value})"
                                         class="m-0"
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
                                    <template #id="props">
                                        <a class="btn btn-tertiary btn-sm" target="_blank"
                                           :href="getHashedUrl(props.row.id)"
                                           @mouseup="(event) => beforeRedirect(
                                               event, dataTableState, props.row.id, props.index, totalRecords,
                                               filterState, selectedIds.length? selectedIds : null)"
                                        >
                                            {{ props.row.id }}
                                        </a>
                                    </template>
                                    <template #summary="props">
                                        <charter-search-summary :charter="props.row"></charter-search-summary>
                                    </template>
                                    <template #date_sort="props">
                                        {{ formatDatationTime(getPreferentialDate(props.row.datations)) }}
                                    </template>
                                </b-table>
                            </div>
                        </div>
                    </div>
                    <div class="tab-pane w-100 h-100" id="nav-map" role="tabpanel" aria-labelledby="nav-map-tab">
                        <div class="position-relative w-100 h-100">
                            <div v-if="!extendedPlaceInfo" class="alert alert-info" role="alert">
                                The map only shows place-date information. Please refine your search to reduce the result set and include actor places.
                            </div>
                            <CharterMap ref="map" :geojson="geojson" :show-actor-count="extendedPlaceInfo" class="w-100 h-100" @marker-click="onMarkerClick"  :update-bounds="updateBounds" :popup-visible="!!activePlaceId">
                                <template #control-top-left v-if="extendedPlaceInfo">
                                    <BRadioList :items="roleFilters" :modelValue="actorRoleFilter"
                                                @update:modelValue="onUpdateRoleFilter" class="m-2"></BRadioList>
                                </template>
                                <template #control-top-right>
                                    <button @click="toggleUpdateBounds">
                                        <i v-if="!updateBounds" class="fa-solid fa-lock" title="Update viewport on data changes"></i>
                                        <i v-if="updateBounds" class="fa-solid fa-unlock" title="Lock viewport on data changes"></i>
                                    </button>
                                </template>
                                <template #popup>
                                    <div class="popup" v-if="activePlace">
                                        <h2>{{ activePlace.name }}</h2><span class="btn-close" @click="activePlaceId=null"></span>
                                        <template v-if="activePlace.actors.length">
                                            <h3>Actors</h3>
                                            <ul>
                                                <li v-for="actor of activePlace.actors">
                                                    <span>{{ actor.name }}</span>
                                                    <template v-for="charterId of actor.charterIds">
                                                        <a class="btn btn-tertiary btn-sm ms-1"
                                                           :href="getHashedUrl(charterId)"
                                                           target="_blank">
                                                            {{ charterId }}
                                                        </a>
                                                    </template>
                                                </li>
                                            </ul>
                                        </template>
                                        <template v-if="activePlace.charterIds.length">
                                            <h3>Placedate Charters</h3>
                                            <template v-for="charterId of activePlace.charterIds">
                                                <a class="btn btn-tertiary btn-sm ms-1"
                                                   :href="getHashedUrl(charterId)"
                                                   target="_blank">
                                                    {{ charterId }}
                                                </a>
                                            </template>
                                        </template>
                                    </div>
                                </template>
                            </CharterMap>
                        </div>
                    </div>
                </div>
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
import {useI18n} from 'vue-i18n'

import {computed, nextTick, onMounted, ref, shallowRef, watch, useTemplateRef} from 'vue'

import CharterSearchSummary from "./CharterSearchSummary.vue";

import BPagination from "../Bootstrap/BPagination.vue";
import BSelect from "../Bootstrap/BSelect.vue";
import RecordCount from "../Bootstrap/RecordCount.vue";
import BTable from "../Bootstrap/BTable.vue";
import BRadioList, {type RadioItem} from "@/components/Bootstrap/BRadioList.vue";
import CharterMap from "@/components/Charter/CharterMap.vue";

import charterRepository from "@/repositories/CharterRepository";
import {type DataTableState, useTablePagination} from "@/composables/useTablePagination";
import {useSimpleState} from "@/composables/useSimpleState.ts";
import {useVueFormGenerator} from "@/composables/useVueFormGenerator";
import {useSearchApi} from "@/composables/useSearchApi";
import {useVueFormGeneratorCollapsibleGroups} from "@/composables/useVueFormGeneratorCollapsibleGroups.ts";
import {createSchema} from '@/components/Charter/CharterSearchAppForm.ts'
import qs from "qs";
import {useSearchContext} from "@/composables/useSearchContext.ts";
import {type FilterTag, useActiveFilterTags} from "@/composables/useActiveFilterTags.ts";
import BFilterTags from "@/components/Bootstrap/BFilterTags.vue";
import SelectedItemsBasket from "@/components/SearchContext/SelectedItemsBasket.vue";
import {useItemsBasket} from "@/composables/useItemsBasket.ts";

import {
    actorRoleFilter,
    fetchPlaces,
    findPlaceById,
    geojson
} from "@/components/Charter/Map.ts";

const {t} = useI18n()

// props
const props = defineProps({
    initUrls: {
        type: String,
        default: '{}',
    },
    title: {
        type: String,
        default: null
    }
})

const {initUrls, title} = props

// refs

const mapRef = useTemplateRef('map')

// table options

const tableOptions = {
    fields: [
        {key: 'id', label: 'Id', sortable: true, thClass: 'no-wrap'},
        {key: 'summary', label: 'Summary'},
        {key: 'date_sort', label: 'Date', sortable: true, thClass: 'no-wrap'},
    ],
    pagination: {
        chunk: 5,
        perPageValues: [25, 50, 100],
    },
}

// map state

const activePlaceId = shallowRef(null)
const mapVisible = shallowRef(false)
const updateBounds = ref(true)

const toggleUpdateBounds = () => {
    updateBounds.value = !updateBounds.value
}

const roleFilters = ref<RadioItem[]>([
    {
        label: t('All'),
        value: 0
    },
    {
        label: t('Issuer'),
        value: 2
    },
    {
        label: t('Author'),
        value: 1
    },
    {
        label: t('Beneficiary'),
        value: 3
    },
])

// pagination state

const defaultDataTableState: DataTableState = {
    orderBy: 'date_sort',
    orderAsc: false,
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
} = useTablePagination(defaultDataTableState)

// filter state
const {state: filterState, setState: setFilterState} = useSimpleState([]);

// form schema & model
const defaultModel = {
    dating_scholary_preferential: true,
}

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
} = useActiveFilterTags(model, getFieldConfig, Object.keys(defaultModel))

const onCloseActiveFilter = (tag: FilterTag) => {
    closeActiveFilterTag(tag);
    updateFilterState(flattenModel(model.value))
}

const {
    getHashedUrl,
    beforeRedirect,
} = useSearchContext('/en/charters/')

const formOptions = {
    validateAfterLoad: false,
    validateAfterChanged: true,
    validationErrorClass: "has-error",
    validationSuccessClass: "success"
}

useVueFormGeneratorCollapsibleGroups(schema, 'charter-search-groups')

// search api

const {
    data,
    isFetching,
    error,
    fetch,
    count: totalRecords,
    results: tableData,
    aggregations
} = useSearchApi('/en/charters/search')

//selected rows
const {
    selectedIds,
    setSelectedIds,
    removeSelectedIndex,
    removeSelectedId,
    toggleRowSelection,
    toggleAllRowsSelection,
    allSelected,
    tableDataWithCheckbox
} = useItemsBasket(tableData);

watch(aggregations, (currentAggregations) => {
    if (currentAggregations) {
        updateFieldValues(currentAggregations)
    }
})

// map api


const activePlace = computed(() => {
    if (activePlaceId.value) {
        return findPlaceById(activePlaceId.value)
    } else {
        return null
    }
})

const extendedPlaceInfo = computed(() => {
    const ret = totalRecords.value && totalRecords.value <= 1000
    return ret
})

const onFormValidated = (isValid, errors) => {
    if (!isValid) {
        return
    }
    updateFilterState(flattenModel(model.value))
}

const getPreferentialDate = (datations) => {
    return datations.find((datation) => datation.preference == 0)
}

const formatDatationTime = (datation) => {
    if (!datation?.time) {
        return ''
    }
    return [datation.time.day, datation.time.month, datation.time.year].filter((x) => x).join('/')
}

const onAutocomplete = (fieldName: string) => {
    return (query: string) => {
        charterRepository.autocomplete(fieldName, query, filterState.value)
            .then((response) => {
                updateFieldValues(response.data, [fieldName])
                // const fieldConfig = getFieldConfig(fieldName)
                // fieldConfig.values = response.data?.[fieldName] ?? []
                // return response
            })
    }
}

const onMarkerClick = (feature: any) => {
    activePlaceId.value = feature.properties.id
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

const onUpdateRoleFilter = (roleId: number) => {
    actorRoleFilter.value = roleId
    activePlaceId.value = null
}

const onPopHistory = (event: PopStateEvent) => {
    if (event.state) {
        setModel(event.state.model)
        setDataTableState(event.state.paginationState)
        setFilterState(flattenModel(model.value))

        const query = createSearchQuery(dataTableState.value, filterState.value);

        // search & aggregate
        fetch(query, 'search_aggregate').then(() => {
            // update place data
            fetchPlaces(filterState.value, extendedPlaceInfo.value);
        });
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
    fetch(query, 'search_aggregate').then(() => {
            fetchPlaces(filterState.value, extendedPlaceInfo.value);
    });
}

// init form schema

setSchema(createSchema({
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
fetchPlaces(filterState.value, extendedPlaceInfo.value)

onMounted(() => {
    window.onpopstate = ((event: PopStateEvent) => {
        onPopHistory(event)
    })
})
</script>

<style lang="scss">
.popup {
    position: relative;

    .btn-close {
        position: absolute;
        right: 0;
        top: 0;
    }
}
</style>