<template>
    <table class="table table-sm tradition-charters">
        <thead>
            <tr>
                <th class="no-wrap">{{ t('label.charterId') }}</th>
                <th v-if="hasFolio" class="no-wrap">{{ t('label.folio') }}</th>
                <th class="no-wrap">{{ t('label.date') }}</th>
                <th>{{ t('label.summary') }}</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="charter in charters" :key="charter.id">
                <td>
                    <a class="btn btn-tertiary btn-sm" :href="createCharterUrl(charter.id)" target="_blank">{{ charter.id }}</a>
                </td>
                <td v-if="hasFolio" class="no-wrap">{{ charter.codex_pof }}</td>
                <td class="no-wrap">
                    <div v-for="date in preferentialDates(charter)">{{ date }}</div>
                </td>
                <td>
                    <charter-search-summary :charter="charter"></charter-search-summary>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup lang="ts">
import {computed} from "vue";
import {useI18n} from "vue-i18n";

import CharterSearchSummary from "@/components/Charter/CharterSearchSummary.vue";
import {formatDatations} from "@/components/Charter/Formatters.ts";

const props = defineProps<{
    charters: any[],
    createCharterUrl: (id: number) => string,
}>()

const {t} = useI18n()

// charters of a manuscript have a folio/page
const hasFolio = computed(() => props.charters.some((charter: any) => charter.codex_pof))

const preferentialDates = (charter: any): string[] =>
    formatDatations((charter.datations ?? []).filter((datation: any) => datation.preference === 0))
</script>
