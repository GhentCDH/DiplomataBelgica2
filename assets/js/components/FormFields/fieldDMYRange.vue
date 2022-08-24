<template>
    <div>
        <div class="input-group mbottom-small">
            <span class="input-group-text bg-primary text-white">From</span>
            <input
                    class="form-control date-input"
                    type="text"
                    style="text-align:center;"
                    size="2"
                    v-model="range.from.day"
                    :disabled="disabled"
                    :maxlength="2"
                    :placeholder="placeholder.day"
                    :readonly="schema.readonly" >
            <input
                    class="form-control date-input"
                    type="text"
                    style="text-align:center;"
                    size="2"
                    v-model="range.from.month"
                    :disabled="disabled"
                    :maxlength="2"
                    :placeholder="placeholder.month"
                    :readonly="schema.readonly" >
            <input
                    class="form-control date-input"
                    type="text"
                    style="text-align:center;"
                    size="4"
                    v-model="range.from.year"
                    :disabled="disabled"
                    :maxlength="4"
                    :placeholder="placeholder.year"
                    :readonly="schema.readonly" >
        </div>
        <div class="input-group">
            <span class="input-group-text bg-primary text-white">Till</span>
            <input
                    class="form-control date-input"
                    type="text"
                    style="text-align:center;"
                    size="2"
                    v-model="range.till.day"
                    :disabled="disabled"
                    :maxlength="2"
                    :placeholder="placeholder.day"
                    :readonly="schema.readonly" >
            <input
                    class="form-control date-input"
                    type="text"
                    style="text-align:center;"
                    size="2"
                    v-model="range.till.month"
                    :disabled="disabled"
                    :maxlength="2"
                    :placeholder="placeholder.month"
                    :readonly="schema.readonly" >
            <input
                    class="form-control date-input"
                    type="text"
                    style="text-align:center;"
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
    _watch: {
        range: {
            deep: true,
            handler(val) {
                // console.log('range watch')
                // console.log(val)
                this.value = val;
            }
        },
        value: {
            deep: true,
            handler(val) {
                // console.log('value watch')
                // console.log(val)
                if ( typeof val === 'object' ) {
                    // this.range = JSON.parse(JSON.stringify(val));
                } else {
                    this.range = this.default
                }
            }
        }
    },
};
</script>

<style lang="scss">
.field-DMYRange {
    .input-group {

      & + .input-group {
        margin-top: 5px;
      }
    
        span {
            min-width: 63px;
            justify-content: center;
        }

        input {
            width: auto;
        }
    }
}
</style>