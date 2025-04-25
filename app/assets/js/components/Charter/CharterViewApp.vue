<template>
    <div class="row d-flex flex-direction-row flex-nowrap align-items-stretch">
        <article class="d-flex col-sm-8 overflow-hidden">
            <div class="scrollable scrollable--vertical pe-2 pbottom-large w-100">

                <h1 class="pbottom-default">DiBe ID {{ charter.id }}</h1>

                <h2>Summary and description</h2>
                <div class="mbottom-default">{{ charter.summary }}</div>

                <div class="mbottom-default">
                  <LabelValue label="Language" :value="charter.language" type="id_name" :url="urlGeneratorIdName('charter_search', 'charter_language')" grid="4|8"></LabelValue>
                  <LabelValue label="Authenticity" :value="charter.authenticity" type="id_name" grid="4|8"></LabelValue>
                  <LabelValue label="Textual tradition" :value="charter.text_subtype" type="id_name" grid="4|8"></LabelValue>
                  <LabelValue label="Nature of the charter" :value="charter.nature" type="id_name" grid="4|8"></LabelValue>
                </div>

                <template v-if="charter.full_text">
                    <h2>Full text of charter</h2>
                    <div class="col-10 pbottom-small">
                        <p class="charter-full-text">
                            {{ charter.full_text }}
                        </p>
                    </div>
                    <div v-if="charter.edition" class="mbottom-default">
                        <LabelValue label="Source" :value="formatSource(charter.edition)"  grid="4|8"></LabelValue>
                    </div>
                </template>

                <h2>Editions and secondary literature</h2>

                <div v-if="editionsFormatted.length" class="mbottom-small">
                    <h3>Editions</h3>

                    <ul class="_list-unstyled" >
                        <li v-for="edition in editionsFormatted" :key="edition.id">
                            {{ edition.text }}
                            <InlineLinkList :linklist="edition.links"></InlineLinkList>
                        </li>
                    </ul>
                </div>

                <div v-if="secondaryLiteratureFormatted.length" class="mbottom-small">
                    <h3>Secondary literature</h3>

                    <ul class="_list-unstyled">
                        <li v-for="edition in secondaryLiteratureFormatted" :key="edition.id">
                            {{ edition.text }}
                            <InlineLinkList :linklist="edition.links"></InlineLinkList>
                        </li>
                    </ul>
                </div>

                <h2>Tradition</h2>

                <div class="mbottom-small">
                    <LabelValue class="mbottom-default" label="Original" :value="isOriginal" grid="4|8"></LabelValue>

                    <div class="ptop-small" v-for="original in originals" :key="original.id">
                        <a target="_blank" v-if="original.link" :href="original.link">{{ original.text }}</a>
                        <p v-else>{{ original.text }}</p>
                    </div>
                </div>

                <div v-if="copies.length" class="mbottom-small">
                    <h3>Copies</h3>
                    <ul>
                        <li v-for="copy in copies" :key="copy.id">
                            <a target="_blank" v-if="copy.link" :href="copy.link">{{ copy.text }}</a>
                            <p v-else>{{ copy.text }}</p>
                        </li>
                    </ul>
                </div>

                <div v-if="codexes.length" class="mbottom-small">
                    <h3>Manuscripts</h3>
                    <ul>
                        <li v-for="codex in codexes" :key="codex.id">
                            <a target="_blank" v-if="codex.link" :href="codex.link">{{ codex.text }}</a>
                            <p v-else>{{ codex.text }}</p>
                        </li>
                    </ul>
                </div>
                <h2 v-if="charter.has_images" > Images </h2>
                <div v-if="(charter.image_count>0)" >
                  <ImageThumbnail :thumbnail-urls="getImageUrl(charter.images)" />
                </div>
                <div v-if="charter.imageUrls.length" >
                  <ul>
                    <li v-for="image in charter.imageUrls" :key="image.codex_id">
                      <a target="_blank" v-if="image.url" :href="image.url">{{ image.url }}</a>
                    </li>
                  </ul>
                </div>

                <h2>Map</h2>

                <div id="map" class="map">
                    <actor-map :geojson="geojson" @marker-over="onMarkerOver" @marker-out="onMarkerOut">
                        <template #popup>
                            <div class="popup">
                                <div v-if="popupActor?.role?.name"><b>{{ popupActor?.role?.name }}</b></div>
                                <ActorDetailsFlat :actor="popupActor"/>
                            </div>
                        </template>
                    </actor-map>
                </div>

            </div>
        </article>
        <aside class="d-flex col-sm-4 overflow-hidden">
            <div class="padding-default bg-tertiary scrollable scrollable--vertical w-100 border-top-dibe">

                <Widget v-if="validContextAndResultSet()" title="Search" :collapsed="false">
                    <div class="row mbottom-default">
                        <div class="form-group">
                            <span class="btn btn-sm btn-primary" @click="returnToSearchResult">&lt; Return to list</span>
                        </div>
                        <div class="col col-3" :class="{ disabled: searchContext.searchIndex === 1}">
                            <span class="btn btn-sm btn-primary" @click="loadCharterByIndex(1)">
                                <i class="fa-solid fa-angles-left"></i>
                            </span>
                            <span class="btn btn-sm btn-primary" @click="loadCharterByIndex(searchContext.searchIndex - 1)">
                                <i class="fa-solid fa-angle-left"></i>
                            </span>
                        </div>

                        <div class="col col-6 text-center"><span>Result {{ searchContext.searchIndex }} of {{ searchContext.count }}</span></div>
                        <div class="col col-3 text-right" :class="{ disabled: searchContext.searchIndex === searchContext.count}">
                          
                            <span class="btn btn-sm btn-primary" @click="loadCharterByIndex(searchContext.searchIndex + 1)">
                                <i class="fa-solid fa-angle-right"></i>
                            </span>
                            <span class="btn btn-sm btn-primary" @click="loadCharterByIndex( searchContext.count)">
                                <i class="fa-solid fa-angles-right"></i>
                            </span>
                        </div>
                    </div>
                </Widget>

                <Widget title="Actors" v-model:collapsed="config.widgets.actors.isOpen">
                    <actor-list-detailed label="Issuer <small>(author)</small>"
                                         label-plural="Issuers <small>(authors)</small>" :actors="issuers"
                                         :url-generator="urlGeneratorIssuer"></actor-list-detailed>
                    <actor-list-detailed label="Author of the actio juridica <small>(disposer)</small>"
                                         label-plural="Authors of the actio juridica <small>(disposers)</small>"
                                         :actors="authors" :url-generator="urlGeneratorAuthors"></actor-list-detailed>
                    <actor-list-detailed label="Beneficiary <small>(recipient)</small>"
                                         label-plural="Beneficiaries <small>(recipients)</small>"
                                         :actors="beneficiaries"
                                         :url-generator="urlGeneratorBeneficiaries"></actor-list-detailed>
                </Widget>

                <Widget title="Date" v-model:collapsed="config.widgets.date.isOpen">
                  <LabelValue label="Scholarly dating (preferential)" :value="formatDatations(preferentialDates)" :inline="false"></LabelValue>
                  <LabelValue label="Scholarly dating (any)" :value="formatDatations(charter.datations)" :inline="false"></LabelValue>
                  <LabelValue v-if="charter.udt" label="Date in the charter" :value="getDates(charter.udt)"  :inline="false"></LabelValue>
                  <LabelValue label="Place-date (in the text)" :value="charter.place_found_name"  :inline="false"></LabelValue>
                  <LabelValue v-if="charter.place" label="Place-date (normalised)" :value="getNormalisedPlace(charter.place)" :url="'/map?lat=' + charter.place.latitude + '&long=' + charter.place.longitude"  :inline="false"></LabelValue>
                </Widget>

            </div>
        </aside>
        <div
                v-if="openRequests"
                class="loading-overlay"
        >
            <div class="spinner"/>
        </div>
    </div>
