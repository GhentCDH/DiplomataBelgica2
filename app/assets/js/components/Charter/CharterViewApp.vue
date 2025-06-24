<template>
    <div class="row d-flex flex-direction-row flex-nowrap align-items-stretch" v-if="charter">
        <article class="d-flex col-sm-8 overflow-hidden">
            <div class="scrollable scrollable--vertical pe-2 pbottom-large w-100">

                <h1 class="pbottom-default">DiBe ID {{ charter.id }}</h1>

                <h2>Summary and description</h2>
                <div class="mbottom-default">{{ charter.summary }}</div>

                <div class="mbottom-default">
                    <LabelValue label="Language" :value="charter.language" type="id_name"
                                :url="urlGeneratorIdName('charter_search', 'charter_language')" grid="4|8"></LabelValue>
                    <LabelValue label="Authenticity" :value="charter.authenticity" type="id_name"
                                grid="4|8"></LabelValue>
                    <LabelValue label="Textual tradition" :value="charter.text_subtype" type="id_name"
                                grid="4|8"></LabelValue>
                    <LabelValue label="Nature of the charter" :value="charter.nature" type="id_name"
                                grid="4|8"></LabelValue>
                </div>

                <template v-if="markedText">
                    <h2>Full text of charter</h2>
                    <div class="col-10 pbottom-small">
                        <p class="charter-full-text" v-html="markedText">
                        </p>
                    </div>
                    <div v-if="charter.edition" class="mbottom-default">
                        <LabelValue label="Source" :value="formatSource(charter.edition)" grid="4|8"></LabelValue>
                    </div>
                </template>

                <h2>Editions and secondary literature</h2>

                <div v-if="editionsFormatted.length" class="mbottom-small">
                    <h3>Editions</h3>

                    <ul class="_list-unstyled">
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
                <h2 v-if="charter.has_images"> Images </h2>
                <div v-if="(charter.image_count>0)">
                    <ImageThumbnail :thumbnail-urls="getImageUrl(charter.images)"/>
                </div>
                <div v-if="charter.imageUrls.length">
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
                            <span class="btn btn-sm btn-primary"
                                  @click="returnToSearchResult">&lt; Return to list</span>
                        </div>
                        <div class="col col-3" :class="{ disabled: context.searchIndex === 1}">
                            <span class="btn btn-sm btn-primary" @click="loadCharterByIndex(1)">
                                <i class="fa-solid fa-angles-left"></i>
                            </span>
                            <span class="btn btn-sm btn-primary" @click="loadCharterByIndex(context.searchIndex - 1)">
                                <i class="fa-solid fa-angle-left"></i>
                            </span>
                        </div>

                        <div class="col col-6 text-center"><span>Result {{ context.searchIndex }} of {{
                                context.count
                            }}</span></div>
                        <div class="col col-3 text-right" :class="{ disabled: context.searchIndex === context.count}">
                          
                            <span class="btn btn-sm btn-primary" @click="loadCharterByIndex(context.searchIndex + 1)">
                                <i class="fa-solid fa-angle-right"></i>
                            </span>
                            <span class="btn btn-sm btn-primary" @click="loadCharterByIndex( context.count)">
                                <i class="fa-solid fa-angles-right"></i>
                            </span>
                        </div>
                    </div>
                </Widget>

                <Widget title="Actors">
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

                <Widget title="Date">
                    <LabelValue label="Scholarly dating (preferential)" :value="formatDatations(preferentialDates)"
                                :inline="false"></LabelValue>
                    <LabelValue label="Scholarly dating (any)" :value="formatDatations(charter.datations)"
                                :inline="false"></LabelValue>
                    <LabelValue v-if="charter.udt" label="Date in the charter" :value="formatDates(charter.udt)"
                                :inline="false"></LabelValue>
                    <LabelValue label="Place-date (in the text)" :value="charter.place_found_name"
                                :inline="false"></LabelValue>
                    <LabelValue v-if="charter.place" label="Place-date (normalised)"
                                :value="formatPlaceNormalised(charter.place)"
                                :url="'/map?lat=' + charter.place.latitude + '&long=' + charter.place.longitude"
                                :inline="false"></LabelValue>
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
import {ref, computed, toValue, watch, toRef} from 'vue'

import Widget from '../Sidebar/Widget.vue'
import LabelValue from '../Sidebar/LabelValue.vue'
import InlineLinkList from '../InlineLinkList.vue'
import ImageThumbnail from '../ImageThumbnail.vue'
import ActorListDetailed from '../Actor/ActorListDetailed.vue'
import ActorMap from '@/components/Actor/ActorMap.vue'
import ActorDetailsFlat from '@/components/Actor/ActorDetailsFlat.vue'
import * as qs from "qs";
import charterRepository from "@/repositories/CharterRepository.ts";
import {useTextMarker} from "@/composables/useTextMarker.ts";

import {
    formatSource,
    formatDatations,
    formatCodex,
    formatEdition,
    formatOriginal,
    formatSecondaryLiterature,
    formatPlaceNormalised,
    formatDates,
} from "./Formatters.ts"

