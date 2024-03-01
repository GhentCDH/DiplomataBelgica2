<template>
    <div class="charter__search-summary">
        <template v-if="issuers.length">
            <h6>Main issuer</h6>
            <actor-details-flat v-for="actor in issuers"
                                :actor="actor"
                                :key="'actor:'+actor.id"
                                class="actor--issuer"
            >
                <FormatValue :value="actor.name.name"></FormatValue> -
                <FormatValue :value="actor.capacity" type="id_name"></FormatValue> -
                <FormatValue :value="actor.place" type="id_name"></FormatValue>
            </actor-details-flat>
        </template>
        <template v-if="beneficiaries.length">
            <h6 class="mtop-small">Main beneficiary</h6>
            <actor-details-flat v-for="actor in beneficiaries"
                                :actor="actor"
                                :key="'beneficiary:'+actor.id"
                                class="actor--beneficiary">
                <FormatValue :value="actor.name.name"></FormatValue>
                <FormatValue :value="actor.capacity" type="id_name"></FormatValue> -
                <FormatValue :value="actor.place" type="id_name"></FormatValue> -
            </actor-details-flat>
        </template>
        <template v-if="charter.summary">
            <h6 class="mtop-small">Summary</h6>
            {{ charter.summary }}
        </template>
    </div>
</template>

<script>
import FormatValue from "../Sidebar/FormatValue.vue";
import ActorDetailsFlat from "../Actor/ActorDetailsFlat.vue";

export default {
    name: "CharterSearchResult",
    components: {
        ActorDetailsFlat,
        FormatValue
    },
    props: {
        charter: {
            type: Object,
            required: true
        },
    },
    computed: {
        issuers: function() {
            if (!this.charter?.actors)
                return [];

            // todo: sort by id, really?
            return this.charter.actors
                .filter( actor => actor.role.id === 2 )
                .sort((a,b) => a.id - b.id)
                .slice(0,1)
        },
        authors: function() {
            if (!this.charter?.actors)
                return [];

            return this.charter.actors
                .filter( actor => actor.role.id === 1 )
                .sort((a,b) => a.id - b.id)
                .slice(0,1)
        },
        beneficiaries: function() {
            if (!this.charter?.actors)
                return [];

            return this.charter.actors
                .filter( actor => actor.role.id === 3 || actor.role.id === 4 )
                .sort((a,b) => a.id - b.id)
                .slice(0,1)
        },
    },
}
</script>

<style scoped lang="scss">
@import '../../../scss/init';

</style>