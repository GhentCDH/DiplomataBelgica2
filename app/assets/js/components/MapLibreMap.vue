<template>
    <mgl-map ref="map" :map-style="style" v-model:zoom="zoom" v-model:center="center" :bounds="geojsonBounds"
             height="500px" map-key="actors">
        <mgl-navigation-control/>
        <mgl-image id="markerIcon" :url="markerIcon"></mgl-image>
        <mgl-image id="clusterIcon" :url="clusterIcon"></mgl-image>
        <mgl-geo-json-source :data="geojson" source-id="geojson" :cluster="true" :cluster-max-zoom="8"
                             :cluster-radius="50">
            <mgl-symbol-layer layer-id="markers"
                              :layout="markerLayer.layout"
                              :paint="markerLayer.paint"
                              :filter="markerLayer.filter"
                              @mouseenter="onMarkerOver"
                              @mouseleave="onMarkerOut"
            ></mgl-symbol-layer>
            <mgl-symbol-layer :layer-id="clusterCountLayer.id"
                              :layout="clusterCountLayer.layout"
                              :paint="clusterCountLayer.paint"
                              :filter="clusterCountLayer.filter"
                              @click="onClusterClick"></mgl-symbol-layer>
            <!--            <mgl-circle-layer layer-id="circles3" :paint="paint"></mgl-circle-layer>-->
        </mgl-geo-json-source>
        <mgl-popup v-if="popupVisible" :coordinates="popupCoordinates" :close-button="false">
            <slot name="popup"></slot>
        </mgl-popup>
    </mgl-map>
</template>

<script setup>
import {computed, onMounted, ref, toRefs, useTemplateRef} from "vue";
import {
    MglMap,
    MglNavigationControl,
    MglImage,
    MglGeoJsonSource,
    MglSymbolLayer,
    MglPopup,
    useMap
} from '@indoorequal/vue-maplibre-gl'
import {LngLatBounds} from 'maplibre-gl'

const props = defineProps({
    style: String,
    zoom: Number,
    center: Array,
    geojson: [Object, String],
})

const emit = defineEmits(['markerOver', 'markerOut'])

import markerIcon from '@assets/icons/marker3.png?no-inline'
import clusterIcon from '@assets/icons/marker3.png?no-inline'

// Examples
// circle color based on actor role
// const actorPaint = {
//     'circle-color': ["to-color", ["at", ['get', 'role'], ["literal", ["#aaaa00", "#ff0000", "#00ff00", "#0000ff"]]]],
//     'circle-radius': 10,
// }
//
// // cluster color
// const clusterPaint = {
//     'circle-color': '#9900ff',
//     'circle-radius': 12,
// };

const popupVisible = ref(false)
const popupCoordinates = ref([0, 0])

const map = ref({})

const {geojson} = toRefs(props)
const style = 'https://api.maptiler.com/maps/bright-v2/style.json?key=7YOGLk0IGA4bPJY564Yk';
const zoom = ref(8);
const center = ref([10.4825, 51.4124]);

// marker layout
const markerLayer = {
    id: 'marker',
    layout: {
        'icon-image': 'markerIcon',
        'icon-size': 0.3,
        'text-field': '{roleLabel}',
        'text-font': ['Arial Unicode MS Bold', 'Helvetica'],
        'text-size': 16,
        'text-offset': [0, -0.1],
    },
    paint: {
        'text-color': '#eee',
    },
    filter: ['has', 'roleId'],
}

// cluster count layout
const clusterCountLayer = {
    id: 'cluster',
    layout: {
        'icon-image': 'markerIcon',
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



function calculateBounds(geojson) {
    const bounds = new LngLatBounds();

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

    return bounds;
}

onMounted(() => {
    map.value = useMap('actors').map
    map.value.fitBounds(geojsonBounds.value, {padding: 200});
});

// inspect a cluster on click
const onClusterClick = async (e) => {
    const map = e.target
    const features = map.queryRenderedFeatures(e.point, {
        layers: ['cluster']
    });
    const clusterId = features[0].properties.cluster_id;
    const zoom = await map.getSource('geojson').getClusterExpansionZoom(clusterId);
    map.easeTo({
        center: features[0].geometry.coordinates,
        zoom
    });
};

const onMarkerOver = (e) => {
    if (e.features.length === 0) {
        return;
    }
    const coordinates = e.features[0].geometry.coordinates.slice();
    popupCoordinates.value = coordinates
    popupVisible.value = true
    emit('markerOver', e.features[0])
}

const onMarkerOut = (e) => {
    popupVisible.value = false
    emit('markerOut', e)
}
</script>