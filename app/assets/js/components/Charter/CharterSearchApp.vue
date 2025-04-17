<template>
    <div class="row search-app">
        <aside class="col-sm-3 search-app__filters h-100 position-relative">
            <div class="bg-tertiary padding-default mh-100 border-top-dibe scrollable scrollable--vertical">
                <div v-if="modelHasChanged" class="form-group mbottom-default">
                    <button class="btn btn-primary" @click="resetAllFilters">
                        Reset all filters
                    </button>
                </div>
                <VueFormGenerator
                    ref="form"
                    :model="model"
                    :options="formOptions"
                    :schema="formSchema"
                    @validated="onFormValidated"
                />
            </div>
        </aside>

        <article class="col-sm-9 d-flex flex-column h-100 search-app__results">
            <header>
                <h1 v-if="title" class="mbottom-default">{{ title }}</h1>
                <div v-if="false">
                    <div>{{ model }}</div>
                    <div>{{getActiveFilterTagStrings(model)}}</div>
                    <div>{{ filterState }}</div>
                    <div>{{ filteredPlaceData.size }}</div>
                </div>
                <div class="flex-row align-items-start justify-content-center m-sm-2">
                    <span v-for="props in getActiveFilterTagStrings(model)" class="badge bg-secondary ms-2">
                        {{`${props.label}${props.value}`}}
                        <button class="btn btn-close btn-sm ms-2" @click="onCloseActiveFilter(props)"></button>
                    </span>
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
                        <b-dropdown class="active ms-auto" :items="selectedIds">
                            <template #display>
                                {{selectedIds.length}} charter{{selectedIds.length != 1 ? "s" : ""}} selected
                            </template>
                            <template #header>
                                <button class="btn" @click="() => {setSelectedIds([])}">unselect all</button>
                            </template>
                            <template #item="{item : id, index}">
                                <a class="btn btn-tertiary btn-sm" target="_blank"
                                   :href="getHashedUrl(id)"
                                   @mouseup="(event) => handleRedirect(
                                           event, dataTableState, id, index, totalRecords,
                                           filterState, selectedIds.length? selectedIds : null)"
                                >
                                    {{id}}
                                </a>
                            </template>
                            <template #postItem="{item, index}">
                                <button class="btn-close btn-sm" @click="removeSelectedId(index)"></button>
                            </template>
                        </b-dropdown>
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

                            <div class="d-flex flex-grow-1 scrollable">
                                <b-table :items="tableDataWithCheckbox"
                                         :fields="tableOptions.fields"
                                         :sort-by="dataTableState.orderBy"
                                         :sort-ascending="dataTableState.orderAsc"
                                         @update:sort-by="(value) => updateDataTableState({orderBy: value})"
                                         @update:sort-ascending="(value) => updateDataTableState({orderAsc: value})"
                                         class="m-0"
                                >
                                    <template #actionsPreRow="props">
                                        <input
                                            type="checkbox"
                                            v-model="props.row.selected"
                                            @change="() => toggleRowSelection(props.row.id, props.index)"
                                        >
                                    </template>
                                    <template #id="props">
                                        <a class="btn btn-tertiary btn-sm" target="_blank"
                                           :href="getHashedUrl(props.row.id)"
                                           @mouseup="(event) => handleRedirect(
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
                            <CharterMap :geojson="geojson" class="w-100 h-100" @marker-click="onMarkerClick" ref="map" :popup-visible="!!activePlaceId">
                                <template #control>
                                    <BRadioList :items="roleFilters" :modelValue="roleFilterValue"
                                                @update:modelValue="onUpdateRoleFilter" class="m-2"></BRadioList>
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
                                                        <a class="btn btn-tertiary btn-sm me-1"
                                                           :href="getHashedUrl(charterId, 0)"
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
                                                <a class="btn btn-tertiary btn-sm me-1"
                                                   :href="getHashedUrl(charterId, 0)"
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
interface PlaceActorRole {
    id: number,
    charterIds: number[],
}
interface PlaceActor {
    id: number,
    name: string,
    roles: PlaceActorRole[],
    charterIds: number[],
}
interface Place {
    id: number,
    name: string,
    latitude: number,
    longitude: number,
    actors: PlaceActor[],
    charterIds: number[],
}

