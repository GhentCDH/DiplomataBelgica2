import {computed, ref, shallowRef, watch} from "vue";

import charterRepository from "@/repositories/CharterRepository";

interface PlaceActorRole {
    id: number,
    charterIds: number[],
}
interface PlaceActor {
    id: number,
    name: string,
    roles: PlaceActorRole[],
    charterIds: number[],
}
interface Place {
    id: number,
    name: string,
    latitude: number,
    longitude: number,
    actors: PlaceActor[],
    charterIds: number[],
}

interface Stats {
    actors: number,
    charters: number,
    actorsCharters: number,
    placeDateCharters: number,
}

interface FilteredPlace extends Place {
    stats: Stats
}

type PlaceData = Place[]
type FilteredPlaceData = Map<number, FilteredPlace>

export const actorRoleFilter = ref(0)

const placeData = shallowRef<PlaceData|null>(null)
const filteredPlaceData = shallowRef<FilteredPlaceData>(new Map())

watch(actorRoleFilter, (newValue, oldValue) => {
    if (newValue !== oldValue) {
        // update filtered place data when actor role filter changes
        updateFilteredPlaceData()
    }
})

const updateFilteredPlaceData = () => {
    // filter places
    // - based on actor role (if selected)
    // - based on place data (if available)

    // console.log('filtering places with role', actorRoleFilter.value)

    const filteredPlaces = new Map()

    // check if place data is available
    if (!placeData.value || placeData.value.length === 0) {
        return filteredPlaces
    }

    // copy place data
    const places = JSON.parse(JSON.stringify(placeData.value)) as PlaceData

    //
    const isFilteredByRole = actorRoleFilter.value !== 0

    // filter actors based on role
    for (const place of places) {
        // skip places without coordinates
        if (!place.latitude || !place.longitude) {
            continue
        }
        // filter actors based on role
        const filteredActors: PlaceActor[] = [];
        const actorsCharterIds = new Set();
        for (const actor of place?.actors ?? []) {
            // filter roles based on selected role
            const filteredRoles = isFilteredByRole
                ? actor.roles.filter((role) => role.id === actorRoleFilter.value)
                : actor.roles

            // skip actors without filtered roles
            if (isFilteredByRole && filteredRoles.length === 0) {
                continue
            }

            // calculate unique charter ids the actor is involved in
            const charterIds = Array.from(new Set(actor.roles.map(role => role?.charterIds).flat())).sort()

            // update actors charter ids
            charterIds.forEach(id => actorsCharterIds.add(id))

            // add actor to filtered actors
            filteredActors.push({
                id: actor.id,
                name: actor.name,
                roles: filteredRoles,
                charterIds: charterIds
            })
        }
        if (isFilteredByRole && filteredActors.length === 0) {
            // no actors with the selected role, skip this place
            continue
        }

        // place has actors with the selected role? add to filtered places
        const stats = {
            actors: filteredActors.length,
            charters: (new Set([...actorsCharterIds, ...place.charterIds])).size,
            actorsCharters: actorsCharterIds.size,
            placeDateCharters: place.charterIds.length,
        }
        place.actors = filteredActors
        if (stats.charters) {
            filteredPlaces.set(place.id, {
                ...place,
                stats: stats
            })
        }
    }
    filteredPlaceData.value = filteredPlaces
}

const createPlaceFeature = (place: FilteredPlace) => {
    return {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [parseFloat(place.longitude.toString()), parseFloat(place.latitude.toString())]
        },
        properties: {
            id: place.id,
            actorCount: place.stats.actors,
            actorCharterCount: place.stats.actorsCharters,
            charterCount: place.stats.charters,
        }
    }
}

export const geojson = computed(() => {
    const geojson: {type: string, features: any[]} = {type: 'FeatureCollection', features: []};
    for (const place of filteredPlaceData.value.values()) {
        const feature = createPlaceFeature(place);
        geojson.features.push(feature);
    }
    return geojson
})

export const fetchPlaces = (filterState, extendedPlaceInfo) => {
    return charterRepository.locate(filterState, extendedPlaceInfo)
        .then((response) => {
            placeData.value = response.data
        })
        .then(() => {
            // update filtered place data
            updateFilteredPlaceData()
        })
}

export const findPlaceById = (placeId: number) => {
    if (!filteredPlaceData.value) {
        return null
    }
    return filteredPlaceData.value.get(placeId) ?? null
}