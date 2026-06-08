<template>
    <div :class="ptClass('wrapper')">
        <button
            :class="ptClass('toggle')"
            type="button"
            data-bs-toggle="dropdown"
            data-bs-auto-close="outside"
            aria-expanded="false"
        >
            <slot name="display"></slot>
        </button>
        <ul :class="ptClass('menu')" style="max-height: 300px">
            <li :class="ptClass('header')">
                <slot name="header"></slot>
            </li>
            <li :class="ptClass('header')">
                <slot name="header2"></slot>
            </li>
            <li v-for="(item, index) in items" :key="index" :class="ptClass('item')">
                <slot name="preItem" :item="item" :index="index"></slot>
                <slot name="item" :item="item" :index="index">
                    <span @click="itemClicked(index)">{{ item }}</span>
                </slot>
                <slot name="postItem" :item="item" :index="index"></slot>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import {usePassThrough, type ComponentPt} from "./usePassThrough.ts";

const props = withDefaults(defineProps<{
    items: [item: number, index: number][];
    pt?: ComponentPt;
}>(), {
    items: () => []
});

const defaultPt: ComponentPt = {
    wrapper: 'dropdown',
    toggle: 'btn btn-primary dropdown-toggle',
    menu: 'dropdown-menu overflow-auto',
    header: 'dropdown-header',
    item: 'dropdown-item d-flex justify-content-evenly align-items-center',
};

const ptClass = usePassThrough('dropdown', defaultPt, () => props.pt);

const emit = defineEmits(['itemClicked']);

function itemClicked(index: number) {
    emit('itemClicked', {
        index: index,
        item: props.items[index]
    });
}
</script>
