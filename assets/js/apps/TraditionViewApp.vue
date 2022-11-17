<template>
    <div class="row">
        <article class="col-sm-8">
            <div class="scrollable scrollable--vertical pbottom-large">

                <h1 class="pbottom-default">DiBe ID {{ charter.id }}</h1>

                <h2>Summary and description</h2>
                <div class="mbottom-default">{{ charter.summary }}</div>

                <div class="mbottom-default">
                  <LabelValue label="Language" :value="charter.language" type="id_name" grid="4|8"></LabelValue>
                  <LabelValue label="Authenticity" :value="charter.authenticity" type="id_name" grid="4|8"></LabelValue>
                  <LabelValue label="Textual tradition" :value="charter.text_subtype" type="id_name" grid="4|8"></LabelValue>
                  <LabelValue label="Nature of the charter" :value="charter.nature" type="id_name" grid="4|8"></LabelValue>
                </div>


                <!-- Text -->
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
                        <a v-if="original.link" :href="original.link">{{ original.text }}</a>
                        <p v-else>{{ original.text }}</p>
                    </div>
                </div>

                <div v-if="codexes.length" class="mbottom-small">
                    <h3>Manuscripts</h3>
                    <ul>
                        <li v-for="codex in codexes" :key="codex.id">
                            <a v-if="codex.link" :href="codex.link">{{ codex.text }}</a>
                            <p v-else>{{ codex.text }}</p>
                        </li>
                    </ul>
                </div>
            </div>
        </article>
        <aside class="col-sm-4 scrollable bg-tertiary scrollable--vertical scrollable--horizontal padding-none">
            <div class="padding-default">

                <Widget v-if="isValidResultSet()" title="Search" :collapsed="false">
                    <div class="row mbottom-default">
                        <div class="col col-3" :class="{ disabled: context.searchIndex === 1}">
                            <span class="btn btn-sm btn-primary" @click="loadCharterByIndex(1)"> 
                                <i class="fa-solid fa-angles-left"></i>
                            </span>
                            <span class="btn btn-sm btn-primary" @click="loadCharterByIndex(context.searchIndex - 1)">
                                <i class="fa-solid fa-angle-left"></i>
                            </span>
                        </div>

                        <div class="col col-6 text-center"><span>Result {{ context.searchIndex }} of {{ resultSet.count }}</span></div>
                        <div class="col col-3 text-right" :class="{ disabled: context.searchIndex === context.count}">
                          
                            <span class="btn btn-sm btn-primary" @click="loadCharterByIndex(context.searchIndex + 1)">
                                <i class="fa-solid fa-angle-right"></i>
                            </span>
                            <span class="btn btn-sm btn-primary" @click="loadCharterByIndex( resultSet.count )">
                                <i class="fa-solid fa-angles-right"></i>
                            </span>
                        </div>
                    </div>
                </Widget>

                <Widget title="Actors" :collapsed.sync="config.widgets.actors.isOpen">
                    <h3 v-if="issuers.length > 0">Issuer(s)<small>(= author)</small></h3>
                    <div v-for="actor in issuers" :key="actor.id">
                      <p>
                        <LabelValue label="Function/title" :value="actor.capacity.name"></LabelValue>
                        <LabelValue label="Name" :value="actor.name.full_name"></LabelValue>
                        <LabelValue label="Institution/jurisdiction" :value="actor.place.name" :url="'/map?lat=' + actor.place.latitude + '&long=' + actor.place.longitude"></LabelValue>
                        <LabelValue label="Diocese" :value="actor.place.diocese_name"></LabelValue>
                        <LabelValue label="Principality" :value="actor.place.principality_name"></LabelValue>
                        <LabelValue v-if="actor.order" label="Religious order" :value="actor.order.name"></LabelValue>
                      </p>
                    </div>

                  <h3 v-if="authors.length > 0">Author(s) of the actio juridica<small>(= disposer)</small></h3>
                  <div v-for="actor in authors" :key="actor.id">
                    <p>
                      <LabelValue label="Function/title" :value="actor.capacity.name"></LabelValue>
                      <LabelValue label="Name" :value="actor.name.full_name"></LabelValue>
                      <LabelValue label="Institution/jurisdiction" :value="actor.place.name" :url="'/map?lat=' + actor.place.latitude + '&long=' + actor.place.longitude"></LabelValue>
                      <LabelValue label="Diocese" :value="actor.place.diocese_name"></LabelValue>
                      <LabelValue label="Principality" :value="actor.place.principality_name"></LabelValue>
                      <LabelValue v-if="actor.order" label="Religious order" :value="actor.order.name"></LabelValue>
                    </p>
                  </div>

                  <h3 v-if="beneficiaries.length > 0">Benefiriary(ies)<small>(= recipient)</small></h3>
                  <div v-for="actor in beneficiaries" :key="actor.id">
                    <p>
                      <LabelValue label="Function/title" :value="actor.capacity.name"></LabelValue>
                      <LabelValue label="Name" :value="actor.name.full_name"></LabelValue>
                      <LabelValue label="Institution/jurisdiction" :value="actor.place.name" :url="'/map?lat=' + actor.place.latitude + '&long=' + actor.place.longitude"></LabelValue>
                      <LabelValue label="Diocese" :value="actor.place.diocese_name"></LabelValue>
                      <LabelValue label="Principality" :value="actor.place.principality_name"></LabelValue>
                      <LabelValue v-if="actor.order" label="Religious order" :value="actor.order.name"></LabelValue>
                    </p>
                  </div>
                </Widget>

                <Widget title="Date" :collapsed.sync="config.widgets.date.isOpen">
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

