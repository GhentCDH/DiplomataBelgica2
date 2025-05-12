<template>
    <div class="row d-flex flex-direction-row flex-nowrap align-items-stretch" v-if="tradition">
        <article class="d-flex col-sm-8 overflow-hidden">
            <div class="scrollable scrollable--vertical pbottom-large">

                <h2>Tradition </h2>
                <!-- <h2>Tradition</h2> -->
                <div class="mbottom-default">
                  <LabelValue label="Reference" :value="formatReference(tradition.repository, tradition.repository_reference_number)" grid="4|8"></LabelValue>
                  <LabelValue label="Type" :value="tradition.type" grid="4|8"></LabelValue>
                </div>
                <h2 v-if="tradition.type == 'manuscript'" class="pbottom-default" > Information about the Manuscript </h2>
                <div v-if="tradition.type == 'manuscript'" class="mbottom-default">
                  <LabelValue label="Stein ID" :value="tradition.stein_number" grid="4|8"></LabelValue>
                  <LabelValue v-if=tradition.authors label="Author(s) of the manuscript" :value="tradition.authors" grid="4|8"></LabelValue>
                  <LabelValue label="Title of the manuscript" :value="tradition.title" grid="4|8"></LabelValue>
                  <LabelValue label="Date of redaction" :value="tradition.redaction_date" grid="4|8"></LabelValue>
                  <LabelValue label="Institution(s) covered by the manuscript" :value="tradition.institutions" type="id_name" grid="4|8"></LabelValue>
                  <LabelValue label="Size of the manuscript" :value="tradition.pages" grid="4|8"></LabelValue>
                  <LabelValue label="Writing material(s)" :value="tradition.materials" grid="4|8" type="id_name"></LabelValue>
                </div>

                <h2> Link </h2>
                <div v-if="tradition.repository.urls.length >0">
                    <h3 v-if="tradition.repository.urls.length >0">Repository</h3>
                    <ul>
                        <li v-for="url in tradition.repository.urls" :key="url.id">
                            <a target="_blank" href="url.url">{{ url.url }}</a>
                        </li>
                    </ul>
                </div>


                <h3 v-if="tradition.urls.length > 0" >Document</h3>
                <ul>
                    <li v-for="url in tradition.urls" :key="url.id">
                        <a target="_blank" href="url.url">{{ url.url }}</a>
                    </li>
                </ul>

                <h2 v-if="tradition.image_count > 0"> Images </h2>
                <div v-if="(tradition.image_count>0)" >
                  <ImageThumbnail :thumbnail-urls="getImageUrl(tradition.images)" />
                </div>
                <h2> Charters </h2>
                <div v-for="charter in tradition.charters" :key="charter.id">
                  <p>
                    <LabelValue label="DiBe ID" :value="charter.id" :url="'/charter/' + charter.id" grid="2|8"></LabelValue>
                    <LabelValue label="Main issuer:" :value="charter.actors[0].capacity.name" grid="2|8"></LabelValue>
                    <LabelValue label="Author" :value="charter.actors[0].name.full_name" grid="2|8"></LabelValue>
                    <LabelValue label="Year" :value="formatDatations(charter.datations)" grid="2|8"></LabelValue>
                  </p>
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
                        <div class="col col-3" :class="{ disabled: context.searchIndex === 1}">
                            <span class="btn btn-sm btn-primary" @click="loadByIndex(1)">
                                <i class="fa-solid fa-angles-left"></i>
                            </span>
                            <span class="btn btn-sm btn-primary" @click="loadByIndex(context.searchIndex - 1)">
                                <i class="fa-solid fa-angle-left"></i>
                            </span>
                        </div>

                        <div class="col col-6 text-center"><span>Result {{ context.searchIndex }} of {{ context.count }}</span></div>
                        <div class="col col-3 text-right" :class="{ disabled: context.searchIndex === context.count}">

                            <span class="btn btn-sm btn-primary" @click="loadByIndex(context.searchIndex + 1)">
                                <i class="fa-solid fa-angle-right"></i>
                            </span>
                            <span class="btn btn-sm btn-primary" @click="loadByIndex( context.count)">
                                <i class="fa-solid fa-angles-right"></i>
                            </span>
                        </div>
                    </div>
                </Widget>
            </div>
        </aside>
    </div>
