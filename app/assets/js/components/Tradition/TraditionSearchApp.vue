<template>
    <div class="row search-app">
        <aside class="col-sm-3 search-app__filters h-100 position-relative">
            <div class="bg-tertiary padding-default mh-100 border-top-dibe scrollable scrollable--vertical">
                <div v-if="modelHasChanged" class="form-group mbottom-default">
                    <b-filter-tags :items="getActiveFilterTagStrings()" @onClickClose="onCloseActiveFilter">
                        <template #startButton>
                            <button class="btn btn-primary" @click="resetAllFilters">
                                {{ t('form.reset-filters') }}
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
                <nav class="mbottom-default">
                    <div class="nav nav-pills" id="nav-tab" role="tablist">
                        <selected-items-basket
                            :selected-ids="selectedIds"
                            :get-hashed-url="getHashedUrl"
                            :set-selected-ids="setSelectedIds"
                            :remove-selected-index="removeSelectedIndex"
                            :save-selection-context="saveSelectionContext"
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

                <article class="flex-grow-1 scrollable">
                    <search-result-table
                        :items="tableData"
                        :fields="tableOptions.fields"
                        :sort-by="dataTableState.orderBy"
                        :sort-ascending="dataTableState.orderAsc"
                        :selected-ids="selectedIds"
                        @update:sort-by="(value) => updateDataTableState({orderBy: value})"
                        @update:sort-ascending="(value) => updateDataTableState({orderAsc: value})"
                        @add-selected="addSelectedIds"
                        @remove-selected="removeSelectedIds"
                        class="m-0"
                    >
                        <template #type="props">
                            {{ props.row.type }}
                        </template>
                        <template #summary="props">
                            <div>
                                <a target="_blank" :href="getHashedUrl(props.row.id)"
                                   @mouseup="(event) => saveResultContext(event, props.row.id, props.index)"
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
                    </search-result-table>
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

<script setup lang="ts">
import {useI18n} from "vue-i18n";

import BSelect from "@/components/Bootstrap/BSelect.vue";
import RecordCount from "@/components/Bootstrap/RecordCount.vue";
import BPagination from "../Bootstrap/BPagination.vue";
import BFilterTags from "@/components/Bootstrap/BFilterTags.vue";
import SelectedItemsBasket from "@/components/SearchContext/SelectedItemsBasket.vue";
import SearchResultTable from "@/components/Search/SearchResultTable.vue";

import {useSearchApp} from "@/composables/useSearchApp.ts";
import {useUrlGenerator} from "@/composables/useUrlGenerator.ts";
import traditionRepository from "@/repositories/TraditionRepository.ts";
import {createTraditionsSchema} from "@/components/Tradition/TraditionSearchAppForm.ts";

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

const {title} = props;
const urls = JSON.parse(props.initUrls)

const {getRoute} = useUrlGenerator(urls)

const tableOptions = {
    fields: [
        // {key: 'id', label: 'Id', sortable: true, thClass: 'no-wrap'},
        {key: 'type', label: 'Type', sortable: true, thClass: 'no-wrap'},
        {key: 'summary', label: 'Summary'},
    ],
    pagination: {
        chunk: 5,
        perPage: 25,
        page: 1,
        perPageValues: [25, 50, 100],
    }
}

const {
    // template-facing state & handlers
    model,
    schema,
    formOptions,
    modelHasChanged,
    getActiveFilterTagStrings,
    onCloseActiveFilter,
    resetAllFilters,
    onFormValidated,
    dataTableState,
    totalRecords,
    tableData,
    updateDataTableState,
    isFetching,
    // selection / basket
    selectedIds,
    setSelectedIds,
    removeSelectedIndex,
    addSelectedIds,
    removeSelectedIds,
    // search context
    getHashedUrl,
    saveResultContext,
    saveSelectionContext,
} = useSearchApp({
    searchApiUrl: getRoute('tradition_search_api'),
    detailBaseUrl: '/en/tradition/original/',
    defaultModel: {},
    defaultDataTableState: {
        orderBy: 'id',
        orderAsc: true,
        rowsPerPage: 25,
        currentPage: 1,
    },
    collapsibleGroupsStorageId: 'tradition-search-groups',
    buildSchema: ({updateFieldValues, filterState}) => {
        const onAutocomplete = (fieldName: string) => {
            return (query: string) => {
                traditionRepository.autocomplete(fieldName, query, filterState)
                    .then((response) => {
                        updateFieldValues(response.data, [fieldName])
                    })
            }
        }
        return createTraditionsSchema({t, onAutocomplete})
    },
})
</script>
