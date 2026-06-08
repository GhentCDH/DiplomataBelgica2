<template>
    <div :class="ptClass('container')">
        <div class="me-1 mt-1">
            <slot name="startButton"></slot>
        </div>
        <span v-for="props in items" :class="ptClass('tag')">
            {{`${props.label}${props.value}`}}
            <button :class="ptClass('close')" @click="clickClose(props)"></button>
        </span>
    </div>
</template>

<script setup lang="ts">
import type {FilterTag} from "@/composables/useActiveFilterTags.ts";
import {usePassThrough, type ComponentPt} from "./usePassThrough.ts";

const props = withDefaults(defineProps<{
    items: FilterTag[];
    pt?: ComponentPt;
}>(), {
    items: () => []
});

const defaultPt: ComponentPt = {
    container: 'd-flex align-items-center justify-content-start flex-wrap',
    tag: 'btn btn-outline-primary me-1 mt-1 nonclickable',
    close: 'btn btn-close btn-sm btn-close',
};

const ptClass = usePassThrough('filterTags', defaultPt, () => props.pt);

const emit = defineEmits(['onClickClose']);
function clickClose(tag: FilterTag) {
    emit('onClickClose', tag);
}
</script>

<style scoped lang="scss">
.nonclickable {
    pointer-events: none;
    cursor: default;
}
.nonclickable > .btn-close {
    pointer-events: auto;
}
</style>