</template>

<script setup lang="ts">

import {type Context, useSearchContext} from "@/composables/useSearchContext";
import { ref, computed, toValue } from 'vue'

import Widget from '../Sidebar/Widget.vue'
import LabelValue from '../Sidebar/LabelValue.vue'
import PropertyGroup from '../Sidebar/PropertyGroup.vue'
import InlineLinkList from '../InlineLinkList.vue'
import FormatValue from '../Sidebar/FormatValue.vue'
import ImageThumbnail from '../ImageThumbnail.vue'
import ActorDetails from '../Actor/ActorDetails.vue'
import ActorListDetailed from '../Actor/ActorListDetailed.vue'
import ActorMap from '@/components/Actor/ActorMap.vue'
import ActorDetailsFlat from '@/components/Actor/ActorDetailsFlat.vue'
import PersistentConfig from '../../mixins/PersistentConfig'
import * as qs from "qs";

const props = defineProps({
    initUrls: {
        type: String,
        required: true
    },
    initData: {
        type: String,
        required: true
    }
})

const urls = JSON.parse(props.initUrls)
const data = ref(JSON.parse(props.initData))

console.log(data.value)

const defaultConfig = {
    widgets: {
        actors: { collapsed: false },
        date: { collapsed: false }
    }
}

const openRequests = ref(false)
const popupActorId = ref<number | null>(null)

