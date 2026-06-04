<template>
    <b-table
        :items="items"
        :fields="fields"
        :sort-by="sortBy"
        :sort-ascending="sortAscending"
        @update:sort-by="(value) => emit('update:sortBy', value)"
        @update:sort-ascending="(value) => emit('update:sortAscending', value)"
    >
        <!-- selection column: derived from selectedIds, identical in every search page -->
        <template v-if="selectable" #actionsPreRowHeader>
            <th>
                <input
                    type="checkbox"
                    :checked="allSelected"
                    @change="onToggleAll"
                >
            </th>
        </template>
        <template v-if="selectable" #actionsPreRow="props">
            <td>
                <input
                    type="checkbox"
                    :checked="isSelected(props.row)"
                    @change="() => onToggleRow(props.row)"
                >
            </td>
        </template>

        <!-- forward every per-cell slot (named by field key) to the consumer -->
        <template v-for="(_, name) in $slots" #[name]="slotProps">
            <slot :name="name" v-bind="slotProps ?? {}"/>
        </template>
    </b-table>
</template>

<script setup lang="ts">
import {computed} from "vue";
import BTable from "@/components/Bootstrap/BTable.vue";

const props = withDefaults(defineProps<{
    fields: any[];
    /** Raw result rows (no `selected` flag needed). */
    items: any[];
    sortBy?: string;
    sortAscending?: boolean;
    /** Ids of the currently selected rows. */
    selectedIds?: (number | string)[];
    /** Name of the identifier property on each row. */
    idKey?: string;
    /** Render the selection checkbox column. */
    selectable?: boolean;
}>(), {
    selectedIds: () => [],
    idKey: 'id',
    selectable: true,
});

const emit = defineEmits<{
    (e: 'update:sortBy', value: string): void;
    (e: 'update:sortAscending', value: boolean): void;
    (e: 'add-selected', ids: (number | string)[]): void;
    (e: 'remove-selected', ids: (number | string)[]): void;
}>();

const selectedSet = computed(() => new Set(props.selectedIds));

const isSelected = (row: any) => selectedSet.value.has(row[props.idKey]);

const pageIds = computed(() => props.items.map((row) => row[props.idKey]));

const allSelected = computed(() =>
    props.items.length > 0 && props.items.every(isSelected)
);

const onToggleRow = (row: any) => {
    emit(isSelected(row) ? 'remove-selected' : 'add-selected', [row[props.idKey]]);
};

const onToggleAll = () => {
    emit(allSelected.value ? 'remove-selected' : 'add-selected', pageIds.value);
};
</script>
