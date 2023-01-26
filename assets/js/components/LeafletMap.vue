<template>
    <div id="leaflet-map" class="leaflet-map">
        <l-map ref="GmMap" v-bind="map" :center="center" :zoom="zoom" :bounds="bounds" @update:zoom="updateZoom"
               @update:center="updateCenter" @update:bounds="updateBounds" @ready="onMapReady">
            <l-tile-layer v-for="layer in tileLayers" :key="layer.id"
                          v-bind="layer.options"
            />
            <l-wms-tile-layer v-for="layer in wmsLayers" :key="layer.id" v-bind="layer.options"></l-wms-tile-layer>
            <l-geo-json :ref="layer.id" v-for="layer in geojsonLayers" :key="layer.id"
                        v-bind="layer.options" ></l-geo-json>
            <l-control position="topleft" >
                <div class="dropup">
                    <button type="button" class="dropbtn" @click="showList" >Filter role</button>
                    <div id="content" class="dropup-content" style="display: none">
                        <a @click="toggleDisplay('Issuer')">Issuer</a>
                        <a @click="toggleDisplay('Author of the actio juridica')">Disposer</a>
                        <a @click="toggleDisplay('Beneficiary')">Beneficiary(ies)</a>
                        <a @click="toggleDisplay('All')">All</a>
                    </div>
                </div>
            </l-control>
            <l-marker v-for="marker in computedMarkers" v-bind="marker" :key="marker.id" >
            <l-popup>Function: {{ marker.name }}</l-popup>
            </l-marker> 
            <l-control class="map__control map__control--topleft" position="topleft">
                <slot name="controls-topleft"></slot>
            </l-control>
        </l-map>
    </div>
</template>

<script>
import {LControl, LGeoJson, LMap, LMarker, LTileLayer, LWMSTileLayer, LControlLayers, LIcon, LPopup} from 'vue2-leaflet';
import 'leaflet/dist/leaflet.css';

// icon fix
import {Icon} from 'leaflet';

delete Icon.Default.prototype._getIconUrl;

let iconDefaults = {
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
}

Icon.Default.mergeOptions(iconDefaults)


export default {
    name: "LeafletMap",
    components: {
        LMap,
        LTileLayer,
        LMarker,
        LGeoJson,
        LControl,
        LControlLayers,
        LPopup,
        'l-wms-tile-layer': LWMSTileLayer
    },
    props: {
        layers: {
            type: Array,
            default() {
                return []
            }
        },
        geojson: {
            type: Object,
            required: false,
            default() {
                return {
                    type: 'FeatureCollection',
                    features: []
                }
            }
        },
        markers: {
            type: Array,
            default() {
                return [];
            }
        },
        // filteredMarkers: {
        //     type: Array,
        //     default() {
        //         return this.markers;
        //     }
        // },
        center: {
            type: Array,
            default() {
                return null
            }
        },
        bounds: {
            type: Array,
            default() {
                return null
            }
        },
        zoom: {
            type: Number,
            default: 8
        },
        visible: {
            type: Boolean,
            default: true
        },
        // filterRole: {
        //     type: String,
        //     default: 'All'
        // },
    },
    data() {
        return {
            mapObject: null,
            showByIndex : null,
            buttonOn: false,
            filteredMarkers: this.markers,
            map: {
                minZoom: 1,
                options: {
                    attributionControl: false,
                    zoomControl: true
                }
            },
        }
    },
    computed: {
        /* layers */
        wmsLayers() {
            return this.layers.filter( layer => layer.type === "wmsLayer" )
        },
        tileLayers() {
            return this.layers.filter( layer => layer.type === "tileLayer" )
        },
        geojsonLayers() {
            return this.layers.filter( layer => layer.type === "geojsonLayer" )
        },
        computedMarkers() {
            let markers= this.filteredMarkers.map( function(m) {
                if (m?.icon) {
                    m.icon = L.Icon(m.icon)
                }
                return m;
            });
            if ( this.mapObject && Array.isArray(markers) && markers.length ) {
                this.mapObject.fitBounds(markers.map(m => m.latLng));
            }
            return markers;
        },
    },
    watch: {
        visible(value, oldValue) {
            this.mapObject.invalidateSize()
            console.log("invalidateSize")
        },
        // computedMarkers(newMarker) {            
        //     if ( this.mapObject && Array.isArray(newMarker) && newMarker.length ) {
        //         this.mapObject.fitBounds(newMarker.map(m => m.latLng));
        //     }
        // }
    },
    methods: {
        updateZoom(payload) {
            // console.log(payload)
        },
        updateCenter(payload) {
            // console.log(payload)
        },
        updateBounds(payload) {
        },
        onMapReady() {
            this.mapObject = this.$refs.GmMap.mapObject
        },
        onEachFeature(marker, layer) {
            if (marker.name ) {
                layer.bindPopup(marker.name);
                layer.on('mouseover', () => { layer.openPopup(); });
                layer.on('mouseout', () => { layer.closePopup(); });
            }
        },
        showList () {
            const element = document.getElementById("content");
            // console.log(element.style.display);
            if (element.style.display === "none") {
                element.style.display = "block";
            } else {
                element.style.display = "none";
            }
        },
        toggleDisplay (role) {
            this.filterRole = role;
            const element = document.getElementById("content");
            element.style.display = "none";
            // console.log(this.filterRole);
            this.filterMarker(role);
        },
        filterMarker (role) {
            if (role != 'All') {
                this.filteredMarkers = this.markers.filter(function (marker)
                {
                return marker.role === role ;
                }
                );
            }
            else {
               this.filteredMarkers = this.markers
            }
            // console.log(this.filteredMarkers)
        },
        onClick: function (event) {
            if (!event.target.matches('.dropbtn')) {
                const element = document.getElementById("content");
                if (element.style.display === "block") {
                    element.style.display = "none";
                }
            }
        },
    },

    created() {
    },
    mounted: function() {
        // Attach event listener to the root vue element
        document.addEventListener('click', this.onClick)
    },
    beforeDestroy: function () {
        document.removeEventListener('click', this.onClick)
        // document.removeEventListener('click', this.onClick)
  },

}
</script>