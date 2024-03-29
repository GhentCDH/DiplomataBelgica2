<template>
    <div class="actor-list-detailed" v-if="actors.length">
        <h3 v-if="actors.length === 1" v-html="label"></h3>
        <h3 v-if="actors.length > 1" v-html="labelPlural ?? label"></h3>
        <div class="actors">
            <actor-details v-for="actor in actors" :actor="actor" :key="`actor ${actor.id}`" :url-generator="urlGenerator"></actor-details>
        </div>
    </div>
</template>

<script>
import FormatValue from "../Sidebar/FormatValue.vue";
import LabelValue from "../Sidebar/LabelValue.vue";
import ActorDetails from "../Actor/ActorDetails.vue";

export default {
    name: "ActorListDetailed",
    components: {
        LabelValue,
        FormatValue,
        ActorDetails,
    },
    props: {
        actors: {
            type: Array,
            required: true
        },
        label: {
            type: String,
            required: true
        },
        labelPlural: {
            type: String,
            required: false
        },
        urlGenerator: {
            type: Function,
            default: null,
            required: true
        },
    },
}
</script>

<style scoped lang="scss">
@import '../../../scss/init';

.actor-list-detailed + .actor-list-detailed {
  margin-top: $margin-default-vertical-small;
}

</style>