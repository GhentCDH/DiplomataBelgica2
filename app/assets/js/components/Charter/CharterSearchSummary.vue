<template>
    <div class="charter__search-summary">
        <template v-if="issuers.length">
            <h6>{{ t('label.mainIssuer') }}</h6>
            <actor-details-flat v-for="actor in issuers"
                                :actor="actor"
                                :key="'actor:'+actor.id"
                                class="actor--issuer"
            >
                <FormatValue :value="actor.name.name" :unknown="t('label.unknown')"></FormatValue> -
                <FormatValue :value="actor.capacity" type="id_name" :unknown="t('label.unknown')"></FormatValue> -
                <FormatValue :value="actor.place" type="id_name" :unknown="t('label.unknown')"></FormatValue>
            </actor-details-flat>
        </template>
        <!-- notitiae and lost charters often have no issuer: show the disposant instead -->
        <template v-else-if="authors.length">
            <h6>{{ t('label.authorOfTheActioJuridica', 1) }}</h6>
            <actor-details-flat v-for="actor in authors"
                                :actor="actor"
                                :key="'author:'+actor.id"
                                class="actor--author"
            >
                <FormatValue :value="actor.name.name" :unknown="t('label.unknown')"></FormatValue> -
                <FormatValue :value="actor.capacity" type="id_name" :unknown="t('label.unknown')"></FormatValue> -
                <FormatValue :value="actor.place" type="id_name" :unknown="t('label.unknown')"></FormatValue>
            </actor-details-flat>
        </template>
        <template v-if="beneficiaries.length">
            <h6 class="mtop-small">{{ t('label.mainBeneficiary') }}</h6>
            <actor-details-flat v-for="actor in beneficiaries"
                                :actor="actor"
                                :key="'beneficiary:'+actor.id"
                                class="actor--beneficiary">
                <FormatValue :value="actor.name.name" :unknown="t('label.unknown')"></FormatValue> -
                <FormatValue :value="actor.capacity" type="id_name" :unknown="t('label.unknown')"></FormatValue> -
                <FormatValue :value="actor.place" type="id_name" :unknown="t('label.unknown')"></FormatValue>
            </actor-details-flat>
        </template>
        <template v-if="charter?.summary">
            <h6 class="mtop-small">{{ t('label.summary') }}</h6>
            <!-- legacy summary filter: the highlighted summary replaces the summary -->
            <div v-html="charter.summary[0]" v-if="Array.isArray(charter.summary)"></div>
            <!-- plain search: html-encoded highlight of the summary -->
            <div v-html="summaryHighlight" v-else-if="summaryHighlight"></div>
            <div v-html="charter.summary" v-else></div>
        </template>
        <SearchHighlights :highlights="charter?._highlight" :fields="highlightFields" class="mtop-small"/>
    </div>
</template>

<script setup>
import {computed, toRefs} from "vue";
import {useI18n} from "vue-i18n";

import {SearchHighlights} from "@ghentcdh/vue-search-kit";

import FormatValue from "../Sidebar/FormatValue.vue";
import ActorDetailsFlat from "../Actor/ActorDetailsFlat.vue";

const props = defineProps({
    charter: {
        type: Object,
        required: true
    },
})

const {charter} = toRefs(props)

const {t} = useI18n()

// highlights of the plain full-text search (besides the summary), in display order
const highlightFields = ['full_text', 'actor_names', 'actor_places', 'place_date'].map((key) => ({
    key: `search_text.${key}`,
    label: t(`charters.search.highlight.${key}`),
}))

const summaryHighlight = computed(() => charter.value?._highlight?.['search_text.summary']?.join(' … ') ?? null)

const issuers = computed(() => {
    if (!charter.value?.actors)
        return [];

    // todo: sort by id, really?
    return charter.value.actors
        .filter(actor => actor.role.id === 2)
        .sort((a, b) => a.id - b.id)
        .slice(0, 1)
})

const authors = computed(() => {
    if (!charter.value?.actors)
        return [];
    return charter.value.actors
        .filter(actor => actor.role.id === 1)
        .sort((a, b) => a.id - b.id)
        .slice(0, 1)
})

const beneficiaries = computed(() => {
    if (!charter.value?.actors)
        return [];
    return charter.value.actors
        .filter(actor => actor.role.id === 3 || actor.role.id === 4)
        .sort((a, b) => a.id - b.id)
        .slice(0, 1)
})
</script>

<style scoped lang="scss">
@import '../../../scss/init';

</style>