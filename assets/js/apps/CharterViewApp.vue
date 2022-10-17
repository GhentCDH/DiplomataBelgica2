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

                <div id="map" class="map">
                    <l-map ref="GmMap" v-bind="map" :center="center" :zoom="zoom" :bounds="bounds">
                        <l-tile-layer v-for="layer in tileLayers" :key="layer.id"
                                      v-bind="layer.options"
                        />
                        <l-wms-tile-layer v-for="layer in wmsLayers" :key="layer.id" v-bind="layer.options"></l-wms-tile-layer>
                        <l-geo-json :ref="layer.id" v-for="layer in geojsonLayers" :key="layer.id"
                                    v-bind="layer.options"></l-geo-json>
                        <l-control class="map__control map__control--topleft" position="topleft">
                            <slot name="controls-topleft"></slot>
                        </l-control>
                    </l-map>
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
                        <li v-for="edition in editionsFormatted">
                            {{ edition.text }}
                            <InlineLinkList :linklist="edition.links"></InlineLinkList>
                        </li>
                    </ul>
                </div>

                <div v-if="secondaryLiteratureFormatted.length" class="mbottom-small">
                    <h3>Secondary literature</h3>

                    <ul class="_list-unstyled">
                        <li v-for="edition in secondaryLiteratureFormatted">
                            {{ edition.text }}
                            <InlineLinkList :linklist="edition.links"></InlineLinkList>
                        </li>
                    </ul>
                </div>

                <h2>Tradition</h2>

                <div class="mbottom-small">
                    <LabelValue class="mbottom-default" label="Original" :value="isOriginal" grid="4|8"></LabelValue>

                    <div class="ptop-small" v-for="original in originals">
                        <a v-if="original.link" :href="original.link">{{ original.text }}</a>
                        <p v-else>{{ original.text }}</p>
                    </div>
                </div>

                <div v-if="codexes.length" class="mbottom-small">
                    <h3>Manuscripts</h3>
                    <ul>
                        <li v-for="codex in codexes">
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
                    <div v-for="actor in issuers">
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
                  <div v-for="actor in authors">
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
                  <div v-for="actor in beneficiaries">
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
    name: "CharterViewApp",
    components: {
      FormatValue,
        Widget, LabelValue, PropertyGroup, CheckboxSwitch, InlineLinkList
    },
    mixins: [
        PersistentConfig('CharterViewConfig'),
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
        charter: function() {
            return this.data.charter
        },
        issuers: function() {
          return this.charter.actors.filter( actor => actor.role.id === 2 )
        },
        authors: function() {
          return this.charter.actors.filter( actor => actor.role.id === 1 )
        },
        beneficiaries: function() {
          return this.charter.actors.filter( actor => actor.role.id === 3 || actor.role.id === 4 )
        },
        preferentialDates: function() {
          return this.charter.datations.filter( datation => datation.preference === 0 )
        },
        hasSearchContext() {
           return Object.keys(this.context.params ?? {} ).length > 0
        },
        isOriginal() {
            if(!this.charter.originals) {
                return "No";
            }
            for(const original of this.charter.originals) {
                if(original.charter_id === this.charter.id) {
                    return "Yes";
                }
            }
            return "No";
        },
        originals() {
            return this.charter.originals.map( original => this.formatOriginal(original) ).filter( original => original !== null);
        },
        codexes() {
            return this.charter.codexes.map( codex => this.formatCodex(codex) ).filter( codex => codex !== null);
        },
        editionsFormatted() {
            return this.charter.edition_indications.map( item => this.formatEdition(item) ).filter( item => item !== null);
        },
        secondaryLiteratureFormatted() {
            return this.charter.secondary_literature_indications.map( item => this.formatSecondaryLiterature(item) ).filter( item => item !== null);
        }
    },
    methods: {
        getUrl(route) {
            return this.urls[route] ?? ''
        },
        getCharterUrl(id) {
            let url = this.getUrl('charter_get_single').replace('charter_id',id)
            if (this.isValidContext()) {
                url += '#' + this.getContextHash()
            }
            return url
        },
        loadCharter(id) {
            this.openRequests += 1
            let url = this.getUrl('charter_get_single').replace('charter_id',id)
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
                that.loadCharter(id).then((response) => {
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
        formatSource(edition) {
          var res = [];
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
        },
        formatDate(date) {
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
        },
        formatDatations(datations) {
          var arr = [];
          for(const datation of datations) {
            var res = this.formatDate(datation.time);
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
        },
        getDates(dates) {
          var arr = [];
          for(const date of dates) {
            arr.push(this.formatDate(date));
          }
          return arr;
        },
        getNormalisedPlace(place) {
          var res = '';
          if(place.name) {
            res = place.name;
          }
          var localisation = [];
          if(place.localisation) {
            if(place.localisation.land) {
              localisation.push(place.localisation.land.name);
            }
            if(place.localisation.echelon_1) {
              localisation.push(place.localisation.echelon_1);
            }
            if(place.localisation.echelon_2) {
              localisation.push(place.localisation.echelon_2);
            }
          }
          if(localisation.length > 0) {
            res += (res.length > 0 ? ' ' : '') + '(' + localisation.join(', ') + ')';
          }
          return res;
        },
        formatOriginal(original) {
          var res = [];
          if(original.repository) {
            if(original.repository.location) {
              res.push(original.repository.location);
            }
            if(original.repository.name) {
              res.push(original.repository.name);
            }
          }
          if(original.repository_reference_number) {
            res.push(original.repository_reference_number);
          }
          if(res.length > 0) {
            if(original.id) {
              return { 'text': res.join(', '), 'link': '/original/' + original.id };
            } else {
              return { 'text' : res.join(', ') };
            }
          } else {
            return null;
          }
        },
        formatCodex(codex) {
          var res = [];
          if(codex.repository) {
            if(codex.repository.location) {
              res.push(codex.repository.location);
            }
            if(codex.repository.name) {
              res.push(codex.repository.name);
            }
          }
          if(codex.repository_reference_number) {
            res.push(codex.repository_reference_number);
          }
          var line = '';
          if(res.length > 0) {
            line = res.join(', ');
          }
          if(codex.redaction_date) {
            line += (line.length > 0 ? ' ' : '') + '(' + codex.redaction_date + ')';
          }
          if(line.length > 0) {
            if(codex.id) {
              return { 'text' : line, 'link' : '/codex/' + codex.id };
            } else {
              return { 'text' : line };
            }
          } else {
            return null;
          }
        },
        formatEdition(edition) {
            let parts = [];
            let links = [];
            if(edition.edition) {
                if(edition.edition.names_editors) {
                    parts.push(edition.edition.names_editors);
                }
                if(edition.edition.full_title) {
                    parts.push(edition.edition.full_title);
                }
            }
            if(edition.bookpart) {
                parts.push(edition.bookpart);
            }
            if(edition.nr) {
                parts.push(edition.nr);
            }
            if(edition.pages) {
                parts.push(edition.pages);
            }
            if(edition.edition && edition.edition.urls) {
              for(const url of edition.edition.urls) {
                if (url.url && url.url.length > 0) {
                  links.push(url.url);
                }
              }
            }
            if(edition.urls) {
              for (const url of edition.urls) {
                if (url.url && url.url.length > 0) {
                  links.push(url.url);
                }
              }
            }
            return parts.length ? { text: parts.join(', '), links: links } : null
        },
        formatSecondaryLiterature(edition) {
            let parts = [];
            let links = [];
            if(edition.secondary_literature) {
                if(edition.secondary_literature.names_editors) {
                    parts.push(edition.secondary_literature.names_editors);
                }
                if(edition.secondary_literature.full_title) {
                    parts.push(edition.secondary_literature.full_title);
                }
            }
            if(edition.bookpart) {
                parts.push(edition.bookpart);
            }
            if(edition.nr) {
                parts.push(edition.nr);
            }
            if(edition.pages) {
                parts.push(edition.pages);
            }
            if(edition.secondary_literature && edition.secondary_literature.urls) {
              for(const url of edition.secondary_literature.urls) {
                if (url.url && url.url.length > 0) {
                  links.push(url.url);
                }
              }
            }
            if(edition.urls) {
              for (const url of edition.urls) {
                if (url.url && url.url.length > 0) {
                  links.push(url.url);
                }
              }
            }
            return parts.length ? { text: parts.join(', '), links: links } : null
        }
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