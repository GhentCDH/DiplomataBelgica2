<template>
    <div>
        <div class="input-group mbottom-small from" :class="{'has-from': hasFrom}">
            <span class="input-group-text">{{ hasTill ? fromLabel : exactLabel }}</span>
            <input
                class="form-control date-input"
                type="text"
                style="text-align:center;"
                size="2"
                v-model="range.from.day"
                :disabled="disabled"
                :maxlength="2"
                :placeholder="placeholder.day"
                :readonly="schema.readonly"
                @change="onChange" @keyup="onChange"
            >
            <input
                class="form-control date-input"
                type="text"
                style="text-align:center;"
                size="2"
                v-model="range.from.month"
                :disabled="disabled"
                :maxlength="2"
                :placeholder="placeholder.month"
                :readonly="schema.readonly"
                @change="onChange" @keyup="onChange"
            >
            <input
                class="form-control date-input"
                type="text"
                style="text-align:center;"
                size="4"
                v-model="range.from.year"
                :disabled="disabled"
                :maxlength="4"
                :placeholder="placeholder.year"
                :readonly="schema.readonly"
                @change="onChange" @keyup="onChange"
            >
        </div>
        <div class="input-group till" :class="{'has-till': hasTill}">
            <span class="input-group-text">{{ tillLabel }}</span>
            <input
                class="form-control date-input"
                type="text"
                style="text-align:center;"
                size="2"
                v-model="range.till.day"
                :disabled="disabled"
                :maxlength="2"
                :placeholder="placeholder.day"
                :readonly="schema.readonly"
                @change="onChange" @keyup="onChange"
            >
            <input
                class="form-control date-input"
                type="text"
                style="text-align:center;"
                size="2"
                v-model="range.till.month"
                :disabled="disabled"
                :maxlength="2"
                :placeholder="placeholder.month"
                :readonly="schema.readonly"
                @change="onChange" @keyup="onChange"
            >
            <input
                class="form-control date-input"
                type="text"
                style="text-align:center;"
                size="4"
                v-model="range.till.year"
                :disabled="disabled"
                :maxlength="4"
                :placeholder="placeholder.year"
                :readonly="schema.readonly"
                @change="onChange" @keyup="onChange"
            >
        </div>
    </div>
</template>

<script>
import {abstractField} from 'vue3-form-generator-legacy'
import {debounce as _debounce} from 'lodash';

export default {
    mixins: [abstractField],
    data() {
        return {
            placeholder: {
                year: 'yyyy',
                month: 'mm',
                day: 'dd'
            },
            fromLabel: 'From',
            tillLabel: 'Till',
            exactLabel: 'Exact / From',
            range: {
                from: {
                    day: null,
                    month: null,
                    year: null
                },
                till: {
                    day: null,
                    month: null,
                    year: null
                }
            },
            default: {
                from: {
                    day: null,
                    month: null,
                    year: null
                },
                till: {
                    day: null,
                    month: null,
                    year: null
                }
            }
        };
    },
    watch: {
        value: {
            deep: true,
            handler(val) {
                if (typeof val === 'object') {
                    this.range = JSON.parse(JSON.stringify(val));
                } else {
                    this.range = JSON.parse(JSON.stringify(val))
                }
            }
        }
    },
    computed: {
        hasFrom() {
            return !!this.range.from.year || !!this.range.from.month || !!this.range.from.day;
        },
        hasTill() {
            return !!this.range.till.year || !!this.range.till.month || !!this.range.till.day;
        }
    },
    methods: {
        formatValueToField(value) {
            if (value === null || value == undefined) {
                return JSON.parse(JSON.stringify(this.default))
            }
            return value;
        },
        onChange() {
            this.updateModelValue(this.range, this.value)
        }
        // onChange: _debounce(function (e) {
        //     this.updateModelValue(this.range, this.value)
        // }, 300)
    }
};
</script>

<style lang="scss">
.field-DMYRange {
    .input-group {

        & + .input-group {
            margin-top: 5px;
        }

        span {
        }

        input {
            width: auto;
        }
    }
}
</style>