const charter = computed(() => data.value.charter)

const issuers = computed(() => charter.value.actors.filter(actor => actor.role.id === 2))
const authors = computed(() => charter.value.actors.filter(actor => actor.role.id === 1))
const beneficiaries = computed(() => charter.value.actors.filter(actor => [3, 4].includes(actor.role.id)))

const preferentialDates = computed(() => charter.value.datations.filter(datation => datation.preference === 0))

const isOriginal = computed(() => {
    if (!charter.value.originals) return 'No'
    for (const original of charter.value.originals) {
        if (original.charter_id === charter.value.id) return 'Yes'
    }
    return 'No'
})

const originals = computed(() => charter.value.originals.map(formatOriginal).filter(Boolean))
const codexes = computed(() => charter.value.codexes.map(c => formatCodex(c, 'manuscript')).filter(Boolean))
const copies = computed(() => charter.value.copies.map(c => formatCodex(c, 'copy')).filter(Boolean))
const editionsFormatted = computed(() => charter.value.edition_indications.map(formatEdition).filter(Boolean))
const secondaryLiteratureFormatted = computed(() => charter.value.secondary_literature_indications.map(formatSecondaryLiterature).filter(Boolean))

const geojson = computed(() => {
    const features: any[] = []
    for (const actor of charter.value.actors) {
        if (actor?.place?.latitude) {
            features.push({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [parseFloat(actor.place.longitude), parseFloat(actor.place.latitude)]
                },
                properties: {
                    actorId: actor.id,
                    roleId: actor.role.id,
                    roleLabel: { 1: 'A', 2: 'I', 3: 'B' }[actor.role.id]
                }
            })
        }
    }
    return { type: 'FeatureCollection', features }
})

const popupActor = computed(() => popupActorId.value ? charter.value.actors.find(actor => actor.id === popupActorId.value) : null)

function getUrl(route: string) {
    return urls[route] ?? ''
}

function urlGeneratorIssuer(url, filter, filter_defaults = {}) {
    return (value) => ( getUrl(url) + '?' + qs.stringify( { filters: { actor_role_1: 2, [filter]: value.id } } ) )
}
function urlGeneratorAuthors(url, filter, filter_defaults = {}) {
    return (value) => ( getUrl(url) + '?' + qs.stringify( { filters: { actor_role_1: 1, [filter]: value.id } } ) )
}
function urlGeneratorBeneficiaries(url, filter, filter_defaults = {}) {
    return (value) => ( getUrl(url) + '?' + qs.stringify( { filters: { actor_role_1: 3, [filter]: value.id } } ) )
}
function urlGeneratorIdName(url: string, filter: string, defaults = {}) {
    return (value: any) => `${getUrl(url)}?${qs.stringify({ filters: { ...defaults, [filter]: value.id } })}`
}

function formatSource(edition: any) {
    var res: any[] = [];
    if(edition.names_editors) {
        res.push(edition.names_editors);
    }
    if(edition.date_of_edition_year) {
        res.push(edition.date_of_edition_year);
    }
    if(res.length > 0) {
        return res.join(', ');
    } else {
        return null;
    }
}

function formatDate(date: any) {
    let res = date.year ?? ''
    if (date.month) res = `${date.month}/${res}`
    if (date.day) res = `${date.day}/${res}`
    return res
}

function formatDatations(datations: any[]) {
    return datations.map(datation => {
        let res = formatDate(datation.time)
        if (datation.time.interpretation) {
            res += ` (${datation.time.interpretation}${datation.researcher ? ' - ' + datation.researcher : ''})`
        }
        return res
    })
}

function getDates(dates: any[]) {
    return dates.map(formatDate)
}

