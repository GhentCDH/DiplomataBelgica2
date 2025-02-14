<template>
    <div class="row search-app">
        <aside class="col-sm-3 search-app__filters h-100 position-relative">
            <div class="bg-tertiary padding-default mh-100 border-top-dibe scrollable scrollable--vertical">
                <div v-if="showReset" class="form-group mbottom-default">
                    <button class="btn btn-primary" @click="resetAllFilters">
                        Reset all filters
                    </button>
                </div>
                <VueFormGenerator
                    ref="form"
                    :model="model"
                    :options="form.options"
                    :schema="formSchema"
                    @validated="onFormValidated"
                    @model-updated="onModelUpdated"
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
                                aria-selected="true"><i
                            class="fa-solid fa-bars"></i> Browse results
                        </button>
                        <button class="nav-link" id="nav-map-tab" data-bs-toggle="tab" data-bs-target="#nav-map"
                                type="button" role="tab" aria-controls="nav-map" aria-selected="false"
                                @click="setMapVisible()"><i class="fa-solid fa-map-location-dot"></i> Browse
                            map
                        </button>
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
                                        :per-page="searchParams.limit"
                                        :page="searchParams.page"
                                        @update:page="onTablePagination"
                                    ></b-pagination>
                                </div>
                                <div class="col-lg-4 d-flex align-items-lg-center justify-content-lg-center">
                                    <RecordCount :per-page="searchParams.limit" :total-records="totalRecords"
                                                 :page="searchParams.page"></RecordCount>
                                </div>
                                <div class="col-lg-4 d-flex align-items-lg-center justify-content-lg-end">
                                    <b-select :id="'per-page'"
                                              :label="'Per page'"
                                              :selected="searchParams.page"
                                              :options="tableOptions.pagination.perPageValues.map(value => ({value, text: value}))"
                                              @update:selected="onTableLimit"
                                              class="w-auto"
                                    ></b-select>
                                </div>
                            </nav>

                            <div class="d-flex flex-grow-1 scrollable">
                                <b-table :items="tableData"
                                         :fields="tableOptions.fields"
                                         :sort-by="searchParams.orderBy"
                                         :sort-ascending="searchParams.ascending"
                                         @sort="onTableSort"
                                         class="m-0"
                                >
                                    <template #id="props">
                                        <a class="btn btn-tertiary btn-sm" target="_blank" :href="getCharterUrl(props.row.id, props.index)">
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
                        <LeafletMap ref="leafletMap" v-if="mapVisible" :markers="markers" :layers="layers" :center="[47.413220, -1.219482]" class="w-100 h-100"></LeafletMap>
                    </div>
                </div>
            </section>
        </article>
        <div
            v-if="searchClient.openRequests"
            class="loading-overlay"
        >
            <div class="spinner"/>
        </div>
    </div>
</template>
<script>
import FormGeneratorFieldCreators from '../../mixins/FormGeneratorFieldCreators'
import SearchClient from '../../mixins/SearchClient'
import FormGeneratorCollapsibleGroups from '../../mixins/FormGeneratorCollapsibleGroups'

import CharterSearchSummary from "./CharterSearchSummary.vue";

import PersistentConfig from "../../mixins/PersistentConfig"
import SharedSearch from "../../mixins/SharedSearch";

import LeafletMap from "../LeafletMap.vue"

import FormatValue from "../Sidebar/FormatValue.vue";

import qs from "qs";

import BPagination from "../Bootstrap/BPagination.vue";
import BSelect from "../Bootstrap/BSelect.vue";
import RecordCount from "../Bootstrap/RecordCount.vue";
import BTable from "../Bootstrap/BTable.vue";

