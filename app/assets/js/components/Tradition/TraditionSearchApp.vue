<template>
    <div class="row search-app">
        <aside class="col-sm-3 search-app__filters h-100 position-relative">
            <div class="bg-tertiary padding-default mh-100 border-top-dibe scrollable scrollable--vertical">
                <div v-if="hasActiveFilters" class="form-group mbottom-default">
                    <b-filter-tags :items="activeFilterTags" @onClickClose="onCloseActiveFilter">
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
                        <selected-items-basket
                            :selected-ids="selectedIds"
                            :set-selected-ids="setSelectedIds"
                            :remove-selected-index="removeSelectedIndex"
                            :get-contextual-detail-url="getContextualDetailUrl"
                            :save-selection-context="saveSelectionContext"
                        />
                    </div>
                </nav>
            </header>
            <section class="d-flex flex-column flex-grow-1 overflow-hidden">
                <search-toolbar
                    :table-state="tableState"
                    :total-records="totalRecords"
                    :per-page-values="tableOptions.pagination.perPageValues"
                    @change="updateTableState"
                ></search-toolbar>

                <article class="flex-grow-1 scrollable">
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
                        <template #type="props">
                            {{ props.row.type }}
                        </template>
                        <template #summary="props">
                            <div>
                                <b-link target="_blank" :href="getContextualDetailUrl(props.row.id, props.index)"
                                   @navigate="saveResultContext(props.row.id, props.index)"
                                >
                                    <span v-if="props.row.repository.location">{{ props.row.repository.location }}</span>
                                    <span v-if="props.row.repository.name">, {{ props.row.repository.name }}</span>
                                    <span v-if="props.row.repository_reference_number"> {{ props.row.repository_reference_number }}</span>
                                </b-link>
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

import BFilterTags from "@/components/Bootstrap/BFilterTags.vue";
import SelectedItemsBasket from "@/components/SearchContext/SelectedItemsBasket.vue";
import SearchResultTable from "@/components/Search/SearchResultTable.vue";
import SearchToolbar from "@/components/Search/SearchToolbar.vue";
import BLink from "@/components/Bootstrap/BLink.vue";

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

const {getRoute, createTraditionUrl} = useUrlGenerator(urls)

const tableOptions = {
    fields: [
        // {key: 'id', label: 'Id', sortable: true, thClass: 'no-wrap'},
        {key: 'type', label: 'Type', sortable: true, thClass: 'no-wrap'},
        {key: 'summary', label: 'Summary'},
    ],
    pagination: {
        perPageValues: [25, 50, 100],
    }
}

const {
    // template-facing state & handlers
    filterModel,
    filterSchema,
    filterOptions,
    hasActiveFilters,
    activeFilterTags,
    onCloseActiveFilter,
    resetFilters,
    onFiltersValidated,
    tableState,
    totalRecords,
    results,
    updateTableState,
    isFetching,
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
} = useSearchApp({
    searchApiUrl: getRoute('tradition_search_api'),
    detailUrl: (id) => createTraditionUrl('original', id),
    defaultFilterModel: {},
    defaultTableState: {
        orderBy: 'id',
        orderAsc: true,
        rowsPerPage: 25,
        currentPage: 1,
    },
    collapsibleGroupsStorageId: 'tradition-search-groups',
    buildFilterSchema: ({updateFieldValues, filterState}) => {
        const onAutocomplete = (fieldName: string) => {
            return (query: string) => {
                traditionRepository.autocomplete(fieldName, query, filterState.value)
                    .then((response) => {
                        updateFieldValues(response.data, [fieldName])
                    })
            }
        }
        return createTraditionsSchema({t, onAutocomplete})
    },
})
</script>
