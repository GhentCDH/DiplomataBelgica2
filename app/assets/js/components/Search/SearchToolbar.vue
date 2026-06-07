<template>
    <nav class="row form-group">
        <div class="col-lg-4 d-flex align-items-lg-center">
            <b-pagination
                :total-records="totalRecords"
                :per-page="tableState.rowsPerPage"
                :page="tableState.currentPage"
                @update:page="(page) => emit('change', { currentPage: parseInt(page) })"
            ></b-pagination>
        </div>
        <div class="col-lg-4 d-flex align-items-lg-center justify-content-lg-center">
            <record-count
                :per-page="tableState.rowsPerPage"
                :total-records="totalRecords"
                :page="tableState.currentPage"
            ></record-count>
        </div>
        <div class="col-lg-4 d-flex align-items-lg-center justify-content-lg-end">
            <b-select id="per-page"
                      :label="perPageLabel"
                      :selected="tableState.rowsPerPage"
                      :options="perPageValues.map((value) => ({ value, text: value }))"
                      @update:selected="(value) => emit('change', { rowsPerPage: parseInt(value) })"
                      class="w-auto"
            ></b-select>
        </div>
    </nav>
</template>

<script setup lang="ts">
import BPagination from "@/components/Bootstrap/BPagination.vue";
import BSelect from "@/components/Bootstrap/BSelect.vue";
import RecordCount from "@/components/Bootstrap/RecordCount.vue";
import type {TableState} from "@/composables/useTableState";

withDefaults(defineProps<{
    tableState: TableState;
    totalRecords: number;
    perPageValues: number[];
    perPageLabel?: string;
}>(), {
    perPageLabel: 'Per page',
});

const emit = defineEmits<{
    // a pagination/per-page change as a TableState patch (wire to updateTableState)
    (e: 'change', patch: Partial<TableState>): void;
}>();
</script>
