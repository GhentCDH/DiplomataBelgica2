<template>
    <div class="flex-row align-items-start justify-content-center">
        <span v-for="props in items" class="btn btn-primary me-1 mt-1 nonclickable">
            {{`${props.label}${props.value}`}}
            <button class="btn btn-close btn-sm" @click="clickClose(props)"></button>
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
.nonclickable {
    pointer-events: none;
    cursor: default;
}
.nonclickable > .btn-close {
    pointer-events: auto;
}
</style>