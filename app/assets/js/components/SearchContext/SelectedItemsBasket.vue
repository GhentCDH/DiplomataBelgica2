<template>
    <b-dropdown class="active ms-auto">
        <template #display>
            {{ t(message ?? 'selectedItemsBasket.message', { count: selectedIds.length }) }}
        </template>

        <li class="dropdown-header">
            <button class="btn" @click="() => {setSelectedIds([])}"> {{ t('selectedItemsBasket.unselectAll') }}</button>
        </li>
        <li v-if="selectedIds.length" class="dropdown-header">
            <b-link class="btn" target="_blank"
               :href="getContextualDetailUrl(selectedIds[0])"
               @navigate="() => { if (selectedIds.length) saveSelectionContext(selectedIds[0]); }"
            >
                View Charters
            </b-link>
        </li>
        <li v-for="(id, index) in selectedIds" :key="id"
            class="dropdown-item d-flex justify-content-evenly align-items-center">
            <b-link class="btn btn-tertiary btn-sm" target="_blank"
               :href="getContextualDetailUrl(id)"
               @navigate="saveSelectionContext(id)"
            >
                {{id}}
            </b-link>
            <button class="btn-close btn-sm" @click="removeSelectedIndex(index)"></button>
        </li>
    </b-dropdown>
</template>

<script setup lang="ts">
import BDropdown from "@/components/Bootstrap/BDropdown.vue";
import BLink from "@/components/Bootstrap/BLink.vue";
import {useI18n} from "vue-i18n";

const { t } = useI18n() // use as global scope

const props = defineProps<{
    selectedIds: number[];
    getContextualDetailUrl: (id: number) => string;
    setSelectedIds: (ids: number[]) => void;
    removeSelectedIndex: (index: number) => void;
    saveSelectionContext: (id: number) => void;
    message: string;
}>();
</script>

<i18n>
{
    "en": {
        "selectedItemsBasket": {
            "message": "No item selected | {count} item selected | {count} items selected",
            "unselectAll": "Unselect all"
        }
    },
    "fr": {
        "selectedItemsBasket": {
            "message": "Aucun élément sélectionné | {count} élément sélectionné | {count} éléments sélectionnés",
            "unselectAll": "Tout désélectionner"
        }
    }
}
</i18n>