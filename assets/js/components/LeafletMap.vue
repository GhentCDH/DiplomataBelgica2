<template>
    <div id="leaflet-map" class="leaflet-map">
        <l-map ref="GmMap" v-bind="map" :center="center" :zoom="zoom" :bounds="bounds" @update:zoom="updateZoom"
               @update:center="updateCenter" @update:bounds="updateBounds" @ready="onMapReady">
            <l-tile-layer v-for="layer in tileLayers" :key="layer.id"
                          v-bind="layer.options"
            />
            <l-wms-tile-layer v-for="layer in wmsLayers" :key="layer.id" v-bind="layer.options"></l-wms-tile-layer>
            <l-geo-json :ref="layer.id" v-for="layer in geojsonLayers" :key="layer.id"
                        v-bind="layer.options"></l-geo-json>
            <l-marker v-for="marker in computedMarkers" v-bind="marker" :key="marker.id"></l-marker>
            <l-control class="map__control map__control--topleft" position="topleft">
                <slot name="controls-topleft"></slot>
            </l-control>
        </l-map>
    </div>
</template>

<script>
import {LControl, LGeoJson, LMap, LMarker, LTileLayer, LWMSTileLayer, LControlLayers, LIcon} from 'vue2-leaflet';
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
            default: 12
        },
        visible: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            mapObject: null,
            map: {
                minZoom: 2,
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
            let markers= this.markers.map( function(m) {
                if (m?.icon) {
                    m.icon = L.Icon(m.icon)
                }
                return m;
            });
            return markers;
        },
    },
    watch: {
        visible(value, oldValue) {
            this.mapObject.invalidateSize()
            console.log("invalidateSize")
        },
        computedMarkers(markers) {
            if ( this.mapObject && Array.isArray(markers) && markers.length ) {
                this.mapObject.fitBounds(markers.map(m => m.latLng))
            }
        }
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
    },

    created() {
    },
    moundted() {
    }
}
</script>