</template>

<script setup lang="ts">
import {computed, ref, toValue} from "vue";
import axios from "axios";
import LabelValue from "@/components/Sidebar/LabelValue.vue";
import ImageThumbnail from "@/components/ImageThumbnail.vue";
import charterRepository from "@/repositories/CharterRepository.ts";
import traditionRepository from "@/repositories/TraditionRepository.ts";
import {type Context, useSearchContext} from "@/composables/useSearchContext.ts";
import Widget from "@/components/Sidebar/Widget.vue";

const props = defineProps({
    initUrls: {
        type: String,
        required: true
    },
});

const urls = JSON.parse(props.initUrls)
const data = ref<{tradition: any}>({} as {tradition: any})

// Initialize
const segments = window.location.pathname.split('/');
const id = Number(segments[segments.length - 1]);
getTradition(id);


const tradition = computed(() => data.value.tradition)

function getUrl(route) {
    return urls[route] ?? ''
}

function formatReference(reference, referenceNum) {
    var res = '';
    if (reference.location) {
        res = reference.location;
    }
    if (reference.name) {
        res = res + ', ' + reference.name;
    }
    if (referenceNum) {
        res = res + ', ' + referenceNum;
    }
    return res;
}

function formatDate(date): string {
    var res = '';
    if (date.year) {
        res = date.year;
        if (date.month) {
            res = date.month + '/' + res;
            if (date.day) {
                res = date.day + '/' + res;
            }
        }
    }
    return res;
}

function formatDatations(datations): string[] {
    var arr: string[] = [];
    for(const datation of datations) {
        var res = formatDate(datation.time);
        if (datation.time.interpretation) {
            res += ' (' + datation.time.interpretation;
            if (datation.researcher) {
                res += ' - ' + datation.researcher + ')';
            } else {
                res += ')';
            }
        }
        arr.push(res);
    }
    return arr;
}

function getImageUrl(values) {
    return values.map( item => formatImageUrl(item.image_file ))
}

function formatImageUrl(url: string) {
    var prefix = 'https://iiif.ghentcdh.ugent.be/iiif/images/dibe:';
    var suffix= '/full/256,/0/default.jpg'

    return prefix + filenameCheck(removeExtension(url)) + suffix;
}

function removeExtension(filename: string) {
    return filename.substring(0, filename.lastIndexOf('.')) || filename;
}
function filenameCheck(filename: string) {
    let name = removeExtension(filename).replace('/',':');

    return name.replace('[^\d:-]','');
}

function updateTitle(id: number) {
    document.title = 'Diplomata Belgica - Tradition ID ' + id
}

function getTradition(id: number) {
    traditionRepository.get(id).then((response) => {
        data.value.tradition = response.data;
        const currentUrl = window.location.href;
        const newUrl = currentUrl.replace(/(\/tradition\/original\/)\d+/, `$1${id}`);
        window.history.pushState(null, '', newUrl);
        updateTitle(id);
    });
}

//Context
const {
    context,
    initContextFromUrl,
    initResultSet,
    loadByIndex,
    returnToSearchResult,
    validContextAndResultSet,
    setOnIdChanged,
} = useSearchContext();

setOnIdChanged((newId: number) => {
    getTradition(newId)
});

initContextFromUrl();
if (context.value.validReadContext && !context.value.ids){
    let readContext: Context = toValue(context);
    initResultSet(readContext, (new URL(readContext.prevUrl)).pathname.replace("/search", "/paginate").replace("/en", "")); //TODO how to fix url in composition API?
}
console.log(context)

</script>

<style scoped lang="scss">
#tradition-view-app {
  display: flex;
  flex-direction: row;
  flex: 1;
  overflow: hidden;
  height: 100%;

  article {
    display: flex;

    & > div {
      width: 100%;
    }
  }

  aside {
    // background-color: #fafafa !important;

    .widget {
      border-bottom: 1px solid #e9ecef;
    }
  }
}
</style>