export default {
    mixins: [
        PersistentConfig('CharterSearchConfig'),
        FormGeneratorFieldCreators,
        FormGeneratorCollapsibleGroups,
        SearchClient,
        SharedSearch,
    ],
    components: {
        RecordCount,
        CharterSearchSummary,
        FormatValue, LeafletMap,
        BPagination,
        BSelect, BTable,
    },
    props: {},
    data() {
        return {
            model: {
                dating_scholary_preferential: true,
            },
            schema: {
                groups: [
                    {
                        styleClasses: 'collapsible',
                        legend: this.$t('filter.legend.identification'),
                        fields: [
                            {
                                type: 'input',
                                inputType: 'text',
                                label: this.$t('filter.field.charter_id.label'),
                                help: this.$t('filter.field.charter_id.help'),
                                labelClasses: 'form-label',
                                placeholder: 'Charter ID',
                                model: 'id',
                                validateDebounceTime: 1000,
                            },
                            this.formGeneratorCreateMultiSelect('Language',
                                {
                                    model: 'charter_language',
                                    label: this.$t('filter.field.language.label'),
                                    help: this.$t('filter.field.language.help'),
                                }
                            )
                        ]
                    },
                    {
                        styleClasses: 'collapsible collapsed',
                        legend: this.$t('filter.legend.actors'),
                        fields: [
                            {
                                type: 'label',
                                label: this.$t('filter.field.actor.label', {index: 1}),
                                model: 'actor_1',
                                styleClasses: 'actor actor-1'
                            },
                            this.formGeneratorCreateMultiSelect(
                                this.$t('filter.field.actor_name.label'),
                                {
                                    model: 'actor_name_full_name_1',
                                    styleClasses: 'actor actor-1',
                                    help: this.$t('filter.field.actor_name.help'),
                                },
                                {onSearch: this.onAutocomplete('actor_name_full_name_1'), internalSearch: false}
                            ),
                            this.formGeneratorCreateMultiSelect(this.$t('filter.field.actor_role.label'), {
                                model: 'actor_role_1',
                                styleClasses: 'actor actor-1',
                                help: this.$t('filter.field.actor_role.help'),
                            }),
                            this.formGeneratorCreateMultiSelect(this.$t('filter.field.actor_function.label'), {
                                model: 'actor_capacity_1',
                                styleClasses: 'actor actor-1',
                                help: this.$t('filter.field.actor_function.help'),
                            }),
                            this.formGeneratorCreateMultiSelect(this.$t('filter.field.actor_institution.label'), {
                                model: 'actor_place_name_1',
                                styleClasses: 'actor actor-1',
                                help: this.$t('filter.field.actor_institution.help'),
                            }),
                            this.formGeneratorCreateMultiSelect(this.$t('filter.field.actor_diocese.label'), {
                                model: 'actor_place_diocese_name_1',
                                styleClasses: 'actor actor-1',
                                help: this.$t('filter.field.actor_diocese.help'),
                            }),
                            this.formGeneratorCreateMultiSelect(this.$t('filter.field.actor_principality.label'), {
                                model: 'actor_place_principality_name_1',
                                styleClasses: 'actor actor-1',
                                help: this.$t('filter.field.actor_principality.help'),
                            }),
                            this.formGeneratorCreateMultiSelect(this.$t('filter.field.actor_order.label'), {
                                model: 'actor_order_name_1',
                                styleClasses: 'actor actor-1 !mbottom-default',
                                help: this.$t('filter.field.actor_order.help'),
                            }),

                            {
                                type: 'label',
                                label: this.$t('filter.field.actor.label', {index: 2}),
                                model: 'actor_2',
                                styleClasses: 'actor actor-2',
                                visible: this.actorFieldIsVisible
                            },
                            this.formGeneratorCreateMultiSelect(
                                this.$t('filter.field.actor_name.label'),
                                {
                                    model: 'actor_name_full_name_2',
                                    styleClasses: 'actor actor-2',
                                    visible: this.actorFieldIsVisible,
                                    help: this.$t('filter.field.actor_name.help'),
                                },
                                {onSearch: this.onAutocomplete('actor_name_full_name_2'), internalSearch: false}
                            ),
                            this.formGeneratorCreateMultiSelect(this.$t('filter.field.actor_role.label'), {
                                model: 'actor_role_2', styleClasses: 'actor actor-2', visible: this.actorFieldIsVisible,
                                help: this.$t('filter.field.actor_role.help'),
                            }),
                            this.formGeneratorCreateMultiSelect(this.$t('filter.field.actor_function.label'), {
                                model: 'actor_capacity_2',
                                styleClasses: 'actor actor-2', visible: this.actorFieldIsVisible,
                                help: this.$t('filter.field.actor_function.help'),
                            }),
                            this.formGeneratorCreateMultiSelect(this.$t('filter.field.actor_institution.label'), {
                                model: 'actor_place_name_2',
                                styleClasses: 'actor actor-2', visible: this.actorFieldIsVisible,
                                help: this.$t('filter.field.actor_institution.help'),
                            }),
                            this.formGeneratorCreateMultiSelect(this.$t('filter.field.actor_diocese.label'), {
                                model: 'actor_place_diocese_name_2',
                                styleClasses: 'actor actor-2', visible: this.actorFieldIsVisible,
                                help: this.$t('filter.field.actor_diocese.help'),
                            }),
                            this.formGeneratorCreateMultiSelect(this.$t('filter.field.actor_principality.label'), {
                                model: 'actor_place_principality_name_2',
                                styleClasses: 'actor actor-2', visible: this.actorFieldIsVisible,
                                help: this.$t('filter.field.actor_principality.help'),
                            }),
                            this.formGeneratorCreateMultiSelect(this.$t('filter.field.actor_order.label'), {
                                model: 'actor_order_name_2',
                                styleClasses: 'actor actor-2 !mbottom-default', visible: this.actorFieldIsVisible,
                                help: this.$t('filter.field.actor_order.help'),
                            }),

                            {
                                type: 'label',
                                label: this.$t('filter.field.actor.label', {index: 3}),
                                model: 'actor_3',
                                styleClasses: 'actor actor-3',
                                visible: this.actorFieldIsVisible
                            },
                            this.formGeneratorCreateMultiSelect(
                                this.$t('filter.field.actor_name.label'),
                                {
                                    model: 'actor_name_full_name_3',
                                    styleClasses: 'actor actor-3',
                                    visible: this.actorFieldIsVisible,
                                    label: this.$t('filter.field.actor_name.label'),
                                    help: this.$t('filter.field.actor_name.help'),
                                },
                                {onSearch: this.onAutocomplete('actor_name_full_name_3'), internalSearch: false}
                            ),
                            this.formGeneratorCreateMultiSelect(this.$t('filter.field.actor_role.label'), {
                                model: 'actor_role_3', styleClasses: 'actor actor-3', visible: this.actorFieldIsVisible,
                                label: this.$t('filter.field.actor_role.label'),
                                help: this.$t('filter.field.actor_role.help'),
                            }),
                            this.formGeneratorCreateMultiSelect(this.$t('filter.field.actor_function.label'), {
                                model: 'actor_capacity_3',
                                styleClasses: 'actor actor-3', visible: this.actorFieldIsVisible,
                                label: this.$t('filter.field.actor_function.label'),
                                help: this.$t('filter.field.actor_function.help'),
                            }),
                            this.formGeneratorCreateMultiSelect(this.$t('filter.field.actor_institution.label'), {
                                model: 'actor_place_name_3',
                                styleClasses: 'actor actor-3', visible: this.actorFieldIsVisible,
                                label: this.$t('filter.field.actor_institution.label'),
                                help: this.$t('filter.field.actor_institution.help'),
                            }),
                            this.formGeneratorCreateMultiSelect(this.$t('filter.field.actor_diocese.label'), {
                                model: 'actor_place_diocese_name_3',
                                styleClasses: 'actor actor-3', visible: this.actorFieldIsVisible,
                                label: this.$t('filter.field.actor_diocese.label'),
                                help: this.$t('filter.field.actor_diocese.help'),
                            }),
                            this.formGeneratorCreateMultiSelect(this.$t('filter.field.actor_principality.label'), {
                                model: 'actor_place_principality_name_3',
                                styleClasses: 'actor actor-3', visible: this.actorFieldIsVisible,
                                label: this.$t('filter.field.actor_principality.label'),
                                help: this.$t('filter.field.actor_principality.help'),
                            }),
                            this.formGeneratorCreateMultiSelect(this.$t('filter.field.actor_order.label'), {
                                model: 'actor_order_name_3',
                                styleClasses: 'actor actor-3 !mbottom-default', visible: this.actorFieldIsVisible,
                                label: this.$t('filter.field.actor_order.label'),
                                help: this.$t('filter.field.actor_order.help'),
                            }),

                        ]
                    },
                    {
                        styleClasses: 'collapsible collapsed',
                        legend: this.$t('filter.legend.datation'),
                        fields: [
                            {
                                type: 'DMYRange',
                                model: 'dating_scholary',
                                label: this.$t('filter.field.date_scholarly_any.label'),
                                help: this.$t('filter.field.date_scholarly_any.help'),

                                labelClasses: 'form-label',
                                validateDebounceTime: 1000,
                            },
                            {
                                type: 'checkboxBS5',
                                model: 'dating_scholary_preferential',
                                label: this.$t('filter.field.date_scholarly_preferential.label'),
                                help: this.$t('filter.field.date_scholarly_preferential.help'),

                                labelClasses: 'd-none',
                                default: true,
                            },
                            {
                                type: 'DMYRange',
                                model: 'dating_charter',
                                label: this.$t('filter.field.date_unconverted.label'),
                                help: this.$t('filter.field.date_unconverted.help'),
                                labelClasses: 'form-label',
                                validateDebounceTime: 1000,
                            },
                            this.formGeneratorCreateMultiSelect(this.$t('filter.field.place_date.label'), {
                                model: 'charter_place_name',
                                help: this.$t('filter.field.place_date.help'),
                            }),
                        ]
                    },
                    {
                        styleClasses: 'collapsible collapsed',
                        legend: this.$t('filter.legend.analysis'),
                        fields: [
                            {
                                type: 'input',
                                inputType: 'text',
                                model: 'summary',
                                label: this.$t('filter.field.summary.label'),
                                help: this.$t('filter.field.summary.help'),
                                placeholder: 'Search in summary',
                                labelClasses: 'form-label',
                                validateDebounceTime: 1000,
                            },
                            {
                                type: 'input',
                                inputType: 'text',
                                model: 'fulltext',
                                label: this.$t('filter.field.fulltext.label'),
                                help: this.$t('filter.field.fulltext.help'),
                                placeholder: 'Search in charter',
                                labelClasses: 'form-label',
                                validateDebounceTime: 1000,
                            },
                        ]
                    },
                    {
                        styleClasses: 'collapsible collapsed',
                        legend: this.$t('filter.legend.images'),
                        fields: [
                            {
                                label: this.$t('filter.field.images.label'),
                                help: this.$t('filter.field.images.help'),
                                type: 'checkboxBS5',
                                model: 'has_images',
                                labelClasses: 'd-none',
                            },
                        ]
                    },
                ],
            },
            tableOptions: {
                fields: [
                    {key: 'id', label: 'Id', sortable: true, thClass: 'no-wrap'},
                    {key: 'summary', label: 'Summary'},
                    {key: 'date_sort', label: 'Date', sortable: true, thClass: 'no-wrap'},
                ],
                orderBy: {
                    column: 'date_sort',
                    ascending: false,
                },
                pagination: {
                    chunk: 5,
                    perPage: 25,
                    page: 1,
                    perPageValues: [25, 50, 100],
                },
            },
            mapVisible: null
        }
    },
    computed: {
        formSchema() {
            const schema = this.schema
            this.formGeneratorCollapseGroups(schema)
            return schema
        },
        requestUrl() {
            return this.urls['charter_search_api']
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
        setMapVisible() {
            this.mapVisible = true;
            window.dispatchEvent(new Event('resize'));
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
            const actorFields = [...getActorFields(actorIndex), ...(actorIndex > 1 ? getActorFields(actorIndex - 1) : [])]
            let res = actorFields.filter((key) => model?.[key] && model?.[key]?.length > 0)
            return res.length > 0
        },
    },
}
</script>