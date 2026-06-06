<template>
    <div class="row search-app">
        <aside class="col-sm-3 search-app__filters h-100 position-relative">
            <div class="bg-tertiary padding-default mh-100 border-top-dibe scrollable scrollable--vertical">
                <div v-if="hasActiveFilters" class="form-group mbottom-default flex-row">

                    <b-filter-tags :items="getActiveFilterTags()" @onClickClose="onCloseActiveFilter">
                        <template #startButton>
                            <button class="btn btn-primary" @click="resetFilters">
                                {{ t('form.reset-filters') }}
                            </button>
                        </template>
                    </b-filter-tags>
                </div>
                <VueFormGenerator
                    ref="form"
                    :model="filterModel"
                    :options="filterOptions"
                    :schema="filterSchema"
                    @validated="onFiltersValidated"
                />
            </div>
        </aside>

        <article class="col-sm-9 d-flex flex-column h-100 search-app__results">
            <header>
                <h1 v-if="title" class="mbottom-default">{{ title }}</h1>
                <nav class="mbottom-default">
                    <div class="nav nav-pills" id="nav-tab" role="tablist">
                        <button class="nav-link active" id="nav-results-tab" data-bs-toggle="tab"
                                data-bs-target="#nav-results" type="button" role="tab" aria-controls="nav-results"
                                aria-selected="true"
                                ><i
                            class="fa-solid fa-bars"></i> {{ t('charters.browseResults') }}
                        </button>
                        <button class="nav-link" id="nav-map-tab" data-bs-toggle="tab" data-bs-target="#nav-map"
                                type="button" role="tab" aria-controls="nav-map" aria-selected="false"
                                ><i class="fa-solid fa-map-location-dot"></i> {{ t('charters.browseMap') }}
                        </button>
                        <selected-items-basket
                            :selected-ids="selectedIds"
                            :get-contextual-detail-url="getContextualDetailUrl"
                            :set-selected-ids="setSelectedIds"
                            :remove-selected-index="removeSelectedIndex"
                            :save-selection-context="saveSelectionContext"
                            message="selectedItemsBasket.selectedCharters"
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
                                        :per-page="tableState.rowsPerPage"
                                        :page="tableState.currentPage"
                                        @update:page="(page) => updateTableState({currentPage: parseInt(page)})"
                                    ></b-pagination>
                                </div>
                                <div class="col-lg-4 d-flex align-items-lg-center justify-content-lg-center">
                                    <RecordCount :per-page="tableState.rowsPerPage" :total-records="totalRecords"
                                                 :page="tableState.currentPage"></RecordCount>
                                </div>
                                <div class="col-lg-4 d-flex align-items-lg-center justify-content-lg-end">
                                    <b-select :id="'per-page'"
                                              :label="t('pagination.perPage')"
                                              :selected="tableState.rowsPerPage"
                                              :options="tableOptions.pagination.perPageValues.map(value => ({value, text: value}))"
                                              @update:selected="(value) => updateTableState({rowsPerPage: parseInt(value)})"
                                              class="w-auto"
                                    ></b-select>
                                </div>
                            </nav>

                            <div class="flex-grow-1 scrollable">
                                <search-result-table
                                    :items="results"
                                    :fields="tableOptions.fields"
                                    :sort-by="tableState.orderBy"
                                    :sort-ascending="tableState.orderAsc"
                                    :selected-ids="selectedIds"
                                    @update:sort-by="(value) => updateTableState({orderBy: value})"
                                    @update:sort-ascending="(value) => updateTableState({orderAsc: value})"
                                    @add-selected="addSelectedIds"
                                    @remove-selected="removeSelectedIds"
                                    class="m-0"
                                >
                                    <template #id="props">
                                        <a class="btn btn-tertiary btn-sm" target="_blank"
                                           :href="getContextualDetailUrl(props.row.id, props.index)"
                                           @mouseup="() => saveResultContext(props.row.id, props.index)"
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
                                </search-result-table>
                            </div>
                        </div>
                    </div>
                    <div class="tab-pane w-100 h-100" id="nav-map" role="tabpanel" aria-labelledby="nav-map-tab">
                        <div class="position-relative w-100 h-100">
                            <div v-if="!extendedPlaceInfo" class="alert alert-info" role="alert">
                                {{ t('charters.mapWarning') }}
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
                                            <h3>{{ t('label.actors') }}</h3>
                                            <ul>
                                                <li v-for="actor of activePlace.actors">
                                                    <span>{{ actor.name }}</span>
                                                    <template v-for="charterId of actor.charterIds">
                                                        <a class="btn btn-tertiary btn-sm ms-1"
                                                           :href="createCharterUrl(charterId)"
                                                           target="_blank">
                                                            {{ charterId }}
                                                        </a>
                                                    </template>
                                                </li>
                                            </ul>
                                        </template>
                                        <template v-if="activePlace.charterIds.length">
                                            <h3>{{ t('charters.placedateCharters') }}</h3>
                                            <template v-for="charterId of activePlace.charterIds">
                                                <a class="btn btn-tertiary btn-sm ms-1"
                                                   :href="createCharterUrl(charterId)"
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

<script setup lang="ts">
import {useI18n} from 'vue-i18n'

import {computed, ref, shallowRef, useTemplateRef} from 'vue'

