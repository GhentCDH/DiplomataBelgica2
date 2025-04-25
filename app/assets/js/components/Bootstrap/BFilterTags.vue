<template>
    <div class="flex-row align-items-start justify-content-center m-sm-2">
        <span v-for="props in items" class="badge bg-secondary ms-2">
            {{`${props.label}${props.value}`}}
            <button class="btn btn-close btn-sm ms-2" @click="clickClose(props)"></button>
        </span>
    </div>
</template>

<script setup lang="ts">
import type {FilterTag} from "@/composables/useActiveFilterTags.ts";

const props = withDefaults(defineProps<{
    items: FilterTag[];
}>(), {
    items: () => []
});

const emit = defineEmits(['onClickClose']);
function clickClose(tag: FilterTag) {
    emit('onClickClose', tag);
}
</script>

<style scoped lang="scss">

</style>