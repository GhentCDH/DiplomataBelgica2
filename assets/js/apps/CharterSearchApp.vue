<template>
    <div class="row search-app">
        <aside class="col-sm-3 search-app__filters scrollable scrollable--vertical">
            <div class="bg-tertiary padding-default">
                <div v-if="showReset" class="form-group ptop-default">
                    <button class="btn btn-primary"  @click="resetAllFilters" >
                        Reset all filters
                    </button>
                </div>
                <vue-form-generator
                        ref="form"
                        :model="model"
                        :options="formOptions"
                        :schema="schema"
                        @validated="onValidated"
                        @model-updated="modelUpdated"
                />
            </div>
        </aside>
        
        <article class="col-sm-9 search-app__results">
            <header>
                <h1 v-if="title" class="mbottom-default">{{ title }}</h1>

                <nav class="mbottom-default">
                    <div class="nav nav-pills" id="nav-tab" role="tablist">
                        <button class="nav-link active" id="nav-results-tab" data-bs-toggle="tab" data-bs-target="#nav-results" type="button" role="tab" aria-controls="nav-results" aria-selected="true" @click="updateMapVisibility(false)"><i class="fa-solid fa-bars" ></i> Browse results</button>
                        <button class="nav-link" id="nav-map-tab" data-bs-toggle="tab" data-bs-target="#nav-map" type="button" role="tab" aria-controls="nav-map" aria-selected="false" @click="updateMapVisibility(true)"><i class="fa-solid fa-map-location-dot"></i> Browse map</button>
                    </div>
                </nav>
            </header>
            <section>
                <div class="tab-content w-100" id="nav-tabContent">
                    <div class="tab-pane show active" id="nav-results" role="tabpanel" aria-labelledby="nav-results-tab">
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
                                        <vt-per-page-selector class="d-flex align-items-md-center"></vt-per-page-selector>
                                    </div>
                                </div>
                            </template>
                            <template #afterFilter>
                                <b v-if="countRecords">{{ countRecords }}</b>
                            </template>
                            <template #id="props">
                                <a :href="getCharterUrl(props.row.id, props.index)">
                                    {{ props.row.id }}
                                </a>
                            </template>
                            <template #summary="props">
                                <charter-search-summary :charter="props.row"></charter-search-summary>
                            </template>
                            <template #date="props">
                                <a v-if="props.row.udt.length">
                                    {{ getDate(props.row.udt) }}
                                </a>
                            </template>
                        </v-server-table>
                    </div>
                    <div class="tab-pane" id="nav-map" role="tabpanel" aria-labelledby="nav-map-tab">
                        <LeafletMap :markers="markers" :layers="layers" :center="[47.413220, -1.219482]" v-if="mapVisible"></LeafletMap>
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
    props: {
    },
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
                                model: 'actor1',
                                styleClasses: 'actor actor-1'
                            },
                            this.createMultiSelect(
                                'Name',
                                { model: 'actor_name_full_name_1', styleClasses: 'actor actor-1' },
                                { 'onSearch': this.onSearch('actor_name_full_name_1') }
                            ),
                            this.createMultiSelect('Role', { model: 'actor_role_1', styleClasses: 'actor actor-1' }),
                            this.createMultiSelect('Function', { model: 'actor_capacity_1', styleClasses: 'actor actor-1' }),
                            this.createMultiSelect('Institution/jurisdiction', { model: 'actor_place_name_1', styleClasses: 'actor actor-1' }),
                            this.createMultiSelect('Diocese', { model: 'actor_place_diocese_name_1', styleClasses: 'actor actor-1' }),
                            this.createMultiSelect('Principality', { model: 'actor_place_principality_name_1', styleClasses: 'actor actor-1' }),
                            this.createMultiSelect('Religious Order', { model: 'actor_order_name_1', styleClasses: 'actor actor-1' }),

                            {
                                type: 'label',
                                label: 'Actor 2',
                                model: 'actor2',
                                styleClasses: 'actor actor-2'
                            },
                            this.createMultiSelect(
                                'Name',
                                { model: 'actor_name_full_name_2', styleClasses: 'actor actor-2' },
                                { 'onSearch': this.onSearch('actor_name_full_name_2') }
                            ),
                            this.createMultiSelect('Role', { model: 'actor_role_2', styleClasses: 'actor actor-2' }),
                            this.createMultiSelect('Function', { model: 'actor_capacity_2', styleClasses: 'actor actor-2' }),
                            this.createMultiSelect('Institution/jurisdiction', { model: 'actor_place_name_2', styleClasses: 'actor actor-2' }),
                            this.createMultiSelect('Diocese', { model: 'actor_place_diocese_name_2', styleClasses: 'actor actor-2' }),
                            this.createMultiSelect('Principality', { model: 'actor_place_principality_name_2', styleClasses: 'actor actor-2' }),
                            this.createMultiSelect('Religious Order', { model: 'actor_order_name_2', styleClasses: 'actor actor-2' }),

                            {
                                type: 'label',
                                label: 'Actor 3',
                                model: 'actor3',
                                styleClasses: 'actor actor-3'
                            },
                            this.createMultiSelect(
                                'Name',
                                { model: 'actor_name_full_name_3', styleClasses: 'actor actor-3' },
                                { 'onSearch': this.onSearch('actor_name_full_name_3') }
                            ),
                            this.createMultiSelect('Role', { model: 'actor_role_3', styleClasses: 'actor actor-3' }),
                            this.createMultiSelect('Function', { model: 'actor_capacity_3', styleClasses: 'actor actor-3' }),
                            this.createMultiSelect('Institution/jurisdiction', { model: 'actor_place_name_3', styleClasses: 'actor actor-3' }),
                            this.createMultiSelect('Diocese', { model: 'actor_place_diocese_name_3', styleClasses: 'actor actor-3' }),
                            this.createMultiSelect('Principality', { model: 'actor_place_principality_name_3', styleClasses: 'actor actor-3' }),
                            this.createMultiSelect('Religious Order', { model: 'actor_order_name_3', styleClasses: 'actor actor-3' }),

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
                                labelClasses: 'd-none'
                            },
                            {
                                type: 'DMYRange',
                                model: 'dating_charter',
                                label: 'Date in the charter',
                                labelClasses: 'form-label'
                            },
                            this.createMultiSelect('Place-date', { model: 'charter_place_name' }),
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
                                label: 'Has images',
                                type: 'checkbox',
                                model: 'has_images',
                            },
                        ]
                    },
                ],
            },
            tableOptions: {
                filterByColumn: false,
                filterable: false,
                headings: {
                },
                columnsClasses: {
                    name: 'no-wrap',
                },
                orderBy: {
                    'column': 'id'
                },
                perPage: 25,
                perPageValues: [25, 50, 100],
                sortable: ['id', 'date'],
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
            },
            submitModel: {
                submitType: 'charter',
                person: {},
            },
            defaultOrdering: 'id',
            mapVisible: null
        }

        // Add view internal only fields
        if (this.isViewInternal) {
        }

        return data
    },
    computed: {
        tableColumns() {
            let columns = ['id', 'summary', 'date']
            return columns
        },
        markers() {
            let places = this.aggregation?.charter_place_name ?? []
            let markers = places.filter( (place) => ( place.latitude ?? false ) ).map(function(place){
                return {
                    latLng: [ parseFloat(place.latitude), parseFloat(place.longitude)],
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
        getDate(udt){
            if (udt.length > 1){
                var year = []
                for(let date of udt) {
                    year.push(date.year);
                }
                year.sort();
                if (year[0]==year[1]){
                    var display = year[0].toString();
                }else{
                    var display = year[0].toString().concat(" - ", year[1]);
                }
            } else {
                var display = udt[0].year.toString();
            }
            return display
        },
        onSearch(field) {
            const that = this
            return function(query) {
                let data = {
                    field: field,
                    value: query,
                    filters: that.constructFilterValues(),
                }
                axios.get(that.urls['charter_aggregation_suggest'], {
                    params: data,
                    paramsSerializer: qs.stringify,
                })
                .then( (response) => {
                    that.updateAggregations(response.data, [ field ], true)
                    return response
                } )
            }
        }
    },
}
</script>