import CharterSearchSummary from "./CharterSearchSummary.vue";

import BPagination from "../Bootstrap/BPagination.vue";
import BSelect from "../Bootstrap/BSelect.vue";
import RecordCount from "../Bootstrap/RecordCount.vue";
import BRadioList, {type RadioItem} from "@/components/Bootstrap/BRadioList.vue";
import CharterMap from "@/components/Charter/CharterMap.vue";
import BFilterTags from "@/components/Bootstrap/BFilterTags.vue";
import SelectedItemsBasket from "@/components/SearchContext/SelectedItemsBasket.vue";
import SearchResultTable from "@/components/Search/SearchResultTable.vue";

import charterRepository from "@/repositories/CharterRepository";
import {type ValidatorFn} from "@/composables/useVueFormGenerator";
import {useSearchApp} from "@/composables/useSearchApp.ts";
import {useSearchSyntax} from "@/composables/useSearchSyntax";
import {useUrlGenerator} from "@/composables/useUrlGenerator.ts";
import {createSchema} from '@/components/Charter/CharterSearchAppForm.ts'

import {
    actorRoleFilter,
    fetchPlaces,
    findPlaceById,
    geojson
} from "@/components/Charter/ChartersMap.js";

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

const {title} = props
const urls = JSON.parse(props.initUrls)

const {getRoute, createCharterUrl} = useUrlGenerator(urls)

const mapRef = useTemplateRef('map')

// table options
const tableOptions = {
    fields: [
        {key: 'id', label: t('label.id'), sortable: true, thClass: 'no-wrap'},
        {key: 'summary', label: t('label.summary')},
        {key: 'date_sort', label: t('label.date'), sortable: true, thClass: 'no-wrap'},
    ],
    pagination: {
        chunk: 5,
        perPageValues: [25, 50, 100],
    },
}

// map state
const activePlaceId = shallowRef(null)
const updateBounds = ref(true)

const toggleUpdateBounds = () => {
    updateBounds.value = !updateBounds.value
}

const roleFilters = ref<RadioItem[]>([
    {label: t('form.allAuthors'), value: 0},
    {label: t('label.issuer'), value: 2},
    {label: t('label.author'), value: 1},
    {label: t('label.beneficiary'), value: 3},
])

// search syntax validators
const {validate: validateSearchSyntax} = useSearchSyntax()

const initialValidators: Record<string, ValidatorFn> = {
    summary: (v: string) => validateSearchSyntax(v) ? true : t("charters.invalidSearchSyntax"),
    fulltext: (v: string) => validateSearchSyntax(v) ? true : t("charters.invalidSearchSyntax"),
    id: (v: string) => /^\d*$/.test(v) ? true : t('charters.charterIdMustBeAnInteger'),
}

// search app orchestrator
const {
    // template-facing state & handlers
    filterModel,
    filterSchema,
    filterOptions,
    hasActiveFilters,
    getActiveFilterTags,
    onCloseActiveFilter,
    resetFilters,
    onFiltersValidated,
    tableState,
    totalRecords,
    results,
    updateTableState,
    isFetching,
    filterState,
    // selection / basket
    selectedIds,
    setSelectedIds,
    removeSelectedIndex,
    addSelectedIds,
    removeSelectedIds,
    // search context
    getContextualDetailUrl,
    saveResultContext,
    saveSelectionContext,
    // extension API
    on,
} = useSearchApp({
    searchApiUrl: getRoute('charter_search_api'),
    detailUrl: (id) => createCharterUrl(id),
    defaultFilterModel: {
        dating_scholary_preferential: true,
    },
    defaultTableState: {
        orderBy: 'date_sort',
        orderAsc: false,
        rowsPerPage: 25,
        currentPage: 1,
    },
    validators: initialValidators,
    collapsibleGroupsStorageId: 'charter-search-groups',
    buildFilterSchema: ({updateFieldValues, filterState}) => {
        const onAutocomplete = (fieldName: string) => {
            return (query: string) => {
                charterRepository.autocomplete(fieldName, query, filterState.value)
                    .then((response) => {
                        updateFieldValues(response.data, [fieldName])
                    })
            }
        }
        return createSchema({t, onAutocomplete})
    },
})

// --- map: a pure extension on top of the search app ---

const extendedPlaceInfo = computed(() => totalRecords.value && totalRecords.value <= 1000)

// refetch places whenever the search (incl. filters) changes, but NOT on a
// pagination/sort-only change (those use the 'search' mode, not 'search_aggregate')
on('search', ({mode}) => {
    if (mode === 'search_aggregate') {
        fetchPlaces(filterState.value, extendedPlaceInfo.value)
    }
})

const activePlace = computed(() => {
    if (activePlaceId.value) {
        return findPlaceById(activePlaceId.value)
    } else {
        return null
    }
})

const getPreferentialDate = (datations) => {
    return datations.find((datation) => datation.preference == 0)
}

const formatDatationTime = (datation) => {
    if (!datation?.time) {
        return ''
    }
    return [datation.time.day, datation.time.month, datation.time.year].filter((x) => x).join('/')
}

const onMarkerClick = (feature: any) => {
    activePlaceId.value = feature.properties.id
}

const onUpdateRoleFilter = (roleId: number) => {
    actorRoleFilter.value = roleId
    activePlaceId.value = null
}
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
