<template>
    <div class="actor actor--detailed">
        <LabelValue v-if="actor.name" label="Name" :value="actor.name.name"></LabelValue>
        <LabelValue v-if="actor.capacity" label="Function/title" :value="actor.capacity.name"></LabelValue>
        <LabelValue v-if="actor.place" label="Institution/jurisdiction" :value="actor.place.name" :url="'/map?lat=' + actor.place.latitude + '&long=' + actor.place.longitude"></LabelValue>
        <LabelValue v-if="actor.place.diocese" label="Diocese" :value="actor.place.diocese.name"></LabelValue>
        <LabelValue v-if="actor.place.principality" label="Principality" :value="actor.place.principality.name"></LabelValue>
        <LabelValue v-if="actor.order" label="Religious order" :value="actor.order.name"></LabelValue>
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
    },
}
</script>

<style scoped lang="scss">
@import '../../../scss/init';

.actor--detailed + .actor--detailed {
  margin-top: $margin-default-vertical-small;
}

</style>