interface Stats {
    actors: number,
    charters: number,
    actorsCharters: number,
    placeDateCharters: number,
}

interface FilteredPlace extends Place {
    stats: Stats
}

type PlaceData = Place[]
type FilteredPlaceData = Map<number, FilteredPlace>
</script>

<script setup lang="ts">
import {useI18n} from 'vue-i18n'

import {computed, onMounted, ref, shallowRef, toRaw, watch} from 'vue'

import CharterSearchSummary from "./CharterSearchSummary.vue";

import BPagination from "../Bootstrap/BPagination.vue";
import BSelect from "../Bootstrap/BSelect.vue";
import RecordCount from "../Bootstrap/RecordCount.vue";
import BTable from "../Bootstrap/BTable.vue";
import BRadioList from "@/components/Bootstrap/BRadioList.vue";
import CharterMap from "@/components/Charter/CharterMap.vue";

import charterRepository from "@/repositories/CharterRepository";
import {useTablePagination} from "@/composables/useTablePagination";
import type {DataTableState, Filters, RadioItem, SearchQuery} from "@/types";
import {useSimpleState} from "@/composables/useSimpleState.ts";
import {useVueFormGenerator} from "@/composables/useVueFormGenerator";
import {useSearchApi} from "@/composables/useSearchApi";
import {useVueFormGeneratorCollapsibleGroups} from "@/composables/useVueFormGeneratorCollapsibleGroups.ts";
import {createSchema} from '@/components/Charter/CharterSearchAppForm.ts'
import qs from "qs";
import {useSearchContext} from "@/composables/useSearchContext.ts";
import BDropdown from "@/components/Bootstrap/BDropdown.vue";
import {type FilterTag, useActiveFilterTags} from "@/composables/useActiveFilterTags.ts";

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

const map = ref(null)

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
const placeData = shallowRef<PlaceData|null>(null)

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

const roleFilterValue = ref(0)

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
} = useVueFormGenerator({}, defaultModel);

const {
    getActiveFilterTagStrings,
    closeActiveFilterTag
} = useActiveFilterTags(Object.keys(defaultModel))

const onCloseActiveFilter = (tag: FilterTag) => {
    closeActiveFilterTag(model.value, tag);
    updateFilterState(flattenModel(model.value))
}

const {
    getHashedUrl,
    handleRedirect,
} = useSearchContext('/en/charters/')

const formSchema = computed(() => {
    schema.value
    // const schema = this.schema
    // todo: migrate form generatorm mixin!
    // formGeneratorCollapseGroups(schema)
    return schema.value
})

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

const {state: selectedIds, setState: setSelectedIds} = useSimpleState([]);

function removeSelectedId(index: number){
    selectedIds.value.splice(index, 1);
}

function toggleRowSelection(id: number, index: number){
    if (selectedIds.value.includes(id)){
        removeSelectedId(index)
    } else {
        setSelectedIds([...selectedIds.value, id].sort());
    }
}

function selectAllVisibleRows(){
    const ids = tableData.value.map((row: any) => row.id);
    setSelectedIds([...new Set([...selectedIds.value, ...ids])].sort());
}

const tableDataWithCheckbox = computed(() => {
    return tableData.value.map(row => ({
        ...row,
        selected: selectedIds.value.includes(row.id)
    }))
});

watch(aggregations, (currentAggregations) => {
    if (currentAggregations) {
        updateFieldValues(currentAggregations)
    }
})

// map api

