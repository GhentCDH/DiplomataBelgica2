<template>
    <div>
        <aside class="col-sm-3">
            <div class="bg-tertiary padding-default">
                <div
                        v-if="showReset"
                        class="form-group"
                >
                    <button
                            class="btn btn-block"
                            @click="resetAllFilters"
                    >
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
        <article class="col-sm-9 search-page">
            <h1 v-if="title" class="mbottom-default">{{ title }}</h1>
            <v-server-table
                    ref="resultTable"
                    :columns="tableColumns"
                    :options="tableOptions"
                    :url="urls['charter_search_api']"
                    @data="onData"
                    @loaded="onLoaded"
            >
                <template slot="afterFilter">
                    <b v-if="countRecords">{{ countRecords }}</b>
                </template>
                <template slot="id" slot-scope="props">
                    <a :href="urls['charter_get_single'].replace('charter_id', props.row.id)">
                        {{ props.row.id }}
                    </a>
                </template>
                <template slot="summary" slot-scope="props">
                    {{ props.row.summary }}
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
import VueFormGenerator from 'vue-form-generator'

import AbstractField from '../components/FormFields/AbstractField'
import AbstractSearch from '../components/Search/AbstractSearch'
import CollapsibleGroups from '../components/Search/CollapsibleGroups'
import PersistentConfig from "../components/Shared/PersistentConfig"


export default {
    mixins: [
        PersistentConfig('CharterSearchConfig'),
        AbstractField,
        AbstractSearch,
        CollapsibleGroups
    ],
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
                            this.createMultiSelect('Role', { model: 'actor_role' }),
                            this.createMultiSelect('Function', { model: 'actor_capacity' }),
                            this.createMultiSelect('Institution/jurisdiction', { model: 'actor_place_name' }),
                            this.createMultiSelect('Diocese', { model: 'actor_place_diocese' }),
                            this.createMultiSelect('Principality', { model: 'actor_place_principality' }),
                        ]
                    },
                    {
                        styleClasses: 'collapsible collapsed',
                        legend: 'Datation',
                        fields: [
                            {
                                type: 'DMYRange',
                                model: 'dating_scholary',
                                label: 'Scholary dating'
                            },
                            {
                                type: 'checkbox',
                                model: 'dating_scholary_preferential',
                                label: 'preferential dates only'
                            },
                            {
                                type: 'DMYRange',
                                model: 'dating_charter',
                                label: 'Date in the charter'
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
                                label: 'Search in summary (in French only)'
                            },
                            {
                                type: 'input',
                                inputType: 'text',
                                model: 'fulltext',
                                label: 'Search in full text of charter'
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
                submitType: 'charter',
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
            let columns = ['id', 'summary']
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
    },
}
</script>