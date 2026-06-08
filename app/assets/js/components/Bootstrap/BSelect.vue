<script>
import {usePassThrough} from "./usePassThrough.ts";

const defaultPt = {
    select: 'form-select',
};

export default {
    name: 'BSelect',
    setup(props) {
        const ptClass = usePassThrough('select', defaultPt, () => props.pt)
        return { ptClass }
    },
    props: {
        pt: {
            type: Object,
            default: undefined
        },
        id: {
            type: String,
            required: true
        },
        label: {
            type: String,
            required: true
        },
        selected: {
            type: [String, Number],
            required: true
        },
        options: {
            type: Array,
            required: true,
            validator: function (value) {
                return value.every(option => 'value' in option && 'text' in option);
            }
        }
    },
    methods: {
        updateSelected(event) {
            this.$emit('update:selected', event.target.value);
        }
    }
}
</script>

<template>
    <select :class="ptClass('select')" @change="updateSelected($event)">
        <option v-for="option in options" :key="option.value" :value="option.value"
                :selected="option.value === selected">
            {{ option.text }}
        </option>
    </select>
</template>

<style lang="scss">
.form-select:focus {
    box-shadow: none;
}
</style>