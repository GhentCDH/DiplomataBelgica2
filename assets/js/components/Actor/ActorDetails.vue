<template>
    <div class="actor actor--detailed">
        <LabelValue v-if="actor.name" label="Name"
                    :value="actor.name"
                    type="id_name"
                    :url="urlGenerator('charter_search', 'actor_name_full_name_1')">
        </LabelValue>
        <LabelValue v-if="actor.capacity" label="Function/title"
                    :value="actor.capacity"
                    type="id_name"
                    :url="urlGenerator('charter_search', 'actor_capacity_1')">
        </LabelValue>
        <LabelValue v-if="actor.place" label="Institution/jurisdiction"
                    :value="actor.place"
                    type="id_name"
                    :url="urlGenerator('charter_search', 'actor_place_name_1')">
        </LabelValue>
        <LabelValue v-if="actor.place.diocese" label="Diocese"
                    :value="actor.place.diocese"
                    type="id_name"
                    :url="urlGenerator('charter_search', 'actor_place_diocese_name_1')">
        </LabelValue>
        <LabelValue v-if="actor.place.principality" label="Principality"
                    :value="actor.place.principality"
                    type="id_name"
                    :url="urlGenerator('charter_search', 'actor_place_principality_name_1')">
        </LabelValue>
        <LabelValue v-if="actor.order" label="Religious order"
                    :value="actor.order"
                    type="id_name"
                    :url="urlGenerator('charter_search', 'actor_order_name_1')">
        </LabelValue>
    </div>
</template>

<script>
import FormatValue from "../Sidebar/FormatValue.vue";
import LabelValue from "../Sidebar/LabelValue.vue";

export default {
    name: "ActorDetails",
    components: {
        LabelValue,
        FormatValue
    },
    props: {
        actor: {
            type: Object,
            required: true
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

.actor--detailed + .actor--detailed {
  margin-top: $margin-default-vertical-small;
}

</style>