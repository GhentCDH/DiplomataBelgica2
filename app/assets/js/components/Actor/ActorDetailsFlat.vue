<template>
    <div class="actor actor--flat">
        <FormatValue :value="actor.capacity" type="id_name" :unknown="false" />
        <FormatValue :value="actor.place" type="id_name" :unknown="false" />
        <FormatValue :value="actor.name.name" :unknown="false" />
    </div>
</template>

<script>
import FormatValue from "../Sidebar/FormatValue.vue";
import LabelValue from "../Sidebar/LabelValue.vue";

export default {
    name: "ActorDetailsFlat",
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

.actor.actor--flat {
  span::after {
    content: ' - ';
  }
  span:last-child::after {
    content: '';
  }
}
</style>