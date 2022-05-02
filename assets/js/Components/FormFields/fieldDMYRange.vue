<template>
    <div>
        <div class="input-group">
            <div class="input-group-addon bg-light">
                <span class="input-group-text" id="">From</span>
            </div>
            <input
                    class="form-control"
                    type="text"
                    size="2"
                    v-model="range.from.day"
                    :disabled="disabled"
                    :maxlength="2"
                    :placeholder="placeholder.day"
                    :readonly="schema.readonly" >
            <input
                    class="form-control"
                    type="text"
                    size="2"
                    v-model="range.from.month"
                    :disabled="disabled"
                    :maxlength="2"
                    :placeholder="placeholder.month"
                    :readonly="schema.readonly" >
            <input
                    class="form-control"
                    type="text"
                    size="4"
                    v-model="range.from.year"
                    :disabled="disabled"
                    :maxlength="4"
                    :placeholder="placeholder.year"
                    :readonly="schema.readonly" >
        </div>
        <div class="input-group">
            <div class="input-group-addon bg-light">
                <span class="input-group-text" id="">Till</span>
            </div>
            <input
                    class="form-control"
                    type="text"
                    size="2"
                    v-model="range.till.day"
                    :disabled="disabled"
                    :maxlength="2"
                    :placeholder="placeholder.day"
                    :readonly="schema.readonly" >
            <input
                    class="form-control"
                    type="text"
                    size="2"
                    v-model="range.till.month"
                    :disabled="disabled"
                    :maxlength="2"
                    :placeholder="placeholder.month"
                    :readonly="schema.readonly" >
            <input
                    class="form-control"
                    type="text"
                    size="4"
                    v-model="range.till.year"
                    :disabled="disabled"
                    :maxlength="4"
                    :placeholder="placeholder.year"
                    :readonly="schema.readonly" >
        </div>
    </div>
</template>

<script>
import { abstractField } from "vue-form-generator";

export default {
    mixins: [ abstractField ],
    data() {
        return {
            placeholder: {
                year: 'yyyy',
                month: 'mm',
                day: 'dd'
            },
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
            }
        };
    },
    watch: {
        range: {
            deep: true,
            handler(val) {
                this.value = val
            }
        },
        value: {
            deep: true,
            handler(val) {
                this.range = val
            }
        }
    },
    mounted() {
        // this.$on('model-updated', function(newVal) {
        //     console.log(newVal);
        //     this.range = newVal
        // })
    }
};
</script>

<style lang="scss">
.field-DMYRange {
    .input-group {

      & + .input-group {
        margin-top: 5px;
      }

      input {
        width: auto;
      }
    }
}
</style>