const props = defineProps({
    initUrls: {
        type: String,
        required: true
    },
})

const urls = JSON.parse(props.initUrls)
const data = ref<{ charter: any }>({} as { charter: any })

// Initialize
const segments = window.location.pathname.split('/');
const id = Number(segments[segments.length - 1]);
getCharter(id);


const openRequests = ref(false)
const popupActorId = ref<number | null>(null)

const charter = computed(() => data.value.charter)

const issuers = computed(() => charter.value.actors.filter(actor => actor.role.id === 2));
const authors = computed(() => charter.value.actors.filter(actor => actor.role.id === 1));
const beneficiaries = computed(() => charter.value.actors.filter(actor => [3, 4].includes(actor.role.id)));

const preferentialDates = computed(() => charter.value.datations.filter(datation => datation.preference === 0));

const isOriginal = computed(() => {
    if (!charter.value.originals) {
        return "No";
    }
    for (const original of charter.value.originals) {
        if (original.charter_id === charter.value.id) {
            return "Yes";
        }
    }
    return "No";
})

const originals = computed(() => charter.value.originals.map(o => formatOriginal(o, traditionUrlGenerator)).filter(Boolean));
const codexes = computed(() => charter.value.codexes.map(c => formatCodex(c, 'manuscript', traditionUrlGenerator)).filter(Boolean));
const copies = computed(() => charter.value.copies.map(c => formatCodex(c, 'copy', traditionUrlGenerator)).filter(Boolean));
const editionsFormatted = computed(() => charter.value.edition_indications.map(formatEdition).filter(Boolean));
const secondaryLiteratureFormatted = computed(() => charter.value.secondary_literature_indications.map(formatSecondaryLiterature).filter(Boolean));

const geojson = computed(() => {
    const geojson = {type: 'FeatureCollection', features: [] as any[]};
    for (const actor of charter.value.actors) {
        if (actor?.place?.latitude) {
            geojson.features.push({
                'type': 'Feature',
                'geometry': {
                    type: 'Point',
                    coordinates: [parseFloat(actor.place.longitude), parseFloat(actor.place.latitude)],
                },
                'properties': {
                    actorId: actor.id,
                    roleId: actor.role.id,
                    roleLabel: {1: 'A', 2: 'I', 3: 'B'}?.[actor.role.id],
                }
            })
        }
    }
    return geojson;
});

const popupActor = computed(() => popupActorId.value ? charter.value.actors.find(actor => actor.id === popupActorId.value) : null);

function getUrl(route: string) {
    return urls[route] ?? '';
}

function urlGeneratorIssuer(url, filter, filter_defaults = {}) {
    return (value) => (getUrl(url) + '?' + qs.stringify({filters: {actor_role_1: 2, [filter]: value.id}}));
}

function urlGeneratorAuthors(url, filter, filter_defaults = {}) {
    return (value) => (getUrl(url) + '?' + qs.stringify({filters: {actor_role_1: 1, [filter]: value.id}}));
}

function urlGeneratorBeneficiaries(url, filter, filter_defaults = {}) {
    return (value) => (getUrl(url) + '?' + qs.stringify({filters: {actor_role_1: 3, [filter]: value.id}}));
}

function urlGeneratorIdName(url: string, filter: string, defaults = {}) {
    return (value: any) => `${getUrl(url)}?${qs.stringify({filters: {...defaults, [filter]: value.id}})}`;
}

const traditionUrlGenerator = (type: string, id: string | number): string => getUrl('tradition_get_single').replace('tradition_type', type).replace('tradition_id', id)

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
    context,
    initContextFromUrl,
    initResultSet,
    loadByIndex: loadCharterByIndex,
    returnToSearchResult,
    validContextAndResultSet,
    setOnIdChanged,
} = useSearchContext();

function getCharter(id: number) {
    charterRepository.get(id).then((response) => {
        data.value.charter = response.data;
        const currentUrl = window.location.href;
        const newUrl = currentUrl.replace(/(\/charters\/)\d+/, `$1${id}`);
        window.history.pushState(null, '', newUrl);
        updateTitle(id);
    });
}

setOnIdChanged((newId: number) => {
    getCharter(newId)
});

initContextFromUrl();
if (context.value.validReadContext && !context.value.ids) {
    let readContext: Context = toValue(context);
    initResultSet(readContext, (new URL(readContext.prevUrl)).pathname + "/paginate"); //TODO how to fix url in composition API?
}

const fullTextRef = computed(() => data.value.charter.full_text ?? "")
const searchString = context.value.params.filters['fulltext'] ?? "";
const words = [...searchString.replace(/#\([^)]*\)/g, '').matchAll(/(?<!#)(^|$|[^\w.*])[\w.*]+(^|$|[^\w.*])/g)].map(m => m[0].replace(/\*/g, '[A-Za-z]*'))
const {
    markedText
} = useTextMarker(fullTextRef, words, "bg-primary-light")

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