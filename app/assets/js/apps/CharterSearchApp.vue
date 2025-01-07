<template>
    <div class="row search-app">
        <aside class="col-sm-3 search-app__filters scrollable scrollable--vertical scrollable--mr">
            <div class="bg-tertiary padding-default">
                <div v-if="showReset" class="form-group ptop-default">
                    <button class="btn btn-primary" @click="resetAllFilters">
                        Reset all filters
                    </button>
                </div>
                <vue-form-generator
                    ref="form"
                    :model="model"
                    :options="formOptions"
                    :schema="schema"
                    @validated="onFormValidated"
                    @model-updated="onModelUpdated"
                />
            </div>
        </aside>

        <article class="col-sm-9 search-app__results">
            <header>
                <h1 v-if="title" class="mbottom-default">{{ title }}</h1>

                <nav class="mbottom-default">
                    <div class="nav nav-pills" id="nav-tab" role="tablist">
                        <button class="nav-link active" id="nav-results-tab" data-bs-toggle="tab"
                                data-bs-target="#nav-results" type="button" role="tab" aria-controls="nav-results"
                                aria-selected="true" @click="updateMapVisibility(false)"><i
                            class="fa-solid fa-bars"></i> Browse results
                        </button>
                        <button class="nav-link" id="nav-map-tab" data-bs-toggle="tab" data-bs-target="#nav-map"
                                type="button" role="tab" aria-controls="nav-map" aria-selected="false"
                                @click="updateMapVisibility(true)"><i class="fa-solid fa-map-location-dot"></i> Browse
                            map
                        </button>
                    </div>
                </nav>
            </header>
            <section>
                <div class="tab-content w-100" id="nav-tabContent">
                    <div class="tab-pane show active" id="nav-results" role="tabpanel"
                         aria-labelledby="nav-results-tab">
                        <v-server-table
                            ref="resultTable"
                            :columns="tableColumns"
                            :options="tableOptions"
                            :url="urls['charter_search_api']"
                            @data="onData"
                            @loaded="onLoaded"
                        >
                            <template v-slot:beforeTable>
                                <div class="VueTables__beforeTable row form-group">
                                    <div class="VueTables__pagination col-lg-4">
                                        <vt-pagination></vt-pagination>
                                    </div>
                                    <div class="VueTables__count col-lg-4 d-flex align-items-lg-center">
                                        <vt-pagination-count></vt-pagination-count>
                                    </div>
                                    <div class="VueTables__limit col-lg-4 d-flex justify-content-lg-end">
                                        <vt-per-page-selector
                                            class="d-flex align-items-md-center"></vt-per-page-selector>
                                    </div>
                                </div>
                            </template>
                            <template #afterFilter>
                                <b v-if="countRecords">{{ countRecords }}</b>
                            </template>
                            <template #id="props">
                                <a target="_blank" :href="getCharterUrl(props.row.id, props.index)">
                                    {{ props.row.id }}
                                </a>
                            </template>
                            <template #summary="props">
                                <charter-search-summary :charter="props.row"></charter-search-summary>
                            </template>
                            <template #date_sort="props">
                                {{ formatDatationTime(getPreferentialDate(props.row.datations)) }}
                            </template>
                        </v-server-table>
                    </div>
                    <div class="tab-pane" id="nav-map" role="tabpanel" aria-labelledby="nav-map-tab">
                        <LeafletMap :markers="markers" :layers="layers" :center="[47.413220, -1.219482]"
                                    v-if="mapVisible"></LeafletMap>
                    </div>
                </div>
            </section>
        </article>
        <div
            v-if="openRequests"
            class="loading-overlay"
        >
            <div class="spinner"/>
        </div>
    </div>
</template>
<script>
import Vue from 'vue'

import AbstractField from '../components/FormFields/AbstractField'
import AbstractSearch from '../components/Search/AbstractSearch'
import CollapsibleGroups from '../components/Search/CollapsibleGroups'

import CharterSearchSummary from "../components/Charter/CharterSearchSummary.vue";

