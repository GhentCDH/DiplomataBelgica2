<template>
    <div class="row">
        <article class="col-sm-8">
            <div class="scrollable scrollable--vertical">
                <h1>{{ charter.title }}</h1>

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
                            <span class="btn btn-sm btn-primary" @click="loadTextByIndex(1)">&laquo;</span>
                            <span class="btn btn-sm btn-primary" @click="loadTextByIndex(context.searchIndex - 1)">&lt;</span>
                        </div>
                        <div class="col col-xs-6 text-center"><span>Result {{ context.searchIndex }} of {{ resultSet.count }}</span></div>
                        <div class="col col-xs-3 text-right" :class="{ disabled: context.searchIndex === context.count}">
                            <span class="btn btn-sm btn-primary" @click="loadTextByIndex(context.searchIndex + 1)">&gt;</span>
                            <span class="btn btn-sm btn-primary" @click="loadTextByIndex( resultSet.count )">&raquo;</span>
                        </div>
                    </div>
                </Widget>

                <Widget title="Summary" :is-open.sync="config.widgets.summary.isOpen">
                    <div class="mbottom-default">{{ charter.summary }}</div>
                    <PropertyGroup>
                        <LabelValue label="Language" :value="charter.language" type="id_name" :inline="false"></LabelValue>
                        <LabelValue label="Authenticity" :value="charter.authenticity.name" :inline="false"></LabelValue>
                        <LabelValue label="Textual tradition" :value="charter.text_subtype" type="id_name" :inline="false"></LabelValue>
                        <LabelValue label="Nature of the charter" :value="charter.nature.name" :inline="false"></LabelValue>
                    </PropertyGroup>
                </Widget>

                <Widget title="Actors" :is-open.sync="config.widgets.actors.isOpen">
                    <div v-for="actor in charter.actors">
                        <LabelValue label="Name" :value="actor.name.full_name"></LabelValue>
                    </div>
                </Widget>

                <Widget title="Date" :is-open.sync="config.widgets.date.isOpen">

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

export default {
    name: "TextViewApp",
    components: {
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
                    summary: { isOpen: true },
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
            return this.data.charter.actors.filter( actor => actor.role.id === 1 )
        },
        hasSearchContext() {
           return Object.keys(this.context.params ?? {} ).length > 0
        },
    },
    methods: {
        getUrl(route) {
            return this.urls[route] ?? ''
        },
        getTextUrl(id) {
            let url = this.urls['text_get_single'].replace('text_id', id);
            if (this.isValidContext()) {
                url += '#' + this.getContextHash()
            }
            return url
        },
        loadText(id) {
            this.openRequests += 1
            let url = this.getUrl('charter_get_single').replace('charter_id',id)
            return axios.get(url).then( (response) => {
                if (response.data) {
                    this.data.text = response.data;
                }
                this.openRequests -= 1
            })
        },
        loadTextByIndex(index) {
            let that = this;
            if ( !this.resultSet.count ) return;

            let newIndex = Math.max(1, Math.min(index, this.resultSet.count))
            this.getResultSetIdByIndex(newIndex).then( function(id) {
                that.loadText(id).then((response) => {
                    // update context
                    that.context.searchIndex = newIndex
                    // update state
                    window.history.replaceState({}, '', that.getTextUrl(id));
                    // bind events
                    that.bindEvents();
                });
            })
        },
        isValidResultSet() {
            return this.context?.searchIndex && this.resultSet?.count
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