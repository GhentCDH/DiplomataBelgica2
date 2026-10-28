<template>
    <table class="table table-sm tradition-charters">
        <thead>
            <tr>
                <th class="no-wrap">{{ t('label.charterId') }}</th>
                <th class="no-wrap">{{ t('label.date') }}</th>
                <th>{{ t('label.summary') }}</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="charter in charters" :key="charter.id">
                <td>
                    <a class="btn btn-tertiary btn-sm" :href="createCharterUrl(charter.id)" target="_blank">{{ charter.id }}</a>
                </td>
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
import {useI18n} from "vue-i18n";

import CharterSearchSummary from "@/components/Charter/CharterSearchSummary.vue";
import {formatDatations} from "@/components/Charter/Formatters.ts";

defineProps<{
    charters: any[],
    createCharterUrl: (id: number) => string,
}>()

const {t} = useI18n()

const preferentialDates = (charter: any): string[] =>
    formatDatations((charter.datations ?? []).filter((datation: any) => datation.preference === 0))
</script>
