<template>
    <div class="row pbottom-large">
        <aside class="col-sm-4">
            <div class="bg-tertiary padding-default">
                <vue-form-generator
                        ref="form"
                        :model="model"
                        :options="formOptions"
                        :schema="schema"
                        @validated="onValidated"
                        @model-updated="modelUpdated"
                />

                <div v-if="showReset" class="form-group ptop-default">
                    <button class="btn btn-primary"  @click="resetAllFilters" >
                        Reset all filters
                    </button>
                </div>
            </div>
        </aside>
        
        <article class="col-sm-8 search-page">
            <h1 v-if="title" class="mbottom-default">{{ title }}</h1>
            <v-server-table
                    ref="resultTable"
                    :columns="tableColumns"
                    :options="tableOptions"
                    :url="urls['tradition_search_api']"
                    @data="onData"
                    @loaded="onLoaded"
            >
                <template #afterFilter>
                    <b v-if="countRecords">{{ countRecords }}</b>
                </template>
                <template #type="props">
                    {{ props.row.type }}
                </template>
                <template #summary="props">
                    <div>
                        <a :href="getTraditionUrl(props.row.id, props.row.type)">
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
            </v-server-table>
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
import PersistentConfig from "../components/Shared/PersistentConfig"
import SharedSearch from "../components/Search/SharedSearch";

import FormatValue from "../components/Sidebar/FormatValue";

import fieldCheckbox from '../components/FormFields/fieldCheckbox';
import fieldCheckboxes from '../components/FormFields/fieldCheckboxes'


Vue.component('fieldCheckboxBS5', fieldCheckbox);
Vue.component('fieldCheckboxes', fieldCheckboxes)

export default {
    mixins: [
        PersistentConfig('TraditionSearchConfig'),
        AbstractField,
        AbstractSearch,
        SharedSearch,
        CollapsibleGroups
    ],
    components: {
        FormatValue
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
                        legend: 'Repository',
                        fields: [
                            this.createMultiSelect('Place',
                                {
                                    model: 'repository_location'
                                }
                            ),
                            this.createMultiSelect('Name',
                                {
                                    model: 'repository_name'
                                }
                            ),
                            this.createMultiSelect('Reference',
                                {
                                    model: 'repository_reference_number'
                                }
                            )
                        ]
                    },
                    {
                        styleClasses: 'collapsible collapsed',
                        legend: 'Tradition',
                        fields: [
                            this.createMultiSelect('Type',
                                {
                                    model: 'tradition_type'
                                }
                            ),
                            this.createMultiSelect('Stein Number',
                                {
                                    model: 'codex_stein_number'
                                }
                            ),
                            this.createMultiSelect('Title of the manuscript',
                                {
                                    model: 'codex_title'
                                }
                            ),
                            this.createMultiSelect('Institutions covered by the manuscript',
                                {
                                    model: 'codex_institutions'
                                }
                            ),
                            this.createMultiSelect('Writing material',
                                {
                                    model: 'codex_material'
                                }
                            )
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
                headings: {
                },
                columnsClasses: {
                    name: 'no-wrap',
                },
                'filterable': false,
                'orderBy': {
                    'column': 'id'
                },
                'perPage': 25,
                'perPageValues': [25, 50, 100],
                'sortable': ['id'],
                customFilters: ['filters'],
                requestFunction: AbstractSearch.requestFunction,
                rowClassCallback: function (row) {
                    return '';
                    // return (row.public == null || row.public) ? '' : 'warning'
                },
            },
            submitModel: {
                submitType: 'tradition',
                person: {},
            },
            defaultOrdering: 'id',
        }

        // Add view internal only fields
        if (this.isViewInternal) {
        }

        return data
    },
    computed: {
        tableColumns() {
            let columns = ['type', 'summary']
            return columns
        },
    },
    watch: {},
    methods: {
        update() {
            // Don't create a new history item
            this.noHistory = true;
            this.$refs.resultTable.refresh();
        },
        getTraditionUrl(id, tradition_type, index) {
            let context = {
                params: this.data.filters,
                searchIndex: (this.data.search.page - 1) * this.data.search.limit + index, // rely on data or params?
                searchSessionHash: this.getSearchSessionHash()
            }
            return this.urls['tradition_get_single'].replace('tradition_id', id).replace('tradition_type', tradition_type) + '#' + this.getContextHash(context)
        },
    },
}
</script>