<template>
    <a @mouseup="onMouseup" @keydown.enter="onEnter">
        <slot/>
    </a>
</template>

<script setup lang="ts">
/**
 * Anchor wrapper that fires intent-revealing events at the right time (on
 * mouse-up, before the browser navigates), so callers can run logic — e.g.
 * saving a search context — without dealing with MouseEvent/button/timing.
 *
 * `href`, `class`, `target`, … fall through to the inner <a>.
 *
 * `navigate` fires for a real open (left or middle click, or Enter on a focused
 * link); it deliberately excludes right-click. The granular events carry the
 * original MouseEvent for callers that need it.
 */
const emit = defineEmits<{
    (e: 'navigate'): void;
    (e: 'left-click', event: MouseEvent): void;
    (e: 'middle-click', event: MouseEvent): void;
    (e: 'right-click', event: MouseEvent): void;
}>();

const onMouseup = (event: MouseEvent) => {
    if (event.button === 0) {
        emit('left-click', event);
        emit('navigate');
    } else if (event.button === 1) {
        emit('middle-click', event);
        emit('navigate');
    } else if (event.button === 2) {
        emit('right-click', event);
    }
};

const onEnter = () => {
    emit('navigate');
};
</script>