function getNormalisedPlace(place: any) {
    let res = place.name ?? ''
    const localisation: any[] = []
    if (place.localisation?.land) localisation.push(place.localisation.land.name)
    if (place.localisation?.echelon_1) localisation.push(place.localisation.echelon_1)
    if (place.localisation?.echelon_2) localisation.push(place.localisation.echelon_2)
    if (localisation.length) res += (res ? ' ' : '') + `(${localisation.join(', ')})`
    return res
}

function formatOriginal(original: any) {
    const parts: any[] = []
    if (original.repository?.location) parts.push(original.repository.location)
    if (original.repository?.name) parts.push(original.repository.name)
    if (original.repository_reference_number) parts.push(original.repository_reference_number)
    const text = parts.join(', ')
    return text ? (original.id ? { text, link: `/tradition/original/${original.id}` } : { text }) : null
}

function formatCodex(codex: any, type: string) {
    const parts: any[] = []
    if (codex.repository?.location) parts.push(codex.repository.location)
    if (codex.repository?.name) parts.push(codex.repository.name)
    if (codex.repository_reference_number) parts.push(codex.repository_reference_number)
    let line = parts.join(', ')
    if (codex.redaction_date) line += (line ? ' ' : '') + `(${codex.redaction_date})`
    return line ? (codex.id ? { text: line, link: `/tradition/${type}/${codex.id}` } : { text: line }) : null
}

function formatEdition(edition: any) {
    const parts: any[] = [], links: any[] = []
    if (edition.edition?.names_editors) parts.push(edition.edition.names_editors)
    if (edition.edition?.full_title) parts.push(edition.edition.full_title)
    if (edition.bookpart) parts.push(edition.bookpart)
    if (edition.nr) parts.push(edition.nr)
    if (edition.pages) parts.push(edition.pages)
    if (edition.edition?.urls) links.push(...edition.edition.urls.map((u: any) => u.url).filter(Boolean))
    if (edition.urls) links.push(...edition.urls.map((u: any) => u.url).filter(Boolean))
    return parts.length ? { text: parts.join(', '), links } : null
}

function formatSecondaryLiterature(edition: any) {
    const parts: any[] = [], links: any[] = []
    if (edition.secondary_literature?.names_editors) parts.push(edition.secondary_literature.names_editors)
    if (edition.secondary_literature?.full_title) parts.push(edition.secondary_literature.full_title)
    if (edition.bookpart) parts.push(edition.bookpart)
    if (edition.nr) parts.push(edition.nr)
    if (edition.pages) parts.push(edition.pages)
    if (edition.secondary_literature?.urls) links.push(...edition.secondary_literature.urls.map((u: any) => u.url).filter(Boolean))
    if (edition.urls) links.push(...edition.urls.map((u: any) => u.url).filter(Boolean))
    return parts.length ? { text: parts.join(', '), links } : null
}

function removeExtension(filename: string) {
    return filename.substring(0, filename.lastIndexOf('.')) || filename
}

function filenameCheck(filename: string) {
    return removeExtension(filename).replace('/', ':').replace('[^\d:-]', '')
}

function formatImageUrl(url: string) {
    const prefix = 'https://iiif.ghentcdh.ugent.be/iiif/images/dibe:'
    const suffix = '/full/256,/0/default.jpg'
    return prefix + filenameCheck(removeExtension(url)) + suffix
}

function getImageUrl(values: any[]) {
    return values.map(item => formatImageUrl(item.image_file))
}

function updateTitle(id: number) {
    document.title = 'Diplomata Belgica - Charter ID ' + id
}

function onMarkerOver(feature: any) {
    popupActorId.value = feature.properties.actorId
}

function onMarkerOut() {
    popupActorId.value = null
}

//Context
const {
    context: searchContext,
    initContextFromUrl,
    initResultSet,
    loadByIndex,
    returnToSearchResult,
    validContextAndResultSet,
} = useSearchContext();

function loadCharterByIndex(index: number) {
    loadByIndex(index, data)
}

initContextFromUrl();
if (searchContext.value.validReadContext && !searchContext.value.ids){
    let readContext: Context = toValue(searchContext);
    initResultSet(readContext, (new URL(readContext.prevUrl)).pathname + "/paginate"); //TODO how to fix url in composition API?
}
</script>

<script lang="ts">
export default {
    name: "CharterViewApp",
    mixins: [
        PersistentConfig('CharterViewConfig'),
    ],
}
</script>


<style scoped lang="scss">
#charter-view-app {
  aside {
    .widget {
      border-bottom: 1px solid #e9ecef;
    }
  }
}
</style>