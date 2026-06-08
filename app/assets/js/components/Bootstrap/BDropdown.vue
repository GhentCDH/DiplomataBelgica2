<template>
    <div ref="root" :class="ptClass('wrapper')">
        <button
            :class="ptClass('toggle')"
            type="button"
            :aria-expanded="isOpen"
            @click="toggle"
        >
            <slot name="display"></slot>
        </button>
        <ul :class="ptClass('menu')" :style="{ maxHeight, display: isOpen ? 'block' : 'none' }">
            <slot :close="close" :isOpen="isOpen"></slot>
        </ul>
    </div>
</template>

<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from "vue";
import {usePassThrough, type ComponentPt} from "./usePassThrough.ts";

const props = withDefaults(defineProps<{
    pt?: ComponentPt;
    /** Inline max-height for the (scrollable) menu. */
    maxHeight?: string;
}>(), {
    maxHeight: '300px',
});

const defaultPt: ComponentPt = {
    wrapper: 'dropdown',
    toggle: 'btn btn-primary dropdown-toggle',
    menu: 'dropdown-menu overflow-auto',
};

const ptClass = usePassThrough('dropdown', defaultPt, () => props.pt);

// --- open/close (self-contained; no Bootstrap JS / Popper) ---
// Visibility is driven by an inline `display` toggle, so it doesn't rely on
// Bootstrap's `.show` (BS5) / `.open` (BS3) CSS either. Closing mirrors
// Bootstrap's old `data-bs-auto-close="outside"`: clicks inside the dropdown
// keep it open; only an outside click or Escape closes it.
const root = ref<HTMLElement | null>(null);
const isOpen = ref(false);

function toggle() {
    isOpen.value = !isOpen.value;
}

function close() {
    isOpen.value = false;
}

function onDocumentClick(event: MouseEvent) {
    if (isOpen.value && root.value && !root.value.contains(event.target as Node)) {
        isOpen.value = false;
    }
}

function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        isOpen.value = false;
    }
}

onMounted(() => {
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', onDocumentClick);
    document.removeEventListener('keydown', onKeydown);
});
</script>