<script>
import Widget from '../components/Sidebar/Widget'
import LabelValue from '../components/Sidebar/LabelValue'
import PropertyGroup from '../components/Sidebar/PropertyGroup'
import CheckboxSwitch from '../components/FormFields/CheckboxSwitch'
import InlineLinkList from '../components/InlineLinkList'

import PersistentConfig from "../components/Shared/PersistentConfig";
import ResultSet from "../components/Search/ResultSet";
import SearchSession from "../components/Search/SearchSession";
import SearchContext from "../components/Search/SearchContext";

import axios from 'axios'
import FormatValue from "../components/Sidebar/FormatValue";

export default {
    name: "TraditionViewApp",
    components: {
      FormatValue,
        Widget, LabelValue, PropertyGroup, CheckboxSwitch, InlineLinkList
    },
    mixins: [
        PersistentConfig('TraditionViewConfig'),
        ResultSet,
        SearchSession,
        SearchContext,
    ],
    props: {
        initUrls: {
            type: String,
            required: true
        },
        initData: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            urls: JSON.parse(this.initUrls),
            data: JSON.parse(this.initData),
            defaultConfig: {
                search: {
                    useContext: true,
                },
                widgets: {
                    actors: { collapsed: false },
                    date: { collapsed: false }
                }
            },
            openRequests: false,
        }
    },
    computed: {
        tradition: function() {
            return this.data.tradition
        },
    },
    methods: {
        getUrl(route) {
            return this.urls[route] ?? ''
        },
        getTraditionUrl(id, tradition_type) {
            let url = this.getUrl('tradition_get_single').replace('charter_id',id).replace('tradition_type', tradition_type)
            if (this.isValidContext()) {
                url += '#' + this.getContextHash()
            }
            return url
        },
        loadTradition(id, tradition_type) {
            this.openRequests += 1
            let url = this.getUrl('tradition_get_single').replace('charter_id',id).replace('tradition_type', tradition_type)
            return axios.get(url).then( (response) => {
                if (response.data) {
                    this.data.charter = response.data;
                }
                this.openRequests -= 1
            })
        },
        loadCharterByIndex(index) {
            let that = this;
            if ( !this.resultSet.count ) return;

            let newIndex = Math.max(1, Math.min(index, this.resultSet.count))
            this.getResultSetIdByIndex(newIndex).then( function(id) {
                that.loadTradition(id).then((response) => {
                    // update context
                    that.context.searchIndex = newIndex
                    // update state
                    window.history.replaceState({}, '', that.getCharterUrl(id));
                });
            })
        },
        isValidResultSet() {
            return this.context?.searchIndex && this.resultSet?.count
        },

    },
    created() {
        // init context
        this.initContextFromUrl()

        // init ResultSet based on SearchSession
        if ( this.context?.searchSessionHash ) {
            let searchSession = this.getSearchSession(this.context.searchSessionHash)
            if ( searchSession ) {
                this.initResultSet(searchSession.urls.paginate, searchSession.params, searchSession.count)
            }
        }
    },
}
</script>

<style scoped lang="scss">
#charter-view-app {
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