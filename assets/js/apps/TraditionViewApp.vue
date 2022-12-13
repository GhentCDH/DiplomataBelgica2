<template>
    <div class="row">
        <article class="col-sm-12">
            <div class="scrollable scrollable--vertical pbottom-large">

                <h2 class="pbottom-default">Tradition </h2>
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
                
                <h2 class="pbottom-default"> Link </h2>
                <div v-if="tradition.repository.urls.length >0">
                    <h3 v-if="tradition.repository.urls.length >0">Repository</h3>
                    <ul>
                        <li v-for="url in tradition.repository.urls" :key="url.id">
                            <a href="url.url">{{ url.url }}</a> 
                        </li>
                    </ul>
                </div>


                <h3 v-if="tradition.urls.length > 0" >Document</h3>
                <ul>
                    <li v-for="url in tradition.urls" :key="url.id">
                        <a href="url.url">{{ url.url }}</a> 
                    </li>
                </ul>

                <h2 v-if="tradition.image_count > 0"> Images </h2>
                <div v-if="(tradition.image_count>0)" >
                  <ImageThumbnail :url="getImageUrl(tradition.images)" > </ImageThumbnail>
                </div>
                <div v-if="(tradition.type=='manuscript')">
                  <h2 v-if="(tradition.type=='manuscript')"> Charters </h2>
                  <div v-for="charter in tradition.charters" :key="charter.id">
                    <p>
                      <LabelValue label="DiBe ID" :value="charter.id" :url="'/charter/' + charter.id" grid="2|8"></LabelValue>
                      <LabelValue label="Main issuer:" :value="charter.actors[0].capacity.name" grid="2|8"></LabelValue>
                      <LabelValue label="Author" :value="charter.actors[0].name.full_name" grid="2|8"></LabelValue>
                      <LabelValue label="Year" :value="getDates(charter.udt)" grid="2|8"></LabelValue>
                    </p>
                  </div>
                </div>
              </div>
        </article> 
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
import ImageThumbnail from '../components/ImageThumbnail.vue'

export default {
    name: "TraditionViewApp",
    components: {
      FormatValue,
      Widget,
      LabelValue,
      PropertyGroup,
      CheckboxSwitch,
      InlineLinkList,
      ImageThumbnail
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
                    tradition: { collapsed: false },
                    link: { collapsed: false }
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
            let url = this.getUrl('tradition_get_single').replace('tradition_id',id).replace('tradition_type', tradition_type)
            if (this.isValidContext()) {
                url += '#' + this.getContextHash()
            }
            return url
        },
        loadTradition(id, tradition_type) {
            this.openRequests += 1
            let url = this.getUrl('tradition_get_single').replace('tradition_id',id).replace('tradition_type', tradition_type)
            return axios.get(url).then( (response) => {
                if (response.data) {
                    this.data.tradition = response.data;
                }
                this.openRequests -= 1
            })
        },
        formatReference(reference, referenceNum) {
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
        },
        loadTraditionByIndex(index) {
            let that = this;
            if ( !this.resultSet.count ) return;

            let newIndex = Math.max(1, Math.min(index, this.resultSet.count))
            this.getResultSetIdByIndex(newIndex).then( function(id) {
                that.loadTradition(id).then((response) => {
                    // update context
                    that.context.searchIndex = newIndex
                    // update state
                    window.history.replaceState({}, '', that.getTraditionUrl(id));
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
        removeExtension(filename) {
          return filename.substring(0, filename.lastIndexOf('.')) || filename;
        },
        removeExtension(filename) {
          return filename.substring(0, filename.lastIndexOf('.')) || filename;
        },
        filenameCheck(filename) {
          var name = this.removeExtension(filename).replace('/',':');

          return name.replace('[^\d:-]','');
        },
        formatImageUrl(url) {
            var prefix = 'https://iiif.ghentcdh.ugent.be/iiif/images/dibe:';
            var suffix='/full/256,/0/default.jpg'
            
            return prefix + this.filenameCheck(this.removeExtension(url)) + suffix;
        },
        getImageUrl(values) {
          return values.map( item => this.formatImageUrl(item.image_file ))
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