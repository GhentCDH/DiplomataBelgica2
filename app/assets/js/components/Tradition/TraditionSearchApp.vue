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
            </header>
            <section class="d-flex flex-column flex-grow-1 overflow-hidden">
                <header class="row form-group">
                    <div class="col-lg-4 d-flex align-items-lg-center">
                        <b-pagination
                            :total-records="totalRecords"
                            :per-page="searchParams.limit"
                            :page="searchParams.page"
                            @update:page="onTablePagination"
                        ></b-pagination>
                    </div>
                    <div class="col-lg-4 d-flex align-items-lg-center justify-content-lg-center">
                        <RecordCount :per-page="searchParams.limit" :total-records="totalRecords" :page="searchParams.page"></RecordCount>
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
                </header>

                <article class="d-flex flex-grow-1 scrollable">
                        <b-table :items="tableData"
                                 :fields="tableOptions.fields"
                                 :sort-by="searchParams.orderBy"
                                 :sort-ascending="searchParams.ascending"
                                 @sort="onTableSort"
                                 class="table table-striped table-bordered table-hover m-0"
                        >
                            <template #type="props">
                                {{ props.row.type }}
                            </template>
                            <template #summary="props">
                                <div>
                                    <a target="_blank" :href="getTraditionUrl(props.row.id, props.row.type)">
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
                v-if="openRequests"
                class="loading-overlay"
        >
            <div class="spinner"/>
        </div>
    </div>
</template>
<script>
import AbstractField from '../../mixins/FormGeneratorFieldCreators'

import AbstractSearch from '../../mixins/SearchClient'
import CollapsibleGroups from '../../mixins/FormGeneratorCollapsibleGroups'
import PersistentConfig from "../../mixins/PersistentConfig"
import SharedSearch from "../../mixins/SharedSearch";

import FormatValue from "../Sidebar/FormatValue.vue";

import BSelect from "../Bootstrap/BSelect.vue";
import BPagination from "../Bootstrap/BPagination.vue";
import RecordCount from "../Bootstrap/RecordCount.vue";
import CharterSearchSummary from "../Charter/CharterSearchSummary.vue";
import BTable from "../Bootstrap/BTable.vue";

export default {
    mixins: [
        PersistentConfig('TraditionSearchConfig'),
        AbstractField,
        AbstractSearch,
        SharedSearch,
        CollapsibleGroups
    ],
    components: {
        BTable, CharterSearchSummary,
        RecordCount, BPagination, BSelect,
        FormatValue
    },
    props: {
    },
    data() {
        return {
            model: {
            },
            schema: {
                groups: [
                    {
                        styleClasses: 'collapsible',
                        legend: 'Repository',
                        fields: [
                            this.formGeneratorCreateMultiSelect('Place',
                                {
                                    model: 'repository_location'
                                }
                            ),
                            this.formGeneratorCreateMultiSelect('Name',
                                {
                                    model: 'repository_name'
                                }
                            ),
                            this.formGeneratorCreateMultiSelect('Reference',
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
                            this.formGeneratorCreateMultiSelect('Type',
                                {
                                    model: 'tradition_type'
                                }
                            ),
                            this.formGeneratorCreateMultiSelect('Stein Number',
                                {
                                    model: 'codex_stein_number'
                                }
                            ),
                            this.formGeneratorCreateMultiSelect('Title of the manuscript',
                                {
                                    model: 'codex_title'
                                }
                            ),
                            this.formGeneratorCreateMultiSelect('Institutions covered by the manuscript',
                                {
                                    model: 'codex_institutions'
                                }
                            ),
                            this.formGeneratorCreateMultiSelect('Writing material',
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
                },
            },
        }
    },
    computed: {
        formSchema() {
            const schema = this.schema
            this.formGeneratorCollapseGroups(schema)
            return schema
        },
        requestUrl() {
            return this.urls['tradition_search_api']
        },
    },
    watch: {},
    methods: {
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