const filteredPlaceData = computed<FilteredPlaceData>((): Map<number, any> => {
    // filter actors based on role
    const filteredPlaces = new Map()

    // check if place data is available
    if (!placeData.value) {
        return filteredPlaces
    }

    // copy place data
    const places = JSON.parse(JSON.stringify(placeData.value)) as PlaceData

    // filter actors based on role
    for (const place of places) {
        const filteredActors: PlaceActor[] = [];
        const actorsCharterIds = new Set();
        for (const actor of place?.actors ?? []) {
            const filteredRoles = roleFilterValue.value !== 0
                ? actor.roles.filter((role) => role.id === roleFilterValue.value)
                : actor.roles
            if(filteredRoles.length === 0) {
                continue
            }

            // calculate unique charter ids the actor is involved in
            const charterIds = Array.from(new Set(actor.roles.map(role => role?.charterIds).flat())).sort()

            // update actor with filtered roles and charter ids
            actor.roles = filteredRoles
            actor.charterIds = charterIds

            // update actors charter ids
            charterIds.forEach(id => actorsCharterIds.add(id))

            // add actor to filtered actors
            filteredActors.push(actor)
        }
        // place has actors with the selected role? add to filtered places
        if (filteredActors.length) {
            const stats = {
                actors: filteredActors.length,
                charters: (new Set([...actorsCharterIds, ...place.charterIds])).size,
                actorsCharters: actorsCharterIds.size,
                placeDateCharters: place.charterIds.length,
            }

            filteredPlaces.set(place.id, {
                ...place,
                stats: stats
            })
        }
    }
    return filteredPlaces
})

const geojson = computed(() => {
    const geojson: {type: string, features: any[]} = {type: 'FeatureCollection', features: []};
    for (const place of filteredPlaceData.value.values()) {
        const feature = createPlaceFeature(place);
        geojson.features.push(feature);
    }
    return geojson
})

const activePlace = computed(() => {
    if (activePlaceId.value) {
        return filteredPlaceData.value.get(activePlaceId.value)
    } else {
        return null
    }
})

const onFormValidated = (isValid, errors) => {
    if (!isValid) {
        return
    }
    updateFilterState(flattenModel(model.value))
}

const createPlaceFeature = (place: FilteredPlace) => {
    return {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [parseFloat(place.longitude.toString()), parseFloat(place.latitude.toString())]
        },
        properties: {
            id: place.id,
            actorCount: place.stats.actors,
            actorCharterCount: place.stats.actorsCharters,
            charterCount: place.stats.charters,
        }
    }
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
        charterRepository.autocomplete(fieldName, query, filterState)
            .then((response) => {
                updateFieldValues(response.data, [fieldName])
                // const fieldConfig = getFieldConfig(fieldName)
                // fieldConfig.values = response.data?.[fieldName] ?? []
                // return response
            })
    }
}

const updatePlaceData = () => {
    charterRepository.locate(filterState.value)
        .then((response) => {
            placeData.value = response.data
        })
}

const onMarkerOver = (feature: any) => {
    activePlaceId.value = feature.properties.id
}

const onMarkerClick = (feature: any) => {
    activePlaceId.value = feature.properties.id
}

const onMarkerOut = () => {
    // this.activePlaceId = null
}

const createSearchQuery = (paginationState: DataTableState, filterState: any) => {
    const query: SearchQuery = {
        orderBy: paginationState.orderBy,
        ascending: paginationState.orderAsc,
        limit: paginationState.rowsPerPage,
        page: paginationState.currentPage,
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
    roleFilterValue.value = roleId
    activePlaceId.value = null
}

const onPopHistory = (event: PopStateEvent) => {
    if (event.state) {
        setModel(event.state.model)
        setDataTableState(event.state.paginationState)
        setFilterState(flattenModel(model.value))

        const query = createSearchQuery(dataTableState.value, filterState.value);

        // search & aggregate
        fetch(query, 'search_aggregate');

        // update map data
        updatePlaceData()
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

    // update map data
    updatePlaceData()
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
updatePlaceData()

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