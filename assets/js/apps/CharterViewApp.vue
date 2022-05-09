<template>
    <div class="row">
        <article class="col-sm-8">
            <div class="scrollable scrollable--vertical">
                <h1>{{ charter.title }}</h1>

                <h2>Summary and description</h2>
                <div class="mbottom-default">{{ charter.summary }}</div>

                <LabelValue label="Language" :value="charter.language" type="id_name"></LabelValue>
                <LabelValue label="Authenticity" :value="charter.authenticity" type="id_name"></LabelValue>
                <LabelValue label="Textual tradition" :value="charter.text_subtype" type="id_name"></LabelValue>
                <LabelValue label="Nature of the charter" :value="charter.nature" type="id_name"></LabelValue>

                <!-- Text -->
                <h2>Full text of charter</h2>

                {{ charter.full_text }}
            </div>
        </article>
        <aside class="col-sm-4 scrollable scrollable--vertical">
            <div class="padding-default">

                <Widget v-if="isValidResultSet()" title="Search" :isOpen="true">
                    <div class="row mbottom-default">
                        <div class="col col-xs-3" :class="{ disabled: context.searchIndex === 1}">
                            <span class="btn btn-sm btn-primary" @click="loadCharterByIndex(1)">&laquo;</span>
                            <span class="btn btn-sm btn-primary" @click="loadCharterByIndex(context.searchIndex - 1)">&lt;</span>
                        </div>
                        <div class="col col-xs-6 text-center"><span>Result {{ context.searchIndex }} of {{ resultSet.count }}</span></div>
                        <div class="col col-xs-3 text-right" :class="{ disabled: context.searchIndex === context.count}">
                            <span class="btn btn-sm btn-primary" @click="loadCharterByIndex(context.searchIndex + 1)">&gt;</span>
                            <span class="btn btn-sm btn-primary" @click="loadCharterByIndex( resultSet.count )">&raquo;</span>
                        </div>
                    </div>
                </Widget>

                <Widget title="Actors" :is-open.sync="config.widgets.actors.isOpen">
                    <h2>Issuer(s)</h2>
                    <h3>(= author)</h3>
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

                  <h2>Author(s) of the actio juridica</h2>
                  <h3>(= disposer)</h3>
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

                  <h2>Benefiriary(ies)</h2>
                  <h3>(= recipient)</h3>
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

                <Widget title="Date" :is-open.sync="config.widgets.date.isOpen">
                  <LabelValue label="Scholarly dating (preferential)" :value="getDatations(preferentialDates)"></LabelValue>
                  <LabelValue label="Scholarly dating (any)" :value="getDatations(charter.datations)"></LabelValue>
                  <LabelValue v-if="charter.udt" label="Date in the charter" :value="getDates(charter.udt)"></LabelValue>
                  <LabelValue label="Place-date (in the text)" :value="charter.place_found_name"></LabelValue>
                  <LabelValue v-if="charter.place" label="Place-date (normalised)" :value="getNormalisedPlace(charter.place)" :url="'/map?lat=' + charter.place.latitude + '&long=' + charter.place.longitude"></LabelValue>
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
import Vue from 'vue'
import Widget from '../components/Sidebar/Widget'
import LabelValue from '../components/Sidebar/LabelValue'
import PropertyGroup from '../components/Sidebar/PropertyGroup'
import CheckboxSwitch from '../components/FormFields/CheckboxSwitch'

import PersistentConfig from "../components/Shared/PersistentConfig";
import ResultSet from "../components/Search/ResultSet";
import SearchSession from "../components/Search/SearchSession";
import SearchContext from "../components/Search/SearchContext";

import axios from 'axios'
import qs from 'qs'
import FormatValue from "../components/Sidebar/FormatValue";

export default {
    name: "CharterViewApp",
    components: {
      FormatValue,
        Widget, LabelValue, PropertyGroup, CheckboxSwitch
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
        let data = {
            urls: JSON.parse(this.initUrls),
            data: JSON.parse(this.initData),
            defaultConfig: {
                search: {
                    useContext: true,
                },
                widgets: {
                    actors: { isOpen: true },
                    date: { isOpen: true },
                }
            },
            openRequests: false,
        }
        return data
    },
    computed: {
        charter: function() {
            return this.data.charter
        },
        issuers: function() {
          return this.data.charter.actors.filter( actor => actor.role.id === 2 )
        },
        authors: function() {
          return this.data.charter.actors.filter( actor => actor.role.id === 1 )
        },
        beneficiaries: function() {
          return this.data.charter.actors.filter( actor => actor.role.id === 3 || actor.role.id === 4 )
        },
        preferentialDates: function() {
          return this.data.charter.datations.filter( datation => datation.preference === 0 )
        },
        hasSearchContext() {
           return Object.keys(this.context.params ?? {} ).length > 0
        },
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
        getDate(date) {
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
        getDatations(datations) {
          var arr = [];
          for(const datation of datations) {
            var res = this.getDate(datation.time);
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
            arr.push(this.getDate(date));
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
    background-color: #fafafa !important;

    .widget {
      border-bottom: 1px solid #e9ecef;
    }
  }
}
</style>