import PersistentConfig from "../components/Shared/PersistentConfig"
import SharedSearch from "../components/Search/SharedSearch";
import LeafletMap from "../components/LeafletMap"

import FormatValue from "../components/Sidebar/FormatValue";

import fieldDMYRange from '../components/FormFields/fieldDMYRange';
import fieldCheckbox from '../components/FormFields/fieldCheckbox';

import VtPerPageSelector from "vue-tables-2-premium/compiled/components/VtPerPageSelector";
import VtPagination from "vue-tables-2-premium/compiled/components/VtPagination";
import VtPaginationCount from "vue-tables-2-premium/compiled/components/VtPaginationCount";
import qs from "qs";

Vue.component('fieldDMYRange', fieldDMYRange);
Vue.component('fieldCheckboxBS5', fieldCheckbox);

export default {
    mixins: [
        PersistentConfig('CharterSearchConfig'),
        AbstractField,
        AbstractSearch,
        SharedSearch,
        CollapsibleGroups,
    ],
    components: {
        CharterSearchSummary,
        FormatValue, LeafletMap,
        VtPerPageSelector,
        VtPagination,
        VtPaginationCount
    },
    props: {},
    data() {
        let data = {
            model: {
                date_search_type: 'exact',
            },
            persons: null,
            schema: {
                groups: [
                    {
                        styleClasses: 'collapsible collapsed',
                        legend: 'Identification',
                        fields: [
                            {
                                type: 'input',
                                inputType: 'text',
                                label: 'Charter ID',
                                labelClasses: 'form-label',
                                placeholder: 'Charter ID',
                                model: 'id',
                            },
                            this.createMultiSelect('Language',
                                {
                                    model: 'charter_language'
                                }
                            )
                        ]
                    },
                    {
                        styleClasses: 'collapsible collapsed',
                        legend: 'Actor(s)',
                        fields: [
                            {
                                type: 'label',
                                label: 'Actor 1',
                                model: 'actor_1',
                                styleClasses: 'actor actor-1'
                            },
                            this.createMultiSelect(
                                'Name',
                                {model: 'actor_name_full_name_1', styleClasses: 'actor actor-1'},
                                {onSearch: this.onAutocomplete('actor_name_full_name_1'), internalSearch: false}
                            ),
                            this.createMultiSelect('Role', {model: 'actor_role_1', styleClasses: 'actor actor-1'}),
                            this.createMultiSelect('Function', {
                                model: 'actor_capacity_1',
                                styleClasses: 'actor actor-1'
                            }),
                            this.createMultiSelect('Institution/jurisdiction', {
                                model: 'actor_place_name_1',
                                styleClasses: 'actor actor-1'
                            }),
                            this.createMultiSelect('Diocese', {
                                model: 'actor_place_diocese_name_1',
                                styleClasses: 'actor actor-1'
                            }),
                            this.createMultiSelect('Principality', {
                                model: 'actor_place_principality_name_1',
                                styleClasses: 'actor actor-1'
                            }),
                            this.createMultiSelect('Religious Order', {
                                model: 'actor_order_name_1',
                                styleClasses: 'actor actor-1 !mbottom-default'
                            }),

                            {
                                type: 'label',
                                label: 'Actor 2',
                                model: 'actor_2',
                                styleClasses: 'actor actor-2',
                                visible: this.actorFieldIsVisible,
                            },
                            this.createMultiSelect(
                                'Name',
                                {model: 'actor_name_full_name_2', styleClasses: 'actor actor-2', visible: this.actorFieldIsVisible},
                                {onSearch: this.onAutocomplete('actor_name_full_name_2'), internalSearch: false}
                            ),
                            this.createMultiSelect('Role', {model: 'actor_role_2', styleClasses: 'actor actor-2', visible: this.actorFieldIsVisible}),
                            this.createMultiSelect('Function', {
                                model: 'actor_capacity_2',
                                styleClasses: 'actor actor-2', visible: this.actorFieldIsVisible
                            }),
                            this.createMultiSelect('Institution/jurisdiction', {
                                model: 'actor_place_name_2',
                                styleClasses: 'actor actor-2', visible: this.actorFieldIsVisible
                            }),
                            this.createMultiSelect('Diocese', {
                                model: 'actor_place_diocese_name_2',
                                styleClasses: 'actor actor-2', visible: this.actorFieldIsVisible
                            }),
                            this.createMultiSelect('Principality', {
                                model: 'actor_place_principality_name_2',
                                styleClasses: 'actor actor-2', visible: this.actorFieldIsVisible
                            }),
                            this.createMultiSelect('Religious Order', {
                                model: 'actor_order_name_2',
                                styleClasses: 'actor actor-2 !mbottom-default', visible: this.actorFieldIsVisible
                            }),

                            {
                                type: 'label',
                                label: 'Actor 3',
                                model: 'actor_3',
                                styleClasses: 'actor actor-3',
                                visible: this.actorFieldIsVisible
                            },
                            this.createMultiSelect(
                                'Name',
                                {model: 'actor_name_full_name_3', styleClasses: 'actor actor-3', visible: this.actorFieldIsVisible},
                                {onSearch: this.onAutocomplete('actor_name_full_name_3'), internalSearch: false}
                            ),
                            this.createMultiSelect('Role', {model: 'actor_role_3', styleClasses: 'actor actor-3', visible: this.actorFieldIsVisible}),
                            this.createMultiSelect('Function', {
                                model: 'actor_capacity_3',
                                styleClasses: 'actor actor-3', visible: this.actorFieldIsVisible
                            }),
                            this.createMultiSelect('Institution/jurisdiction', {
                                model: 'actor_place_name_3',
                                styleClasses: 'actor actor-3', visible: this.actorFieldIsVisible
                            }),
                            this.createMultiSelect('Diocese', {
                                model: 'actor_place_diocese_name_3',
                                styleClasses: 'actor actor-3', visible: this.actorFieldIsVisible
                            }),
                            this.createMultiSelect('Principality', {
                                model: 'actor_place_principality_name_3',
                                styleClasses: 'actor actor-3', visible: this.actorFieldIsVisible
                            }),
                            this.createMultiSelect('Religious Order', {
                                model: 'actor_order_name_3',
                                styleClasses: 'actor actor-3 !mbottom-default', visible: this.actorFieldIsVisible
                            }),

                        ]
                    },
                    {
                        styleClasses: 'collapsible collapsed',
                        legend: 'Datation',
                        fields: [
                            {
                                type: 'DMYRange',
                                model: 'dating_scholary',
                                label: 'Scholary dating',
                                labelClasses: 'form-label'
                            },
                            {
                                type: 'checkboxBS5',
                                model: 'dating_scholary_preferential',
                                label: 'Preferential dates only',
                                labelClasses: 'd-none',
                                default: true,
                            },
                            {
                                type: 'DMYRange',
                                model: 'dating_charter',
                                label: 'Date in the charter',
                                labelClasses: 'form-label'
                            },
                            this.createMultiSelect('Place-date', {model: 'charter_place_name'}),
                        ]
                    },
                    {
                        styleClasses: 'collapsible collapsed',
                        legend: 'Analysis',
                        fields: [
                            {
                                type: 'input',
                                inputType: 'text',
                                model: 'summary',
                                label: 'Search in summary (in French only)',
                                placeholder: 'Search in summary',
                                labelClasses: 'form-label'
                            },
                            {
                                type: 'input',
                                inputType: 'text',
                                model: 'fulltext',
                                label: 'Search in full text of charter',
                                placeholder: 'Search in charter',
                                labelClasses: 'form-label'
                            },
                        ]
                    },
                    {
                        styleClasses: 'collapsible collapsed',
                        legend: 'Images',
                        fields: [
                            {
                                label: 'Images available',
                                type: 'checkboxBS5',
                                model: 'has_images',
                                labelClasses: 'd-none',
                            },
                        ]
                    },
                ],
            },
            tableOptions: {
                filterByColumn: false,
                filterable: false,
                headings: {
                    id: 'Id',
                    summary: 'Summary',
                    date_sort: 'Date',
                },
                columnsClasses: {
                    id: 'no-wrap ',
                    date: 'no-wrap ',
                },
                orderBy: {
                    'column': 'date_preferential'
                },
                addSortedClassToCells: true,
                perPage: 25,
                perPageValues: [25, 50, 100],
                sortable: ['id', 'date_sort'],
                customFilters: ['filters'],
                requestFunction: AbstractSearch.requestFunction,
                rowClassCallback: function (row) {
                    return '';
                    // return (row.public == null || row.public) ? '' : 'warning'
                },
                pagination: {
                    show: false,
                    chunk: 5
                },
                sortIcon: {base: 'fa-solid', up: 'fa-chevron-up', down: 'fa-chevron-down', is: 'fa-sort'}
            },
            submitModel: {
                submitType: 'charter',
                person: {},
            },
            defaultOrdering: 'date_sort',
            mapVisible: null
        }

        // Add view internal only fields
        if (this.isViewInternal) {
        }

        return data
    },
    computed: {
        tableColumns() {
            let columns = ['id', 'summary', 'date_sort']
            return columns
        },
        markers() {
            let places = this.aggregation?.charter_place_name ?? []
            let markers = places.filter((place) => (place.latitude ?? false)).map(function (place) {
                return {
                    latLng: [parseFloat(place.latitude), parseFloat(place.longitude)],
                    name: place.name + ' (' + place.count + ')',
                    id: place.id
                }
            });
            return markers
        },
        layers() {
            return [
                {
                    id: 'google-satellite',
                    type: 'tileLayer',
                    options: {
                        // url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
                        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                        attribution: 'Open Streetmap',
                        maxZoom: 18,
                        name: 'Open Streetmap',
                        visible: true,
                        opacity: 1,
                        layerType: 'base',
                        zIndex: 10,
                    }
                },
            ]
        }
    },
    watch: {},
    methods: {
        update() {
            // Don't create a new history item
            this.noHistory = true;
            this.$refs.resultTable.refresh();
        },
        updateMapVisibility(value) {
            this.mapVisible = value;
        },

        getCharterUrl(id, index) {
            let context = {
                params: this.data.filters,
                searchIndex: (this.data.search.page - 1) * this.data.search.limit + index, // rely on data or params?
                searchSessionHash: this.getSearchSessionHash()
            }
            return this.urls['charter_get_single'].replace('charter_id', id) + '#' + this.getContextHash(context)
        },
        getPreferentialDate(datations) {
            return datations.find((datation) => datation.preference == 0)
        },
        formatDatationTime(datation) {
            if (!datation?.time) {
                return ''
            }
            return [datation.time.day, datation.time.month, datation.time.year].filter((x) => x).join('/')
        },
        onAutocomplete(field) {
            const that = this
            return function (query) {
                let data = {
                    field: field,
                    value: query,
                    filters: that.constructFilterValues(),
                }
                axios.get(that.urls['charter_aggregation_suggest'], {
                    params: data,
                    paramsSerializer: qs.stringify,
                })
                    .then((response) => {
                        const fieldConfig = that?.fields?.[field]
                        fieldConfig.values = response.data?.[field] ?? []
                        return response
                    })
            }
        },
        actorFieldIsVisible(model, field) {

            function getActorFields(index) {
                return [
                    'actor_name_full_name_' + index,
                    'actor_role_' + index,
                    'actor_capacity_' + index,
                    'actor_place_name_' + index,
                    'actor_place_diocese_name_' + index,
                    'actor_place_principality_name_' + index,
                    'actor_order_name_' + index,
                ]
            }

            const modelKey = field.model
            const actorIndex = modelKey.split('_').pop()
            const actorFields = [ ...getActorFields(actorIndex), ...(actorIndex > 1 ? getActorFields(actorIndex - 1) : []) ]
            let res = actorFields.filter((key) => model?.[key] && model?.[key]?.length > 0)
            return res.length > 0
        },
    },
}
</script>