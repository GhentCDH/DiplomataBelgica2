<template>
    <div class="charter-map">
        <mgl-map :map-style="style" v-model:zoom="zoom" v-model:center="center"
                 map-key="actors">
            <mgl-navigation-control/>
            <mgl-image id="markerIcon" :url="markerIcon"></mgl-image>
            <mgl-image id="clusterIcon" :url="clusterIcon"></mgl-image>
            <mgl-geo-json-source :data="geojson" source-id="geojson" :cluster="true" :cluster-max-zoom="8"
                                 :cluster-radius="40">
                <mgl-symbol-layer v-bind="markerLayer"
                                  @click="onMarkerClick"
                ></mgl-symbol-layer>
                <mgl-symbol-layer v-bind="actorCountLayer"></mgl-symbol-layer>
                <mgl-circle-layer v-bind="clusterLayer" @click="onClusterClick"></mgl-circle-layer>
                <mgl-symbol-layer v-bind="clusterCountLayerSymbol"></mgl-symbol-layer>

            </mgl-geo-json-source>
            <mgl-custom-control position="top-left">
                <slot name="control-top-left"></slot>
            </mgl-custom-control>
            <mgl-custom-control position="top-right">
                <button @click="fitBounds">
                    <i class="fa-solid fa-expand" title="Show all places"></i>
                </button>
            </mgl-custom-control>
            <mgl-custom-control position="top-right">
                <slot name="control-top-right"></slot>
            </mgl-custom-control>
            <mgl-popup v-if="popupVisible" :coordinates="popupCoordinates" :close-button="false" :close-on-click="false" max-width="500px">
                <slot name="popup"></slot>
            </mgl-popup>
        </mgl-map>
    </div>
</template>

<script setup>
import {computed, nextTick, onMounted, ref, toRefs, useTemplateRef, watch} from "vue";
import {
    MglMap,
    MglNavigationControl,
    MglImage,
    MglGeoJsonSource,
    MglSymbolLayer,
    MglPopup,
    MglCustomControl,
    MglCircleLayer,
    useMap
} from '@indoorequal/vue-maplibre-gl'
import {LngLatBounds} from 'maplibre-gl'

const props = defineProps({
    style: String,
    zoom: Number,
    center: Array,
    geojson: [Object, String],
    popupVisible: {
        type: Boolean,
        default: false
    },
    updateBounds: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['markerOver', 'markerOut'])

import markerIcon from '@assets/icons/marker3.png?no-inline'
import clusterIcon from '@assets/icons/marker4.png?no-inline'

const popupCoordinates = ref([0, 0])

const map = ref({})

const {geojson, popupVisible, updateBounds} = toRefs(props)
const style = 'https://api.maptiler.com/maps/bright-v2/style.json?key=7YOGLk0IGA4bPJY564Yk';
const zoom = ref(8);
const center = ref([10.4825, 51.4124]);

// marker layout
const markerLayer = {
    'layer-id': 'marker',
    layout: {
        'icon-image': 'markerIcon',
        'icon-size': 0.35,
        'text-field': '{charterCount}',
        'text-font': ['Arial Unicode MS Bold', 'Helvetica'],
        'text-size': 14,
        'text-offset': [0, -0.7],
        'text-allow-overlap': true,
        'text-ignore-placement': true,
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
    },
    paint: {
        'text-color': '#eee',
    },
    filter: ["!", ["has", "point_count"]],
}

const actorCountLayer = {
    'layer-id': 'actorstats',
    layout: {
        'text-field': '{actorCount}',
        'text-font': ['Arial Unicode MS Bold', 'Helvetica'],
        'text-size': 11,
        'text-offset': [0, 0.5],
        'text-allow-overlap': true,
        'text-ignore-placement': true,
    },
    paint: {
        'text-color': '#f6d14a',
    },
    filter: ["!", ["has", "point_count"]],
}


// cluster count layout
const clusterLayer = {
    'layer-id': 'clusterLayer',
    paint: {
        'circle-color': '#3C7386',
        'circle-radius': 16,
    },
    filter: ['has', 'point_count'],
}

const clusterCountLayerSymbol = {
    'layer-id': 'clusterCountLayer',
    layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Arial Unicode MS Bold', 'Helvetica'],
        'text-size': 14,
        'text-offset': [0, -0.1],
    },
    paint: {
        'text-color': '#eee',
    },
    filter: ['has', 'point_count'],
}

const clusterCountLayerIcon = {
    'layer-id': 'clusterCountLayer',
    layout: {
        'icon-image': 'clusterIcon',
        'icon-size': 0.35,
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Arial Unicode MS Bold', 'Helvetica'],
        'text-size': 16,
        'text-offset': [0, -0.1],
    },
    paint: {
        'text-color': '#eee',
    },
    filter: ['has', 'point_count'],
}

const geojsonBounds = computed(() => {
    const bounds = calculateBounds(geojson.value)
    return bounds
})

watch(geojsonBounds, (bounds) => {
    if (bounds && map.value && updateBounds.value) {
        map.value.fitBounds(bounds, {padding: 100, linear: false, maxZoom: 16, animate: false});
    }
})

const fitBounds = () => {
    if (geojsonBounds.value && map.value) {
        map.value.fitBounds(geojsonBounds.value, {padding: 100, linear: false, maxZoom: 16, animate: false});
    }
}

defineExpose({fitBounds})

function calculateBounds(geojson) {
    let bounds = null
    if (geojson.features?.length) {
        bounds = new LngLatBounds();

        geojson.features.forEach(feature => {
            const coordinates = feature.geometry.coordinates;
            if (feature.geometry.type === 'Point') {
                bounds.extend(coordinates);
            } else if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiPoint') {
                coordinates.forEach(coord => bounds.extend(coord));
            } else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiLineString') {
                coordinates.forEach(ring => ring.forEach(coord => bounds.extend(coord)));
            } else if (feature.geometry.type === 'MultiPolygon') {
                coordinates.forEach(polygon => polygon.forEach(ring => ring.forEach(coord => bounds.extend(coord))));
            }
        });
    }

    return bounds;
}

onMounted(() => {
    map.value = useMap('actors').map
});

// inspect a cluster on click
const onClusterClick = async (e) => {
    const map = e.target
    if (e.features.length === 0) {
        return;
    }
    const feature = e.features[0];
    const clusterId = feature.properties.cluster_id;
    const zoom = await map.getSource('geojson').getClusterExpansionZoom(clusterId);
    map.easeTo({
        center: feature.geometry.coordinates,
        zoom
    });
};

const onMarkerClick = (e) => {
    const map = e.target
    if (e.features.length === 0) {
        return;
    }
    const feature = e.features[0];
    const coordinates = feature.geometry.coordinates.slice();
    popupCoordinates.value = coordinates
    emit('markerClick', feature)
}

</script>